

import { allTopics, categories, mockUserNames, currentUser } from '@/lib/data';
import type { Topic, Subcategory } from '@/lib/types';
import { format, subDays } from 'date-fns';
import type { User } from './users/page';

// Overview Page
export const kpiData = {
  dau: { value: '12,456', delta: '+12.5%' },
  sessions: { value: '34,890', delta: '+8.2%' },
  totalVotes: { value: '1.2M', delta: '+25K' },
  newUsers: { value: '1,502', delta: '-3.1%' },
};

export const topPollsData = allTopics
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 5)
    .map(p => ({ id: p.id, title: p.question, votes: p.totalVotes }));

// Analytics Page
export const pollPerformanceData = allTopics
    .slice(0, 10)
    .map(p => ({ 
        poll: p.question, 
        status: p.status.charAt(0).toUpperCase() + p.status.slice(1), 
        total_votes: p.totalVotes,
        votes_last_7d: p.votesLastWeek
     }));

// Charts
const generateChartData = (key: string, days: number, scale: number) => {
    return Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), days - 1 - i);
        return {
            date: format(date, 'MMM d'),
            [key]: Math.floor(Math.random() * 5000 * scale) + (10000 * scale),
        };
    });
};

export const chartData = {
    dau: generateChartData('DAU', 30, 1),
    votes: generateChartData('votes', 30, 1.5),
    sessions: generateChartData('sessions', 30, 1.2),
}

// Suggestions Queue Page
export const suggestionsData = [
    { id: 1, text: 'Increase inheritance tax to 25% for amounts over 10M NOK', author: 'testuser', verdict: 'create', status: 'Pending', created: '2023-10-27' },
    { id: 2, text: 'Stop taxing working capital so hard', author: 'Per Hansen', verdict: 'merge', status: 'Pending', created: '2023-10-27' },
    { id: 3, text: 'Should we build trains and also stop giving money to rich people?', author: 'Kari Berg', verdict: 'reject', status: 'Pending', created: '2023-10-26' },
    { id: 4, text: 'Better roads in the north', author: 'testuser', verdict: 'create', status: 'Approved', created: '2023-10-25' },
    { id: 5, text: 'Abolish the monarchy', author: 'Lars Nilsen', verdict: 'reject', status: 'Rejected', created: '2023-10-24' },
];

// Topic Curation Page
export const topicsData = [
    { id: 1, nb: 'Should the wealth tax threshold be raised?', en: 'Should the wealth tax threshold be raised?', params: 'Threshold: NOK 10m', status: 'Active', aliases: 5 },
    { id: 2, nb: 'Should Norway build a high-speed rail between Oslo and Trondheim?', en: 'Should Norway build high-speed rail...', params: 'N/A', status: 'Active', aliases: 2 },
    { id: 3, nb: 'Should Norway cease issuing new oil and gas exploration licenses?', en: 'Should Norway cease issuing new oil...', params: 'N/A', status: 'Archived', aliases: 12 },
];

// Users Page
const generatedUsers = Array.from({ length: 50 }, (_, i) => {
    const createdDate = subDays(new Date(), Math.floor(Math.random() * 90));
    const lastSeenDate = subDays(createdDate, Math.floor(Math.random() * -30)); // last seen is after created
    const randomHex = [...Array(4)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const name = mockUserNames[i % mockUserNames.length];
    const [firstName, lastName] = name.split(' ');

    return {
        id: `voter...${randomHex}`,
        name: name,
        username: `${firstName.toLowerCase()}${lastName ? lastName.charAt(0).toLowerCase() : ''}${Math.floor(10 + Math.random() * 90)}`,
        avatar: `https://placehold.co/40x40.png?text=${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`,
        created: format(createdDate, 'yyyy-MM-dd'),
        locale: Math.random() > 0.3 ? 'nb-NO' : 'en-US',
        device: Math.random() > 0.5 ? 'Mobile' : 'Desktop',
        last_seen: format(lastSeenDate, 'yyyy-MM-dd HH:mm'),
        type: 'Mock',
        password: 'a1bc2d',
        role: 'voter',
    };
});

const currentLoggedInUser: User = {
    id: currentUser.uid,
    name: currentUser.displayName,
    username: currentUser.username,
    avatar: currentUser.photoUrl,
    created: format(subDays(new Date(), 120), 'yyyy-MM-dd'),
    locale: 'en-US',
    device: 'Desktop',
    last_seen: format(new Date(), 'yyyy-MM-dd HH:mm'),
    type: 'Real',
    password: 'password',
    role: currentUser.role,
};

export const usersData: User[] = [currentLoggedInUser, ...generatedUsers];


// Health Page
export const healthData = [
    { name: 'Firestore Latency', status: 'ok', details: 'Read: 25ms, Write: 40ms' },
    { name: 'Genkit AI Functions', status: 'ok', details: 'All functions responsive' },
    { name: 'Next.js Server', status: 'warn', details: 'Memory usage at 85%' },
    { name: 'BankID API', status: 'ok', details: 'Connection healthy' },
];

// Exports Page
export const exportsData = [
    { id: 1, type: 'Votes', params: 'Poll: #123, Date: 2023-10-01 to 2023-10-27', status: 'Done', created: '2023-10-27', url: '#' },
    { id: 2, type: 'Users', params: 'All users', status: 'Running', created: '2023-10-27', url: null },
    { id: 3, type: 'Audit Logs', params: 'Actor: admin, Last 30 days', status: 'Queued', created: '2023-10-27', url: null },
    { id: 4, type: 'Polls', params: 'Category: Taxation', status: 'Error', created: '2023-10-26', url: null },
];

// Feature Flags Page
export const featureFlagsData = [
    { key: 'suggestions.require_admin_approval', desc: 'All new topic suggestions must be approved by an admin', enabled: true, rollout: '100%' },
    { key: 'suggestions.enabled', desc: 'Allow users to submit new topics', enabled: false, rollout: '0%' },
    { key: 'polls.shuffle_options', desc: 'Randomize order of Yes/No options', enabled: true, rollout: '100%' },
    { key: 'realtime.results.enabled', desc: 'Update poll results in real-time via websockets', enabled: true, rollout: '100%' },
    { key: 'ai.moderation.enabled', desc: 'Use AI to moderate suggestions', enabled: true, rollout: '100%' },
    { key: 'auth.vipps_reauth.enabled', desc: 'Enable Vipps as a low-cost re-auth option for device linking', enabled: true, rollout: '100%' },
];

// Audit Logs Page
export const auditLogsData = [
    { ts: '2023-10-27 10:45:12', actor: 'admin@...', action: 'poll.update_status', entity: 'poll/xyz123', notes: 'Status -> Archived' },
    { ts: '2023-10-27 10:30:05', actor: 'moderator@...', action: 'suggestion.approve', entity: 'suggestion/abc789', notes: 'Approved as new topic' },
    { ts: '2023-10-26 15:00:00', actor: 'system', action: 'export.complete', entity: 'export/def456', notes: 'Weekly votes export' },
];


// Polls Management Page
export interface PollRowData {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    categoryId: string;
    subcategoryId: string;
    status: string;
    votes: number;
    updated: string;
    author: string;
}

const getCategoryInfo = (categoryId: string, subcategoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { cat: 'N/A', sub: 'N/A', catId: 'N/A', subId: 'N/A' };
    
    if (categoryId === 'election_2025') {
        return {
            cat: category.label,
            sub: 'N/A',
            catId: category.id,
            subId: 'N/A'
        }
    }
    
    const subcategoryInfo = category.subcategories.find(s => s.id === subcategoryId);
    return {
        cat: category.label,
        sub: subcategoryInfo?.label || 'N/A',
        catId: category.id,
        subId: subcategoryInfo?.id || 'N/A'
    }
}

export function getPollsTableData(): PollRowData[] {
  return allTopics.map((topic): PollRowData => {
    const { cat, sub, catId, subId } = getCategoryInfo(topic.categoryId, topic.subcategoryId);
    return {
      id: topic.id,
      title: topic.question,
      category: cat,
      subcategory: sub,
      categoryId: catId,
      subcategoryId: subId,
      status: topic.status.charAt(0).toUpperCase() + topic.status.slice(1),
      votes: topic.totalVotes,
      updated: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString().split('T')[0],
      author: topic.author || 'System',
    };
  });
}

// Re-export categories for convenience in other admin components
export { categories };
