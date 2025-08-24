
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
 * Converts a base64url string to an ArrayBuffer.
 * This is a necessary step for passing challenges from the server to the browser's WebAuthn API.
 * @param base64urlString a base64url-encoded string
 */
function base64URLToBuffer(base64urlString: string): ArrayBuffer {
    const base64 = String(base64urlString).replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64.padEnd(base64.length + padLength, '=');
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
}


/**
 * Begins the passkey registration process.
 * @param personHash The unique identifier for the user.
 */
export async function startRegistration(personHash: string): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Get a challenge from the server
    const options: PublicKeyCredentialCreationOptionsJSON = await getRegistrationChallengeAction(personHash);
    
    // 2. Convert server-sent strings to ArrayBuffers for the browser API
    // The browser API expects `challenge` and `user.id` to be ArrayBuffers.
    options.challenge = base64URLToBuffer(options.challenge);
    options.user.id = base64URLToBuffer(options.user.id);
    
    if (options.excludeCredentials) {
        options.excludeCredentials.forEach(cred => {
            // The server sends the credential ID as a base64url string, convert it to a buffer.
            cred.id = base64URLToBuffer(cred.id as unknown as string);
        });
    }

    // 3. Prompt the user to create a passkey
    const attestationResponse: RegistrationResponseJSON = await browserStartRegistration(options);
    
    // 4. Send the response back to the server for verification
    const verificationResult = await verifyRegistrationAction(personHash, attestationResponse);

    if (verificationResult && verificationResult.verified) {
      // Store credential ID to identify current device
      localStorage.setItem('passkey_credential_id', attestationResponse.id);
      return { success: true };
    } else {
      return { success: false, message: 'Verification failed. ' + (verificationResult.error || 'Unknown server error.') };
    }
  } catch (error: any) {
    console.error('Registration failed:', error);
    let message = error.message || 'An unknown error occurred during registration.';
    if (error.name === 'InvalidStateError') {
      message = 'This passkey has already been registered on another account.';
    } else if (error.name === 'NotAllowedError') {
      message = 'Passkey creation was cancelled.';
    }
    return { success: false, message };
  }
}

/**
 * Begins the passkey login process.
 */
export async function startLogin(): Promise<{ success: boolean; message?: string, personHash?: string }> {
  try {
    // 1. Get a challenge from the server for discoverable credentials.
    const options: PublicKeyCredentialRequestOptionsJSON = await getLoginChallengeAction();
    
    // Convert challenge from Base64URL to ArrayBuffer
    if (options.challenge) {
        options.challenge = base64URLToBuffer(options.challenge);
    }

    // 2. Prompt the user to use their passkey
    const assertionResponse: AuthenticationResponseJSON = await browserStartAuthentication(options);

    // 3. Send the response to the server for verification
    const verificationResult = await verifyLoginAction(assertionResponse);

    if (verificationResult && verificationResult.verified) {
      // Store credential ID to identify current device
      localStorage.setItem('passkey_credential_id', assertionResponse.id);
      return { success: true, personHash: verificationResult.personHash };
    } else {
       return { success: false, message: 'Verification failed. ' + (verificationResult.error || 'Unknown server error.') };
    }
  } catch (error: any) {
    let message = error.message || 'An unknown error occurred during login.';
    if (error.name === 'NotAllowedError') {
        message = 'Login was cancelled.';
    }
    return { success: false, message: message };
  }
}
