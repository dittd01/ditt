
'use server';

import { db } from '@/lib/firestore.server';
import { FieldValue } from 'firebase-admin/firestore';
import { electionTopic as initialElectionData, parties as partyDetails } from '@/lib/election-data';
import type { Topic } from '@/lib/types';


/**
 * Fetches the current state of the election poll from Firestore.
 */
export async function getElectionData(userId: string | null): Promise<{ topic: Topic, votedFor: string | null }> {
    const partiesRef = db.collection('election_parties');
    const partiesSnapshot = await partiesRef.get();
    
    const votes: Record<string, number> = {};
    let totalVotes = 0;

    partiesSnapshot.forEach(doc => {
        const data = doc.data();
        votes[doc.id] = data.vote_count || 0;
        totalVotes += data.vote_count || 0;
    });

    const topic: Topic = {
        ...initialElectionData,
        votes: votes,
        totalVotes: totalVotes,
    };
    
    let votedFor: string | null = null;
    if (userId) {
        const userVoteRef = db.collection('election_votes').doc(userId);
        const userVoteDoc = await userVoteRef.get();
        if (userVoteDoc.exists) {
            votedFor = userVoteDoc.data()?.partyId || null;
        }
    }

    return { topic, votedFor };
}

/**
 * Atomically casts or changes a vote for a user using a Firestore transaction.
 */
export async function castVote(input: { userId: string, partyId: string }): Promise<{
    status: 'ok' | 'error',
    code?: string,
    message?: string,
    oldPartyId?: string | null,
    newPartyId?: string,
    unchanged?: boolean,
    currentCounts?: Record<string, number>
}> {
    const { userId, partyId: newPartyId } = input;

    if (!partyDetails.find(p => p.id === newPartyId)) {
        return { status: 'error', code: 'invalid_party', message: 'The selected party does not exist.' };
    }

    const userVoteRef = db.collection('election_votes').doc(userId);
    const newPartyRef = db.collection('election_parties').doc(newPartyId);

    try {
       const finalCounts = await db.runTransaction(async (transaction) => {
            const userVoteDoc = await transaction.get(userVoteRef);
            const oldPartyId = userVoteDoc.exists ? userVoteDoc.data()?.partyId : null;

            if (oldPartyId === newPartyId) {
                return null; // Return null to indicate no change was made
            }
            
            // Decrement old party's vote count if it exists
            if (oldPartyId) {
                const oldPartyRef = db.collection('election_parties').doc(oldPartyId);
                transaction.update(oldPartyRef, { vote_count: FieldValue.increment(-1) });
            }

            // Increment new party's vote count
            transaction.update(newPartyRef, { vote_count: FieldValue.increment(1) });
            
            // Set or update user's current vote
            transaction.set(userVoteRef, { partyId: newPartyId, updatedAt: FieldValue.serverTimestamp() });
            
            // Add to audit trail
            const auditRef = db.collection('election_audit').doc();
            transaction.set(auditRef, {
                user_id: userId,
                old_party_id: oldPartyId,
                new_party_id: newPartyId,
                ts: FieldValue.serverTimestamp(),
            });

            return oldPartyId; // Return oldPartyId to use in the response
        });
        
        // After transaction, get the latest counts
        const partiesSnapshot = await db.collection('election_parties').get();
        const currentCounts: Record<string, number> = {};
        partiesSnapshot.forEach(doc => {
            currentCounts[doc.id] = doc.data().vote_count || 0;
        });

        if (finalCounts === null) { // This means the vote was unchanged
            return {
                status: 'ok',
                oldPartyId: newPartyId, 
                newPartyId, 
                unchanged: true,
                currentCounts
            };
        }

        return {
            status: 'ok',
            oldPartyId: finalCounts,
            newPartyId,
            unchanged: false,
            currentCounts
        };

    } catch (e: any) {
        console.error("Firestore vote transaction failed:", e);
        return { status: 'error', code: 'transaction_failed', message: e.message || 'An unexpected error occurred.' };
    }
}
