

import type { Topic, Category, VoteHistory, Argument } from './types';
import { electionTopic as initialElectionTopic, parties as partyDetails } from './election-data';
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
    { id: "electoral_system", label: "Electoral System", categoryId: "elections-governance", topic: "Adopt ranked‑choice voting for national elections?", imageUrl: 'https://images.unsplash.com/photo-1555626811-66ea1a47321e?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot', voteType: 'ranked' },
    { id: "direct_democracy", label: "Direct Democracy", categoryId: "elections-governance", topic: "Introduce national citizens’ initiative (50k signatures)?", imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1740&auto=format&fit=crop', aiHint: 'people meeting', voteType: 'yesno' },
    { id: "party_finance", label: "Party Finance", categoryId: "elections-governance", topic: "Ban private donations above NOK 100k?", imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1740&auto=format&fit=crop', aiHint: 'money cash', voteType: 'yesno' },
    { id: "municipal_reform", label: "Municipal Reform", categoryId: "elections-governance", topic: "Merge municipalities with <5k residents?", imageUrl: 'https://images.unsplash.com/photo-1549925243-75059599b5a3?q=80&w=1740&auto=format&fit=crop', aiHint: 'norway map', voteType: 'yesno' },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", categoryId: "taxation", topic: "Raise wealth‑tax threshold to NOK 10m?", imageUrl: 'https://images.unsplash.com/photo-1612178713438-669141e3d748?q=80&w=1740&auto=format&fit=crop', aiHint: 'luxury yacht', voteType: 'likert' },
    { id: "inheritance_tax", label: "Inheritance Tax", categoryId: "taxation", topic: "Reintroduce inheritance tax above NOK 5m at 10%?", imageUrl: 'https://images.unsplash.com/photo-1628191136450-4d4b943715c0?q=80&w=1740&auto=format&fit=crop', aiHint: 'family hands', voteType: 'yesno' },
    { id: "corporate_tax", label: "Corporate Tax", categoryId: "taxation", topic: "Reduce corporate tax rate to 20%?", imageUrl: 'https://images.unsplash.com/photo-1554224154-26032f2a7144?q=80&w=1740&auto=format&fit=crop', aiHint: 'office building', voteType: 'yesno' },
    { id: "vat_gst", label: "VAT", categoryId: "taxation", topic: "Lower VAT on food to 10%?", imageUrl: 'https://images.unsplash.com/photo-1588964895597-cf29e52c97a8?q=80&w=1740&auto=format&fit=crop', aiHint: 'supermarket groceries', voteType: 'yesno' },
    { id: "carbon_tax", label: "Carbon Tax", categoryId: "taxation", topic: "Increase carbon tax to NOK 2,000/ton?", imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d42e2?q=80&w=1740&auto=format&fit=crop', aiHint: 'factory smoke', voteType: 'quadratic' },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", categoryId: "budget-public-finance", topic: "Change structural non‑oil deficit rule to 2.5%?", imageUrl: 'https://images.unsplash.com/photo-1549925243-75059599b5a3?q=80&w=1740&auto=format&fit=crop', aiHint: 'norway map', voteType: 'yesno' },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", categoryId: "budget-public-finance", topic: "Allow Oljefondet to invest 10% in domestic infrastructure?", imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1740&auto=format&fit=crop', aiHint: 'stock chart', voteType: 'yesno' },
    { id: "spending_priorities", label: "Spending Priorities", categoryId: "budget-public-finance", topic: "Raise defense spending to 2.5% of GDP?", imageUrl: 'https://images.unsplash.com/photo-1561657876-1b585370343a?q=80&w=1740&auto=format&fit=crop', aiHint: 'fighter jet', voteType: 'yesno' },
    { id: "debt_rule", label: "Debt Rule", categoryId: "budget-public-finance", topic: "Adopt balanced‑budget amendment?", imageUrl: 'https://images.unsplash.com/photo-1601574323710-0e152f788b17?q=80&w=1740&auto=format&fit=crop', aiHint: 'piggy bank', voteType: 'yesno' },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", categoryId: "economy-business", topic: "Cut employer fees for firms with <20 employees?", imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1740&auto=format&fit=crop', aiHint: 'small business', voteType: 'yesno' },
    { id: "competition", label: "Competition", categoryId: "economy-business", topic: "Break up dominant grocery chains?", imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1740&auto=format&fit=crop', aiHint: 'grocery aisle', voteType: 'yesno' },
    { id: "trade_policy", label: "Trade", categoryId: "economy-business", topic: "Seek new FTA with key Asian partners?", imageUrl: 'https://images.unsplash.com/photo-1611796335345-4b13d5a1532c?q=80&w=1740&auto=format&fit=crop', aiHint: 'shipping containers', voteType: 'yesno' },
    { id: "industrial", label: "Industrial Policy", categoryId: "economy-business", topic: "Subsidize a national battery gigafactory program?", imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1740&auto=format&fit=crop', aiHint: 'circuit board', voteType: 'yesno' },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", categoryId: "labor-welfare", topic: "Introduce a national minimum wage?", imageUrl: 'https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=1740&auto=format&fit=crop', aiHint: 'diverse workers', voteType: 'yesno' },
    { id: "unemployment", label: "Unemployment Benefits", categoryId: "labor-welfare", topic: "Extend benefits eligibility to 18 months?", imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1740&auto=format&fit=crop', aiHint: 'helping hands', voteType: 'yesno' },
    { id: "parental_leave", label: "Parental Leave", categoryId: "labor-welfare", topic: "Increase paid leave to 60 weeks (shared)?", imageUrl: 'https://images.unsplash.com/photo-1482029219965-2593b2e36402?q=80&w=1740&auto=format&fit=crop', aiHint: 'parent baby', voteType: 'yesno' },
    { id: "pensions", label: "Pensions", categoryId: "labor-welfare", topic: "Gradually raise retirement age to 69?", imageUrl: 'https://images.unsplash.com/photo-1619548439399-528f3a388f7c?q=80&w=1740&auto=format&fit=crop', aiHint: 'older couple', voteType: 'yesno' },
    // Health
    { id: "funding", label: "Funding", categoryId: "health", topic: "Increase hospital funding by 5% next year?", imageUrl: 'https://images.unsplash.com/photo-1586773860414-72476c28aa6f?q=80&w=1740&auto=format&fit=crop', aiHint: 'hospital corridor', voteType: 'yesno' },
    { id: "private_role", label: "Private Providers", categoryId: "health", topic: "Expand private providers within public system?", imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1740&auto=format&fit=crop', aiHint: 'doctor patient', voteType: 'yesno' },
    { id: "pharma", label: "Prescription Drugs", categoryId: "health", topic: "Cap out‑of‑pocket drug costs at NOK 5,000/year?", imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1740&auto=format&fit=crop', aiHint: 'pills medication', voteType: 'yesno' },
    { id: "mental_health", label: "Mental Health", categoryId: "health", topic: "Guarantee 10 free therapy sessions/year?", imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1742&auto=format&fit=crop', aiHint: 'calm person', voteType: 'yesno' },
    // Education & Research
    { id: "schools", label: "Schools", categoryId: "education-research", topic: "Raise teacher salaries by 10%?", imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1740&auto=format&fit=crop', aiHint: 'students classroom', voteType: 'yesno' },
    { id: "higher_ed", label: "Higher Education", categoryId: "education-research", topic: "Tuition fees for non‑EU students in public universities?", imageUrl: 'https://images.unsplash.com/photo-1525921429624-479b6a26d86e?q=80&w=1740&auto=format&fit=crop', aiHint: 'university campus', voteType: 'yesno' },
    { id: "vocational", label: "Vocational Training", categoryId: "education-research", topic: "Add 20,000 apprenticeship seats?", imageUrl: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1740&auto=format&fit=crop', aiHint: 'workshop training', voteType: 'yesno' },
    { id: "research", label: "R&D", categoryId: "education-research", topic: "Double national AI research funding?", imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1740&auto=format&fit=crop', aiHint: 'science laboratory', voteType: 'yesno' },
    // Environment & Energy
    { id: "renewables", label: "Renewables", categoryId: "environment-energy", topic: "Build 5 GW offshore wind by 2030?", imageUrl: 'https://images.unsplash.com/photo-1496412423228-0628e37586c5?q=80&w=1740&auto=format&fit=crop', aiHint: 'wind turbines', voteType: 'yesno' },
    { id: "oil_gas", label: "Oil & Gas", categoryId: "environment-energy", topic: "Halt new exploration licenses?", imageUrl: 'https://images.unsplash.com/photo-1563233367-1b0b53a39e8a?q=80&w=1740&auto=format&fit=crop', aiHint: 'oil rig', voteType: 'yesno' },
    { id: "nuclear", label: "Nuclear", categoryId: "environment-energy", topic: "Legalize small modular reactors (SMRs)?", imageUrl: 'https://images.unsplash.com/photo-1596178065889-281b33833555?q=80&w=1740&auto=format&fit=crop', aiHint: 'nuclear power', voteType: 'yesno' },
    { id: "climate_targets", label: "Climate Targets", categoryId: "environment-energy", topic: "Make net‑zero by 2040 legally binding?", imageUrl: 'https://images.unsplash.com/photo-1422493757035-1e5e03968f95?q=80&w=1740&auto=format&fit=crop', aiHint: 'earth globe', voteType: 'yesno' },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", categoryId: "infrastructure-transport", topic: "High‑speed rail Oslo–Trondheim?", imageUrl: 'https://images.unsplash.com/photo-1559265706-54311d8820a4?q=80&w=1740&auto=format&fit=crop', aiHint: 'high-speed train', voteType: 'yesno' },
    { id: "roads", label: "Roads/Tolls", categoryId: "infrastructure-transport", topic: "Abolish urban road tolls?", imageUrl: 'https://images.unsplash.com/photo-1570165516242-5a4635d214a1?q=80&w=1740&auto=format&fit=crop', aiHint: 'traffic highway', voteType: 'yesno' },
    { id: "public_transit", label: "Public Transit", categoryId: "infrastructure-transport", topic: "Free transit for under‑18s?", imageUrl: 'https://images.unsplash.com/photo-1646244552321-217ab905f505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxCdXNzfGVufDB8fHx8MTc1NTcxNzQ0M3ww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'bus city', voteType: 'yesno' },
    { id: "broadband", label: "Broadband", categoryId: "infrastructure-transport", topic: "Universal 1 Gbps by 2028?", imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1740&auto=format&fit=crop', aiHint: 'fiber optics', voteType: 'yesno' },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", categoryId: "housing-urban-development", topic: "Target 30k affordable units/year?", imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1740&auto=format&fit=crop', aiHint: 'modern houses', voteType: 'yesno' },
    { id: "rent", label: "Rent Regulation", categoryId: "housing-urban-development", topic: "Cap annual rent increases to CPI?", imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1740&auto=format&fit=crop', aiHint: 'apartment building', voteType: 'yesno' },
    { id: "zoning", label: "Zoning", categoryId: "housing-urban-development", topic: "Upzone near transit for mid‑rise housing?", imageUrl: 'https://images.unsplash.com/photo-1545423379-3f942b78a91f?q=80&w=1740&auto=format&fit=crop', aiHint: 'city street', voteType: 'yesno' },
    { id: "homelessness", label: "Homelessness", categoryId: "housing-urban-development", topic: "Adopt national Housing‑First program?", imageUrl: 'https://images.unsplash.com/photo-1518395699432-69641a96c3d9?q=80&w=1740&auto=format&fit=crop', aiHint: 'homeless person', voteType: 'yesno' },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", categoryId: "justice-rights-public-safety", topic: "Mandate body‑worn cameras nationwide?", imageUrl: 'https://images.unsplash.com/photo-1621283315358-8316a30141b7?q=80&w=1740&auto=format&fit=crop', aiHint: 'police officer', voteType: 'yesno' },
    { id: "drug_policy", label: "Drugs", categoryId: "justice-rights-public-safety", topic: "Decriminalize possession of small amounts?", imageUrl: 'https://images.unsplash.com/photo-1599933638382-0cf0299acb4a?q=80&w=1740&auto=format&fit=crop', aiHint: 'cannabis leaf', voteType: 'yesno' },
    { id: "privacy", label: "Civil Liberties", categoryId: "justice-rights-public-safety", topic: "Ban mass facial recognition in public spaces?", imageUrl: 'https://images.unsplash.com/photo-1628422537562-0980980f52a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmYWNpYWwlMjByZWNvZ25pdGlvbnxlbnwwfHx8fDE3NTU3NjcxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'cctv camera', voteType: 'yesno' },
    { id: "prison_reform", label: "Prisons", categoryId: "justice-rights-public-safety", topic: "Expand rehabilitation programs over incarceration?", imageUrl: 'https://images.unsplash.com/photo-1596700239859-c9a44a6723e4?q=80&w=1740&auto=format&fit=crop', aiHint: 'prison cell', voteType: 'yesno' },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", categoryId: "digital-data-ai", topic: "Require explicit opt‑in for cross‑service data sharing?", imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1740&auto=format&fit=crop', aiHint: 'code screen', voteType: 'yesno' },
    { id: "cybersecurity", label: "Cybersecurity", categoryId: "digital-data-ai", topic: "Launch a national bug‑bounty program?", imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1740&auto=format&fit=crop', aiHint: 'hacker code', voteType: 'yesno' },
    { id: "ai_governance", label: "AI Governance", categoryId: "digital-data-ai", topic: "Adopt Algorithmic Accountability Act?", imageUrl: 'https://images.unsplash.com/photo-1593349480503-68c36c71a308?q=80&w=1740&auto=format&fit=crop', aiHint: 'robot hand', voteType: 'yesno' },
    { id: "digital_id", label: "Digital ID", categoryId: "digital-data-ai", topic: "Open BankID APIs for civic services integration?", imageUrl: 'https://images.unsplash.com/photo-1588590521083-f54f59c8a77a?q=80&w=1740&auto=format&fit=crop', aiHint: 'fingerprint scan', voteType: 'yesno' },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", categoryId: "immigration-integration", topic: "Increase annual refugee quota to a higher target?", imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1740&auto=format&fit=crop', aiHint: 'people waiting', voteType: 'yesno' },
    { id: "work_visas", label: "Work Visas", categoryId: "immigration-integration", topic: "Fast‑track skilled worker permits?", imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1770&auto=format&fit=crop', aiHint: 'passport stamp', voteType: 'yesno' },
    { id: "integration_policy", label: "Integration", categoryId: "immigration-integration", topic: "Mandatory Norwegian language courses for newcomers?", imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1742&auto=format&fit=crop', aiHint: 'language class', voteType: 'yesno' },
    { id: "citizenship", label: "Citizenship", categoryId: "immigration-integration", topic: "Reduce residency requirement for citizenship?", imageUrl: 'https://images.unsplash.com/photo-1563274934-7546f0b0c61c?q=80&w=1740&auto=format&fit=crop', aiHint: 'norwegian passport', voteType: 'yesno' },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", categoryId: "defense-foreign-affairs", topic: "Raise defense to 2.5% of GDP and expand NATO deployments?", imageUrl: 'https://images.unsplash.com/photo-1582131509012-4e637843d100?q=80&w=1740&auto=format&fit=crop', aiHint: 'nato flag', voteType: 'yesno' },
    { id: "conscription", label: "Conscription", categoryId: "defense-foreign-affairs", topic: "Extend universal conscription to 12 months?", imageUrl: 'https://images.unsplash.com/photo-1611108023803-a0a4b7529f7f?q=80&w=1740&auto=format&fit=crop', aiHint: 'soldiers marching', voteType: 'yesno' },
    { id: "foreign_aid", label: "Foreign Aid", categoryId: "defense-foreign-affairs", topic: "Set aid budget to 1% of GNI?", imageUrl: 'https://images.unsplash.com/photo-1618493649673-f38018315183?q=80&w=1740&auto=format&fit=crop', aiHint: 'aid worker', voteType: 'yesno' },
    { id: "arctic", label: "Arctic Policy", categoryId: "defense-foreign-affairs", topic: "Increase Arctic patrols and infrastructure?", imageUrl: 'https://images.unsplash.com/photo-1601614748831-e4a36d231b14?q=80&w=1740&auto=format&fit=crop', aiHint: 'icebreaker ship', voteType: 'yesno' },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", categoryId: "agriculture-fisheries-rural", topic: "Shift subsidies toward small/medium farms?", imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1740&auto=format&fit=crop', aiHint: 'farmer field', voteType: 'yesno' },
    { id: "fisheries", label: "Fisheries", categoryId: "agriculture-fisheries-rural", topic: "Ban bottom trawling in sensitive areas?", imageUrl: 'https://images.unsplash.com/photo-1598965158655-e8d14c194a2e?q=80&w=1740&auto=format&fit=crop', aiHint: 'fishing boat', voteType: 'yesno' },
    { id: "animal_welfare", label: "Animal Welfare", categoryId: "agriculture-fisheries-rural", topic: "Phase out fur farming?", imageUrl: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=1740&auto=format&fit=crop', aiHint: 'happy dog', voteType: 'yesno' },
    { id: "rural_services", label: "Rural Services", categoryId: "agriculture-fisheries-rural", topic: "Tax incentives for rural doctors and teachers?", imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=1740&auto=format&fit=crop', aiHint: 'rural landscape', voteType: 'yesno' },
    { id: "foreign_fishing", label: "Fisheries", categoryId: "agriculture-fisheries-rural", topic: "Foreign fishing boats should be banned from Norwegian waters.", imageUrl: 'https://images.unsplash.com/photo-1655523539874-e6c9aa4b5edd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxmaXNoaW5nJTIwYm9hdHxlbnwwfHx8fDE3NTU3MTc3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'fishing trawler', voteType: 'yesno' },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", categoryId: "culture-media-sports", topic: "Increase regional arts funding by 20%?", imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1674&auto=format&fit=crop', aiHint: 'music concert', voteType: 'yesno' },
    { id: "media_policy", label: "Media", categoryId: "culture-media-sports", topic: "Expand public broadcaster budget?", imageUrl: 'https://images.unsplash.com/photo-1594904351333-d95856a35a22?q=80&w=1740&auto=format&fit=crop', aiHint: 'retro tv', voteType: 'yesno' },
    { id: "sports", label: "Sports", categoryId: "culture-media-sports", topic: "Nationwide school sports grants program?", imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1740&auto=format&fit=crop', aiHint: 'soccer ball', voteType: 'yesno' },
    { id: "gambling", label: "Gambling", categoryId: "culture-media-sports", topic: "Stricter limits on gambling advertising?", imageUrl: 'https://images.unsplash.com/photo-1541348263662-e349a15d6741?q=80&w=1740&auto=format&fit=crop', aiHint: 'poker chips', voteType: 'yesno' }
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
    const votesLastMonth = (latestVotes.total || 0) - (history[history.length - 31]?.total || 0);
    const votesLastYear = (latestVotes.total || 0) - (history[history.length - 366]?.total || 0);

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
        votesLastMonth: votesLastMonth,
        votesLastYear: votesLastYear,
        history: history,
        categoryId: sub.categoryId,
        subcategoryId: sub.id,
        status: 'live',
        voteType: voteType,
    }
});

const electionTopic: Topic = {
    ...initialElectionTopic,
    votesLastWeek: initialElectionTopic.totalVotes - (initialElectionTopic.history[1].total || 0),
    votesLastMonth: initialElectionTopic.totalVotes - (initialElectionTopic.history[0].total || 0),
    votesLastYear: initialElectionTopic.totalVotes,
}

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

const forStatementsByTopic: Record<string, string[]> = {
    '3': [ // Ban private donations
        "Banning large donations reduces the risk of 'cash for access' and political corruption.", "It levels the playing field, so that political influence isn't tied to wealth.", "This encourages parties to seek broader support from many small donors instead of a few large ones.", "Large, undisclosed donations create public distrust in the political system.", "A ban prevents wealthy special interests from dominating political discourse.", "It helps maintain the principle of 'one person, one vote' by limiting financial influence.", "This would force parties to be more transparent about their funding sources.", "Capping donations can lead to more grassroots engagement and volunteering.", "It reduces the pressure on politicians to cater to the demands of their biggest donors.", "This policy would help to restore faith in democracy and political integrity.", "It limits the ability of foreign entities or individuals to influence domestic politics.", "A cap makes politics more accessible for candidates who don't have wealthy networks.", "It's a simple, effective measure to curb the power of money in politics.", "This would shift focus from fundraising to policy and public debate.", "Other democracies have similar caps, and it works to improve fairness."
    ],
    '5': [ // Raise wealth tax threshold
        "Raising the threshold protects family businesses and farms from being taxed on essential equipment and assets.", "A higher threshold encourages entrepreneurs to reinvest their capital in Norway instead of moving it abroad.", "The current wealth tax is effectively a double tax on already-taxed income; this change mitigates that unfairness.", "It simplifies the tax system for thousands of people with illiquid assets like property or shares in small companies.", "This adjustment is necessary to keep Norwegian capital competitive with other European countries that have lower or no wealth tax.", "By reducing the tax burden on working capital, we stimulate job creation and economic growth.", "The state's revenue loss is minimal compared to the economic benefit of retaining investment capital within the country.", "This is a modernization of the tax code, recognizing that most 'wealth' for small business owners is not liquid cash.", "It prevents the forced sale of assets or businesses simply to pay an annual tax bill, ensuring stability.", "A higher threshold allows more individuals to build a financial buffer, increasing overall economic resilience.", "The tax disproportionately affects retirees whose property values have increased but whose incomes have not.", "Focusing wealth tax on the truly super-rich makes the system more efficient and targeted.", "This change would reduce the administrative burden on both taxpayers and the tax authority.", "Less tax on capital means more money available for innovation and new technology development.", "It's a matter of principle: people should not be taxed year after year on assets they have already paid tax on."
    ]
};

const againstStatementsByTopic: Record<string, string[]> = {
    '3': [ // Ban private donations
        "Banning donations is a restriction on free speech and the right to support a cause.", "Parties need significant funding to run campaigns and communicate with voters effectively.", "A cap could drive donations underground to less transparent 'dark money' groups.", "Wealthy individuals should be free to support the political causes they believe in.", "This could lead to parties becoming more dependent on state funding, reducing their independence.", "It's not the government's role to decide how much an individual can support a political party.", "A ban might not solve the problem, as influence can be wielded in other ways (e.g., media ownership).", "This penalizes parties that rely on a few large donors but have legitimate public support.", "Defining what constitutes a 'donation' can be complex and lead to legal loopholes.", "It could inadvertently give more power to unions or other organizations that can mobilize members.", "Transparency reports on donations are a better solution than an outright ban.", "A cap could weaken political parties and make them less effective.", "This is an overreach of state power into the voluntary association of citizens.", "If donations are public, voters can decide for themselves if a politician is 'bought'.", "It could lead to a system where only the independently wealthy can afford to run for office."
    ],
    '5': [ // Raise wealth tax threshold
        "This is a significant tax cut for the wealthiest, increasing the gap between rich and poor.", "It would reduce public revenue by billions, forcing cuts to schools, healthcare, and infrastructure.", "The current threshold is already high enough to protect average citizens; this only benefits the top 1%.", "Wealth concentration is a major social problem, and this change would make it worse.", "The wealth tax is a vital tool for redistribution and ensuring the richest contribute their fair share.", "Claims that capital will flee are exaggerated; Norway remains an attractive place to invest regardless.", "This argument ignores the fact that wealth generates returns; a small tax on large fortunes is reasonable.", "It sends the wrong signal at a time when many are struggling with the cost of living.", "Public services, which benefit everyone, are a better use of this money than giving a tax break to the rich.", "The 'working capital' argument is a red herring; exemptions for business assets already exist.", "This change would further entrench generational wealth and reduce social mobility.", "A strong wealth tax ensures that untaxed capital gains on assets like property contribute to society.", "It undermines the progressive nature of the Norwegian tax system.", "The majority of the population, who would not benefit from this change, would have to bear the cost through reduced services.", "This is a step backward in our collective effort to build a more egalitarian society."
    ]
};

let argIdCounter = 1;

const createArgsForTopic = (topicId: string): Argument[] => {
    const users = Array.from({ length: 100 }, (_, i) => {
        const name = norwegianNames[i % norwegianNames.length];
        const suffix = Math.floor(10 + Math.random() * 90);
        return {
            id: `user_${topicId}_${i + 1}`,
            username: `${name.toLowerCase()}${suffix}`,
            role: i < 30 ? 'arguer' : 'voter',
            avatarUrl: `https://placehold.co/40x40.png?text=${name.substring(0, 1)}${suffix.toString().substring(0,1)}`,
        };
    });

    const arguers = users.filter(u => u.role === 'arguer');
    const voters = users.filter(u => u.role === 'voter');
    const forArguers = arguers.slice(0, 15);
    const againstArguers = arguers.slice(15, 30);

    const forStatements = forStatementsByTopic[topicId] || [];
    const againstStatements = againstStatementsByTopic[topicId] || [];
    
    const topicArguments: Argument[] = [];

    forStatements.forEach((statement, i) => {
        const arguer = forArguers[i % forArguers.length];
        topicArguments.push({
            id: `arg_${topicId}_${argIdCounter++}`,
            topicId: topicId,
            parentId: 'root',
            side: 'for',
            author: { name: arguer.username, avatarUrl: arguer.avatarUrl },
            text: statement,
            upvotes: 0, downvotes: 0, replyCount: 0,
            createdAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
        });
    });

    againstStatements.forEach((statement, i) => {
        const arguer = againstArguers[i % againstArguers.length];
        topicArguments.push({
            id: `arg_${topicId}_${argIdCounter++}`,
            topicId: topicId,
            parentId: 'root',
            side: 'against',
            author: { name: arguer.username, avatarUrl: arguer.avatarUrl },
            text: statement,
            upvotes: 0, downvotes: 0, replyCount: 0,
            createdAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
        });
    });

    // Simulate votes
    voters.forEach(voter => {
        const votedOn = new Set<string>();
        const numVotes = Math.floor(Math.random() * 10) + 3; // Vote on 3 to 12 arguments
        for (let i = 0; i < numVotes; i++) {
            if (topicArguments.length === 0) break;
            let randomArgIndex = Math.floor(Math.random() * topicArguments.length);
            let retries = 0;
            while (votedOn.has(topicArguments[randomArgIndex].id) && retries < 10) {
                randomArgIndex = Math.floor(Math.random() * topicArguments.length);
                retries++;
            }
            if(retries >= 10) continue;

            const argument = topicArguments[randomArgIndex];
            votedOn.add(argument.id);
            if (Math.random() > 0.3) {
                argument.upvotes += 1;
            } else {
                argument.downvotes += 1;
            }
        }
    });

    // Simulate replies
    const addReplies = (count: number) => {
        const originalArgsCount = topicArguments.length;
        for (let i = 0; i < count; i++) {
            const potentialParents = topicArguments.slice(0, originalArgsCount).filter(a => a.replyCount < 2);
            if (potentialParents.length === 0) break;
            
            const parent = potentialParents[Math.floor(Math.random() * potentialParents.length)];
            const arguer = arguers[Math.floor(Math.random() * arguers.length)];
            const replySide = parent.side === 'for' ? 'against' : 'for';
            
            const reply: Argument = {
                 id: `arg_reply_${topicId}_${argIdCounter++}`,
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
            
            const parentInArray = topicArguments.find(a => a.id === parent.id);
            if(parentInArray) {
                 parentInArray.replyCount++;
                 topicArguments.push(reply);
            }
        }
    };
    addReplies(20); // Add 20 replies for this topic
    return topicArguments;
}

const argumentsForTopic3 = createArgsForTopic('3');
const argumentsForTopic5 = createArgsForTopic('5');

const allMockArguments: Argument[] = [...argumentsForTopic3, ...argumentsForTopic5];

// Ensure unique IDs across all arguments, including replies
const generateUniqueArguments = () => {
  let uniqueIdCounter = 1;
  const idMap = new Map<string, string>();
  const generatedArgs: Argument[] = [];

  // Re-map IDs for a specific topic's arguments
  const processTopicArgs = (topicId: string, forStatements: string[], againstStatements: string[]) => {
      const users = Array.from({ length: 100 }, (_, i) => {
          const name = norwegianNames[i % norwegianNames.length];
          const suffix = Math.floor(10 + Math.random() * 90);
          return {
              username: `${name.toLowerCase()}${suffix}`,
              avatarUrl: `https://placehold.co/40x40.png?text=${name.substring(0, 1)}${suffix.toString().substring(0,1)}`,
          };
      });
      const arguers = users.slice(0, 30);
      const voters = users.slice(30);

      const topicArgs: Argument[] = [];

      // Create root-level arguments
      forStatements.forEach((statement, i) => {
          const author = arguers[i % arguers.length];
          const newId = `arg-${uniqueIdCounter++}`;
          topicArgs.push({
              id: newId, topicId, parentId: 'root', side: 'for', author, text: statement,
              upvotes: Math.floor(Math.random() * 50), downvotes: Math.floor(Math.random() * 20), replyCount: 0,
              createdAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
          });
      });
      againstStatements.forEach((statement, i) => {
          const author = arguers[i % arguers.length];
          const newId = `arg-${uniqueIdCounter++}`;
          topicArgs.push({
              id: newId, topicId, parentId: 'root', side: 'against', author, text: statement,
              upvotes: Math.floor(Math.random() * 50), downvotes: Math.floor(Math.random() * 20), replyCount: 0,
              createdAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
          });
      });

      // Create replies
      const originalArgsCount = topicArgs.length;
      for (let i = 0; i < 20; i++) { // Create 20 replies
          if (topicArgs.length === 0) break;
          const parentArg = topicArgs[Math.floor(Math.random() * topicArgs.length)];
          const author = arguers[Math.floor(Math.random() * arguers.length)];
          const replySide = parentArg.side === 'for' ? 'against' : 'for';
          const newId = `arg-${uniqueIdCounter++}`;
          
          topicArgs.push({
              id: newId, topicId, parentId: parentArg.id, side: replySide, author,
              text: `This is a reply to a previous argument about "${parentArg.text.substring(0, 20)}...". I believe...`,
              upvotes: Math.floor(Math.random() * 15), downvotes: Math.floor(Math.random() * 5), replyCount: 0,
              createdAt: subHours(new Date(parentArg.createdAt), Math.floor(Math.random() * -48)).toISOString(),
          });
          parentArg.replyCount++;
      }
      
      generatedArgs.push(...topicArgs);
  };

  processTopicArgs('3', forStatementsByTopic['3'], againstStatementsByTopic['3']);
  processTopicArgs('5', forStatementsByTopic['5'], againstStatementsByTopic['5']);

  return generatedArgs;
};

export const mockArguments: Argument[] = generateUniqueArguments();

export const getArgumentsForTopic = (topicId: string): Argument[] => {
  return mockArguments.filter(arg => arg.topicId === topicId);
};







