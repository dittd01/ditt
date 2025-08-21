
'use server';

import { moderateVotingSuggestion } from '@/ai/flows/moderate-voting-suggestions';
import { curateTopicSuggestion, type CurateTopicSuggestionOutput } from '@/ai/flows/curate-topic-suggestion';
import { categories, allTopics } from '@/lib/data';
import { calculateQVCost } from '@/lib/qv';
import type { Topic } from '@/lib/types';

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

export async function curateSuggestionAction(suggestion: string): Promise<{
    success: boolean;
    message: string;
    action?: 'create' | 'merge' | 'reject';
    curationResult?: CurateTopicSuggestionOutput;
}> {
    try {
        if (!suggestion || suggestion.trim().length < 10) {
            return { success: false, message: 'Suggestion is too short.' };
        }
        
        const existing_topics_json = JSON.stringify(allTopics.map(t => ({
            canonical_nb: t.question,
            category: t.categoryId,
            subcategory: t.subcategoryId
        })));

        const taxonomy_json = JSON.stringify(categories);

        const result = await curateTopicSuggestion({ 
            user_text: suggestion,
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
