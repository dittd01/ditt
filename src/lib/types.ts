

import type { LucideIcon } from 'lucide-react';
import type { CredentialDeviceType } from '@simplewebauthn/server';

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

// --- New Auth & Security Types ---

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
