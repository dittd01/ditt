'use server';

/**
 * @fileOverview Moderates user-submitted voting suggestions using an LLM.
 *
 * - moderateVotingSuggestion - A function to moderate a voting suggestion.
 * - ModerateVotingSuggestionInput - The input type for the moderateVotingSuggestion function.
 * - ModerateVotingSuggestionOutput - The return type for the moderateVotingSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateVotingSuggestionInputSchema = z.object({
  suggestion: z
    .string()
    .describe('The voting suggestion to be moderated.'),
});
export type ModerateVotingSuggestionInput = z.infer<typeof ModerateVotingSuggestionInputSchema>;

const ModerateVotingSuggestionOutputSchema = z.object({
  isAppropriate: z
    .boolean()
    .describe(
      'Whether the voting suggestion is appropriate and not abusive. True if it is appropriate, false otherwise.'
    ),
  reason: z
    .string()
    .describe(
      'The reason why the suggestion is considered inappropriate, if applicable. Empty string if the suggestion is appropriate.'
    ),
});
export type ModerateVotingSuggestionOutput = z.infer<typeof ModerateVotingSuggestionOutputSchema>;

export async function moderateVotingSuggestion(
  input: ModerateVotingSuggestionInput
): Promise<ModerateVotingSuggestionOutput> {
  return moderateVotingSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateVotingSuggestionPrompt',
  input: {schema: ModerateVotingSuggestionInputSchema},
  output: {schema: ModerateVotingSuggestionOutputSchema},
  prompt: `You are a content moderator for a voting platform.

You are responsible for ensuring that user-submitted voting suggestions are appropriate and not abusive.  Suggestions should be related to the voting topic at hand, and should not contain offensive, hateful, or harmful content.

Given the following voting suggestion, determine if it is appropriate.  If it is not appropriate, explain why.

Suggestion: {{{suggestion}}}

Return a JSON object with the following schema:
{
  "isAppropriate": boolean, // true if the suggestion is appropriate, false otherwise
  "reason": string // The reason why the suggestion is considered inappropriate, if applicable. Empty string if the suggestion is appropriate.
}
`,
});

const moderateVotingSuggestionFlow = ai.defineFlow(
  {
    name: 'moderateVotingSuggestionFlow',
    inputSchema: ModerateVotingSuggestionInputSchema,
    outputSchema: ModerateVotingSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
