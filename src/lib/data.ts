import type { Topic } from './types';

export const mockTopics: Topic[] = [
  {
    id: '1',
    slug: 'oslo-car-free-zone',
    question: 'Should Oslo expand its car-free "Liveability Zone"?',
    description: 'The city of Oslo is proposing to expand the current car-free zone to include more streets in the city center. Proponents argue it will reduce pollution and improve public space, while opponents are concerned about accessibility and business impact.',
    imageUrl: 'https://placehold.co/600x400.png',
    options: [
      { id: 'yes', label: 'Yes, expand it', color: 'hsl(var(--chart-2))' },
      { id: 'no', label: 'No, keep as is', color: 'hsl(var(--chart-1))' },
    ],
    votes: { yes: 78123, no: 54321 },
    totalVotes: 132444,
    history: [
      { date: '1W Ago', yes: 65000, no: 45000 },
      { date: '6D Ago', yes: 68000, no: 47000 },
      { date: '5D Ago', yes: 70000, no: 48000 },
      { date: '4D Ago', yes: 71000, no: 50000 },
      { date: '3D Ago', yes: 74000, no: 51000 },
      { date: '2D Ago', yes: 76000, no: 52000 },
      { date: 'Yesterday', yes: 77000, no: 53000 },
      { date: 'Today', yes: 78123, no: 54321 },
    ],
  },
  {
    id: '2',
    slug: 'daylight-savings-time',
    question: 'Should Norway abolish Daylight Saving Time?',
    description: 'A recurring debate about whether to stick to a single time zone year-round. Abolishing DST means staying on "winter time" (standard time) permanently. This could affect everything from sleep patterns to energy consumption.',
    imageUrl: 'https://placehold.co/600x400.png',
    options: [
      { id: 'abolish', label: 'Abolish DST', color: 'hsl(var(--chart-1))' },
      { id: 'keep', label: 'Keep DST', color: 'hsl(var(--chart-2))' },
    ],
    votes: { abolish: 120456, keep: 115789 },
    totalVotes: 236245,
    history: [
      { date: '1W Ago', abolish: 100000, keep: 105000 },
      { date: '6D Ago', abolish: 105000, keep: 107000 },
      { date: '5D Ago', abolish: 108000, keep: 109000 },
      { date: '4D Ago', abolish: 112000, keep: 110000 },
      { date: '3D Ago', abolish: 115000, keep: 112000 },
      { date: '2D Ago', abolish: 118000, keep: 114000 },
      { date: 'Yesterday', abolish: 119000, keep: 115000 },
      { date: 'Today', abolish: 120456, keep: 115789 },
    ],
  },
  {
    id: '3',
    slug: 'digital-voting-methods',
    question: 'Which digital voting method should be prioritized for future local elections?',
    description: 'As technology evolves, so do the possibilities for voting. Which of these methods offers the best balance of security, accessibility, and reliability for Norway?',
    imageUrl: 'https://placehold.co/600x400.png',
    options: [
      { id: 'online', label: 'Web Portal', color: 'hsl(var(--chart-1))' },
      { id: 'mobile', label: 'Mobile App', color: 'hsl(var(--chart-2))' },
      { id: 'kiosk', label: 'Voting Kiosks', color: 'hsl(var(--chart-3))' },
    ],
    votes: { online: 45000, mobile: 65000, kiosk: 12000 },
    totalVotes: 122000,
    history: [
      { date: '1W Ago', online: 35000, mobile: 55000, kiosk: 10000 },
      { date: '4D Ago', online: 40000, mobile: 60000, kiosk: 11000 },
      { date: 'Today', online: 45000, mobile: 65000, kiosk: 12000 },
    ],
  },
];
