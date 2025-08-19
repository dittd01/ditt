import type { Topic, VoteHistory, VoteOption } from './types';
import type { Party } from './types';

export const parties: Party[] = [
  {
    id: 'rodt',
    name: 'Rødt',
    abbreviation: 'R',
    color: '#9B1C1C',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'woman politician',
  },
  {
    id: 'sv',
    name: 'Sosialistisk Venstreparti',
    abbreviation: 'SV',
    color: '#D63DB3',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'woman politician',
  },
  {
    id: 'ap',
    name: 'Arbeiderpartiet',
    abbreviation: 'AP',
    color: '#E52424',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'sp',
    name: 'Senterpartiet',
    abbreviation: 'SP',
    color: '#BBD64B',
    textColor: '#000000',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'mdg',
    name: 'Miljøpartiet De Grønne',
    abbreviation: 'MDG',
    color: '#006437',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'krf',
    name: 'Kristelig Folkeparti',
    abbreviation: 'KRF',
    color: '#F6C14B',
    textColor: '#000000',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'v',
    name: 'Venstre',
    abbreviation: 'V',
    color: '#00A199',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'woman politician',
  },
  {
    id: 'h',
    name: 'Høyre',
    abbreviation: 'H',
    color: '#0055A4',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'woman politician',
  },
  {
    id: 'frp',
    name: 'Fremskrittspartiet',
    abbreviation: 'FRP',
    color: '#003876',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'woman politician',
  },
  {
    id: 'fp',
    name: 'Folkets Parti',
    abbreviation: 'FOR', // As per image
    color: '#8B575C',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'woman politician',
  },
  {
    id: 'dni',
    name: 'Demokratene i Norge',
    abbreviation: 'DNI',
    color: '#4A6B7B',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'gp',
    name: 'Generasjonspartiet',
    abbreviation: 'GP',
    color: '#D8A868',
    textColor: '#000000',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'woman politician',
  },
  {
    id: 'pp',
    name: 'Pensjonistpartiet',
    abbreviation: 'PS', // As per image
    color: '#C3874B',
    textColor: '#000000',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'pirat',
    name: 'Piratpartiet',
    abbreviation: 'PP',
    color: '#9A7E98',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'kon',
    name: 'Konservativt',
    abbreviation: 'KON',
    color: '#6FA8D1',
    textColor: '#000000',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'inp',
    name: 'Industri- og Næringspartiet',
    abbreviation: 'INP',
    color: '#4B7F7F',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'vip',
    name: 'Verdipartiet',
    abbreviation: 'VIP',
    color: '#8C7B3E',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
  {
    id: 'nd',
    name: 'Norgesdemokratene',
    abbreviation: 'ND',
    color: '#3D6E98',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'man politician',
  },
];

const electionOptions: VoteOption[] = parties.map(p => ({
    id: p.id,
    label: p.abbreviation,
    color: p.color,
}));

const electionVotes: Record<string, number> = {
    rodt: 45102, sv: 92340, ap: 280104, sp: 150234, mdg: 50233,
    krf: 60349, v: 88123, h: 250102, frp: 130234, fp: 10234,
    dni: 5234, gp: 2103, pp: 15234, pirat: 3123, kon: 8234,
    inp: 20123, vip: 1123, nd: 4123,
};

const totalElectionVotes = Object.values(electionVotes).reduce((sum, v) => sum + v, 0);

const electionHistory: VoteHistory[] = [
    { date: '1M Ago', ...Object.fromEntries(Object.entries(electionVotes).map(([k, v]) => [k, Math.floor(v * 0.7)])) },
    { date: '1W Ago', ...Object.fromEntries(Object.entries(electionVotes).map(([k, v]) => [k, Math.floor(v * 0.85)])) },
    { date: 'Today', ...electionVotes },
];

export const electionTopic: Topic = {
    id: 'election-2025-poll',
    slug: 'election-2025',
    question: 'Election 2025: Who gets your vote?',
    description: 'Cast your vote for the upcoming Stortingsvalg (parliamentary election). This is an anonymous, non-binding poll to gauge public sentiment. Results are for informational purposes only.',
    imageUrl: 'https://placehold.co/1200x600.png',
    options: electionOptions,
    votes: electionVotes,
    totalVotes: totalElectionVotes,
    history: electionHistory,
    categoryId: 'election_2025',
    subcategoryId: '',
    status: 'live',
    voteType: 'election'
};
