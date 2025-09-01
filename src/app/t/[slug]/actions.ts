
'use server';

import { z } from 'zod';
import { simulateDebate } from '@/ai/flows/simulate-debate-flow';
import type { SimulateDebateInput, SimulateDebateOutput } from '@/lib/types';
import { db } from '@/lib/firestore.server';
import { FieldValue } from 'firebase-admin/firestore';

const voteSchema = z.object({
  topicId: z.string(),
  voteOption: z.string(),
  voterId: z.string(), // This is the person_hash
});

/**
 * Server Action to record a user's vote in Firestore.
 * This function is now the single source of truth for casting and changing votes.
 *
 * It performs a transaction to ensure data integrity:
 * 1. Reads the user's previous vote for this topic, if any.
 * 2. Writes the new vote to a `user_votes` collection.
 * 3. Atomically increments/decrements the vote counts on the main topic document.
 */
export async function castVoteAction(input: {
  topicId: string;
  voteOption: string;
  voterId: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { topicId, voteOption, voterId } = voteSchema.parse(input);

    if (!voterId) {
        return { success: false, message: 'Authentication is required to vote.'};
    }
    
    const userVoteRef = db.collection('user_votes').doc(`${voterId}_${topicId}`);
    const topicRef = db.collection('topics').doc(topicId);

    await db.runTransaction(async (transaction) => {
        const userVoteDoc = await transaction.get(userVoteRef);
        const topicDoc = await transaction.get(topicRef);

        if (!topicDoc.exists) {
            throw new Error(`Topic with ID ${topicId} not found.`);
        }

        const previousVote = userVoteDoc.exists ? userVoteDoc.data()?.voteOption : null;

        // If the user is casting the same vote again, do nothing.
        if (previousVote === voteOption) {
            return;
        }

        const topicUpdate: { [key: string]: FieldValue } = {};

        // Decrement the count for the previous vote, if one existed.
        if (previousVote) {
            topicUpdate[`votes.${previousVote}`] = FieldValue.increment(-1);
        }

        // Increment the count for the new vote.
        topicUpdate[`votes.${voteOption}`] = FieldValue.increment(1);

        // Atomically update the topic's vote counts.
        transaction.update(topicRef, topicUpdate);
        
        // Set or update the user's vote record.
        transaction.set(userVoteRef, {
            person_hash: voterId,
            topic_id: topicId,
            voteOption: voteOption,
            votedAt: FieldValue.serverTimestamp(),
        });
    });

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
