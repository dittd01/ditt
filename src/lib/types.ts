
import type { LucideIcon } from 'lucide-react';
import type { CredentialDeviceType } from '@simplewebauthn/server';
import { z } from 'genkit';

export type VoteOption = {
  id: string;
  label: string;
  color: string;
};

export type VoteHistory = {
  date: string; // ISO 8601 format
  total?: number;
  [key: string]: number | string | undefined;
};

export type Topic = {
  id: string;
  slug: string;
  question: string; // Default to Norwegian
  question_en: string;
  description: string; // Default to Norwegian
  description_en: string;
  background_md?: string;
  pros?: string[];
  cons?: string[];
  sources?: { title: string; url: string }[];
  imageUrl: string;
  aiHint: string;
  options: VoteOption[];
  votes: Record<string, number>;
  totalVotes: number;
  votesLastWeek: number;
  votesLastMonth: number;
  votesLastYear: number;
  history: VoteHistory[];
  categoryId: string;
  subcategoryId: string;
  status: 'live' | 'closed' | 'draft';
  voteType: 'yesno' | 'multi' | 'ranked' | 'election' | 'likert' | 'quadratic';
  averageImportance: number;
  author?: string;
};

export type Subcategory = {
  id: string;
  label: string;
  label_nb: string;
  categoryId: string;
};

export type Category = {
  id: string;
  label: string;
  label_nb: string;
  icon: string;
  subcategories: Subcategory[];
};

export interface Party {
    id: string;
    name: string;
    abbreviation: string;
    color: string;
    textColor?: string;
    imageUrl: string;
    aiHint: string;
}

export interface Argument {
    id: string;
    topicId: string;
    parentId: string | 'root'; // Use 'root' for top-level arguments
    side: 'for' | 'against';
    author: {
        name: string;
        avatarUrl?: string;
    };
    text: string;
    upvotes: number;
    downvotes: number;
    replyCount: number;
    createdAt: string; // ISO 8601 string
}

// --- Auth & Security Types ---

/**
 * Represents the eligibility record for a unique person.
 * Stored in Firestore: /eligibility/{person_hash}
 */
export interface Eligibility {
    is_adult: boolean;
    assurance_level: string; // e.g., 'BankID', 'Vipps'
    createdAt: number; // Unix timestamp
    lastVerifiedAt: number; // Unix timestamp
    bankid_first_verified_at: number; // Unix timestamp
    deviceIds: string[];
    audit_flags?: string[];
}

/**
 * Represents a registered device for a user.
 * Stored in Firestore: /devices/{deviceId}
 */
export interface Device {
    person_hash: string;
    webauthn?: {
        credentialID: string; // base64url encoded
        publicKey: string; // base64url encoded
        signCount: number;
        deviceType?: CredentialDeviceType;
        transports?: AuthenticatorTransport[];
    };
    mobileKey?: {
        publicKey: string; // PEM format
    };
    platform: 'web' | 'ios' | 'android';
    createdAt: number; // Unix timestamp
    lastSeenAt: number; // Unix timestamp
    revoked: boolean;
}

/**
 * Represents a pending request to link a new device.
 * Stored in Firestore: /links/{link_id}
 */
export interface LinkRequest {
    person_hash: string;
    nonce: string;
    status: 'pending' | 'confirmed' | 'expired';
    expiresAt: number; // Unix timestamp
    createdAt: number; // Unix timestamp
}


// --- Synthetic Data Types ---

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
export type SimUser = z.infer<typeof SimUserSchema>;

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
export type SimArgument = z.infer<typeof SimArgumentSchema> & { author: { name: string; avatarUrl?: string; } };


// Output schema for the entire flow
export const SimulateDebateOutputSchema = z.object({
  users: z.array(SimUserSchema).describe('The list of generated synthetic users.'),
  arguments: z.array(SimArgumentSchema).describe('The list of generated synthetic arguments.'),
});
export type SimulateDebateOutput = z.infer<typeof SimulateDebateOutputSchema>;
