
'use server';

/**
 * @fileoverview Server-side authentication utilities.
 * This file contains functions for hashing, key management, and other security operations
 * that should only run on the server. It should never be imported into client-side code.
 */
import { createHmac } from 'crypto';
import type { 
    GenerateRegistrationOptionsOpts,
    GenerateAuthenticationOptionsOpts,
    VerifyRegistrationResponseOpts,
    VerifyAuthenticationResponseOpts,
    VerifiedRegistrationResponse,
    VerifiedAuthenticationResponse
 } from '@simplewebauthn/server';
import { 
    generateRegistrationOptions, 
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { RegistrationResponseJSON, AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
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


// Mock database for users and devices. In a real app, this would be Firestore.
const mockUserStore: { [key: string]: { username: string, personHash: string, devices: Device[], currentChallenge?: string } } = {
    'mock-uid-123': {
        username: 'testuser',
        personHash: 'mock-uid-123',
        devices: [],
    }
};
const mockEligibilityStore: { [key: string]: Eligibility } = {};


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
 * This function handles both standard Fnr and D-numbers.
 * Note: This is a simplified implementation for demonstration. A production
 * system should use a robust, well-tested library for Fnr parsing.
 * 
 * @param fnr The user's Fødselsnummer.
 * @returns The user's age in years.
 */
export async function deriveAgeFromFnr(fnr: string): Promise<number> {
    const normalized = normalizeFnr(fnr);
    if (normalized.length !== 11) {
        throw new Error('Invalid Fnr length.');
    }

    let day = parseInt(normalized.substring(0, 2), 10);
    // Adjust for D-number
    if (day > 40) {
        day -= 40;
    }

    const month = parseInt(normalized.substring(2, 4), 10);
    let year = parseInt(normalized.substring(4, 6), 10);
    const individnummer = parseInt(normalized.substring(6, 9), 10);

    // Determine century
    if (individnummer >= 500 && individnummer <= 749 && year >= 55 && year <= 99) {
        year += 1800;
    } else if (individnummer >= 0 && individnummer <= 499) {
        year += 1900;
    } else if (individnummer >= 900 && individnummer <= 999 && year >= 40 && year <= 99) {
        year += 1900;
    } else {
        year += 2000;
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}


// --- WebAuthn Functions ---
// These functions are simplified and use a mock in-memory store.
// A real implementation would use a database like Firestore.

export async function getDevicesForUser(personHash: string): Promise<Device[]> {
    const user = Object.values(mockUserStore).find(u => u.personHash === personHash);
    return user ? user.devices : [];
}


export async function generateRegistrationChallenge(personHash: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
    if (!mockUserStore[personHash]) {
        mockUserStore[personHash] = { username: personHash, personHash, devices: [] };
    }

    const user = mockUserStore[personHash];

    const opts: GenerateRegistrationOptionsOpts = {
        rpName,
        rpID,
        userID: personHash,
        userName: user.username,
        timeout: 60000,
        attestationType: 'none',
        // Prevent users from creating multiple credentials on the same device
        excludeCredentials: user.devices.map(dev => ({
            id: dev.webauthn!.credentialID,
            type: 'public-key',
            transports: dev.webauthn?.transports,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
        supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
    };

    const options = await generateRegistrationOptions(opts);
    
    user.currentChallenge = options.challenge;

    return {
      ...options,
      user: {
        ...options.user,
        id: personHash, // Ensure the raw string ID is sent to the client
      }
    };
}

export async function verifyRegistration(personHash: string, response: RegistrationResponseJSON) {
    const user = mockUserStore[personHash];

    if (!user || !user.currentChallenge) {
        throw new Error('User or challenge not found.');
    }

    const opts: VerifyRegistrationResponseOpts = {
        response,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
    };

    try {
        const verification = await verifyRegistrationResponse(opts);
        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            const { credentialPublicKey, credentialID, counter } = registrationInfo;

            const newDevice: Device = {
                person_hash: personHash,
                webauthn: {
                    credentialID: Buffer.from(credentialID).toString('base64url'),
                    publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
                    signCount: counter,
                },
                platform: 'web',
                createdAt: Date.now(),
                lastSeenAt: Date.now(),
                revoked: false,
            };

            user.devices.push(newDevice);
            user.currentChallenge = undefined;

            return { verified: true, error: null };
        } else {
            return { verified: false, error: 'Verification failed.' };
        }
    } catch(e: any) {
        return { verified: false, error: e.message };
    }
}

export async function generateLoginChallenge() {
    const opts: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        userVerification: 'preferred',
        rpID,
    };
    
    const options = await generateAuthenticationOptions(opts);

    // This is a simplification for a "discoverable" credential login.
    // In a real app, you'd handle this session more robustly.
    (mockUserStore as any).globalChallenge = options.challenge;

    return options;
}

export async function verifyLogin(response: AuthenticationResponseJSON) {
    const credentialID = response.id;
    let user: (typeof mockUserStore)[string] | undefined;
    let device: Device | undefined;
    
    // Find user and device by credentialID
    for (const personHash in mockUserStore) {
        const potentialUser = mockUserStore[personHash];
        const foundDevice = potentialUser.devices.find(d => d.webauthn?.credentialID === credentialID);
        if (foundDevice) {
            user = potentialUser;
            device = foundDevice;
            break;
        }
    }

    if (!user || !device || !device.webauthn) {
        throw new Error('Device not registered.');
    }
    
    const challenge = (mockUserStore as any).globalChallenge;
     if (!challenge) {
        throw new Error("No active challenge found for login.");
     }

    const opts: VerifyAuthenticationResponseOpts = {
        response,
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
            credentialID: Buffer.from(device.webauthn.credentialID, 'base64url'),
            credentialPublicKey: Buffer.from(device.webauthn.publicKey, 'base64url'),
            counter: device.webauthn.signCount,
        },
        requireUserVerification: true,
    };
    
    try {
        const verification = await verifyAuthenticationResponse(opts);
        const { verified, authenticationInfo } = verification;

        if (verified) {
            // Update the signature counter
            device.webauthn.signCount = authenticationInfo.newCounter;
            device.lastSeenAt = Date.now();
            user.currentChallenge = undefined; // Clear the challenge
            (mockUserStore as any).globalChallenge = undefined; 
            
            return { verified: true, personHash: device.person_hash, error: null };
        } else {
             return { verified: false, error: "Verification failed." };
        }
    } catch(e: any) {
        console