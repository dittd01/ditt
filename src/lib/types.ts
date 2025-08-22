

import type { LucideIcon } from 'lucide-react';

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
    parentId: string | null;
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
    
