
'use server';

/**
 * @fileOverview A topic curation AI agent for "Ditt Demokrati".
 * This flow processes user-submitted suggestions for new voting topics. It normalizes the suggestion,
 * maps it to the MECE taxonomy, handles numeric parameters, detects duplicates against existing topics,
 * and makes a decision to create, merge, or reject the topic.
 *
 * - curateTopicSuggestion - A function that handles the topic curation process.
 * - CurateTopicSuggestionInput - The input type for the curateTopicSuggestion function.
 * - CurateTopicSuggestionOutput - The return type for the curateTopicSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CurateTopicSuggestionInputSchema = z.object({
  user_text: z.string().describe('The raw text suggestion for the topic question submitted by the user.'),
  user_description: z.string().optional().describe('The optional user-submitted description or context for the topic.'),
  user_pro_argument: z.string().optional().describe('An optional key argument "for" the topic, submitted by the user.'),
  user_con_argument: z.string().optional().describe('An optional key argument "against" the topic, submitted by the user.'),
  taxonomy_json: z.string().describe('A JSON string representing the MECE category/subcategory taxonomy.'),
  existing_topics_json: z.string().describe('A JSON string of existing canonical topics to check for duplicates.'),
});
export type CurateTopicSuggestionInput = z.infer<typeof CurateTopicSuggestionInputSchema>;

const CurateTopicSuggestionOutputSchema = z.object({
  action: z.enum(['create', 'merge', 'reject']).describe('The final decision for the suggestion.'),
  category: z.string().describe('The assigned category from the taxonomy.'),
  subcategory: z.string().describe('The assigned subcategory from the taxonomy.'),
  canonical_nb: z.string().describe('The normalized, neutral phrasing of the topic in Norwegian (Bokmål).'),
  canonical_en: z.string().describe('The normalized, neutral phrasing of the topic in English.'),
  canonical_description: z.string().describe('A refined, neutral description of the topic, based on user input or generated if none was provided.'),
  key_pro_argument: z.string().describe('A clear, concise key argument in favor of the topic.'),
  key_con_argument: z.string().describe('A clear, concise key argument against the topic.'),
  parameters: z.object({
    threshold: z.number().int().optional().describe('The extracted numeric threshold, as an absolute integer in NOK.'),
    threshold_binned: z.number().int().optional().describe('The threshold binned to the nearest 5 million.'),
  }).describe('Extracted numeric parameters from the suggestion.'),
  duplicate_of: z.string().describe("The 'canonical_nb' of the existing topic if the action is 'merge', otherwise an empty string."),
  similarity: z.object({
    cosine_estimate: z.number().describe('Estimated cosine similarity between the suggestion and the closest existing topic (0.0 to 1.0).'),
    parameter_distance: z.number().int().optional().describe('The absolute NOK distance between the suggestion\'s parameter and an existing topic\'s parameter.'),
    same_bin: z.boolean().optional().describe('Whether the suggestion\'s parameter falls into the same bin as an existing topic\'s.'),
  }).describe('Similarity metrics used for duplicate detection.'),
  policy_flags: z.array(z.string()).describe('Flags for content that may violate policy or require human review. "none" if no issues.'),
  reject_reason: z.string().describe('The reason for rejection if the action is "reject", otherwise an empty string.'),
  confidence: z.number().describe('The model\'s confidence in its decision, from 0.0 to 1.0.'),
});
export type CurateTopicSuggestionOutput = z.infer<typeof CurateTopicSuggestionOutputSchema>;


export async function curateTopicSuggestion(input: CurateTopicSuggestionInput): Promise<CurateTopicSuggestionOutput> {
  return curateTopicSuggestionFlow(input);
}


const prompt = ai.definePrompt({
  name: 'curateTopicSuggestionPrompt',
  input: { schema: CurateTopicSuggestionInputSchema },
  output: { schema: CurateTopicSuggestionOutputSchema },
  prompt: `You are a Topic Curator AI for the anonymous voting platform “Ditt Demokrati”. Your role is to process user-submitted suggestions for new voting topics with precision and neutrality.

Your primary sources of truth for any factual claims, statistics, or financial data are the official Norwegian government budget (Regjeringen.no) and Statistics Norway (SSB.no). Use information from these sites to inform your generated content:
- https://www.regjeringen.no/no/statsbudsjett/2025/a-aa/id3052994/
- https://www.ssb.no
- https://www.ssb.no/offentlig-sektor/faktaside/slik-brukes-skattepengene

Follow these instructions exactly:

1.  **Normalize Text**:
    -   Rewrite the user's suggestion (user_text) into a clear, neutral, single-issue question.
    -   The question must be answerable with a simple "Yes" or "No".
    -   Remove any rhetorical, biased, or loaded framing.
    -   Generate both Norwegian Bokmål (canonical_nb) and English (canonical_en) versions.

2.  **Generate Content**:
    -   **Description**: Review the 'user_description'. If it's provided, refine it to be neutral and encyclopedic. If it's empty, generate a brief, objective background for the topic. Base any facts or figures on the provided Norwegian government sources.
    -   **Key Arguments**: Review 'user_pro_argument' and 'user_con_argument'. If provided, sharpen them into concise, compelling single sentences. If empty, generate a strong, representative 'key_pro_argument' and 'key_con_argument' from scratch, grounded in data from the key sources where applicable.

3.  **Map to Taxonomy**:
    -   Analyze the provided taxonomy_json.
    -   Assign the normalized topic to exactly one Category and one Subcategory. Be precise. If uncertain, choose the most plausible subcategory.

4.  **Handle Numeric Parameters**:
    -   If the suggestion contains a numeric threshold (e.g., an amount in NOK), extract it into the 'parameters.threshold' field.
    -   Normalize numbers to absolute integers (e.g., "15 million" -> 15000000).
    -   Calculate 'parameters.threshold_binned' by rounding the threshold to the nearest 5,000,000.

5.  **Duplicate Detection**:
    -   Compare the normalized suggestion against the existing_topics_json within the *same subcategory*.
    -   Calculate an estimated semantic similarity ('similarity.cosine_estimate').
    -   If parameters exist, calculate the 'similarity.parameter_distance' (absolute difference in NOK).
    -   Determine if the binned thresholds are the same ('similarity.same_bin').
    -   Mark as a duplicate ('merge') if semantic similarity is very high (>= 0.9) OR if the parameter distance is less than 10,000,000 NOK.

6.  **Decision Logic**:
    -   **'create'**: If the topic is new, valid, and not a duplicate.
    -   **'merge'**: If it's a duplicate of an existing topic. The 'duplicate_of' field must contain the 'canonical_nb' of the topic it merges with.
    -   **'reject'**: If the suggestion is multi-issue, out of scope for the platform, unsafe, or violates policy. Provide a clear 'reject_reason'.

7.  **Moderation**:
    -   Analyze for safety. Reject any suggestions containing personal attacks, PII, illegal content, or harmful topics.
    -   Use 'policy_flags' to note any concerns (e.g., "borderline-language", "sensitive-topic"). Set to ["none"] if clear.

8.  **Final Output**:
    -   Return ONLY a single, valid JSON object matching the output schema. Do not include any explanations or prose.
    -   Set a 'confidence' score (0.0 to 1.0) for your overall output.

**Inputs:**
-   User Text: {{{user_text}}}
-   User Description: {{{user_description}}}
-   User Pro Argument: {{{user_pro_argument}}}
-   User Con Argument: {{{user_con_argument}}}
-   Taxonomy: {{{taxonomy_json}}}
-   Existing Topics: {{{existing_topics_json}}}
`,
});

const curateTopicSuggestionFlow = ai.defineFlow(
  {
    name: 'curateTopicSuggestionFlow',
    inputSchema: CurateTopicSuggestionInputSchema,
    outputSchema: CurateTopicSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a structured response from the model.');
    }
    return output;
  }
);
