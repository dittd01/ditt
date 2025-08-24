
'use server';

/**
 * @fileoverview Server-side authentication utilities for WebAuthn/Passkeys.
 * This file contains functions for securely generating challenges and verifying responses.
 * It uses a mock in-memory store to simulate a database for this prototype.
 *
 * Design Rationale:
 * - Stateful Challenges: Each registration or login attempt generates a unique, single-use
 *   challenge that is stored on the server. This is a critical security measure to prevent
 *   replay attacks. A stateless approach (e.g., using JWTs) was considered but adds
 *   complexity and was deemed less appropriate for a high-security flow.
 * - Data Type Purity: This module is responsible for handling NodeJS-specific data types
 *   (like Buffers) required by the `@simplewebauthn/server` library. It sends simple,
 *   serializable strings (Base64URL) to the client.
 * - Separation of Concerns: This file does not handle any business logic (like age checks)
 *   or direct database writes beyond the auth flow itself. It is purely for the mechanics
 *   of WebAuthn.
 */
import { createHmac } from 'crypto';
import type { 
    GenerateRegistrationOptionsOpts,
    GenerateAuthenticationOptionsOpts,
    VerifyRegistrationResponseOpts,
    VerifyAuthenticationResponseOpts,
    VerifiedRegistrationResponse,
    VerifiedAuthenticationResponse,
 } from '@simplewebauthn/server';
import { 
    generateRegistrationOptions, 
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { RegistrationResponseJSON, AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON, AuthenticatorDevice, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import type { Device, Eligibility } from './types';


// In a real application, this would be loaded securely from a secret manager (e.g., Google Secret Manager)
// and not hardcoded. This is a placeholder for the KMS-managed pepper.
const KMS_PEPPER = process.env.PERSON_HASH_PEPPER || 'a-very-secret-pepper-for-development';

if (process.env.NODE_ENV === 'production' && KMS_PEPPER === 'a-very-secret-pepper-for-development') {
    console.warn('WARNING: Using default development pepper in production. This is insecure. Please set PERSON_HASH_PEPPER.');
}

// --- Domain and Origin ---
// In a production environment, these would be configured via environment variables.
const rpName = 'Ditt Demokrati';
const rpID = process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'localhost';
const origin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : `http://${rpID}:3000`;

// --- Mock Database Simulation ---
// In a real app, this would be Firestore or another persistent database.
// This mock store simulates the required data structures for the auth flow.
const mockUserStore: { [personHash: string]: { username: string; personHash: string; devices: Device[] } } = {
    'mock-uid-123': {
        username: 'testuser',
        personHash: 'mock-uid-123',
        devices: [],
    }
};

const mockChallengeStore: { [key: string]: string } = {};

/**
 * Normalizes a Norwegian Fødselsnummer (Fnr) by removing non-digit characters.
 * @param fnr The Fødselsnummer to normalize.
 * @returns The normalized Fnr consisting only of digits.
 */
function normalizeFnr(fnr: string): string {
    return fnr.replace(/\D/g, '');
}

/**
 * Computes a secure, peppered hash of a user's Fødselsnummer (Fnr).
 * This hash is used as the primary, privacy-preserving identifier for a person.
 * 
 * @param fnr The user's Fødselsnummer.
 * @returns A hex-encoded HMAC-SHA256 hash.
 */
export async function computePersonHash(fnr: string): Promise<string> {
    const normalized = normalizeFnr(fnr);
    const hmac = createHmac('sha256', KMS_PEPPER);
    hmac.update(normalized);
    return hmac.digest('hex');
}

/**
 * Derives the user's age from their Fødselsnummer.
 * @param fnr The user's Fødselsnummer.
 * @returns The user's age in years.
 */
export async function deriveAgeFromFnr(fnr: string): Promise<number> {
    const normalized = normalizeFnr(fnr);
    if (normalized.length !== 11) {
        throw new Error('Invalid Fnr length.');
    }

    let day = parseInt(normalized.substring(0, 2), 10);
    if (day > 40) day -= 40;

    const month = parseInt(normalized.substring(2, 4), 10);
    let year = parseInt(normalized.substring(4, 6), 10);
    const individnummer = parseInt(normalized.substring(6, 9), 10);

    if (individnummer >= 500 && individnummer <= 749 && year >= 55 && year <= 99) year += 1800;
    else if (individnummer >= 0 && individnummer <= 499) year += 1900;
    else if (individnummer >= 900 && individnummer <= 999 && year >= 40 && year <= 99) year += 1900;
    else year += 2000;

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age--;

    return age;
}

// --- WebAuthn Server-Side Functions ---

/**
 * Retrieves all registered devices for a given user.
 * @param personHash The user's unique identifier.
 * @returns An array of Device objects.
 */
export async function getDevicesForUser(personHash: string): Promise<Device[]> {
    const user = mockUserStore[personHash];
    return user ? user.devices : [];
}

/**
 * Generates registration options for a new passkey.
 * @param personHash The user's unique identifier.
 * @returns A `PublicKeyCredentialCreationOptionsJSON` object to be sent to the client.
 */
export async function generateRegistrationChallenge(personHash: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
    // Ensure a user record exists in our mock store. In a real app, this might
    // be created earlier in the onboarding flow.
    if (!mockUserStore[personHash]) {
        mockUserStore[personHash] = { username: `user...${personHash.slice(0, 4)}`, personHash, devices: [] };
    }
    const user = mockUserStore[personHash];

    const opts: GenerateRegistrationOptionsOpts = {
        rpName,
        rpID,
        // The `simplewebauthn` library requires the userID to be a Buffer for security reasons.
        // This prevents certain types of attacks and ensures data integrity.
        userID: Buffer.from(personHash), 
        userName: user.username,
        timeout: 60000,
        attestationType: 'none',
        // To prevent a user from registering the same device multiple times, we provide a list
        // of already registered credential IDs. The authenticator (e.g., browser) will
        // error if it's asked to re-register an existing credential.
        excludeCredentials: user.devices.map(dev => ({
            id: Buffer.from(dev.webauthn!.credentialID, 'base64url'),
            type: 'public-key',
            transports: dev.webauthn?.transports,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
        supportedAlgorithmIDs: [-7, -257], // ES256 (most common) and RS256
    };

    const options = await generateRegistrationOptions(opts);

    // Store the challenge securely, associated with the user. This is critical to
    // prevent replay attacks. The challenge is retrieved during the verification step.
    mockChallengeStore[personHash] = options.challenge;
    
    // The user.id is sent to the client as the original string for easier handling.
    // The client will be responsible for converting this string back to an ArrayBuffer
    // before passing it to the `navigator.credentials.create()` API.
    return {
        ...options,
        user: {
            ...options.user,
            id: personHash, 
        }
    };
}


/**
 * Verifies the client's response to a registration challenge.
 * @param personHash The user's unique identifier.
 * @param response The `RegistrationResponseJSON` from the client.
 * @returns A promise resolving to a verification result object.
 */
export async function verifyRegistration(personHash: string, response: RegistrationResponseJSON): Promise<{ verified: boolean; error?: string }> {
    const user = mockUserStore[personHash];
    const expectedChallenge = mockChallengeStore[personHash];

    if (!user || !expectedChallenge) {
        return { verified: false, error: 'User or challenge not found. Session may have expired. Please try again.' };
    }

    const opts: VerifyRegistrationResponseOpts = {
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
    };

    let verification: VerifiedRegistrationResponse;
    try {
        verification = await verifyRegistrationResponse(opts);
    } catch (error: any) {
        console.error('Registration verification failed:', error);
        return { verified: false, error: error.message };
    } finally {
        // Clean up the challenge regardless of the outcome to ensure it's single-use.
        delete mockChallengeStore[personHash];
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = registrationInfo;
        
        const newDevice: Device = {
            person_hash: personHash,
            webauthn: {
                credentialID: Buffer.from(credentialID).toString('base64url'),
                publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
                signCount: counter,
                transports: response.response.transports,
            },
            platform: 'web', 
            createdAt: Date.now(),
            lastSeenAt: Date.now(),
            revoked: false,
        };
        // Add the new, verified device to the user's record.
        user.devices.push(newDevice);
        return { verified: true };
    }

    return { verified: false, error: 'Verification failed.' };
}


/**
 * Generates an authentication challenge for a login attempt.
 * This is for "discoverable" credentials, where the user doesn't provide a username first.
 * @returns A `PublicKeyCredentialRequestOptionsJSON` object to be sent to the client.
 */
export async function generateLoginChallenge(): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const opts: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        userVerification: 'preferred',
        rpID,
    };
    
    const options = await generateAuthenticationOptions(opts);
    
    // For discoverable credentials, we store the challenge under a temporary, non-user-specific
    // key. In a real app, this might be a session ID stored in a secure, HTTP-only cookie.
    mockChallengeStore['login_challenge'] = options.challenge;

    return options;
}

/**
 * Verifies the client's response to an authentication challenge.
 * @param response The `AuthenticationResponseJSON` from the client.
 * @returns A promise resolving to an object containing verification status and the user's `personHash` on success.
 */
export async function verifyLogin(response: AuthenticationResponseJSON): Promise<{ verified: boolean; personHash?: string; error?: string }> {
    const credentialID = response.id;
    let user: (typeof mockUserStore)[string] | undefined;
    let device: Device | undefined;
    
    // Find the user and device based on the credential ID returned by the browser's authenticator.
    // This is a secure way to look up the user without them needing to enter a username.
    for (const hash in mockUserStore) {
        const potentialUser = mockUserStore[hash];
        const foundDevice = potentialUser.devices.find(d => d.webauthn?.credentialID === credentialID);
        if (foundDevice) {
            user = potentialUser;
            device = foundDevice;
            break;
        }
    }

    if (!user || !device || !device.webauthn) {
        return { verified: false, error: 'This passkey is not registered with our service.' };
    }
    
    const expectedChallenge = mockChallengeStore['login_challenge'];
    if (!expectedChallenge) {
        return { verified: false, error: 'Login challenge expired or was not found. Please try again.' };
    }

    const opts: VerifyAuthenticationResponseOpts = {
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
            credentialID: Buffer.from(device.webauthn.credentialID, 'base64url'),
            credentialPublicKey: Buffer.from(device.webauthn.publicKey, 'base64url'),
            counter: device.webauthn.signCount,
            transports: device.webauthn.transports,
        },
        requireUserVerification: true,
    };
    
    let verification: VerifiedAuthenticationResponse;
    try {
        verification = await verifyAuthenticationResponse(opts);
    } catch (error: any) {
        console.error('Login verification failed:', error);
        return { verified: false, error: error.message };
    } finally {
        // Clean up the challenge after the attempt.
        delete mockChallengeStore['login_challenge'];
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        // Update the signature counter. This is a critical security measure to help
        // prevent credential cloning. The server should reject any attempt to
        // authenticate with a counter value less than or equal to the last known value.
        device.webauthn.signCount = authenticationInfo.newCounter;
        device.lastSeenAt = Date.now();
        
        return { verified: true, personHash: user.personHash };
    }

    return { verified: false, error: 'Cannot authenticate signature.' };
}
