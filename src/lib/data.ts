import type { Topic, Category } from './types';
import { electionTopic } from './election-data';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

const categoryData: Omit<Category, 'subcategories' | 'id'>[] = [
  { label: 'Elections & Governance' },
  { label: 'Taxation' },
  { label: 'Budget & Public Finance' },
  { label: 'Economy & Business' },
  { label: 'Labor & Welfare' },
  { label: 'Health' },
  { label: 'Education & Research' },
  { label: 'Environment & Energy' },
  { label: 'Infrastructure & Transport' },
  { label: 'Housing & Urban Development' },
  { label: 'Justice, Rights & Public Safety' },
  { label: 'Digital, Data & AI' },
  { label: 'Immigration & Integration' },
  { label: 'Defense & Foreign Affairs' },
  { label: 'Agriculture, Fisheries & Rural' },
  { label: 'Culture, Media & Sports' },
];

const categoryDataWithIds = categoryData.map(cat => ({
    ...cat,
    id: generateSlug(cat.label),
}));


const subCategoryData = [
    // Elections & Governance
    { id: "electoral_system", label: "Electoral System", categoryId: "elections-governance", topic: "Adopt ranked‑choice voting for national elections?" },
    { id: "direct_democracy", label: "Direct Democracy", categoryId: "elections-governance", topic: "Introduce national citizens’ initiative (50k signatures)?" },
    { id: "party_finance", label: "Party Finance", categoryId: "elections-governance", topic: "Ban private donations above NOK 100k?" },
    { id: "municipal_reform", label: "Municipal Reform", categoryId: "elections-governance", topic: "Merge municipalities with <5k residents?" },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", categoryId: "taxation", topic: "Raise wealth‑tax threshold to NOK 10m?" },
    { id: "inheritance_tax", label: "Inheritance Tax", categoryId: "taxation", topic: "Reintroduce inheritance tax above NOK 5m at 10%?" },
    { id: "corporate_tax", label: "Corporate Tax", categoryId: "taxation", topic: "Reduce corporate tax rate to 20%?" },
    { id: "vat_gst", label: "VAT", categoryId: "taxation", topic: "Lower VAT on food to 10%?" },
    { id: "carbon_tax", label: "Carbon Tax", categoryId: "taxation", topic: "Increase carbon tax to NOK 2,000/ton?" },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", categoryId: "budget-public-finance", topic: "Change structural non‑oil deficit rule to 2.5%?" },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", categoryId: "budget-public-finance", topic: "Allow Oljefondet to invest 10% in domestic infrastructure?" },
    { id: "spending_priorities", label: "Spending Priorities", categoryId: "budget-public-finance", topic: "Raise defense spending to 2.5% of GDP?" },
    { id: "debt_rule", label: "Debt Rule", categoryId: "budget-public-finance", topic: "Adopt balanced‑budget amendment?" },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", categoryId: "economy-business", topic: "Cut employer fees for firms with <20 employees?" },
    { id: "competition", label: "Competition", categoryId: "economy-business", topic: "Break up dominant grocery chains?" },
    { id: "trade_policy", label: "Trade", categoryId: "economy-business", topic: "Seek new FTA with key Asian partners?" },
    { id: "industrial", label: "Industrial Policy", categoryId: "economy-business", topic: "Subsidize a national battery gigafactory program?" },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", categoryId: "labor-welfare", topic: "Introduce a national minimum wage?" },
    { id: "unemployment", label: "Unemployment Benefits", categoryId: "labor-welfare", topic: "Extend benefits eligibility to 18 months?" },
    { id: "parental_leave", label: "Parental Leave", categoryId: "labor-welfare", topic: "Increase paid leave to 60 weeks (shared)?" },
    { id: "pensions", label: "Pensions", categoryId: "labor-welfare", topic: "Gradually raise retirement age to 69?" },
    // Health
    { id: "funding", label: "Funding", categoryId: "health", topic: "Increase hospital funding by 5% next year?" },
    { id: "private_role", label: "Private Providers", categoryId: "health", topic: "Expand private providers within public system?" },
    { id: "pharma", label: "Prescription Drugs", categoryId: "health", topic: "Cap out‑of‑pocket drug costs at NOK 5,000/year?" },
    { id: "mental_health", label: "Mental Health", categoryId: "health", topic: "Guarantee 10 free therapy sessions/year?" },
    // Education & Research
    { id: "schools", label: "Schools", categoryId: "education-research", topic: "Raise teacher salaries by 10%?" },
    { id: "higher_ed", label: "Higher Education", categoryId: "education-research", topic: "Tuition fees for non‑EU students in public universities?" },
    { id: "vocational", label: "Vocational Training", categoryId: "education-research", topic: "Add 20,000 apprenticeship seats?" },
    { id: "research", label: "R&D", categoryId: "education-research", topic: "Double national AI research funding?" },
    // Environment & Energy
    { id: "renewables", label: "Renewables", categoryId: "environment-energy", topic: "Build 5 GW offshore wind by 2030?" },
    { id: "oil_gas", label: "Oil & Gas", categoryId: "environment-energy", topic: "Halt new exploration licenses?" },
    { id: "nuclear", label: "Nuclear", categoryId: "environment-energy", topic: "Legalize small modular reactors (SMRs)?" },
    { id: "climate_targets", label: "Climate Targets", categoryId: "environment-energy", topic: "Make net‑zero by 2040 legally binding?" },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", categoryId: "infrastructure-transport", topic: "High‑speed rail Oslo–Trondheim?" },
    { id: "roads", label: "Roads/Tolls", categoryId: "infrastructure-transport", topic: "Abolish urban road tolls?" },
    { id: "public_transit", label: "Public Transit", categoryId: "infrastructure-transport", topic: "Free transit for under‑18s?" },
    { id: "broadband", label: "Broadband", categoryId: "infrastructure-transport", topic: "Universal 1 Gbps by 2028?" },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", categoryId: "housing-urban-development", topic: "Target 30k affordable units/year?" },
    { id: "rent", label: "Rent Regulation", categoryId: "housing-urban-development", topic: "Cap annual rent increases to CPI?" },
    { id: "zoning", label: "Zoning", categoryId: "housing-urban-development", topic: "Upzone near transit for mid‑rise housing?" },
    { id: "homelessness", label: "Homelessness", categoryId: "housing-urban-development", topic: "Adopt national Housing‑First program?" },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", categoryId: "justice-rights-public-safety", topic: "Mandate body‑worn cameras nationwide?" },
    { id: "drug_policy", label: "Drugs", categoryId: "justice-rights-public-safety", topic: "Decriminalize possession of small amounts?" },
    { id: "privacy", label: "Civil Liberties", categoryId: "justice-rights-public-safety", topic: "Ban mass facial recognition in public spaces?" },
    { id: "prison_reform", label: "Prisons", categoryId: "justice-rights-public-safety", topic: "Expand rehabilitation programs over incarceration?" },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", categoryId: "digital-data-ai", topic: "Require explicit opt‑in for cross‑service data sharing?" },
    { id: "cybersecurity", label: "Cybersecurity", categoryId: "digital-data-ai", topic: "Launch a national bug‑bounty program?" },
    { id: "ai_governance", label: "AI Governance", categoryId: "digital-data-ai", topic: "Adopt Algorithmic Accountability Act?" },
    { id: "digital_id", label: "Digital ID", categoryId: "digital-data-ai", topic: "Open BankID APIs for civic services integration?" },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", categoryId: "immigration-integration", topic: "Increase annual refugee quota to a higher target?" },
    { id: "work_visas", label: "Work Visas", categoryId: "immigration-integration", topic: "Fast‑track skilled worker permits?" },
    { id: "integration_policy", label: "Integration", categoryId: "immigration-integration", topic: "Mandatory Norwegian language courses for newcomers?" },
    { id: "citizenship", label: "Citizenship", categoryId: "immigration-integration", topic: "Reduce residency requirement for citizenship?" },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", categoryId: "defense-foreign-affairs", topic: "Raise defense to 2.5% of GDP and expand NATO deployments?" },
    { id: "conscription", label: "Conscription", categoryId: "defense-foreign-affairs", topic: "Extend universal conscription to 12 months?" },
    { id: "foreign_aid", label: "Foreign Aid", categoryId: "defense-foreign-affairs", topic: "Set aid budget to 1% of GNI?" },
    { id: "arctic", label: "Arctic Policy", categoryId: "defense-foreign-affairs", topic: "Increase Arctic patrols and infrastructure?" },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", categoryId: "agriculture-fisheries-rural", topic: "Shift subsidies toward small/medium farms?" },
    { id: "fisheries", label: "Fisheries", categoryId: "agriculture-fisheries-rural", topic: "Ban bottom trawling in sensitive areas?" },
    { id: "animal_welfare", label: "Animal Welfare", categoryId: "agriculture-fisheries-rural", topic: "Phase out fur farming?" },
    { id: "rural_services", label: "Rural Services", categoryId: "agriculture-fisheries-rural", topic: "Tax incentives for rural doctors and teachers?" },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", categoryId: "culture-media-sports", topic: "Increase regional arts funding by 20%?" },
    { id: "media_policy", label: "Media", categoryId: "culture-media-sports", topic: "Expand public broadcaster budget?" },
    { id: "sports", label: "Sports", categoryId: "culture-media-sports", topic: "Nationwide school sports grants program?" },
    { id: "gambling", label: "Gambling", categoryId: "culture-media-sports", topic: "Stricter limits on gambling advertising?" }
];


const standardTopics: Topic[] = subCategoryData.map((sub, index) => {
    const yesVotes = Math.floor(Math.random() * 100000);
    const noVotes = Math.floor(Math.random() * 80000);
    const totalVotes = yesVotes + noVotes;

    return {
        id: (index + 1).toString(),
        slug: generateSlug(sub.topic),
        question: sub.topic,
        description: `This is a public poll regarding ${sub.label.toLowerCase()} under the ${categoryDataWithIds.find(c => c.id === sub.categoryId)?.label} category. Your anonymous vote contributes to the public sentiment on this issue.`,
        imageUrl: 'https://placehold.co/600x400.png',
        options: [
            { id: 'yes', label: 'Yes', color: 'hsl(var(--chart-2))' },
            { id: 'no', label: 'No', color: 'hsl(var(--chart-1))' },
        ],
        votes: { yes: yesVotes, no: noVotes },
        totalVotes: totalVotes,
        history: [
            { date: '1W Ago', yes: Math.floor(yesVotes * 0.8), no: Math.floor(noVotes * 0.7) },
            { date: '4D Ago', yes: Math.floor(yesVotes * 0.9), no: Math.floor(noVotes * 0.85) },
            { date: 'Today', yes: yesVotes, no: noVotes },
        ],
        categoryId: sub.categoryId,
        subcategoryId: sub.id,
        status: 'live',
        voteType: 'yesno'
    }
});

export const allTopics: Topic[] = [electionTopic, ...standardTopics];


export const categories: Category[] = [
    { id: 'election_2025', label: 'Election 2025', subcategories: [] },
    ...categoryDataWithIds.map(cat => ({
        ...cat,
        subcategories: subCategoryData
            .filter(sub => sub.categoryId === cat.id)
            .map(sub => ({ id: sub.id, label: sub.label, categoryId: sub.categoryId })),
    }))
];
