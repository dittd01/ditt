import type { Topic } from './types';

export interface Party {
    id: string;
    name: string;
    abbreviation: string;
    color: string;
    textColor?: string;
    imageUrl: string;
    aiHint: string;
}

export const electionTopic: Topic = {
    id: 'election-2025-poll',
    slug: 'election-2025',
    question: 'Election 2025: Who gets your vote?',
    description: 'Cast your vote for the upcoming Stortingsvalg (parliamentary election). This is an anonymous, non-binding poll to gauge public sentiment. Results are for informational purposes only.',
    imageUrl: 'https://placehold.co/1200x600.png',
    options: [],
    votes: {},
    totalVotes: 123456,
    history: [],
    categoryId: 'election_2025',
    subcategoryId: '',
    status: 'live',
    voteType: 'election'
};

export const parties: Party[] = [
  {
    id: "rodt",
    name: "Rødt",
    abbreviation: "R",
    color: "#9B1C1C",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "woman politician",
  },
  {
    id: "sv",
    name: "Sosialistisk Venstreparti",
    abbreviation: "SV",
    color: "#D63DB3",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "woman politician",
  },
  {
    id: "ap",
    name: "Arbeiderpartiet",
    abbreviation: "AP",
    color: "#E52424",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "sp",
    name: "Senterpartiet",
    abbreviation: "SP",
    color: "#BBD64B",
    textColor: "#000000",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "mdg",
    name: "Miljøpartiet De Grønne",
    abbreviation: "MDG",
    color: "#006437",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "krf",
    name: "Kristelig Folkeparti",
    abbreviation: "KRF",
    color: "#F6C14B",
    textColor: "#000000",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "v",
    name: "Venstre",
    abbreviation: "V",
    color: "#00A199",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "woman politician",
  },
  {
    id: "h",
    name: "Høyre",
    abbreviation: "H",
    color: "#0055A4",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "woman politician",
  },
  {
    id: "frp",
    name: "Fremskrittspartiet",
    abbreviation: "FRP",
    color: "#003876",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "woman politician",
  },
  {
    id: "fp",
    name: "Folkets Parti",
    abbreviation: "FOR", // As per image
    color: "#8B575C",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "woman politician",
  },
  {
    id: "dni",
    name: "Demokratene i Norge",
    abbreviation: "DNI",
    color: "#4A6B7B",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "gp",
    name: "Generasjonspartiet",
    abbreviation: "GP",
    color: "#D8A868",
    textColor: "#000000",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "woman politician",
  },
  {
    id: "pp",
    name: "Pensjonistpartiet",
    abbreviation: "PS", // As per image
    color: "#C3874B",
    textColor: "#000000",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "pirat",
    name: "Piratpartiet",
    abbreviation: "PP",
    color: "#9A7E98",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "kon",
    name: "Konservativt",
    abbreviation: "KON",
    color: "#6FA8D1",
    textColor: "#000000",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "inp",
    name: "Industri- og Næringspartiet",
    abbreviation: "INP",
    color: "#4B7F7F",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "vip",
    name: "Verdipartiet",
    abbreviation: "VIP",
    color: "#8C7B3E",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
  {
    id: "nd",
    name: "Norgesdemokratene",
    abbreviation: "ND",
    color: "#3D6E98",
    imageUrl: "https://placehold.co/400x300.png",
    aiHint: "man politician",
  },
];
