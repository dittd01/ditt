
'use server';

import { computePersonHash, deriveAgeFromFnr } from '@/lib/auth-utils.server';
import type { Eligibility } from '@/lib/types';
import { z } from 'zod';
import { currentUser } from '@/lib/user-data';

const BankIDCallbackSchema = z.object({
  fnr: z.string().regex(/^\d{11}$/, 'Invalid Norwegian Fødselsnummer'),
});

export type BankIDCallbackInput = z.infer<typeof BankIDCallbackSchema>;

interface OnboardingResult {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  personHash?: string;
  eligibility?: Omit<Eligibility, 'deviceIds'>;
}

/**
 * Simulates the callback handling for a BankID OIDC authentication flow.
 *
 * In a real implementation, this function would:
 * 1. Receive an authorization code from the OIDC provider.
 * 2. Exchange the code for an ID token.
 * 3. Verify the ID token's signature and claims.
 * 4. Extract the Fnr (fødselsnummer) from the verified token.
 *
 * For this prototype, we receive the Fnr directly and simulate the rest.
 */
export async function handleBankIdCallback(input: BankIDCallbackInput): Promise<OnboardingResult> {
  try {
    const { fnr } = BankIDCallbackSchema.parse(input);

    // Development backdoor for the test user
    if (process.env.NODE_ENV !== 'production' && fnr === '00000000000') {
      return {
        success: true,
        message: 'Developer login successful for test user.',
        isNewUser: false, // Assume test user already exists and has passkeys
        personHash: currentUser.uid, // The known UID for the default test user
        eligibility: {
          is_adult: true,
          assurance_level: 'BankID',
          createdAt: Date.now(),
          lastVerifiedAt: Date.now(),
          bankid_first_verified_at: Date.now(),
        },
      };
    }

    // 1. Derive age and check eligibility
    const age = await deriveAgeFromFnr(fnr);
    if (age < 18) {
      return {
        success: false,
        message: 'User must be at least 18 years old to register.',
      };
    }

    // 2. Compute the privacy-preserving person hash
    const personHash = await computePersonHash(fnr);

    // 3. Check if eligibility record already exists in Firestore (simulated)
    // const eligibilityRef = db.collection('eligibility').doc(personHash);
    // const doc = await eligibilityRef.get();
    // const isNewUser = !doc.exists;
    const isNewUser = true; // Simulating new user for now

    const now = Date.now();
    let eligibilityData: Omit<Eligibility, 'deviceIds'>;

    if (isNewUser) {
      // 4a. Create a new eligibility record
      eligibilityData = {
        is_adult: true,
        assurance_level: 'BankID',
        createdAt: now,
        lastVerifiedAt: now,
        bankid_first_verified_at: now,
        // deviceIds will be added when the first device is linked
      };
      // await eligibilityRef.set(eligibilityData);
      console.log('SIMULATE: Creating new eligibility record for', personHash);
    } else {
      // 4b. Update existing eligibility record
      // const existingData = doc.data() as Eligibility;
      const existingData: any = {}; // placeholder
      eligibilityData = {
          ...existingData,
          lastVerifiedAt: now,
      };
      // await eligibilityRef.update({ lastVerifiedAt: now });
      console.log('SIMULATE: Updating eligibility record for', personHash);
    }
    
    // 5. Mint a Firebase custom token and return session info
    // const firebaseToken = await admin.auth().createCustomToken(personHash);
    // For prototype, we'll just return the hash and success state.
    // The client will use this to know onboarding was successful and proceed
    // to the next step (biometric registration).

    return {
      success: true,
      message: isNewUser ? 'Verification successful. Welcome!' : 'Welcome back! Verification successful.',
      isNewUser,
      personHash,
      eligibility: eligibilityData,
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
        return { success: false, message: `Invalid input: ${error.errors[0].message}` };
    }
    console.error('Error in BankID callback:', error);
    return { success: false, message: 'An unexpected error occurred during verification.' };
  }
}
