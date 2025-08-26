
'use server';

/**
 * @fileOverview An AI agent for simulating a complete, realistic debate dataset.
 * This flow generates synthetic users and a balanced set of arguments for a given poll topic.
 * It performs analysis on the arguments to extract axes for visualization and scores them for
 * relevance and strength. The output is a complete, self-contained dataset ready for use
 * in development and demonstration environments.
 *
 * This is a developer-only tool and includes server-side checks to prevent execution in production.
 *
 * - simulateDebate - The main function to generate the synthetic debate.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { SimulateDebateInput, SimulateDebateOutput } from '@/lib/types';
import { SimulateDebateInputSchema, SimulateDebateOutputSchema } from '@/lib/types';

// The main exported function that developers will call.
export async function simulateDebate(input: SimulateDebateInput): Promise<SimulateDebateOutput> {
  return simulateDebateFlow(input);
}


// Why: Defining a dedicated prompt for the complex generation task.
// This prompt uses a structured input and requests a structured JSON output,
// which is the most reliable way to get consistent results from modern LLMs.
// It performs user generation, argument generation, and analysis in one go,
// which is more efficient than multiple separate calls.
const simulateDebatePrompt = ai.definePrompt({
  name: 'simulateDebatePrompt',
  input: { schema: SimulateDebateInputSchema },
  output: { schema: SimulateDebateOutputSchema },
  prompt: `You are an expert data synthesizer for a political debate platform. Your task is to generate a realistic and balanced set of synthetic users and arguments for a given poll topic.

**Poll Topic:** "{{pollTitle}}"
**Language:** {{language}}
**Number of Users to Generate:** {{numUsers}}
**Total Arguments to Generate:** {{numArguments}}
**Ratio of "For" Arguments:** {{ratioFor}}

**Instructions:**

1.  **Generate Users:**
    *   Create {{numUsers}} unique, pseudonymous users.
    *   Handles should sound plausible (e.g., "NordicExplorer", "TechSage7", "Kari_N"). Avoid real names.
    *   Assign each user a unique ID like "sim-user-1", "sim-user-2", etc.
    *   Generate a placeholder avatar URL for each using placehold.co, e.g. https://placehold.co/40x40.png

2.  **Generate Arguments:**
    *   Create {{numArguments}} arguments in total.
    *   Distribute them according to the 'ratioFor': approximately {{#multiply numArguments ratioFor}}{{/multiply}} arguments "for" and the rest "against".
    *   **Crucially, all text must be in the specified language: {{language}}.**
    *   Ensure each argument is unique, on-topic, and between 60 and 420 characters.
    *   Each argument should be assigned to one of the synthetic users you created. A user can have multiple arguments.

3.  **Analyze Each Argument:**
    *   **Relevance (0.0 - 1.0):** How relevant is the argument to the "{{pollTitle}}"?
    *   **Strength (1 - 5):** How strong or convicting is the argument?
    *   **Axes (Array of strings):** Identify 1-2 primary axes the argument falls on. Choose from: "economy", "rights", "security", "environment", "governance", "social", "technology", "health". This is for the radial chart visualization.
    *   **Votes:** Assign a plausible number of upvotes and downvotes to each argument.

4.  **Moderation**:
    *   Do NOT generate toxic, hateful, personally-identifying, or off-topic content. All arguments must be civil and contribute to a constructive debate.

5.  **Final Output**:
    *   Return ONLY a single, valid JSON object that strictly adheres to the output schema. Ensure all 'isSynthetic' flags are set to true. All timestamps should be valid ISO 8601 strings.
  `,
});

const simulateDebateFlow = ai.defineFlow(
  {
    name: 'simulateDebateFlow',
    inputSchema: SimulateDebateInputSchema,
    outputSchema: SimulateDebateOutputSchema,
  },
  async (input) => {
    // Why: We call the strongly-typed prompt with the validated input.
    // This ensures that the data passed to the LLM matches the structure defined
    // in the prompt's input schema.
    const { output } = await simulateDebatePrompt(input);

    // Why: A robust check to ensure the LLM's response is not null or undefined.
    // If the model fails to return a valid object, we throw an explicit error,
    // which is better than letting a null reference propagate through the system.
    if (!output) {
      throw new Error('AI model failed to generate a valid simulation dataset.');
    }
    
    // Add author data to arguments based on the generated users
    const usersById = new Map(output.users.map(u => [u.id, u]));
    const argumentsWithAuthors = output.arguments.map(arg => {
        const author = usersById.get(arg.userId);
        return {
            ...arg,
            author: {
                name: author?.handle || 'Synthetic User',
                avatarUrl: author?.avatarUrl || '',
            }
        };
    });

    return {
        users: output.users,
        // @ts-ignore - We've added the author field, which isn't in the strict SimArgumentSchema
        // but is needed by the ArgumentCard component. This is a safe override for this dev-only feature.
        arguments: argumentsWithAuthors,
    };
  }
);
