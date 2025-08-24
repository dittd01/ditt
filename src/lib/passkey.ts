
'use client';
import {
  getRegistrationChallengeAction,
  verifyRegistrationAction,
  getLoginChallengeAction,
  verifyLoginAction
} from '@/app/actions';
import type { RegistrationResponseJSON, AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import { startRegistration as browserStartRegistration, startAuthentication as browserStartAuthentication } from '@simplewebauthn/browser';

/**
 * Converts a Base64URL-encoded string to an ArrayBuffer.
 * This is a critical helper function for client-side WebAuthn operations, as the browser's
 * crypto APIs require binary data in ArrayBuffer format, while servers typically send
 * this data in a URL-safe string format.
 *
 * @param base64urlString The Base64URL-encoded string from the server.
 * @returns An ArrayBuffer representation of the input string.
 */
function base64URLToBuffer(base64urlString: string): ArrayBuffer {
    // 1. Sanity check: Ensure the input is a non-empty string.
    if (typeof base64urlString !== 'string' || base64urlString.length === 0) {
        throw new Error('Invalid input: base64URLToBuffer expects a non-empty string.');
    }
    // 2. Convert Base64URL to standard Base64 by replacing URL-safe characters.
    const base64 = base64urlString.replace(/-/g, '+').replace(/_/g, '/');
    // 3. Decode the Base64 string into a binary string.
    const binary = atob(base64);
    // 4. Create an ArrayBuffer with the same length as the binary string.
    const buffer = new ArrayBuffer(binary.length);
    // 5. Create a byte-level view of the buffer.
    const bytes = new Uint8Array(buffer);
    // 6. Populate the buffer with the character codes of the binary string.
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
}


/**
 * Initiates the client-side passkey registration process.
 * This function orchestrates the flow:
 * 1. Fetches a challenge from the server.
 * 2. Prepares the options for the browser's WebAuthn API.
 * 3. Prompts the user for biometric confirmation.
 * 4. Sends the browser's response back to the server for verification.
 *
 * @param personHash The user's unique, privacy-preserving identifier (string).
 * @returns A promise resolving to an object indicating success or failure.
 */
export async function startRegistration(personHash: string): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Get registration options (including the challenge) from the server.
    const options: PublicKeyCredentialCreationOptionsJSON = await getRegistrationChallengeAction(personHash);
    
    // 2. Convert server-sent strings to ArrayBuffers for the browser's `create()` method.
    //    The WebAuthn API requires `challenge` and `user.id` to be ArrayBuffers.
    options.challenge = base64URLToBuffer(options.challenge);
    options.user.id = base64URLToBuffer(options.user.id);
    
    // If the server suggests credentials to exclude (to prevent re-registration),
    // their IDs must also be converted to ArrayBuffers.
    if (options.excludeCredentials) {
        options.excludeCredentials.forEach(cred => {
            cred.id = base64URLToBuffer(cred.id as unknown as string);
        });
    }

    // 3. Invoke the browser's WebAuthn API to create the passkey.
    const attestationResponse: RegistrationResponseJSON = await browserStartRegistration(options);
    
    // 4. Send the attestation response back to the server for verification.
    const verificationResult = await verifyRegistrationAction(personHash, attestationResponse);

    if (verificationResult && verificationResult.verified) {
      // Store the new credential ID locally to identify this device in the future.
      localStorage.setItem('passkey_credential_id', attestationResponse.id);
      return { success: true };
    } else {
      return { success: false, message: 'Server verification failed: ' + (verificationResult.error || 'Unknown error.') };
    }
  } catch (error: any) {
    // Gracefully handle common user actions and errors.
    console.error('Passkey Registration Failed:', error);
    let message = error.message || 'An unknown error occurred.';
    if (error.name === 'InvalidStateError') {
      message = 'This passkey has already been registered. Please try logging in instead.';
    } else if (error.name === 'NotAllowedError') {
      message = 'Passkey creation was cancelled by the user.';
    }
    return { success: false, message };
  }
}

/**
 * Initiates the client-side passkey login (authentication) process.
 *
 * @returns A promise resolving to an object with success status and the user's `personHash` on success.
 */
export async function startLogin(): Promise<{ success: boolean; message?: string, personHash?: string }> {
  try {
    // 1. Get authentication options from the server for a "discoverable" credential login.
    const options: PublicKeyCredentialRequestOptionsJSON = await getLoginChallengeAction();
    
    // 2. Convert the server's challenge from Base64URL string to an ArrayBuffer.
    if (options.challenge) {
        options.challenge = base64URLToBuffer(options.challenge);
    }

    // 3. Invoke the browser's WebAuthn API to use the passkey.
    const assertionResponse: AuthenticationResponseJSON = await browserStartAuthentication(options);

    // 4. Send the browser's response to the server for verification.
    const verificationResult = await verifyLoginAction(assertionResponse);

    if (verificationResult && verificationResult.verified) {
      // Store the credential ID to identify the current device.
      localStorage.setItem('passkey_credential_id', assertionResponse.id);
      return { success: true, personHash: verificationResult.personHash };
    } else {
       return { success: false, message: 'Server verification failed: ' + (verificationResult.error || 'Unknown error.') };
    }
  } catch (error: any) {
    // Gracefully handle common errors during login.
    console.error('Passkey Login Failed:', error);
    let message = error.message || 'An unknown error occurred during login.';
    if (error.name === 'NotAllowedError') {
        message = 'Login attempt was cancelled by the user.';
    }
    return { success: false, message: message };
  }
}
