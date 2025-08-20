
import type { Topic, VoteHistory, VoteOption } from './types';
import type { Party } from './types';

export const parties: Party[] = [
  {
    id: 'rodt',
    name: 'Rødt',
    abbreviation: 'R',
    color: '#9B1C1C',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician glasses',
  },
  {
    id: 'sv',
    name: 'Sosialistisk Venstreparti',
    abbreviation: 'SV',
    color: '#D63DB3',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'smiling woman politician',
  },
  {
    id: 'ap',
    name: 'Arbeiderpartiet',
    abbreviation: 'AP',
    color: '#E52424',
    imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician suit',
  },
  {
    id: 'sp',
    name: 'Senterpartiet',
    abbreviation: 'SP',
    color: '#BBD64B',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'smiling man politician',
  },
  {
    id: 'mdg',
    name: 'Miljøpartiet De Grønne',
    abbreviation: 'MDG',
    color: '#006437',
    imageUrl: 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician portrait',
  },
  {
    id: 'krf',
    name: 'Kristelig Folkeparti',
    abbreviation: 'KRF',
    color: '#F6C14B',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician beard',
  },
  {
    id: 'v',
    name: 'Venstre',
    abbreviation: 'V',
    color: '#00A199',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician smiling',
  },
  {
    id: 'h',
    name: 'Høyre',
    abbreviation: 'H',
    color: '#0055A4',
    imageUrl: 'https://images.unsplash.com/photo-1611601322175-875b4cfb334a?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician portrait',
  },
  {
    id: 'frp',
    name: 'Fremskrittspartiet',
    abbreviation: 'FRP',
    color: '#003876',
    imageUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician professional',
  },
  {
    id: 'fp',
    name: 'Folkets Parti',
    abbreviation: 'FOR', // As per image
    color: '#8B575C',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'woman politician friendly',
  },
  {
    id: 'dni',
    name: 'Demokratene i Norge',
    abbreviation: 'DNI',
    color: '#4A6B7B',
    imageUrl: 'https://images.unsplash.com/photo-1628890923662-2cb23c2a02cf?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician serious',
  },
  {
    id: 'gp',
    name: 'Generasjonspartiet',
    abbreviation: 'GP',
    color: '#D8A868',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1542596768-5d1d6bf6cf52?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'young woman politician',
  },
  {
    id: 'pp',
    name: 'Pensjonistpartiet',
    abbreviation: 'PS', // As per image
    color: '#C3874B',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1615222441922-a8d8396d11b5?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'older man politician',
  },
  {
    id: 'pirat',
    name: 'Piratpartiet',
    abbreviation: 'PP',
    color: '#9A7E98',
    imageUrl: 'https://images.unsplash.com/photo-1610624922137-0c675c747657?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician glasses',
  },
  {
    id: 'kon',
    name: 'Konservativt',
    abbreviation: 'KON',
    color: '#6FA8D1',
    textColor: '#000000',
    imageUrl: 'https://images.unsplash.com/photo-1627541594242-ac420480d457?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician leader',
  },
  {
    id: 'inp',
    name: 'Industri- og Næringspartiet',
    abbreviation: 'INP',
    color: '#4B7F7F',
    imageUrl: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician professional',
  },
  {
    id: 'vip',
    name: 'Verdipartiet',
    abbreviation: 'VIP',
    color: '#8C7B3E',
    imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician smiling glasses',
  },
  {
    id: 'nd',
    name: 'Norgesdemokratene',
    abbreviation: 'ND',
    color: '#3D6E98',
    imageUrl: 'https://images.unsplash.com/photo-1639747594911-3b653d5d08a2?q=80&w=1740&auto=format&fit=crop',
    aiHint: 'man politician confident',
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
    imageUrl: 'https://images.unsplash.com/photo-1738604977246-3e3b08b6bf38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxWb3RlJTIwZm9yJTIwcG9saXRpY2FsJTIwcGFydHl8ZW58MHx8fHwxNzU1NzE3MzAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    aiHint: 'Vote for political party',
    options: electionOptions,
    votes: electionVotes,
    totalVotes: totalElectionVotes,
    votesLastWeek: totalElectionVotes - (Object.values(electionHistory[1]).reduce((s: number, v) => s + (typeof v === 'number' ? v : 0), 0) as number),
    history: electionHistory,
    categoryId: 'election_2025',
    subcategoryId: '',
    status: 'live',
    voteType: 'election'
};

    
