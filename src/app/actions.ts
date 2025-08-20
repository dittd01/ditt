'use server';

import { moderateVotingSuggestion } from '@/ai/flows/moderate-voting-suggestions';
import { curateTopicSuggestion } from '@/ai/flows/curate-topic-suggestion';
import { categories, allTopics } from '@/lib/data';

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
        
        // In a real app, you might not want to send all topics every time.
        // For this demo, we will.
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
            return { success: true, message: `Thanks! Your suggestion is similar to an existing topic and has been merged.` };
        }
        
        return { success: true, message: 'Thank you! Your new topic suggestion has been accepted and is under review.' };

    } catch(error) {
        console.error('Error curating suggestion:', error);
        return { success: false, message: 'An error occurred while processing your suggestion.' };
    }
}
