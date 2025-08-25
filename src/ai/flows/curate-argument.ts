
'use server';

/**
 * @fileOverview An AI agent for curating debate arguments.
 * This flow processes a user-submitted argument, checks for semantic duplicates
 * against existing arguments, normalizes the text for clarity, and suggests a title.
 * The goal is to improve debate quality and prevent redundant posts.
 *
 * - curateArgument - The main function to process a new argument.
 * - CurateArgumentInput - The input type for the function.
 * - CurateArgumentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExistingArgumentSchema = z.object({
    id: z.string(),
    text: z.string(),
});

const CurateArgumentInputSchema = z.object({
  userText: z.string().describe('The raw text of the argument submitted by the user.'),
  existingArguments: z.array(ExistingArgumentSchema).describe('A list of existing arguments to check for duplicates.'),
  side: z.enum(['for', 'against']).describe("The side of the debate the user's argument is on."),
});
export type CurateArgumentInput = z.infer<typeof CurateArgumentInputSchema>;

const CurateArgumentOutputSchema = z.object({
  action: z.enum(['create', 'merge']).describe('The recommended action. "create" for a new argument, "merge" if a duplicate is found.'),
  normalizedText: z.string().describe('A refined, clearer, and more neutral version of the user\'s argument.'),
  suggestedTitle: z.string().max(80).describe('A concise, AI-generated title that summarizes the core of the argument.'),
  mergeSuggestion: z.object({
    similarArgumentId: z.string().optional().describe('The ID of the most similar existing argument if action is "merge".'),
    similarityScore: z.number().optional().describe('The cosine similarity score (0.0 to 1.0) with the most similar argument.'),
  }).describe('Details for merging with an existing argument.'),
  confidence: z.number().min(0).max(1).describe('The model\'s confidence in its decision and generated content.'),
});
export type CurateArgumentOutput = z.infer<typeof CurateArgumentOutputSchema>;

export async function curateArgument(input: CurateArgumentInput): Promise<CurateArgumentOutput> {
  // Why: Direct pass-through to the Genkit flow. This keeps the exported function
  // clean and allows the underlying flow to be instrumented and managed by Genkit.
  return curateArgumentFlow(input);
}

// Why: A dedicated prompt with a strongly-typed schema ensures the LLM's response
// is structured and predictable, reducing the risk of runtime errors.
// This is the core instruction set for the AI agent.
const prompt = ai.definePrompt({
  name: 'curateArgumentPrompt',
  input: { schema: CurateArgumentInputSchema },
  output: { schema: CurateArgumentOutputSchema },
  prompt: `
    You are an expert debate moderator and editor for a sophisticated online platform. Your primary goal is to ensure the debate is clear, non-redundant, and high-quality.

    A user has submitted a new argument for the "{{side}}" side of a debate. Your task is to process it by following these steps precisely:

    1.  **Analyze for Duplication**:
        -   Carefully read the user's submission: "{{userText}}".
        -   Compare it semantically against the list of existing arguments: {{{jsonStringify existingArguments}}}.
        -   Calculate a similarity score for the most similar existing argument.
        -   **Decision Rule**: If the similarity score is > 0.9, you MUST set the action to "merge". Otherwise, set the action to "create".

    2.  **Normalize and Refine Text**:
        -   Rewrite the user's argument ("{{userText}}") to be as clear, concise, and neutral as possible.
        -   Remove any inflammatory language, rhetorical questions, or personal attacks, but preserve the core logical point.
        -   Store this improved version in the 'normalizedText' field.

    3.  **Generate a Title**:
        -   Based on the normalized text, create a short, descriptive title (max 80 characters) that accurately summarizes the argument's main point.
        -   Store this in the 'suggestedTitle' field.

    4.  **Populate Output**:
        -   If the action is "merge", you MUST provide the 'similarArgumentId' and 'similarityScore' in the 'mergeSuggestion' object.
        -   If the action is "create", the 'mergeSuggestion' object should be empty.
        -   Provide a 'confidence' score from 0.0 to 1.0 based on how certain you are about your analysis and generated content.

    Return ONLY a single, valid JSON object that strictly adheres to the output schema.
  `,
});


const curateArgumentFlow = ai.defineFlow(
  {
    name: 'curateArgumentFlow',
    inputSchema: CurateArgumentInputSchema,
    outputSchema: CurateArgumentOutputSchema,
  },
  async (input) => {

    // Why: We check for the trivial edge case of no existing arguments here.
    // This saves a call to the LLM when it's not necessary and simplifies the prompt logic.
    if (input.existingArguments.length === 0) {
        const createNewPrompt = ai.definePrompt({
            name: 'curateFirstArgumentPrompt',
            input: { schema: z.object({ userText: z.string() }) },
            output: { schema: z.object({ normalizedText: z.string(), suggestedTitle: z.string() }) },
            prompt: `A user has submitted the first argument in a debate: "{{userText}}".
            
            1. Rewrite the argument to be as clear, concise, and neutral as possible. This is 'normalizedText'.
            2. Create a short, descriptive title (max 80 characters) that summarizes the argument. This is 'suggestedTitle'.
            
            Return ONLY a single, valid JSON object.`
        });
        const { output } = await createNewPrompt({ userText: input.userText });
        if (!output) {
            throw new Error('Failed to generate content for the first argument.');
        }
        return {
            action: 'create',
            normalizedText: output.normalizedText,
            suggestedTitle: output.suggestedTitle,
            mergeSuggestion: {},
            confidence: 0.95,
        };
    }

    // Why: If there are existing arguments, we proceed with the full curation and deduplication prompt.
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a structured response from the model.');
    }
    return output;
  }
);
