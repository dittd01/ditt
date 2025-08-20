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
    { id: "direct_democracy", label: "Direct Democracy", categoryId: "elections-governance", topic: "Introduce national citizens’ initiative (50k signatures)?", imageUrl: 'https://images.unsplash.com/photo-1518465623628-82a44d0545b3?q=80&w=1740&auto=format&fit=crop', aiHint: 'protest crowd' },
    { id: "party_finance", label: "Party Finance", categoryId: "elections-governance", topic: "Ban private donations above NOK 100k?", imageUrl: 'https://images.unsplash.com/photo-1554224155-8d044b4a15e3?q=80&w=1740&auto=format&fit=crop', aiHint: 'money cash' },
    { id: "municipal_reform", label: "Municipal Reform", categoryId: "elections-governance", topic: "Merge municipalities with <5k residents?", imageUrl: 'https://images.unsplash.com/photo-1589993372297-554220f592d3?q=80&w=1740&auto=format&fit=crop', aiHint: 'norway map' },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", categoryId: "taxation", topic: "Raise wealth‑tax threshold to NOK 10m?", imageUrl: 'https://images.unsplash.com/photo-1604594849382-6c34b102c382?q=80&w=1740&auto=format&fit=crop', aiHint: 'luxury yacht' },
    { id: "inheritance_tax", label: "Inheritance Tax", categoryId: "taxation", topic: "Reintroduce inheritance tax above NOK 5m at 10%?", imageUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1740&auto=format&fit=crop', aiHint: 'money hands' },
    { id: "corporate_tax", label: "Corporate Tax", categoryId: "taxation", topic: "Reduce corporate tax rate to 20%?", imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1740&auto=format&fit=crop', aiHint: 'office business' },
    { id: "vat_gst", label: "VAT", categoryId: "taxation", topic: "Lower VAT on food to 10%?", imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1740&auto=format&fit=crop', aiHint: 'supermarket groceries' },
    { id: "carbon_tax", label: "Carbon Tax", categoryId: "taxation", topic: "Increase carbon tax to NOK 2,000/ton?", imageUrl: 'https://images.unsplash.com/photo-1473876637954-4b493d59fd9e?q=80&w=1740&auto=format&fit=crop', aiHint: 'factory smoke' },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", categoryId: "budget-public-finance", topic: "Change structural non‑oil deficit rule to 2.5%?", imageUrl: 'https://images.unsplash.com/photo-1665686374006-b8f04b628fde?q=80&w=1740&auto=format&fit=crop', aiHint: 'graph chart' },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", categoryId: "budget-public-finance", topic: "Allow Oljefondet to invest 10% in domestic infrastructure?", imageUrl: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?q=80&w=1740&auto=format&fit=crop', aiHint: 'money growth' },
    { id: "spending_priorities", label: "Spending Priorities", categoryId: "budget-public-finance", topic: "Raise defense spending to 2.5% of GDP?", imageUrl: 'https://images.unsplash.com/photo-1581014334335-a134a94a3b72?q=80&w=1740&auto=format&fit=crop', aiHint: 'fighter jet' },
    { id: "debt_rule", label: "Debt Rule", categoryId: "budget-public-finance", topic: "Adopt balanced‑budget amendment?", imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1740&auto=format&fit=crop', aiHint: 'piggy bank' },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", categoryId: "economy-business", topic: "Cut employer fees for firms with <20 employees?", imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1740&auto=format&fit=crop', aiHint: 'small business' },
    { id: "competition", label: "Competition", categoryId: "economy-business", topic: "Break up dominant grocery chains?", imageUrl: 'https://images.unsplash.com/photo-1584680219324-4841e3031063?q=80&w=1740&auto=format&fit=crop', aiHint: 'grocery aisle' },
    { id: "trade_policy", label: "Trade", categoryId: "economy-business", topic: "Seek new FTA with key Asian partners?", imageUrl: 'https://images.unsplash.com/photo-1577974005623-3a5c4433a571?q=80&w=1740&auto=format&fit=crop', aiHint: 'shipping containers' },
    { id: "industrial", label: "Industrial Policy", categoryId: "economy-business", topic: "Subsidize a national battery gigafactory program?", imageUrl: 'https://images.unsplash.com/photo-1632938833403-1ea15a09214d?q=80&w=1740&auto=format&fit=crop', aiHint: 'battery factory' },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", categoryId: "labor-welfare", topic: "Introduce a national minimum wage?", imageUrl: 'https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=1740&auto=format&fit=crop', aiHint: 'diverse workers' },
    { id: "unemployment", label: "Unemployment Benefits", categoryId: "labor-welfare", topic: "Extend benefits eligibility to 18 months?", imageUrl: 'https://images.unsplash.com/photo-1616441394334-5a21235defa6?q=80&w=1740&auto=format&fit=crop', aiHint: 'sad person' },
    { id: "parental_leave", label: "Parental Leave", categoryId: "labor-welfare", topic: "Increase paid leave to 60 weeks (shared)?", imageUrl: 'https://images.unsplash.com/photo-1546015329-472c5ba6e55a?q=80&w=1740&auto=format&fit=crop', aiHint: 'parent baby' },
    { id: "pensions", label: "Pensions", categoryId: "labor-welfare", topic: "Gradually raise retirement age to 69?", imageUrl: 'https://images.unsplash.com/photo-1574786662382-12298a44a709?q=80&w=1740&auto=format&fit=crop', aiHint: 'older couple' },
    // Health
    { id: "funding", label: "Funding", categoryId: "health", topic: "Increase hospital funding by 5% next year?", imageUrl: 'https://images.unsplash.com/photo-1586773860414-774423258ae1?q=80&w=1740&auto=format&fit=crop', aiHint: 'hospital corridor' },
    { id: "private_role", label: "Private Providers", categoryId: "health", topic: "Expand private providers within public system?", imageUrl: 'https://images.unsplash.com/photo-1538688423619-a83d1f4a4ab8?q=80&w=1740&auto=format&fit=crop', aiHint: 'doctor patient' },
    { id: "pharma", label: "Prescription Drugs", categoryId: "health", topic: "Cap out‑of‑pocket drug costs at NOK 5,000/year?", imageUrl: 'https://images.unsplash.com/photo-1584308666744-8480404b63ae?q=80&w=1740&auto=format&fit=crop', aiHint: 'pills medication' },
    { id: "mental_health", label: "Mental Health", categoryId: "health", topic: "Guarantee 10 free therapy sessions/year?", imageUrl: 'https://images.unsplash.com/photo-1594125674939-5735a26a2aca?q=80&w=1740&auto=format&fit=crop', aiHint: 'therapy session' },
    // Education & Research
    { id: "schools", label: "Schools", categoryId: "education-research", topic: "Raise teacher salaries by 10%?", imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1740&auto=format&fit=crop', aiHint: 'students classroom' },
    { id: "higher_ed", label: "Higher Education", categoryId: "education-research", topic: "Tuition fees for non‑EU students in public universities?", imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1740&auto=format&fit=crop', aiHint: 'university campus' },
    { id: "vocational", label: "Vocational Training", categoryId: "education-research", topic: "Add 20,000 apprenticeship seats?", imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1740&auto=format&fit=crop', aiHint: 'workshop training' },
    { id: "research", label: "R&D", categoryId: "education-research", topic: "Double national AI research funding?", imageUrl: 'https://images.unsplash.com/photo-1532187643623-dbf2f5a73b16?q=80&w=1740&auto=format&fit=crop', aiHint: 'science laboratory' },
    // Environment & Energy
    { id: "renewables", label: "Renewables", categoryId: "environment-energy", topic: "Build 5 GW offshore wind by 2030?", imageUrl: 'https://images.unsplash.com/photo-1523726481579-25f3c1cb5f30?q=80&w=1740&auto=format&fit=crop', aiHint: 'wind turbines' },
    { id: "oil_gas", label: "Oil & Gas", categoryId: "environment-energy", topic: "Halt new exploration licenses?", imageUrl: 'https://images.unsplash.com/photo-1559862361-2673d36067a4?q=80&w=1740&auto=format&fit=crop', aiHint: 'oil rig' },
    { id: "nuclear", label: "Nuclear", categoryId: "environment-energy", topic: "Legalize small modular reactors (SMRs)?", imageUrl: 'https://images.unsplash.com/photo-1594392158837-550a10c66b8c?q=80&w=1740&auto=format&fit=crop', aiHint: 'nuclear power' },
    { id: "climate_targets", label: "Climate Targets", categoryId: "environment-energy", topic: "Make net‑zero by 2040 legally binding?", imageUrl: 'https://images.unsplash.com/photo-1502920514302-d765de1e52d6?q=80&w=1740&auto=format&fit=crop', aiHint: 'earth globe' },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", categoryId: "infrastructure-transport", topic: "High‑speed rail Oslo–Trondheim?", imageUrl: 'https://images.unsplash.com/photo-1555633512-386838a5814b?q=80&w=1740&auto=format&fit=crop', aiHint: 'high-speed train' },
    { id: "roads", label: "Roads/Tolls", categoryId: "infrastructure-transport", topic: "Abolish urban road tolls?", imageUrl: 'https://images.unsplash.com/photo-1533613220921-934898d438a2?q=80&w=1740&auto=format&fit=crop', aiHint: 'traffic highway' },
    { id: "public_transit", label: "Public Transit", categoryId: "infrastructure-transport", topic: "Free transit for under‑18s?", imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1740&auto=format&fit=crop', aiHint: 'bus city' },
    { id: "broadband", label: "Broadband", categoryId: "infrastructure-transport", topic: "Universal 1 Gbps by 2028?", imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1740&auto=format&fit=crop', aiHint: 'fiber optics' },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", categoryId: "housing-urban-development", topic: "Target 30k affordable units/year?", imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1740&auto=format&fit=crop', aiHint: 'modern houses' },
    { id: "rent", label: "Rent Regulation", categoryId: "housing-urban-development", topic: "Cap annual rent increases to CPI?", imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1740&auto=format&fit=crop', aiHint: 'apartment building' },
    { id: "zoning", label: "Zoning", categoryId: "housing-urban-development", topic: "Upzone near transit for mid‑rise housing?", imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1740&auto=format&fit=crop', aiHint: 'city street' },
    { id: "homelessness", label: "Homelessness", categoryId: "housing-urban-development", topic: "Adopt national Housing‑First program?", imageUrl: 'https://images.unsplash.com/photo-1542841925-555375543e33?q=80&w=1740&auto=format&fit=crop', aiHint: 'homeless person' },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", categoryId: "justice-rights-public-safety", topic: "Mandate body‑worn cameras nationwide?", imageUrl: 'https://images.unsplash.com/photo-1570868328153-0c4a45373468?q=80&w=1740&auto=format&fit=crop', aiHint: 'police officer' },
    { id: "drug_policy", label: "Drugs", categoryId: "justice-rights-public-safety", topic: "Decriminalize possession of small amounts?", imageUrl: 'https://images.unsplash.com/photo-1590054941624-574443739853?q=80&w=1740&auto=format&fit=crop', aiHint: 'cannabis leaf' },
    { id: "privacy", label: "Civil Liberties", categoryId: "justice-rights-public-safety", topic: "Ban mass facial recognition in public spaces?", imageUrl: 'https://images.unsplash.com/photo-1550699049-6f3b4a2052f7?q=80&w=1740&auto=format&fit=crop', aiHint: 'cctv camera' },
    { id: "prison_reform", label: "Prisons", categoryId: "justice-rights-public-safety", topic: "Expand rehabilitation programs over incarceration?", imageUrl: 'https://images.unsplash.com/photo-1596701168434-71e8a8e3d16b?q=80&w=1740&auto=format&fit=crop', aiHint: 'prison cell' },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", categoryId: "digital-data-ai", topic: "Require explicit opt‑in for cross‑service data sharing?", imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1740&auto=format&fit=crop', aiHint: 'code screen' },
    { id: "cybersecurity", label: "Cybersecurity", categoryId: "digital-data-ai", topic: "Launch a national bug‑bounty program?", imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1740&auto=format&fit=crop', aiHint: 'hacker code' },
    { id: "ai_governance", label: "AI Governance", categoryId: "digital-data-ai", topic: "Adopt Algorithmic Accountability Act?", imageUrl: 'https://images.unsplash.com/photo-1531259653400-3f18b5d37ac3?q=80&w=1740&auto=format&fit=crop', aiHint: 'robot face' },
    { id: "digital_id", label: "Digital ID", categoryId: "digital-data-ai", topic: "Open BankID APIs for civic services integration?", imageUrl: 'https://images.unsplash.com/photo-1588600878108-578397d268f8?q=80&w=1740&auto=format&fit=crop', aiHint: 'fingerprint scan' },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", categoryId: "immigration-integration", topic: "Increase annual refugee quota to a higher target?", imageUrl: 'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?q=80&w=1740&auto=format&fit=crop', aiHint: 'refugee camp' },
    { id: "work_visas", label: "Work Visas", categoryId: "immigration-integration", topic: "Fast‑track skilled worker permits?", imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1740&auto=format&fit=crop', aiHint: 'passport stamp' },
    { id: "integration_policy", label: "Integration", categoryId: "immigration-integration", topic: "Mandatory Norwegian language courses for newcomers?", imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1740&auto=format&fit=crop', aiHint: 'language class' },
    { id: "citizenship", label: "Citizenship", categoryId: "immigration-integration", topic: "Reduce residency requirement for citizenship?", imageUrl: 'https://images.unsplash.com/photo-1562327383-149d88022930?q=80&w=1740&auto=format&fit=crop', aiHint: 'norwegian passport' },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", categoryId: "defense-foreign-affairs", topic: "Raise defense to 2.5% of GDP and expand NATO deployments?", imageUrl: 'https://images.unsplash.com/photo-1620905973752-54a8a3f5f30e?q=80&w=1740&auto=format&fit=crop', aiHint: 'nato flag' },
    { id: "conscription", label: "Conscription", categoryId: "defense-foreign-affairs", topic: "Extend universal conscription to 12 months?", imageUrl: 'https://images.unsplash.com/photo-1563242031-b32328615b34?q=80&w=1740&auto=format&fit=crop', aiHint: 'soldiers marching' },
    { id: "foreign_aid", label: "Foreign Aid", categoryId: "defense-foreign-affairs", topic: "Set aid budget to 1% of GNI?", imageUrl: 'https://images.unsplash.com/photo-1618220456939-2a1ed3158866?q=80&w=1740&auto=format&fit=crop', aiHint: 'aid worker' },
    { id: "arctic", label: "Arctic Policy", categoryId: "defense-foreign-affairs", topic: "Increase Arctic patrols and infrastructure?", imageUrl: 'https://images.unsplash.com/photo-1549643449-37a561c2e402?q=80&w=1740&auto=format&fit=crop', aiHint: 'icebreaker ship' },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", categoryId: "agriculture-fisheries-rural", topic: "Shift subsidies toward small/medium farms?", imageUrl: 'https://images.unsplash.com/photo-1492496913980-50133821932d?q=80&w=1740&auto=format&fit=crop', aiHint: 'farmer field' },
    { id: "fisheries", label: "Fisheries", categoryId: "agriculture-fisheries-rural", topic: "Ban bottom trawling in sensitive areas?", imageUrl: 'https://images.unsplash.com/photo-1596702952104-335e3814de13?q=80&w=1740&auto=format&fit=crop', aiHint: 'fishing boat' },
    { id: "animal_welfare", label: "Animal Welfare", categoryId: "agriculture-fisheries-rural", topic: "Phase out fur farming?", imageUrl: 'https://images.unsplash.com/photo-1587570234748-2615a6b185d9?q=80&w=1740&auto=format&fit=crop', aiHint: 'fox animal' },
    { id: "rural_services", label: "Rural Services", categoryId: "agriculture-fisheries-rural", topic: "Tax incentives for rural doctors and teachers?", imageUrl: 'https://images.unsplash.com/photo-1576765664444-159741c49d44?q=80&w=1740&auto=format&fit=crop', aiHint: 'rural landscape' },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", categoryId: "culture-media-sports", topic: "Increase regional arts funding by 20%?", imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1740&auto=format&fit=crop', aiHint: 'music concert' },
    { id: "media_policy", label: "Media", categoryId: "culture-media-sports", topic: "Expand public broadcaster budget?", imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1740&auto=format&fit=crop', aiHint: 'retro tv' },
    { id: "sports", label: "Sports", categoryId: "culture-media-sports", topic: "Nationwide school sports grants program?", imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1740&auto=format&fit=crop', aiHint: 'soccer ball' },
    { id: "gambling", label: "Gambling", categoryId: "culture-media-sports", topic: "Stricter limits on gambling advertising?", imageUrl: 'https://images.unsplash.com/photo-1541345023926-53d043634d4a?q=80&w=1740&auto=format&fit=crop', aiHint: 'poker chips' }
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
