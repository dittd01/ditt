import type { Topic, Category } from './types';
import { electionTopic } from './election-data';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    // Replace sequences of non-alphanumeric characters with a single dash
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading or trailing dashes
    .replace(/^-+|-+$/g, '');
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
    { id: "electoral_system", label: "Electoral System", categoryId: "elections-governance", topic: "Adopt ranked‑choice voting for national elections?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "direct_democracy", label: "Direct Democracy", categoryId: "elections-governance", topic: "Introduce national citizens’ initiative (50k signatures)?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "party_finance", label: "Party Finance", categoryId: "elections-governance", topic: "Ban private donations above NOK 100k?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "municipal_reform", label: "Municipal Reform", categoryId: "elections-governance", topic: "Merge municipalities with <5k residents?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", categoryId: "taxation", topic: "Raise wealth‑tax threshold to NOK 10m?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "inheritance_tax", label: "Inheritance Tax", categoryId: "taxation", topic: "Reintroduce inheritance tax above NOK 5m at 10%?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "corporate_tax", label: "Corporate Tax", categoryId: "taxation", topic: "Reduce corporate tax rate to 20%?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "vat_gst", label: "VAT", categoryId: "taxation", topic: "Lower VAT on food to 10%?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "carbon_tax", label: "Carbon Tax", categoryId: "taxation", topic: "Increase carbon tax to NOK 2,000/ton?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", categoryId: "budget-public-finance", topic: "Change structural non‑oil deficit rule to 2.5%?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", categoryId: "budget-public-finance", topic: "Allow Oljefondet to invest 10% in domestic infrastructure?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "spending_priorities", label: "Spending Priorities", categoryId: "budget-public-finance", topic: "Raise defense spending to 2.5% of GDP?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "debt_rule", label: "Debt Rule", categoryId: "budget-public-finance", topic: "Adopt balanced‑budget amendment?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", categoryId: "economy-business", topic: "Cut employer fees for firms with <20 employees?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "competition", label: "Competition", categoryId: "economy-business", topic: "Break up dominant grocery chains?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "trade_policy", label: "Trade", categoryId: "economy-business", topic: "Seek new FTA with key Asian partners?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "industrial", label: "Industrial Policy", categoryId: "economy-business", topic: "Subsidize a national battery gigafactory program?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", categoryId: "labor-welfare", topic: "Introduce a national minimum wage?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "unemployment", label: "Unemployment Benefits", categoryId: "labor-welfare", topic: "Extend benefits eligibility to 18 months?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "parental_leave", label: "Parental Leave", categoryId: "labor-welfare", topic: "Increase paid leave to 60 weeks (shared)?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "pensions", label: "Pensions", categoryId: "labor-welfare", topic: "Gradually raise retirement age to 69?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Health
    { id: "funding", label: "Funding", categoryId: "health", topic: "Increase hospital funding by 5% next year?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "private_role", label: "Private Providers", categoryId: "health", topic: "Expand private providers within public system?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "pharma", label: "Prescription Drugs", categoryId: "health", topic: "Cap out‑of‑pocket drug costs at NOK 5,000/year?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "mental_health", label: "Mental Health", categoryId: "health", topic: "Guarantee 10 free therapy sessions/year?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Education & Research
    { id: "schools", label: "Schools", categoryId: "education-research", topic: "Raise teacher salaries by 10%?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "higher_ed", label: "Higher Education", categoryId: "education-research", topic: "Tuition fees for non‑EU students in public universities?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "vocational", label: "Vocational Training", categoryId: "education-research", topic: "Add 20,000 apprenticeship seats?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "research", label: "R&D", categoryId: "education-research", topic: "Double national AI research funding?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Environment & Energy
    { id: "renewables", label: "Renewables", categoryId: "environment-energy", topic: "Build 5 GW offshore wind by 2030?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "oil_gas", label: "Oil & Gas", categoryId: "environment-energy", topic: "Halt new exploration licenses?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "nuclear", label: "Nuclear", categoryId: "environment-energy", topic: "Legalize small modular reactors (SMRs)?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "climate_targets", label: "Climate Targets", categoryId: "environment-energy", topic: "Make net‑zero by 2040 legally binding?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", categoryId: "infrastructure-transport", topic: "High‑speed rail Oslo–Trondheim?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "roads", label: "Roads/Tolls", categoryId: "infrastructure-transport", topic: "Abolish urban road tolls?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "public_transit", label: "Public Transit", categoryId: "infrastructure-transport", topic: "Free transit for under‑18s?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "broadband", label: "Broadband", categoryId: "infrastructure-transport", topic: "Universal 1 Gbps by 2028?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", categoryId: "housing-urban-development", topic: "Target 30k affordable units/year?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "rent", label: "Rent Regulation", categoryId: "housing-urban-development", topic: "Cap annual rent increases to CPI?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "zoning", label: "Zoning", categoryId: "housing-urban-development", topic: "Upzone near transit for mid‑rise housing?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "homelessness", label: "Homelessness", categoryId: "housing-urban-development", topic: "Adopt national Housing‑First program?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", categoryId: "justice-rights-public-safety", topic: "Mandate body‑worn cameras nationwide?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "drug_policy", label: "Drugs", categoryId: "justice-rights-public-safety", topic: "Decriminalize possession of small amounts?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "privacy", label: "Civil Liberties", categoryId: "justice-rights-public-safety", topic: "Ban mass facial recognition in public spaces?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "prison_reform", label: "Prisons", categoryId: "justice-rights-public-safety", topic: "Expand rehabilitation programs over incarceration?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", categoryId: "digital-data-ai", topic: "Require explicit opt‑in for cross‑service data sharing?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "cybersecurity", label: "Cybersecurity", categoryId: "digital-data-ai", topic: "Launch a national bug‑bounty program?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "ai_governance", label: "AI Governance", categoryId: "digital-data-ai", topic: "Adopt Algorithmic Accountability Act?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "digital_id", label: "Digital ID", categoryId: "digital-data-ai", topic: "Open BankID APIs for civic services integration?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", categoryId: "immigration-integration", topic: "Increase annual refugee quota to a higher target?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "work_visas", label: "Work Visas", categoryId: "immigration-integration", topic: "Fast‑track skilled worker permits?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "integration_policy", label: "Integration", categoryId: "immigration-integration", topic: "Mandatory Norwegian language courses for newcomers?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "citizenship", label: "Citizenship", categoryId: "immigration-integration", topic: "Reduce residency requirement for citizenship?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", categoryId: "defense-foreign-affairs", topic: "Raise defense to 2.5% of GDP and expand NATO deployments?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "conscription", label: "Conscription", categoryId: "defense-foreign-affairs", topic: "Extend universal conscription to 12 months?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "foreign_aid", label: "Foreign Aid", categoryId: "defense-foreign-affairs", topic: "Set aid budget to 1% of GNI?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "arctic", label: "Arctic Policy", categoryId: "defense-foreign-affairs", topic: "Increase Arctic patrols and infrastructure?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", categoryId: "agriculture-fisheries-rural", topic: "Shift subsidies toward small/medium farms?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "fisheries", label: "Fisheries", categoryId: "agriculture-fisheries-rural", topic: "Ban bottom trawling in sensitive areas?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "animal_welfare", label: "Animal Welfare", categoryId: "agriculture-fisheries-rural", topic: "Phase out fur farming?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "rural_services", label: "Rural Services", categoryId: "agriculture-fisheries-rural", topic: "Tax incentives for rural doctors and teachers?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", categoryId: "culture-media-sports", topic: "Increase regional arts funding by 20%?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "media_policy", label: "Media", categoryId: "culture-media-sports", topic: "Expand public broadcaster budget?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "sports", label: "Sports", categoryId: "culture-media-sports", topic: "Nationwide school sports grants program?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' },
    { id: "gambling", label: "Gambling", categoryId: "culture-media-sports", topic: "Stricter limits on gambling advertising?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'voting ballot' }
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
        imageUrl: sub.imageUrl,
        aiHint: sub.aiHint,
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
