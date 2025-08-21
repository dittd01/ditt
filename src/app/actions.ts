
'use server';

import { moderateVotingSuggestion } from '@/ai/flows/moderate-voting-suggestions';
import { curateTopicSuggestion } from '@/ai/flows/curate-topic-suggestion';
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

export async function curateSuggestionAction(suggestion: string) {
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
             return { success: false, message: `Suggestion rejected: ${result.reject_reason}` };
        }
        
        if (result.action === 'merge') {
            return { success: true, action: 'merge', message: `Thanks! Your suggestion is similar to an existing topic and has been merged.` };
        }
        
        // If we get here, the action is 'create'.
        // We'll create a new Topic object to pass back to the client.
        const newTopicSlug = result.canonical_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const newTopic: Partial<Topic> = {
            id: `topic_${Date.now()}`,
            slug: newTopicSlug,
            question: result.canonical_nb,
            description: `A new topic suggested by a user: ${result.canonical_en}`,
            categoryId: result.category,
            subcategoryId: result.subcategory,
            // These are placeholder values for a new topic
            imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1738&auto=format&fit=crop',
            aiHint: 'debate ideas',
            status: 'live',
            voteType: 'yesno', // Default to yes/no for new suggestions
            votes: { yes: 0, no: 0, abstain: 0},
            totalVotes: 0,
            votesLastWeek: 0,
            history: [],
             options: [
                { id: 'yes', label: 'Yes', color: 'hsl(var(--chart-2))' },
                { id: 'no', label: 'No', color: 'hsl(var(--chart-1))' },
                { id: 'abstain', label: 'Abstain', color: 'hsl(var(--muted))' }
            ],
        };

        return { 
            success: true, 
            action: 'create',
            message: 'Thank you! Your new topic suggestion has been accepted and is now live.',
            newTopic: newTopic,
            suggestionForProfile: {
                id: Date.now(),
                text: suggestion, // The original user text
                verdict: 'Approved',
                reason: 'Clear, single-issue question.',
                slug: newTopicSlug,
            }
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
