
'use server';

/**
 * @fileOverview Generates realistic mock user data for populating profiles.
 *
 * - generateMockUser - A function to generate mock user data.
 * - GenerateMockUserInput - The input type for the generateMockUser function.
 * - GenerateMockUserOutput - The return type for the generateMockUser function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMockUserInputSchema = z.object({
  role: z.string().describe("The role of the user, e.g., 'standard user', 'forum moderator', 'new contributor'."),
  country: z.string().describe("The country the user is from, e.g., 'Norway'."),
});
export type GenerateMockUserInput = z.infer<typeof GenerateMockUserInputSchema>;

const GenerateMockUserOutputSchema = z.object({
  displayName: z.string().describe("A realistic-sounding full name for the user."),
  username: z.string().describe("A plausible, lowercase, alphanumeric username (with underscores). e.g., 'johndoe_88'."),
  email: z.string().email().describe("A mock email address based on the username, using 'example.com' domain."),
  bio: z.string().describe("A short, interesting bio for the user in the first person (1-2 sentences)."),
  location: z.string().describe("A plausible city and country for the user."),
  interests: z.array(z.string()).describe("An array of 3-5 interests or hobbies for the user."),
  pronouns: z.string().describe("A plausible set of pronouns, e.g., 'he/him', 'she/her', 'they/them'."),
  password: z.string().describe("A random password containing exactly four letters and two numbers."),
});
export type GenerateMockUserOutput = z.infer<typeof GenerateMockUserOutputSchema>;


export async function generateMockUser(input: GenerateMockUserInput): Promise<GenerateMockUserOutput> {
  return generateMockUserFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateMockUserPrompt',
    input: { schema: GenerateMockUserInputSchema },
    output: { schema: GenerateMockUserOutputSchema },
    prompt: `You are an expert at creating believable mock user data for a web application.
    
    Generate a profile for a {{role}} from {{country}}.
    
    The user data should be realistic and consistent. The username should be derived from the display name. The email should be the username at 'example.com'.
    
    The password must contain exactly four letters and two numbers, in any order.

    Return a single, valid JSON object matching the output schema. Do not include any other text or explanations.`
});


const generateMockUserFlow = ai.defineFlow(
  {
    name: 'generateMockUserFlow',
    inputSchema: GenerateMockUserInputSchema,
    outputSchema: GenerateMockUserOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a structured response from the model.');
    }
    return output;
  }
);
