
'use server';

/**
 * @fileOverview An AI agent for generating rebuttal hints in a debate.
 * This flow takes a user's argument and a list of opposing arguments. It either finds
 * the most relevant existing counter-argument or generates a new one.
 *
 * - generateRebuttal - The main function to get a rebuttal hint.
 * - GenerateRebuttalInput - The input type for the function.
 * - GenerateRebuttalOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OpposingArgumentSchema = z.object({
    id: z.string(),
    text: z.string(),
});

const GenerateRebuttalInputSchema = z.object({
  topicQuestion: z.string().describe("The main question or topic of the debate."),
  argumentText: z.string().describe("The user's newly submitted argument text."),
  opposingArguments: z.array(OpposingArgumentSchema).describe('A list of existing arguments from the opposing side of the debate.'),
});
export type GenerateRebuttalInput = z.infer<typeof GenerateRebuttalInputSchema>;


const GenerateRebuttalOutputSchema = z.object({
  rebuttal: z.string().describe('The single most relevant counter-argument, either selected from the existing list or newly generated.'),
});
export type GenerateRebuttalOutput = z.infer<typeof GenerateRebuttalOutputSchema>;

export async function generateRebuttal(input: GenerateRebuttalInput): Promise<GenerateRebuttalOutput> {
  return generateRebuttalFlow(input);
}

// Why: A dedicated prompt with a strongly-typed schema ensures the LLM's response
// is structured and predictable.
const prompt = ai.definePrompt({
  name: 'generateRebuttalPrompt',
  input: { schema: GenerateRebuttalInputSchema },
  output: { schema: GenerateRebuttalOutputSchema },
  prompt: `
    You are an expert debate coach. Your goal is to help users strengthen their arguments by considering counter-arguments.
    
    The main topic of the debate is:
    "{{{topicQuestion}}}"

    A user has just submitted the following argument:
    "{{{argumentText}}}"

    Your task is to provide them with a single, relevant rebuttal hint. Follow these steps:

    1.  **Analyze Existing Counter-Arguments**: Review the list of existing opposing arguments:
        {{#if opposingArguments}}
            {{#each opposingArguments}}
                - "{{this.text}}"
            {{/each}}
        {{else}}
            (No existing opposing arguments)
        {{/if}}

    2.  **Decision Logic**:
        -   **If** you find an existing argument that is a strong, direct rebuttal to the user's point (within the context of the main topic), select its text.
        -   **Else if** there are no relevant existing arguments (or the list is empty), you MUST generate a new, concise, and plausible counter-argument. This new rebuttal should directly challenge the user's premise.

    3.  **Output**:
        -   Return a single JSON object containing the chosen or generated rebuttal in the 'rebuttal' field.
  `,
});

const generateRebuttalFlow = ai.defineFlow(
  {
    name: 'generateRebuttalFlow',
    inputSchema: GenerateRebuttalInputSchema,
    outputSchema: GenerateRebuttalOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a structured response from the model.');
    }
    return output;
  }
);
