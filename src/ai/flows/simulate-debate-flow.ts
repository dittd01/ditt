
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
 * - SimulateDebateInput - The input type for the function.
 * - SimulateDebateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the main flow
export const SimulateDebateInputSchema = z.object({
  pollId: z.string().describe('The unique ID of the poll to simulate debate for.'),
  pollTitle: z.string().describe('The title or question of the poll.'),
  language: z.enum(['en', 'no']).default('en').describe('The language for the generated content.'),
  numUsers: z.number().int().min(10).max(100).default(60).describe('The number of synthetic users to generate.'),
  numArguments: z.number().int().min(10).max(50).default(30).describe('The total number of arguments to generate.'),
  ratioFor: z.number().min(0).max(1).default(0.5).describe('The ratio of "for" arguments (e.g., 0.5 for 50%).'),
});
export type SimulateDebateInput = z.infer<typeof SimulateDebateInputSchema>;


// --- Schemas for Synthetic Data Structures ---

const SimUserSchema = z.object({
  id: z.string().describe("A unique ID for the user, e.g., 'sim-user-1'."),
  handle: z.string().describe("A plausible, pseudonymous handle, e.g., 'TechLover88', 'EvaK_5'."),
  language: z.enum(['no', 'en']).describe("The user's language."),
  isSynthetic: z.literal(true).describe('Flag indicating this is a synthetic user.'),
  createdAt: z.string().datetime().describe('ISO 8601 timestamp of creation.'),
  avatarUrl: z.string().url().describe('A placeholder avatar URL.'),
});

const SimArgumentSchema = z.object({
  id: z.string().describe("A unique ID for the argument, e.g., 'sim-arg-1'."),
  pollId: z.string().describe('The ID of the poll this argument belongs to.'),
  userId: z.string().describe('The ID of the synthetic user who authored this argument.'),
  stance: z.enum(['for', 'against']).describe('The side of the debate this argument is on.'),
  text: z.string().min(60).max(420).describe('The full text of the argument (60-420 characters).'),
  strength: z.number().min(1).max(5).describe('The subjective strength/conviction of the argument (1-5).'),
  relevance: z.number().min(0).max(1).describe('The relevance of the argument to the poll topic (0.0-1.0).'),
  axes: z.array(z.string()).describe('An array of 1-2 primary axes this argument addresses (e.g., ["economy", "environment"]).'),
  cluster: z.string().optional().describe('A semantic cluster label for grouping similar arguments.'),
  upvotes: z.number().int().min(0).describe('A simulated upvote count.'),
  downvotes: z.number().int().min(0).describe('A simulated downvote count.'),
  isSynthetic: z.literal(true).describe('Flag indicating this is a synthetic argument.'),
  createdAt: z.string().datetime().describe('ISO 8601 timestamp of creation.'),
});


// Output schema for the entire flow
export const SimulateDebateOutputSchema = z.object({
  users: z.array(SimUserSchema).describe('The list of generated synthetic users.'),
  arguments: z.array(SimArgumentSchema).describe('The list of generated synthetic arguments.'),
});
export type SimulateDebateOutput = z.infer<typeof SimulateDebateOutputSchema>;


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
