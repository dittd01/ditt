
'use server';

import { moderateVotingSuggestion } from '@/ai/flows/moderate-voting-suggestions';
import { curateTopicSuggestion, type CurateTopicSuggestionInput, type CurateTopicSuggestionOutput } from '@/ai/flows/curate-topic-suggestion';
import { generateMockUser, type GenerateMockUserOutput } from '@/ai/flows/generate-mock-user';
import { populatePoll, type PopulatePollOutput } from '@/ai/flows/populate-poll-flow';
import { curateArgument, type CurateArgumentInput, type CurateArgumentOutput } from '@/ai/flows/curate-argument';
import { generateRebuttal, type GenerateRebuttalInput, type GenerateRebuttalOutput } from '@/ai/flows/generate-rebuttal';
import { categories, allTopics } from '@/lib/data';
import { calculateQVCost } from '@/lib/qv';
import type { Topic, FinanceData, Device } from '@/lib/types';
import { 
    generateRegistrationChallenge, 
    verifyRegistration,
    generateLoginChallenge,
    verifyLogin,
    getDevicesForUser
} from '@/lib/auth-utils.server';
import type { RegistrationResponseJSON, AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import { z } from 'zod';
import { allFinanceData } from '@/lib/finance-data';


export async function moderateSuggestionAction(suggestion: string) {
  try {
    if (!suggestion || suggestion.trim().length < 10) {
      return { isAppropriate: false, reason: 'Suggestion is too short.' };
    }
    const result = await moderateVotingSuggestion({ suggestion });
    return result;
  } catch (error) {
    console.error('Error moderating suggestion:', error);
    return { isAppropriate: false, reason: 'An error occurred while moderating the suggestion.' };
  }
}

export async function curateSuggestionAction(input: CurateTopicSuggestionInput): Promise<{
    success: boolean;
    message: string;
    action?: 'create' | 'merge' | 'reject';
    curationResult?: CurateTopicSuggestionOutput;
}> {
    try {
        if (!input.user_text || input.user_text.trim().length < 10) {
            return { success: false, message: 'Suggestion is too short.' };
        }
        
        const existing_topics_json = JSON.stringify(allTopics.map(t => ({
            canonical_nb: t.question,
            category: t.categoryId,
            subcategory: t.subcategoryId
        })));

        const taxonomy_json = JSON.stringify(categories);

        const result = await curateTopicSuggestion({ 
            ...input,
            taxonomy_json,
            existing_topics_json,
         });

        if (result.action === 'reject') {
             return { success: false, message: `Suggestion rejected: ${result.reject_reason}`, action: 'reject' };
        }
        
        if (result.action === 'merge') {
            return { 
                success: true, 
                action: 'merge', 
                message: `Thanks! Your suggestion is similar to an existing topic and has been merged.`,
                curationResult: result 
            };
        }
        
        // Action is 'create', return the data for user review
        return { 
            success: true, 
            action: 'create',
            message: 'AI review complete. Please confirm the details.',
            curationResult: result,
        };

    } catch(error) {
        console.error('Error curating suggestion:', error);
        return { success: false, message: 'An error occurred while processing your suggestion.' };
    }
}

export async function curateArgumentAction(input: CurateArgumentInput): Promise<{ success: boolean; data?: CurateArgumentOutput; message?: string }> {
    try {
        const result = await curateArgument(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error curating argument:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message };
    }
}


// In a real app, this would interact with Firestore and be secured by Cloud Functions.
// For now, we simulate the logic.
export async function castQuadraticVoteAction(input: {
  userId: string;
  topicId: string;
  votes: { yes: number, no: number };
  currentCredits: number;
}) {
  const { userId, topicId, votes, currentCredits } = input;
  const cost = calculateQVCost(votes.yes) + calculateQVCost(votes.no);

  if (cost > currentCredits) {
    return { 
        success: false, 
        message: 'Insufficient voice credits.',
        newCreditBalance: currentCredits,
    };
  }

  const newCreditBalance = currentCredits - cost;
  
  console.log(`User ${userId} voted on topic ${topicId}. Votes: ${JSON.stringify(votes)}, Cost: ${cost}, New Balance: ${newCreditBalance}`);

  // Here you would update Firestore:
  // 1. Decrement userCredits[userId].balance
  // 2. Add/update the record in votes collection
  // 3. This should be done in a transaction.

  return {
    success: true,
    message: `Vote cast successfully! You spent ${cost} credits.`,
    newCreditBalance: newCreditBalance,
  };
}


export async function generateMockUserAction(): Promise<{ success: true, data: GenerateMockUserOutput } | { success: false, message: string }> {
    try {
        const result = await generateMockUser({ role: 'standard user', country: 'Norway' });
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating mock user:', error);
        return { success: false, message: 'Failed to generate mock user data.' };
    }
}


export async function populatePollAction(input: { title: string, customPrompt?: string }): Promise<{ success: true, data: PopulatePollOutput } | { success: false, message: string }> {
    const PopulatePollInputClientSchema = z.object({
      title: z.string().min(1, "Title is required."),
      customPrompt: z.string().optional(),
    });

    try {
        const validatedInput = PopulatePollInputClientSchema.parse(input);

        const taxonomy_json = JSON.stringify(categories.map(c => ({
            id: c.id,
            label: c.label,
            subcategories: c.subcategories.map(s => ({ id: s.id, label: s.label }))
        })));
        
        const result = await populatePoll({ ...validatedInput, taxonomy_json });
        return { success: true, data: result };
    } catch (error) {
        console.error('Error populating poll from AI:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message };
    }
}

export async function generateRebuttalAction(input: GenerateRebuttalInput): Promise<{ success: boolean; data?: GenerateRebuttalOutput, message?: string }> {
    try {
        const result = await generateRebuttal(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating rebuttal:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message };
    }
}


// --- WebAuthn Actions ---

export async function getRegistrationChallengeAction(personHash: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
    return generateRegistrationChallenge(personHash);
}

export async function verifyRegistrationAction(personHash: string, response: RegistrationResponseJSON): Promise<{ verified: boolean; error?: string; }> {
    return await verifyRegistration(personHash, response);
}

export async function getLoginChallengeAction(): Promise<PublicKeyCredentialRequestOptionsJSON> {
    return generateLoginChallenge();
}

export async function verifyLoginAction(response: AuthenticationResponseJSON): Promise<{ verified: boolean; personHash?: string; error?: string; }> {
    return await verifyLogin(response);
}

export async function getDevicesForUserAction(personHash: string): Promise<Device[]> {
    return await getDevicesForUser(personHash);
}

// --- Finance Actions ---
export async function getFinanceDataForCountry(
  countryIso3: string,
  year: number
): Promise<FinanceData | null> {
  // Simulate a database lookup with a delay
  await new Promise(resolve => setTimeout(resolve, 50));

  const data = allFinanceData.data.find(
    d => d.countryIso3 === countryIso3 && d.year === year
  );

  return data || null;
}
