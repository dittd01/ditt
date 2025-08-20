

import type { Topic, Category, VoteHistory, Argument } from './types';
import { electionTopic } from './election-data';
import type { LucideIcon } from 'lucide-react';
import { subDays, subHours, subMonths, subYears, format } from 'date-fns';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    // Replace sequences of non-alphanumeric characters with a single dash
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading or trailing dashes
    .replace(/^-+|-+$/g, '');
}

const categoryData: { label: string; icon: string }[] = [
  { label: 'Elections & Governance', icon: 'Landmark' },
  { label: 'Taxation', icon: 'Scale' },
  { label: 'Budget & Public Finance', icon: 'Banknote' },
  { label: 'Economy & Business', icon: 'Building2' },
  { label: 'Labor & Welfare', icon: 'UserCheck' },
  { label: 'Health', icon: 'Stethoscope' },
  { label: 'Education & Research', icon: 'School' },
  { label: 'Environment & Energy', icon: 'Leaf' },
  { label: 'Infrastructure & Transport', icon: 'Train' },
  { label: 'Housing & Urban Development', icon: 'Home' },
  { label: 'Justice, Rights & Public Safety', icon: 'Gavel' },
  { label: 'Digital, Data & AI', icon: 'BrainCircuit' },
  { label: 'Immigration & Integration', icon: 'Users' },
  { label: 'Defense & Foreign Affairs', icon: 'Shield' },
  { label: 'Agriculture, Fisheries & Rural', icon: 'Tractor' },
  { label: 'Culture, Media & Sports', icon: 'Film' },
];

const categoryDataWithIds = categoryData.map(cat => ({
    ...cat,
    id: generateSlug(cat.label),
}));


const subCategoryData = [
    // Elections & Governance
    { id: "electoral_system", label: "Electoral System", categoryId: "elections-governance", topic: "Adopt ranked‑choice voting for national elections?", imageUrl: 'https://images.pexels.com/photos/6708876/pexels-photo-6708876.jpeg', aiHint: 'voting ballot', voteType: 'ranked' },
    { id: "direct_democracy", label: "Direct Democracy", categoryId: "elections-governance", topic: "Introduce national citizens’ initiative (50k signatures)?", imageUrl: 'https://images.pexels.com/photos/6708877/pexels-photo-6708877.jpeg', aiHint: 'protest crowd', voteType: 'yesno' },
    { id: "party_finance", label: "Party Finance", categoryId: "elections-governance", topic: "Ban private donations above NOK 100k?", imageUrl: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg', aiHint: 'money cash', voteType: 'yesno' },
    { id: "municipal_reform", label: "Municipal Reform", categoryId: "elections-governance", topic: "Merge municipalities with <5k residents?", imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', aiHint: 'norway map', voteType: 'yesno' },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", categoryId: "taxation", topic: "Raise wealth‑tax threshold to NOK 10m?", imageUrl: 'https://images.pexels.com/photos/6863174/pexels-photo-6863174.jpeg', aiHint: 'luxury yacht', voteType: 'likert' },
    { id: "inheritance_tax", label: "Inheritance Tax", categoryId: "taxation", topic: "Reintroduce inheritance tax above NOK 5m at 10%?", imageUrl: 'https://images.pexels.com/photos/669319/pexels-photo-669319.jpeg', aiHint: 'money hands', voteType: 'yesno' },
    { id: "corporate_tax", label: "Corporate Tax", categoryId: "taxation", topic: "Reduce corporate tax rate to 20%?", imageUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg', aiHint: 'office business', voteType: 'yesno' },
    { id: "vat_gst", label: "VAT", categoryId: "taxation", topic: "Lower VAT on food to 10%?", imageUrl: 'https://images.pexels.com/photos/669320/pexels-photo-669320.jpeg', aiHint: 'supermarket groceries', voteType: 'yesno' },
    { id: "carbon_tax", label: "Carbon Tax", categoryId: "taxation", topic: "Increase carbon tax to NOK 2,000/ton?", imageUrl: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg', aiHint: 'factory smoke', voteType: 'quadratic' },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", categoryId: "budget-public-finance", topic: "Change structural non‑oil deficit rule to 2.5%?", imageUrl: 'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg', aiHint: 'graph chart', voteType: 'yesno' },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", categoryId: "budget-public-finance", topic: "Allow Oljefondet to invest 10% in domestic infrastructure?", imageUrl: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg', aiHint: 'money growth', voteType: 'yesno' },
    { id: "spending_priorities", label: "Spending Priorities", categoryId: "budget-public-finance", topic: "Raise defense spending to 2.5% of GDP?", imageUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg', aiHint: 'fighter jet', voteType: 'yesno' },
    { id: "debt_rule", label: "Debt Rule", categoryId: "budget-public-finance", topic: "Adopt balanced‑budget amendment?", imageUrl: 'https://images.pexels.com/photos/669320/pexels-photo-669320.jpeg', aiHint: 'piggy bank', voteType: 'yesno' },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", categoryId: "economy-business", topic: "Cut employer fees for firms with <20 employees?", imageUrl: 'https://images.pexels.com/photos/4968637/pexels-photo-4968637.jpeg', aiHint: 'small business', voteType: 'yesno' },
    { id: "competition", label: "Competition", categoryId: "economy-business", topic: "Break up dominant grocery chains?", imageUrl: 'https://images.pexels.com/photos/3184297/pexels-photo-3184297.jpeg', aiHint: 'grocery aisle', voteType: 'yesno' },
    { id: "trade_policy", label: "Trade", categoryId: "economy-business", topic: "Seek new FTA with key Asian partners?", imageUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg', aiHint: 'shipping containers', voteType: 'yesno' },
    { id: "industrial", label: "Industrial Policy", categoryId: "economy-business", topic: "Subsidize a national battery gigafactory program?", imageUrl: 'https://images.pexels.com/photos/3861457/pexels-photo-3861457.jpeg', aiHint: 'battery factory', voteType: 'yesno' },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", categoryId: "labor-welfare", topic: "Introduce a national minimum wage?", imageUrl: 'https://images.pexels.com/photos/669320/pexels-photo-669320.jpeg', aiHint: 'diverse workers', voteType: 'yesno' },
    { id: "unemployment", label: "Unemployment Benefits", categoryId: "labor-welfare", topic: "Extend benefits eligibility to 18 months?", imageUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg', aiHint: 'sad person', voteType: 'yesno' },
    { id: "parental_leave", label: "Parental Leave", categoryId: "labor-welfare", topic: "Increase paid leave to 60 weeks (shared)?", imageUrl: 'https://images.pexels.com/photos/4968638/pexels-photo-4968638.jpeg', aiHint: 'parent baby', voteType: 'yesno' },
    { id: "pensions", label: "Pensions", categoryId: "labor-welfare", topic: "Gradually raise retirement age to 69?", imageUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg', aiHint: 'older couple', voteType: 'yesno' },
    // Health
    { id: "funding", label: "Funding", categoryId: "health", topic: "Increase hospital funding by 5% next year?", imageUrl: 'https://images.pexels.com/photos/263194/pexels-photo-263194.jpeg', aiHint: 'hospital corridor', voteType: 'yesno' },
    { id: "private_role", label: "Private Providers", categoryId: "health", topic: "Expand private providers within public system?", imageUrl: 'https://images.pexels.com/photos/3957987/pexels-photo-3957987.jpeg', aiHint: 'doctor patient', voteType: 'yesno' },
    { id: "pharma", label: "Prescription Drugs", categoryId: "health", topic: "Cap out‑of‑pocket drug costs at NOK 5,000/year?", imageUrl: 'https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg', aiHint: 'pills medication', voteType: 'yesno' },
    { id: "mental_health", label: "Mental Health", categoryId: "health", topic: "Guarantee 10 free therapy sessions/year?", imageUrl: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg', aiHint: 'therapy session', voteType: 'yesno' },
    // Education & Research
    { id: "schools", label: "Schools", categoryId: "education-research", topic: "Raise teacher salaries by 10%?", imageUrl: 'https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg', aiHint: 'students classroom', voteType: 'yesno' },
    { id: "higher_ed", label: "Higher Education", categoryId: "education-research", topic: "Tuition fees for non‑EU students in public universities?", imageUrl: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg', aiHint: 'university campus', voteType: 'yesno' },
    { id: "vocational", label: "Vocational Training", categoryId: "education-research", topic: "Add 20,000 apprenticeship seats?", imageUrl: 'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg', aiHint: 'workshop training', voteType: 'yesno' },
    { id: "research", label: "R&D", categoryId: "education-research", topic: "Double national AI research funding?", imageUrl: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg', aiHint: 'science laboratory', voteType: 'yesno' },
    // Environment & Energy
    { id: "renewables", label: "Renewables", categoryId: "environment-energy", topic: "Build 5 GW offshore wind by 2030?", imageUrl: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg', aiHint: 'wind turbines', voteType: 'yesno' },
    { id: "oil_gas", label: "Oil & Gas", categoryId: "environment-energy", topic: "Halt new exploration licenses?", imageUrl: 'https://images.pexels.com/photos/2272846/pexels-photo-2272846.jpeg', aiHint: 'oil rig', voteType: 'yesno' },
    { id: "nuclear", label: "Nuclear", categoryId: "environment-energy", topic: "Legalize small modular reactors (SMRs)?", imageUrl: 'https://images.pexels.com/photos/157929/nuclear-power-plant-power-plant-energy-reactor-157929.jpeg', aiHint: 'nuclear power', voteType: 'yesno' },
    { id: "climate_targets", label: "Climate Targets", categoryId: "environment-energy", topic: "Make net‑zero by 2040 legally binding?", imageUrl: 'https://images.pexels.com/photos/46160/field-clouds-sky-earth-46160.jpeg', aiHint: 'earth globe', voteType: 'yesno' },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", categoryId: "infrastructure-transport", topic: "High‑speed rail Oslo–Trondheim?", imageUrl: 'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg', aiHint: 'high-speed train', voteType: 'yesno' },
    { id: "roads", label: "Roads/Tolls", categoryId: "infrastructure-transport", topic: "Abolish urban road tolls?", imageUrl: 'https://images.pexels.com/photos/347141/pexels-photo-347141.jpeg', aiHint: 'traffic highway', voteType: 'yesno' },
    { id: "public_transit", label: "Public Transit", categoryId: "infrastructure-transport", topic: "Free transit for under‑18s?", imageUrl: 'https://images.pexels.com/photos/1603599/pexels-photo-1603599.jpeg', aiHint: 'bus city', voteType: 'yesno' },
    { id: "broadband", label: "Broadband", categoryId: "infrastructure-transport", topic: "Universal 1 Gbps by 2028?", imageUrl: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg', aiHint: 'fiber optics', voteType: 'yesno' },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", categoryId: "housing-urban-development", topic: "Target 30k affordable units/year?", imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', aiHint: 'modern houses', voteType: 'yesno' },
    { id: "rent", label: "Rent Regulation", categoryId: "housing-urban-development", topic: "Cap annual rent increases to CPI?", imageUrl: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg', aiHint: 'apartment building', voteType: 'yesno' },
    { id: "zoning", label: "Zoning", categoryId: "housing-urban-development", topic: "Upzone near transit for mid‑rise housing?", imageUrl: 'https://images.pexels.com/photos/209271/pexels-photo-209271.jpeg', aiHint: 'city street', voteType: 'yesno' },
    { id: "homelessness", label: "Homelessness", categoryId: "housing-urban-development", topic: "Adopt national Housing‑First program?", imageUrl: 'https://images.pexels.com/photos/7174415/pexels-photo-7174415.jpeg', aiHint: 'homeless person', voteType: 'yesno' },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", categoryId: "justice-rights-public-safety", topic: "Mandate body‑worn cameras nationwide?", imageUrl: 'https://images.pexels.com/photos/8649395/pexels-photo-8649395.jpeg', aiHint: 'police officer', voteType: 'yesno' },
    { id: "drug_policy", label: "Drugs", categoryId: "justice-rights-public-safety", topic: "Decriminalize possession of small amounts?", imageUrl: 'https://images.pexels.com/photos/7667733/pexels-photo-7667733.jpeg', aiHint: 'cannabis leaf', voteType: 'yesno' },
    { id: "privacy", label: "Civil Liberties", categoryId: "justice-rights-public-safety", topic: "Ban mass facial recognition in public spaces?", imageUrl: 'https://images.pexels.com/photos/53464/camera-movie-video-recording-53464.jpeg', aiHint: 'cctv camera', voteType: 'yesno' },
    { id: "prison_reform", label: "Prisons", categoryId: "justice-rights-public-safety", topic: "Expand rehabilitation programs over incarceration?", imageUrl: 'https://images.pexels.com/photos/1546912/pexels-photo-1546912.jpeg', aiHint: 'prison cell', voteType: 'yesno' },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", categoryId: "digital-data-ai", topic: "Require explicit opt‑in for cross‑service data sharing?", imageUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg', aiHint: 'code screen', voteType: 'yesno' },
    { id: "cybersecurity", label: "Cybersecurity", categoryId: "digital-data-ai", topic: "Launch a national bug‑bounty program?", imageUrl: 'https://images.pexels.com/photos/5473956/pexels-photo-5473956.jpeg', aiHint: 'hacker code', voteType: 'yesno' },
    { id: "ai_governance", label: "AI Governance", categoryId: "digital-data-ai", topic: "Adopt Algorithmic Accountability Act?", imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg', aiHint: 'robot face', voteType: 'yesno' },
    { id: "digital_id", label: "Digital ID", categoryId: "digital-data-ai", topic: "Open BankID APIs for civic services integration?", imageUrl: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg', aiHint: 'fingerprint scan', voteType: 'yesno' },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", categoryId: "immigration-integration", topic: "Increase annual refugee quota to a higher target?", imageUrl: 'https://images.pexels.com/photos/3828054/pexels-photo-3828054.jpeg', aiHint: 'refugee camp', voteType: 'yesno' },
    { id: "work_visas", label: "Work Visas", categoryId: "immigration-integration", topic: "Fast‑track skilled worker permits?", imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg', aiHint: 'passport stamp', voteType: 'yesno' },
    { id: "integration_policy", label: "Integration", categoryId: "immigration-integration", topic: "Mandatory Norwegian language courses for newcomers?", imageUrl: 'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg', aiHint: 'language class', voteType: 'yesno' },
    { id: "citizenship", label: "Citizenship", categoryId: "immigration-integration", topic: "Reduce residency requirement for citizenship?", imageUrl: 'https://images.pexels.com/photos/4386442/pexels-photo-4386442.jpeg', aiHint: 'norwegian passport', voteType: 'yesno' },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", categoryId: "defense-foreign-affairs", topic: "Raise defense to 2.5% of GDP and expand NATO deployments?", imageUrl: 'https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg', aiHint: 'nato flag', voteType: 'yesno' },
    { id: "conscription", label: "Conscription", categoryId: "defense-foreign-affairs", topic: "Extend universal conscription to 12 months?", imageUrl: 'https://images.pexels.com/photos/1327429/pexels-photo-1327429.jpeg', aiHint: 'soldiers marching', voteType: 'yesno' },
    { id: "foreign_aid", label: "Foreign Aid", categoryId: "defense-foreign-affairs", topic: "Set aid budget to 1% of GNI?", imageUrl: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg', aiHint: 'aid worker', voteType: 'yesno' },
    { id: "arctic", label: "Arctic Policy", categoryId: "defense-foreign-affairs", topic: "Increase Arctic patrols and infrastructure?", imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg', aiHint: 'icebreaker ship', voteType: 'yesno' },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", categoryId: "agriculture-fisheries-rural", topic: "Shift subsidies toward small/medium farms?", imageUrl: 'https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg', aiHint: 'farmer field', voteType: 'yesno' },
    { id: "fisheries", label: "Fisheries", categoryId: "agriculture-fisheries-rural", topic: "Ban bottom trawling in sensitive areas?", imageUrl: 'https://images.pexels.com/photos/2227776/pexels-photo-2227776.jpeg', aiHint: 'fishing boat', voteType: 'yesno' },
    { id: "animal_welfare", label: "Animal Welfare", categoryId: "agriculture-fisheries-rural", topic: "Phase out fur farming?", imageUrl: 'https://images.pexels.com/photos/1084425/pexels-photo-1084425.jpeg', aiHint: 'fox animal', voteType: 'yesno' },
    { id: "rural_services", label: "Rural Services", categoryId: "agriculture-fisheries-rural", topic: "Tax incentives for rural doctors and teachers?", imageUrl: 'https://images.pexels.com/photos/226589/pexels-photo-226589.jpeg', aiHint: 'rural landscape', voteType: 'yesno' },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", categoryId: "culture-media-sports", topic: "Increase regional arts funding by 20%?", imageUrl: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg', aiHint: 'music concert', voteType: 'yesno' },
    { id: "media_policy", label: "Media", categoryId: "culture-media-sports", topic: "Expand public broadcaster budget?", imageUrl: 'https://images.pexels.com/photos/764835/pexels-photo-764835.jpeg', aiHint: 'retro tv', voteType: 'yesno' },
    { id: "sports", label: "Sports", categoryId: "culture-media-sports", topic: "Nationwide school sports grants program?", imageUrl: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg', aiHint: 'soccer ball', voteType: 'yesno' },
    { id: "gambling", label: "Gambling", categoryId: "culture-media-sports", topic: "Stricter limits on gambling advertising?", imageUrl: 'https://images.pexels.com/photos/167703/pexels-photo-167703.jpeg', aiHint: 'poker chips', voteType: 'yesno' }
];

const topicOptions = {
    yesno: [
        { id: 'yes', label: 'Yes', color: 'hsl(var(--chart-2))' },
        { id: 'no', label: 'No', color: 'hsl(var(--chart-1))' },
        { id: 'abstain', label: 'Abstain', color: 'hsl(var(--muted))' }
    ],
    likert: [
        { id: 'strongly_agree', label: 'Strongly Agree', color: 'hsl(var(--chart-2))' },
        { id: 'agree', label: 'Agree', color: 'hsl(var(--chart-3))' },
        { id: 'neutral', label: 'Neutral', color: 'hsl(var(--muted))' },
        { id: 'disagree', label: 'Disagree', color: 'hsl(var(--chart-4))' },
        { id: 'strongly_disagree', label: 'Strongly Disagree', color: 'hsl(var(--chart-1))' },
    ],
    ranked: [
        { id: 'option_a', label: 'Option A', color: 'hsl(var(--chart-1))' },
        { id: 'option_b', label: 'Option B', color: 'hsl(var(--chart-2))' },
        { id: 'option_c', label: 'Option C', color: 'hsl(var(--chart-3))' },
    ],
    quadratic: [
        { id: 'yes', label: 'Yes', color: 'hsl(var(--chart-2))' },
        { id: 'no', label: 'No', color: 'hsl(var(--chart-1))' },
    ]
};

const generateVoteHistory = (options: {id: string}[], days: number): VoteHistory[] => {
    const history: VoteHistory[] = [];
    let currentVotes = options.reduce((acc, option) => {
        acc[option.id] = Math.floor(Math.random() * 20000) + 1000;
        return acc;
    }, {} as Record<string, number>);

    for (let i = days; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const newEntry: VoteHistory = { date: date.toISOString() };

        let totalDayVotes = 0;
        options.forEach(option => {
            // Fluctuate votes
            const fluctuation = (Math.random() - 0.45) * 0.1; // Fluctuate by up to 10%
            currentVotes[option.id] = Math.max(0, Math.floor(currentVotes[option.id] * (1 + fluctuation)));
            newEntry[option.id] = currentVotes[option.id];
            totalDayVotes += newEntry[option.id] as number;
        });

        // Add a total for percentage calculation
        newEntry.total = totalDayVotes;
        history.push(newEntry);
    }
    return history;
}


const standardTopics: Topic[] = subCategoryData.map((sub, index): Topic => {
    const voteType = (sub.voteType || 'yesno') as Topic['voteType'];
    const options = topicOptions[voteType === 'multi' || voteType === 'ranked' ? 'ranked' : voteType === 'likert' ? 'likert' : voteType === 'quadratic' ? 'quadratic' : 'yesno'];
    
    const history = generateVoteHistory(options, 365 * 2); // 2 years of data
    const latestVotes = history[history.length - 1];
    
    const votes = options.reduce((acc, option) => {
        acc[option.id] = latestVotes[option.id] as number;
        return acc;
    }, {} as Record<string, number>);
    
    const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
    
    const votesLastWeek = (latestVotes.total || 0) - (history[history.length - 8]?.total || 0);

    return {
        id: (index + 1).toString(),
        slug: generateSlug(sub.topic),
        question: sub.topic,
        description: `This is a public poll regarding ${sub.label.toLowerCase()} under the ${categoryDataWithIds.find(c => c.id === sub.categoryId)?.label} category. Your anonymous vote contributes to the public sentiment on this issue.`,
        imageUrl: sub.imageUrl,
        aiHint: sub.aiHint,
        options: options,
        votes: votes,
        totalVotes: totalVotes,
        votesLastWeek: votesLastWeek,
        history: history,
        categoryId: sub.categoryId,
        subcategoryId: sub.id,
        status: 'live',
        voteType: voteType,
    }
});

export const allTopics: Topic[] = [electionTopic, ...standardTopics];


export const categories: Category[] = [
    { id: 'election_2025', label: 'Election 2025', icon: 'Landmark', subcategories: [] },
    ...categoryDataWithIds.map(cat => ({
        ...cat,
        subcategories: subCategoryData
            .filter(sub => sub.categoryId === cat.id)
            .map(sub => ({ id: sub.id, label: sub.label, categoryId: sub.categoryId })),
    }))
];

export function getRelatedTopics(currentTopicId: string, subcategoryId: string): Topic[] {
  return allTopics
    .filter(topic => 
      topic.id !== currentTopicId && 
      topic.subcategoryId === subcategoryId &&
      topic.voteType !== 'election' // Exclude the main election poll
    )
    .slice(0, 3);
}

// MOCK DATA GENERATION
const norwegianNames = [
  'Anne', 'Per', 'Ingrid', 'Lars', 'Kari', 'Ole', 'Sigrid', 'Torbjorn', 'Marit', 'Hans',
  'Solveig', 'Knut', 'Astrid', 'Jan', 'Berit', 'Arne', 'Liv', 'Svein', 'Gerd', 'Erik',
  'Randi', 'Geir', 'Hilde', 'Bjorn', 'Nina', 'Morten', 'Tone', 'Terje', 'Heidi', 'Kjell'
];

const users = Array.from({ length: 100 }, (_, i) => {
  const name = norwegianNames[i % norwegianNames.length];
  const suffix = Math.floor(10 + Math.random() * 90);
  return {
    id: `user_${i + 1}`,
    username: `${name}${suffix}`,
    role: i < 30 ? 'arguer' : 'voter',
    avatarUrl: `https://placehold.co/40x40.png?text=${name.substring(0, 1)}${suffix.toString().substring(0,1)}`,
  };
});

const arguers = users.filter(u => u.role === 'arguer');
const voters = users.filter(u => u.role === 'voter');

let argIdCounter = 1;
const generatedArguments: Argument[] = [];

const createArgsForTopic = (topicId: string, forStatements: string[], againstStatements: string[]) => {
    forStatements.forEach((statement, i) => {
        const arguer = arguers[i % 15];
        generatedArguments.push({
            id: `arg_${topicId}_${argIdCounter++}`,
            topicId: topicId,
            parentId: null,
            side: 'for',
            author: { name: arguer.username, avatarUrl: arguer.avatarUrl },
            text: statement,
            upvotes: 0, downvotes: 0, replyCount: 0,
            createdAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
        });
    });
    againstStatements.forEach((statement, i) => {
        const arguer = arguers[15 + (i % 15)];
        generatedArguments.push({
            id: `arg_${topicId}_${argIdCounter++}`,
            topicId: topicId,
            parentId: null,
            side: 'against',
            author: { name: arguer.username, avatarUrl: arguer.avatarUrl },
            text: statement,
            upvotes: 0, downvotes: 0, replyCount: 0,
            createdAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
        });
    });
};

const forStatementsTopic5 = [
    "Raising the threshold protects family businesses and farms from being taxed on essential equipment and assets.",
    "A higher threshold encourages entrepreneurs to reinvest their capital in Norway instead of moving it abroad.",
    "The current wealth tax is effectively a double tax on already-taxed income; this change mitigates that unfairness.",
    "It simplifies the tax system for thousands of people with illiquid assets like property or shares in small companies.",
    "This adjustment is necessary to keep Norwegian capital competitive with other European countries that have lower or no wealth tax.",
    "By reducing the tax burden on working capital, we stimulate job creation and economic growth.",
    "The state's revenue loss is minimal compared to the economic benefit of retaining investment capital within the country.",
    "This is a modernization of the tax code, recognizing that most 'wealth' for small business owners is not liquid cash.",
    "It prevents the forced sale of assets or businesses simply to pay an annual tax bill, ensuring stability.",
    "A higher threshold allows more individuals to build a financial buffer, increasing overall economic resilience.",
    "The tax disproportionately affects retirees whose property values have increased but whose incomes have not.",
    "Focusing wealth tax on the truly super-rich makes the system more efficient and targeted.",
    "This change would reduce the administrative burden on both taxpayers and the tax authority.",
    "Less tax on capital means more money available for innovation and new technology development.",
    "It's a matter of principle: people should not be taxed year after year on assets they have already paid tax on."
];

const againstStatementsTopic5 = [
    "This is a significant tax cut for the wealthiest, increasing the gap between rich and poor.",
    "It would reduce public revenue by billions, forcing cuts to schools, healthcare, and infrastructure.",
    "The current threshold is already high enough to protect average citizens; this only benefits the top 1%.",
    "Wealth concentration is a major social problem, and this change would make it worse.",
    "The wealth tax is a vital tool for redistribution and ensuring the richest contribute their fair share.",
    "Claims that capital will flee are exaggerated; Norway remains an attractive place to invest regardless.",
    "This argument ignores the fact that wealth generates returns; a small tax on large fortunes is reasonable.",
    "It sends the wrong signal at a time when many are struggling with the cost of living.",
    "Public services, which benefit everyone, are a better use of this money than giving a tax break to the rich.",
    "The 'working capital' argument is a red herring; exemptions for business assets already exist.",
    "This change would further entrench generational wealth and reduce social mobility.",
    "A strong wealth tax ensures that untaxed capital gains on assets like property contribute to society.",
    "It undermines the progressive nature of the Norwegian tax system.",
    "The majority of the population, who would not benefit from this change, would have to bear the cost through reduced services.",
    "This is a step backward in our collective effort to build a more egalitarian society."
];


const forStatementsTopic3 = [
    "Banning large donations reduces the risk of 'cash for access' and political corruption.",
    "It levels the playing field, so that political influence isn't tied to wealth.",
    "This encourages parties to seek broader support from many small donors instead of a few large ones.",
    "Large, undisclosed donations create public distrust in the political system.",
    "A ban prevents wealthy special interests from dominating political discourse.",
    "It helps maintain the principle of 'one person, one vote' by limiting financial influence.",
    "This would force parties to be more transparent about their funding sources.",
    "Capping donations can lead to more grassroots engagement and volunteering.",
    "It reduces the pressure on politicians to cater to the demands of their biggest donors.",
    "This policy would help to restore faith in democracy and political integrity.",
    "It limits the ability of foreign entities or individuals to influence domestic politics.",
    "A cap makes politics more accessible for candidates who don't have wealthy networks.",
    "It's a simple, effective measure to curb the power of money in politics.",
    "This would shift focus from fundraising to policy and public debate.",
    "Other democracies have similar caps, and it works to improve fairness."
];

const againstStatementsTopic3 = [
    "Banning donations is a restriction on free speech and the right to support a cause.",
    "Parties need significant funding to run campaigns and communicate with voters effectively.",
    "A cap could drive donations underground to less transparent 'dark money' groups.",
    "Wealthy individuals should be free to support the political causes they believe in.",
    "This could lead to parties becoming more dependent on state funding, reducing their independence.",
    "It's not the government's role to decide how much an individual can support a political party.",
    "A ban might not solve the problem, as influence can be wielded in other ways (e.g., media ownership).",
    "This penalizes parties that rely on a few large donors but have legitimate public support.",
    "Defining what constitutes a 'donation' can be complex and lead to legal loopholes.",
    "It could inadvertently give more power to unions or other organizations that can mobilize members.",
    "Transparency reports on donations are a better solution than an outright ban.",
    "A cap could weaken political parties and make them less effective.",
    "This is an overreach of state power into the voluntary association of citizens.",
    "If donations are public, voters can decide for themselves if a politician is 'bought'.",
    "It could lead to a system where only the independently wealthy can afford to run for office."
];

createArgsForTopic('5', forStatementsTopic5, againstStatementsTopic5);
createArgsForTopic('3', forStatementsTopic3, againstStatementsTopic3);

voters.forEach(voter => {
    const votedOn = new Set<string>();
    const numVotes = Math.floor(Math.random() * 10) + 3; // Vote on 3 to 12 arguments
    for (let i = 0; i < numVotes; i++) {
        let randomArgIndex = Math.floor(Math.random() * generatedArguments.length);
        while (votedOn.has(generatedArguments[randomArgIndex].id)) {
            randomArgIndex = Math.floor(Math.random() * generatedArguments.length);
        }
        const argument = generatedArguments[randomArgIndex];
        votedOn.add(argument.id);
        if (Math.random() > 0.3) {
            argument.upvotes += 1;
        } else {
            argument.downvotes += 1;
        }
    }
});

const addReplies = (count: number) => {
    for (let i = 0; i < count; i++) {
        const potentialParents = generatedArguments.filter(a => a.replyCount < 3);
        if (potentialParents.length === 0) break;
        
        const parent = potentialParents[Math.floor(Math.random() * potentialParents.length)];
        const arguer = arguers[Math.floor(Math.random() * arguers.length)];
        const replySide = parent.side === 'for' ? 'against' : 'for';
        
        const reply: Argument = {
             id: `arg_reply_${argIdCounter++}`,
             topicId: parent.topicId,
             parentId: parent.id,
             side: replySide,
             author: { name: arguer.username, avatarUrl: arguer.avatarUrl },
             text: `This is a reply to "${parent.text.substring(0, 20)}...". I think you are mistaken because...`,
             upvotes: Math.floor(Math.random() * 10),
             downvotes: Math.floor(Math.random() * 5),
             replyCount: 0,
             createdAt: subHours(new Date(parent.createdAt), Math.floor(Math.random() * -24)).toISOString(),
        };
        
        parent.replyCount++;
        generatedArguments.push(reply);
    }
};

addReplies(40);

export const mockArguments: Argument[] = generatedArguments;

export const getArgumentsForTopic = (topicId: string): Argument[] => {
    return mockArguments.filter(arg => arg.topicId === topicId);
}
    

    


