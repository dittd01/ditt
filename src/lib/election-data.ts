import type { Topic, VoteHistory, VoteOption } from './types';
import type { Party } from './types';

export const parties: Party[] = [
  {
    id: 'rodt',
    name: 'Rødt',
    abbreviation: 'R',
    color: '#9B1C1C',
    imageUrl: 'https://images.unsplash.com/photo-1601574465779-70d6db384784?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician',
  },
  {
    id: 'sv',
    name: 'Sosialistisk Venstreparti',
    abbreviation: 'SV',
    color: '#D63DB3',
    imageUrl: 'https://images.unsplash.com/photo-1596281789723-441f71a9e6b3?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician',
  },
  {
    id: 'ap',
    name: 'Arbeiderpartiet',
    abbreviation: 'AP',
    color: '#E52424',
    imageUrl: 'https://images.unsplash.com/photo-1605902151737-368e573a9f0c?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'sp',
    name: 'Senterpartiet',
    abbreviation: 'SP',
    color: '#BBD64B',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1569913486515-b74bf7751574?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'mdg',
    name: 'Miljøpartiet De Grønne',
    abbreviation: 'MDG',
    color: '#006437',
    imageUrl: 'https://images.unsplash.com/photo-1628260412296-a8016c413442?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'krf',
    name: 'Kristelig Folkeparti',
    abbreviation: 'KRF',
    color: '#F6C14B',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-4242e47c14d7?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'v',
    name: 'Venstre',
    abbreviation: 'V',
    color: '#00A199',
    imageUrl: 'https://images.unsplash.com/photo-1581093430995-1216a92e5f03?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician',
  },
  {
    id: 'h',
    name: 'Høyre',
    abbreviation: 'H',
    color: '#0055A4',
    imageUrl: 'https://images.unsplash.com/photo-1628890923662-2cb23c2a02cf?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician',
  },
  {
    id: 'frp',
    name: 'Fremskrittspartiet',
    abbreviation: 'FRP',
    color: '#003876',
    imageUrl: 'https://images.unsplash.com/photo-1628890920690-9e29d0019b9b?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician',
  },
  {
    id: 'fp',
    name: 'Folkets Parti',
    abbreviation: 'FOR', // As per image
    color: '#8B575C',
    imageUrl: 'https://images.unsplash.com/photo-1616082405025-b44d5c8a6f8b?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician',
  },
  {
    id: 'dni',
    name: 'Demokratene i Norge',
    abbreviation: 'DNI',
    color: '#4A6B7B',
    imageUrl: 'https://images.unsplash.com/photo-1590846406792-044811a4a165?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'gp',
    name: 'Generasjonspartiet',
    abbreviation: 'GP',
    color: '#D8A868',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician',
  },
  {
    id: 'pp',
    name: 'Pensjonistpartiet',
    abbreviation: 'PS', // As per image
    color: '#C3874B',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1583344498060-b6f24e9b9598?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'pirat',
    name: 'Piratpartiet',
    abbreviation: 'PP',
    color: '#9A7E98',
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'kon',
    name: 'Konservativt',
    abbreviation: 'KON',
    color: '#6FA8D1',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1738&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'inp',
    name: 'Industri- og Næringspartiet',
    abbreviation: 'INP',
    color: '#4B7F7F',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'vip',
    name: 'Verdipartiet',
    abbreviation: 'VIP',
    color: '#8C7B3E',
    imageUrl: 'https://images.unsplash.com/photo-1619985991416-3a5e8f42a5d7?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician',
  },
  {
    id: 'nd',
    name: 'Norgesdemokratene',
    abbreviation: 'ND',
    color: '#3D6E98',
    imageUrl: 'https://images.unsplash.com/photo-1559893345-6736a35d94e2?q=80&w=1740&auto=format&fit=crop',
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
    imageUrl: 'https://images.unsplash.com/photo-1517404829322-197931f08463?q=80&w=1740&auto=format&fit=crop',
    options: electionOptions,
    votes: electionVotes,
    totalVotes: totalElectionVotes,
    history: electionHistory,
    categoryId: 'election_2025',
    subcategoryId: '',
    status: 'live',
    voteType: 'election'
};
