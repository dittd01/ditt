
'use client';
import {
  getRegistrationChallengeAction,
  verifyRegistrationAction,
  getLoginChallengeAction,
  verifyLoginAction
} from '@/app/actions';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';
import { startRegistration as browserStartRegistration, startAuthentication as browserStartAuthentication } from '@simplewebauthn/browser';

// Helper function to convert buffer-like data to Base64URL
const bufferToBase64URL = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Helper function to convert Base64URL to a buffer
const base64URLToBuffer = (base64urlString: string): ArrayBuffer => {
  // Ensure the input is a string before calling replace
  const padded = String(base64urlString).replace(/-/g, '+').replace(/_/g, '/') + '=='.substring(0, (3 * base64urlString.length) % 4);
  const binStr = atob(padded);
  const bin = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bin[i] = binStr.charCodeAt(i);
  }
  return bin.buffer;
};


/**
 * Begins the passkey registration process.
 * @param personHash The unique identifier for the user.
 */
export async function startRegistration(personHash: string): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Get a challenge from the server
    const options = await getRegistrationChallengeAction(personHash);
    
    // The server sends the challenge as a base64url-encoded string.
    // The browser's WebAuthn API expects `challenge` to be an ArrayBuffer.
    if(options.challenge) {
       options.challenge = base64URLToBuffer(options.challenge as unknown as string);
    }
   
    // The user.id from the server is a utf-8 string, but the browser API expects an ArrayBuffer.
    if(options.user && options.user.id) {
        options.user.id = new TextEncoder().encode(options.user.id as unknown as string) as any;
    }
    
    // 2. Prompt the user to create a passkey
    const attestationResponse: RegistrationResponseJSON = await browserStartRegistration(options);
    
    // 3. Send the response back to the server for verification
    const verificationResult = await verifyRegistrationAction(personHash, attestationResponse);

    if (verificationResult && verificationResult.verified) {
      // Store credential ID to identify current device
      localStorage.setItem('passkey_credential_id', attestationResponse.id);
      return { success: true };
    } else {
      return { success: false, message: 'Verification failed. ' + verificationResult.error };
    }
  } catch (error: any) {
    console.error('Registration failed:', error);
    if (error.name === 'InvalidStateError') {
      return { success: false, message: 'This passkey has already been registered on another account.' };
    }
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

/**
 * Begins the passkey login process.
 */
export async function startLogin(): Promise<{ success: boolean; message?: string, personHash?: string }> {
  try {
    // 1. Get a challenge from the server for discoverable credentials.
    const options = await getLoginChallengeAction();
    
    // Convert challenge from Base64URL to ArrayBuffer
    if (options.challenge) {
        options.challenge = base64URLToBuffer(options.challenge as unknown as string);
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
       return { success: false, message: 'Verification failed. ' + verificationResult.error };
    }
  } catch (error: any) {
    console.error('Login failed:', error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
