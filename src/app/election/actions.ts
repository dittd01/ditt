
'use server';

import fs from 'fs/promises';
import path from 'path';
import { electionTopic as initialElectionData, parties as partyDetails } from '@/lib/election-data';
import type { Topic } from '@/lib/types';

// In a real app, this would be a database. We're using JSON files for simulation.
const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'db');
const PARTIES_DB = path.join(DB_PATH, 'parties.json');
const VOTES_DB = path.join(DB_PATH, 'votes.json');
const AUDIT_DB = path.join(DB_PATH, 'vote_audit.json');

type PartyDb = {
    [key: string]: { id: string; name: string; vote_count: number };
}
type VotesDb = {
    [userId: string]: string; // userId: partyId
}
type AuditRecord = {
    audit_id: string;
    user_id: string;
    old_party_id: string | null;
    new_party_id: string;
    ts: string;
}

// Simple file-based locking to simulate transactions
let isLocked = false;
async function withLock<T>(fn: () => Promise<T>): Promise<T> {
    if (isLocked) {
        throw new Error("A vote is already in progress. Please try again.");
    }
    isLocked = true;
    try {
        return await fn();
    } finally {
        isLocked = false;
    }
}


async function readDb(): Promise<{ parties: PartyDb, votes: VotesDb, audit: AuditRecord[] }> {
    const [parties, votes, audit] = await Promise.all([
        fs.readFile(PARTIES_DB, 'utf-8').then(JSON.parse),
        fs.readFile(VOTES_DB, 'utf-8').then(JSON.parse),
        fs.readFile(AUDIT_DB, 'utf-8').then(JSON.parse),
    ]);
    return { parties, votes, audit };
}

async function writeDb(data: { parties: PartyDb, votes: VotesDb, audit: AuditRecord[] }): Promise<void> {
    await Promise.all([
        fs.writeFile(PARTIES_DB, JSON.stringify(data.parties, null, 4)),
        fs.writeFile(VOTES_DB, JSON.stringify(data.votes, null, 4)),
        fs.writeFile(AUDIT_DB, JSON.stringify(data.audit, null, 4)),
    ]);
}

/**
 * Fetches the current state of the election poll.
 */
export async function getElectionData(userId: string | null): Promise<{ topic: Topic, votedFor: string | null }> {
    const { parties: partiesDb, votes: votesDb } = await readDb();
    
    const votes: Record<string, number> = {};
    let totalVotes = 0;

    for (const partyId in partiesDb) {
        votes[partyId] = partiesDb[partyId].vote_count;
        totalVotes += partiesDb[partyId].vote_count;
    }

    const topic: Topic = {
        ...initialElectionData,
        votes: votes,
        totalVotes: totalVotes,
    };
    
    const votedFor = userId ? (votesDb[userId] || null) : null;

    return { topic, votedFor };
}

/**
 * Atomically casts or changes a vote for a user.
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

    try {
       return await withLock(async () => {
            const { parties, votes, audit } = await readDb();

            const oldPartyId = votes[userId] || null;

            if (oldPartyId === newPartyId) {
                return { 
                    status: 'ok', 
                    oldPartyId, 
                    newPartyId, 
                    unchanged: true,
                    currentCounts: Object.fromEntries(Object.values(parties).map(p => [p.id, p.vote_count]))
                };
            }
            
            // Decrement old party's vote count if exists
            if (oldPartyId && parties[oldPartyId]) {
                parties[oldPartyId].vote_count = Math.max(0, parties[oldPartyId].vote_count - 1);
            }

            // Increment new party's vote count
            if (parties[newPartyId]) {
                 parties[newPartyId].vote_count += 1;
            }

            // Update user's current vote
            votes[userId] = newPartyId;
            
            // Add to audit trail
            audit.push({
                audit_id: `${Date.now()}-${userId}`,
                user_id: userId,
                old_party_id: oldPartyId,
                new_party_id: newPartyId,
                ts: new Date().toISOString(),
            });

            await writeDb({ parties, votes, audit });

            return {
                status: 'ok',
                oldPartyId,
                newPartyId,
                unchanged: false,
                currentCounts: Object.fromEntries(Object.values(parties).map(p => [p.id, p.vote_count]))
            };
        });
    } catch (e: any) {
        return { status: 'error', code: 'transaction_failed', message: e.message || 'An unexpected error occurred.' };
    }
}
