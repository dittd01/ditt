
'use client';
import {
  getRegistrationChallengeAction,
  verifyRegistrationAction,
  getLoginChallengeAction,
  verifyLoginAction
} from '@/app/actions';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';

// Helper function to convert buffer-like data to Base64URL
const bufferToBase64URL = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Helper function to convert Base64URL to a buffer
const base64URLToBuffer = (base64urlString: string): ArrayBuffer => {
  const base64 = String(base64urlString).replace(/-/g, '+').replace(/_/g, '/');
  const binStr = atob(base64);
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
    // In a real app, the username would be dynamic.
    const username = `user_${personHash.substring(0, 8)}`;

    // 1. Get a challenge from the server
    const options = await getRegistrationChallengeAction(personHash, username);
    
    // SimpleWebAuthn's startRegistration expects `challenge` to be a Uint8Array
    // but the server sends it as a base64url string for JSON compatibility.
    // We need to convert it back.
    options.challenge = base64URLToBuffer(options.challenge as unknown as string);
    if(options.user.id) {
        options.user.id = base64URLToBuffer(options.user.id as unknown as string);
    }
    
    // 2. Prompt the user to create a passkey
    const { startRegistration } = await import('@simplewebauthn/browser');
    const attestationResponse: RegistrationResponseJSON = await startRegistration(options);
    
    // 3. Send the response back to the server for verification
    const verificationResult = await verifyRegistrationAction(personHash, attestationResponse);

    if (verificationResult && verificationResult.verified) {
      return { success: true };
    } else {
      return { success: false, message: 'Verification failed. ' + verificationResult.error };
    }
  } catch (error: any) {
    console.error('Registration failed:', error);
    if (error.name === 'InvalidStateError') {
      return { success: false, message: 'This passkey has already been registered.' };
    }
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

/**
 * Begins the passkey login process.
 */
export async function startLogin(): Promise<{ success: boolean; message?: string, personHash?: string }> {
  try {
    // 1. Get a challenge from the server. For discoverable credentials, we don't pass a username.
    const options = await getLoginChallengeAction();
    
    // Convert challenge from Base64URL to ArrayBuffer
    options.challenge = base64URLToBuffer(options.challenge as unknown as string);
    // For discoverable credentials, allowCredentials is not set, so no conversion needed here.

    // 2. Prompt the user to use their passkey
    const { startAuthentication } = await import('@simplewebauthn/browser');
    const assertionResponse: AuthenticationResponseJSON = await startAuthentication(options);

    // 3. Send the response to the server for verification
    const verificationResult = await verifyLoginAction(assertionResponse);

    if (verificationResult && verificationResult.verified) {
      return { success: true, personHash: verificationResult.personHash };
    } else {
       return { success: false, message: 'Verification failed. ' + verificationResult.error };
    }
  } catch (error: any) {
    console.error('Login failed:', error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
