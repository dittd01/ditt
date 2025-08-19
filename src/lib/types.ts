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
};
