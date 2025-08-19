export type VoteOption = {
  id: string;
  label: string;
  color: string;
};

export type VoteHistory = {
  date: string;
  [key: string]: number | string;
};

export type Topic = {
  id: string;
  slug: string;
  question: string;
  description: string;
  imageUrl: string;
  options: VoteOption[];
  votes: Record<string, number>;
  totalVotes: number;
  history: VoteHistory[];
  categoryId: string;
  subcategoryId: string;
  status: 'live' | 'closed' | 'draft';
  voteType: 'yesno' | 'multi' | 'ranked' | 'election';
};

export type Subcategory = {
  id: string;
  label: string;
  categoryId: string;
};

export type Category = {
  id: string;
  label: string;
  subcategories: Subcategory[];
};
