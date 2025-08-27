
'use server';

/**
 * @fileOverview An AI agent that populates a poll form from a single title.
 * This flow takes a user-provided title and generates all the necessary fields
 * for a well-structured poll, including a neutral description, pro/con arguments,
 * category, subcategory, and tags.
 *
 * - populatePoll - A function that handles the poll population process.
 * - PopulatePollInput - The input type for the populatePoll function.
 * - PopulatePollOutput - The return type for the populatePoll function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PopulatePollInputSchema = z.object({
  title: z.string().describe('The user-provided title for the poll.'),
  taxonomy_json: z.string().describe('A JSON string representing the MECE category/subcategory taxonomy.'),
  customPrompt: z.string().optional().describe('An optional custom prompt to override the default instructions.'),
});
type PopulatePollInput = z.infer<typeof PopulatePollInputSchema>;

const PopulatePollOutputSchema = z.object({
  title: z.string().describe('A refined, neutral, and clear version of the poll question.'),
  description: z.string().describe('A brief, encyclopedic, and neutral background description for the poll topic.'),
  language: z.enum(['en', 'no']).describe('The detected language of the original title, either English (en) or Norwegian (no).'),
  category: z.string().describe('The single most appropriate category ID from the provided taxonomy.'),
  subcategory: z.string().describe('The single most appropriate subcategory ID from the provided taxonomy for the chosen category.'),
  pros: z.array(z.string()).describe('An array of 3 distinct, compelling arguments in favor of the proposal.'),
  cons: z.array(z.string()).describe('An array of 3 distinct, compelling arguments against the proposal.'),
  tags: z.array(z.string()).describe('An array of 3-5 relevant, single-word, lowercase tags for the topic.'),
  background_md: z.string().optional().describe('A comprehensive (5-15 sentences), neutral, and encyclopedic background for the topic.'),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })).optional().describe('An array of source objects, each with a title and a URL.'),
});
export type PopulatePollOutput = z.infer<typeof PopulatePollOutputSchema>;

const DEFAULT_POPULATE_POLL_PROMPT = `You are an expert editor and political analyst for a neutral voting platform. Your task is to take a user's poll title and generate a complete, well-structured poll.

Your primary sources of truth for any factual claims, statistics, or financial data are the official Norwegian government budget (Regjeringen.no) and Statistics Norway (SSB.no). Use information from these sites to inform your generated content.
**Crucially, do not invent data.** If you mention a statistic (e.g., "statsgjelden ved utgangen av 2022"), you must provide the real number from your sources. If you do not have the number, do not include the sentence.

- https://www.regjeringen.no/no/id4/
- https://www.ssb.no

Follow these instructions precisely:

1.  **Detect Language**: Analyze the user's title and determine if it is primarily English or Norwegian. Set the 'language' field to 'en' for English or 'no' for Norwegian.
2.  **Generate Content in Detected Language**: All subsequent text fields (title, description, pros, cons) **must** be generated in the language you detected in step 1.
3.  **Refine Title**: Rewrite the user's title to be a clear, neutral, and unbiased question that can be voted on.
4.  **Generate Description**: Write a brief (2-3 sentences), neutral, and encyclopedic background for the topic. Ground any data points in the provided official sources.
5.  **Generate Arguments**: Create exactly three distinct, strong, and concise arguments FOR the proposal (pros) and exactly three distinct, strong, and concise arguments AGAINST it (cons). These should reflect common real-world viewpoints on the issue.
6.  **Categorize**: Based on the provided taxonomy, assign the poll to the most relevant **category** and **subcategory**. Your output for the category and subcategory fields must be the **ID** (e.g., 'taxation', 'wealth_tax'), not the label.
7.  **Generate Tags**: Provide an array of 3 to 5 relevant, single-word, lowercase tags for the topic.
8.  **Generate Background**: Write a more comprehensive (5-15 sentences), neutral, and encyclopedic background for the topic. preferred source: https://www.regjeringen.no/no/id4/ and https://www.ssb.no
9.  **Add Source Links**: If you used any of the official sources provided to generate the background or description, include them in the 'sources' array. Each source should be an object with a 'title' (e.g., "SSB: Public Finances") and a 'url'.

Return ONLY a single, valid JSON object matching the output schema.

**Taxonomy for Categorization:**
{{{taxonomy_json}}}

**User-provided Title:**
"{{{title}}}"
`;

export async function populatePoll(input: PopulatePollInput): Promise<PopulatePollOutput> {
  return populatePollFlow(input);
}


const populatePollFlow = ai.defineFlow(
  {
    name: 'populatePollFlow',
    inputSchema: PopulatePollInputSchema,
    outputSchema: PopulatePollOutputSchema,
  },
  async (input) => {
    
    const prompt = ai.definePrompt({
        name: 'populatePollPrompt_dynamic',
        input: { schema: PopulatePollInputSchema },
        output: { schema: PopulatePollOutputSchema },
        prompt: input.customPrompt || DEFAULT_POPULATE_POLL_PROMPT,
    });

    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a structured response from the model.');
    }
    return output;
  }
);
