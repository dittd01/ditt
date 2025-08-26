
'use server';

import { z } from 'zod';
import { simulateDebate } from '@/ai/flows/simulate-debate-flow';
import type { SimulateDebateInput, SimulateDebateOutput } from '@/lib/types';

const voteSchema = z.object({
  topicId: z.string(),
  voteOption: z.string(),
  voterId: z.string(),
});

/**
 * Server Action to record a user's vote.
 * In a real application, this function would perform the following:
 * 1. Validate the user's session and permissions.
 * 2. Perform a transactional database write to:
 *    - Update the user's vote record for this topic.
 *    - Increment the vote count on the topic document.
 *    - Decrement the count for the user's previous vote, if applicable.
 * 3. Revalidate the path or tag for the topic page to update cached data.
 *
 * For this prototype, we simulate the action by logging it and returning a success message.
 * This establishes the client-server communication pattern.
 */
export async function castVoteAction(input: {
  topicId: string;
  voteOption: string;
  voterId: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { topicId, voteOption, voterId } = voteSchema.parse(input);

    console.log('[SERVER ACTION] castVoteAction triggered:');
    console.log({ topicId, voteOption, voterId });
    
    // --- DATABASE LOGIC SIMULATION ---
    // 1. Find user, find topic
    // 2. Start transaction
    // 3. Update vote counts
    // 4. Commit transaction
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network latency

    return {
      success: true,
      message: `Server successfully recorded vote for "${voteOption}".`,
    };
  } catch (error) {
    console.error('Error in castVoteAction:', error);
    const errorMessage = error instanceof z.ZodError ? error.errors[0].message : 'An unexpected error occurred.';
    return {
      success: false,
      message: `Failed to record vote on server: ${errorMessage}`,
    };
  }
}


/**
 * Server Action to trigger the synthetic debate generation flow.
 * This is a developer-only feature and should be guarded by environment checks.
 */
export async function simulateDebateAction(
  input: SimulateDebateInput
): Promise<{ success: boolean; data?: SimulateDebateOutput; message?: string }> {
  // Why: A hardcoded check on the server-side ensures this can never be
  // accidentally run in a production environment, even if client-side checks fail.
  if (process.env.NODE_ENV === 'production') {
    return { success: false, message: 'This action is disabled in production.' };
  }
  
  try {
    const result = await simulateDebate(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[simulateDebateAction] Error:', error);
    return { success: false, message: error.message || 'An unknown error occurred during simulation.' };
  }
}
