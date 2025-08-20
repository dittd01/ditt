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
    { id: "direct_democracy", label: "Direct Democracy", categoryId: "elections-governance", topic: "Introduce national citizens’ initiative (50k signatures)?", imageUrl: 'https://images.unsplash.com/photo-1517524206127-48bbd363f59ce?q=80&w=1740&auto=format&fit=crop', aiHint: 'crowd protest' },
    { id: "party_finance", label: "Party Finance", categoryId: "elections-governance", topic: "Ban private donations above NOK 100k?", imageUrl: 'https://images.unsplash.com/photo-1581090393663-89a7a3b93479?q=80&w=1740&auto=format&fit=crop', aiHint: 'money cash' },
    { id: "municipal_reform", label: "Municipal Reform", categoryId: "elections-governance", topic: "Merge municipalities with <5k residents?", imageUrl: 'https://images.unsplash.com/photo-1534204990089-b6b5d95erc13?q=80&w=1740&auto=format&fit=crop', aiHint: 'norway map' },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", categoryId: "taxation", topic: "Raise wealth‑tax threshold to NOK 10m?", imageUrl: 'https://images.unsplash.com/photo-1604594849382-6397c1404107?q=80&w=1740&auto=format&fit=crop', aiHint: 'luxury yacht' },
    { id: "inheritance_tax", label: "Inheritance Tax", categoryId: "taxation", topic: "Reintroduce inheritance tax above NOK 5m at 10%?", imageUrl: 'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?q=80&w=1740&auto=format&fit=crop', aiHint: 'family generations' },
    { id: "corporate_tax", label: "Corporate Tax", categoryId: "taxation", topic: "Reduce corporate tax rate to 20%?", imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1740&auto=format&fit=crop', aiHint: 'business meeting' },
    { id: "vat_gst", label: "VAT", categoryId: "taxation", topic: "Lower VAT on food to 10%?", imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1740&auto=format&fit=crop', aiHint: 'grocery shopping' },
    { id: "carbon_tax", label: "Carbon Tax", categoryId: "taxation", topic: "Increase carbon tax to NOK 2,000/ton?", imageUrl: 'https://images.unsplash.com/photo-1521206488944-641f0217e52d?q=80&w=1740&auto=format&fit=crop', aiHint: 'factory smoke' },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", categoryId: "budget-public-finance", topic: "Change structural non‑oil deficit rule to 2.5%?", imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1740&auto=format&fit=crop', aiHint: 'government building' },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", categoryId: "budget-public-finance", topic: "Allow Oljefondet to invest 10% in domestic infrastructure?", imageUrl: 'https://images.unsplash.com/photo-1665686306574-1ace09918530?q=80&w=1740&auto=format&fit=crop', aiHint: 'investment chart' },
    { id: "spending_priorities", label: "Spending Priorities", categoryId: "budget-public-finance", topic: "Raise defense spending to 2.5% of GDP?", imageUrl: 'https://images.unsplash.com/photo-1561638845-35656111574a?q=80&w=1740&auto=format&fit=crop', aiHint: 'military soldiers' },
    { id: "debt_rule", label: "Debt Rule", categoryId: "budget-public-finance", topic: "Adopt balanced‑budget amendment?", imageUrl: 'https://images.unsplash.com/photo-1554474059-873f33c847a9?q=80&w=1740&auto=format&fit=crop', aiHint: 'scales justice' },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", categoryId: "economy-business", topic: "Cut employer fees for firms with <20 employees?", imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1740&auto=format&fit=crop', aiHint: 'small business' },
    { id: "competition", label: "Competition", categoryId: "economy-business", topic: "Break up dominant grocery chains?", imageUrl: 'https://images.unsplash.com/photo-1584680226833-0d680d0a0f67?q=80&w=1740&auto=format&fit=crop', aiHint: 'supermarket aisle' },
    { id: "trade_policy", label: "Trade", categoryId: "economy-business", topic: "Seek new FTA with key Asian partners?", imageUrl: 'https://images.unsplash.com/photo-1611789710328-543b59c77649?q=80&w=1740&auto=format&fit=crop', aiHint: 'container ship' },
    { id: "industrial", label: "Industrial Policy", categoryId: "economy-business", topic: "Subsidize a national battery gigafactory program?", imageUrl: 'https://images.unsplash.com/photo-1633681926036-13611a144f6f?q=80&w=1740&auto=format&fit=crop', aiHint: 'modern factory' },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", categoryId: "labor-welfare", topic: "Introduce a national minimum wage?", imageUrl: 'https://images.unsplash.com/photo-1502462021-3a521d234d3f?q=80&w=1740&auto=format&fit=crop', aiHint: 'worker portrait' },
    { id: "unemployment", label: "Unemployment Benefits", categoryId: "labor-welfare", topic: "Extend benefits eligibility to 18 months?", imageUrl: 'https://images.unsplash.com/photo-1611799292352-050f2f3f4f7d?q=80&w=1740&auto=format&fit=crop', aiHint: 'sad person' },
    { id: "parental_leave", label: "Parental Leave", categoryId: "labor-welfare", topic: "Increase paid leave to 60 weeks (shared)?", imageUrl: 'https://images.unsplash.com/photo-1476900236353-33e1e4b8596a?q=80&w=1740&auto=format&fit=crop', aiHint: 'newborn baby' },
    { id: "pensions", label: "Pensions", categoryId: "labor-welfare", topic: "Gradually raise retirement age to 69?", imageUrl: 'https://images.unsplash.com/photo-1615474636780-9a4054a7ac33?q=80&w=1740&auto=format&fit=crop', aiHint: 'elderly couple' },
    // Health
    { id: "funding", label: "Funding", categoryId: "health", topic: "Increase hospital funding by 5% next year?", imageUrl: 'https://images.unsplash.com/photo-1580281658223-9b93f18ae9ae?q=80&w=1740&auto=format&fit=crop', aiHint: 'hospital exterior' },
    { id: "private_role", label: "Private Providers", categoryId: "health", topic: "Expand private providers within public system?", imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1740&auto=format&fit=crop', aiHint: 'doctor office' },
    { id: "pharma", label: "Prescription Drugs", categoryId: "health", topic: "Cap out‑of‑pocket drug costs at NOK 5,000/year?", imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29209?q=80&w=1740&auto=format&fit=crop', aiHint: 'pills medicine' },
    { id: "mental_health", label: "Mental Health", categoryId: "health", topic: "Guarantee 10 free therapy sessions/year?", imageUrl: 'https://images.unsplash.com/photo-1549490109-19597b810d4e?q=80&w=1740&auto=format&fit=crop', aiHint: 'therapy session' },
    // Education & Research
    { id: "schools", label: "Schools", categoryId: "education-research", topic: "Raise teacher salaries by 10%?", imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1740&auto=format&fit=crop', aiHint: 'classroom students' },
    { id: "higher_ed", label: "Higher Education", categoryId: "education-research", topic: "Tuition fees for non‑EU students in public universities?", imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1740&auto=format&fit=crop', aiHint: 'university campus' },
    { id: "vocational", label: "Vocational Training", categoryId: "education-research", topic: "Add 20,000 apprenticeship seats?", imageUrl: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=1740&auto=format&fit=crop', aiHint: 'welder working' },
    { id: "research", label: "R&D", categoryId: "education-research", topic: "Double national AI research funding?", imageUrl: 'https://images.unsplash.com/photo-1518152006812-edab29b0a9ac?q=80&w=1740&auto=format&fit=crop', aiHint: 'science laboratory' },
    // Environment & Energy
    { id: "renewables", label: "Renewables", categoryId: "environment-energy", topic: "Build 5 GW offshore wind by 2030?", imageUrl: 'https://images.unsplash.com/photo-1594796695624-955956a312a0?q=80&w=1740&auto=format&fit=crop', aiHint: 'wind turbines' },
    { id: "oil_gas", label: "Oil & Gas", categoryId: "environment-energy", topic: "Halt new exploration licenses?", imageUrl: 'https://images.unsplash.com/photo-1563811771708-71ee81736633?q=80&w=1740&auto=format&fit=crop', aiHint: 'oil rig' },
    { id: "nuclear", label: "Nuclear", categoryId: "environment-energy", topic: "Legalize small modular reactors (SMRs)?", imageUrl: 'https://images.unsplash.com/photo-1629809549346-7c9c09ee65a2?q=80&w=1740&auto=format&fit=crop', aiHint: 'nuclear power' },
    { id: "climate_targets", label: "Climate Targets", categoryId: "environment-energy", topic: "Make net‑zero by 2040 legally binding?", imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1740&auto=format&fit=crop', aiHint: 'earth space' },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", categoryId: "infrastructure-transport", topic: "High‑speed rail Oslo–Trondheim?", imageUrl: 'https://images.unsplash.com/photo-1555633461-9e8e2b7de325?q=80&w=1740&auto=format&fit=crop', aiHint: 'highspeed train' },
    { id: "roads", label: "Roads/Tolls", categoryId: "infrastructure-transport", topic: "Abolish urban road tolls?", imageUrl: 'https://images.unsplash.com/photo-1574828136894-3d024419253e?q=80&w=1740&auto=format&fit=crop', aiHint: 'car traffic' },
    { id: "public_transit", label: "Public Transit", categoryId: "infrastructure-transport", topic: "Free transit for under‑18s?", imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1738&auto=format&fit=crop', aiHint: 'city bus' },
    { id: "broadband", label: "Broadband", categoryId: "infrastructure-transport", topic: "Universal 1 Gbps by 2028?", imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1740&auto=format&fit=crop', aiHint: 'fiber optics' },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", categoryId: "housing-urban-development", topic: "Target 30k affordable units/year?", imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1740&auto=format&fit=crop', aiHint: 'apartment building' },
    { id: "rent", label: "Rent Regulation", categoryId: "housing-urban-development", topic: "Cap annual rent increases to CPI?", imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1740&auto=format&fit=crop', aiHint: 'house keys' },
    { id: "zoning", label: "Zoning", categoryId: "housing-urban-development", topic: "Upzone near transit for mid‑rise housing?", imageUrl: 'https://images.unsplash.com/photo-1545423379-374a88f7b7f2?q=80&w=1740&auto=format&fit=crop', aiHint: 'city skyline' },
    { id: "homelessness", label: "Homelessness", categoryId: "housing-urban-development", topic: "Adopt national Housing‑First program?", imageUrl: 'https://images.unsplash.com/photo-1542861607-1e8a97016254?q=80&w=1740&auto=format&fit=crop', aiHint: 'homeless person' },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", categoryId: "justice-rights-public-safety", topic: "Mandate body‑worn cameras nationwide?", imageUrl: 'https://images.unsplash.com/photo-1629822434335-7c9c09ee65a2?q=80&w=1740&auto=format&fit=crop', aiHint: 'police officer' },
    { id: "drug_policy", label: "Drugs", categoryId: "justice-rights-public-safety", topic: "Decriminalize possession of small amounts?", imageUrl: 'https://images.unsplash.com/photo-1599981509868-3d8d64243644?q=80&w=1740&auto=format&fit=crop', aiHint: 'cannabis leaf' },
    { id: "privacy", label: "Civil Liberties", categoryId: "justice-rights-public-safety", topic: "Ban mass facial recognition in public spaces?", imageUrl: 'https://images.unsplash.com/photo-1558502844-3c9454432493?q=80&w=1740&auto=format&fit=crop', aiHint: 'CCTV camera' },
    { id: "prison_reform", label: "Prisons", categoryId: "justice-rights-public-safety", topic: "Expand rehabilitation programs over incarceration?", imageUrl: 'https://images.unsplash.com/photo-1596225337223-349c83695240?q=80&w=1740&auto=format&fit=crop', aiHint: 'prison cell' },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", categoryId: "digital-data-ai", topic: "Require explicit opt‑in for cross‑service data sharing?", imageUrl: 'https://images.unsplash.com/photo-1550751827-4138d0e3e68e?q=80&w=1740&auto=format&fit=crop', aiHint: 'server room' },
    { id: "cybersecurity", label: "Cybersecurity", categoryId: "digital-data-ai", topic: "Launch a national bug‑bounty program?", imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1740&auto=format&fit=crop', aiHint: 'hacker code' },
    { id: "ai_governance", label: "AI Governance", categoryId: "digital-data-ai", topic: "Adopt Algorithmic Accountability Act?", imageUrl: 'https://images.unsplash.com/photo-1527430253228-e93688616381?q=80&w=1740&auto=format&fit=crop', aiHint: 'robot human' },
    { id: "digital_id", label: "Digital ID", categoryId: "digital-data-ai", topic: "Open BankID APIs for civic services integration?", imageUrl: 'https://images.unsplash.com/photo-1584433144853-6d3c42a8a5b2?q=80&w=1740&auto=format&fit=crop', aiHint: 'fingerprint scan' },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", categoryId: "immigration-integration", topic: "Increase annual refugee quota to a higher target?", imageUrl: 'https://images.unsplash.com/photo-1457521893359-1143a60963be?q=80&w=1740&auto=format&fit=crop', aiHint: 'refugee camp' },
    { id: "work_visas", label: "Work Visas", categoryId: "immigration-integration", topic: "Fast‑track skilled worker permits?", imageUrl: 'https://images.unsplash.com/photo-1556761175-57738b5985de?q=80&w=1740&auto=format&fit=crop', aiHint: 'passport stamp' },
    { id: "integration_policy", label: "Integration", categoryId: "immigration-integration", topic: "Mandatory Norwegian language courses for newcomers?", imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1740&auto=format&fit=crop', aiHint: 'language class' },
    { id: "citizenship", label: "Citizenship", categoryId: "immigration-integration", topic: "Reduce residency requirement for citizenship?", imageUrl: 'https://images.unsplash.com/photo-1534433603764-21c6139c894c?q=80&w=1740&auto=format&fit=crop', aiHint: 'norwegian passport' },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", categoryId: "defense-foreign-affairs", topic: "Raise defense to 2.5% of GDP and expand NATO deployments?", imageUrl: 'https://images.unsplash.com/photo-1587612844837-533b66627065?q=80&w=1740&auto=format&fit=crop', aiHint: 'military jet' },
    { id: "conscription", label: "Conscription", categoryId: "defense-foreign-affairs", topic: "Extend universal conscription to 12 months?", imageUrl: 'https://images.unsplash.com/photo-1555427183-047a436c6a43?q=80&w=1740&auto=format&fit=crop', aiHint: 'soldiers marching' },
    { id: "foreign_aid", label: "Foreign Aid", categoryId: "defense-foreign-affairs", topic: "Set aid budget to 1% of GNI?", imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1740&auto=format&fit=crop', aiHint: 'aid worker' },
    { id: "arctic", label: "Arctic Policy", categoryId: "defense-foreign-affairs", topic: "Increase Arctic patrols and infrastructure?", imageUrl: 'https://images.unsplash.com/photo-1620120966883-9d0440375b2a?q=80&w=1740&auto=format&fit=crop', aiHint: 'icebreaker ship' },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", categoryId: "agriculture-fisheries-rural", topic: "Shift subsidies toward small/medium farms?", imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1740&auto=format&fit=crop', aiHint: 'tractor field' },
    { id: "fisheries", label: "Fisheries", categoryId: "agriculture-fisheries-rural", topic: "Ban bottom trawling in sensitive areas?", imageUrl: 'https://images.unsplash.com/photo-1541558585641-768c5b364a69?q=80&w=1740&auto=format&fit=crop', aiHint: 'fishing boat' },
    { id: "animal_welfare", label: "Animal Welfare", categoryId: "agriculture-fisheries-rural", topic: "Phase out fur farming?", imageUrl: 'https://images.unsplash.com/photo-1516934024016-1488c5f66b44?q=80&w=1740&auto=format&fit=crop', aiHint: 'fox animal' },
    { id: "rural_services", label: "Rural Services", categoryId: "agriculture-fisheries-rural", topic: "Tax incentives for rural doctors and teachers?", imageUrl: 'https://images.unsplash.com/photo-1528654262493-27b173f43503?q=80&w=1740&auto=format&fit=crop', aiHint: 'rural village' },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", categoryId: "culture-media-sports", topic: "Increase regional arts funding by 20%?", imageUrl: 'https://images.unsplash.com/photo-1531548489311-872f22918e7b?q=80&w=1740&auto=format&fit=crop', aiHint: 'art gallery' },
    { id: "media_policy", label: "Media", categoryId: "culture-media-sports", topic: "Expand public broadcaster budget?", imageUrl: 'https://images.unsplash.com/photo-1574717024683-11c5651624a9?q=80&w=1740&auto=format&fit=crop', aiHint: 'television camera' },
    { id: "sports", label: "Sports", categoryId: "culture-media-sports", topic: "Nationwide school sports grants program?", imageUrl: 'https://images.unsplash.com/photo-1579952516518-6c212a87a24d?q=80&w=1740&auto=format&fit=crop', aiHint: 'children playing' },
    { id: "gambling", label: "Gambling", categoryId: "culture-media-sports", topic: "Stricter limits on gambling advertising?", imageUrl: 'https://images.unsplash.com/photo-1541250004419-3388a383b401?q=80&w=1740&auto=format&fit=crop', aiHint: 'playing cards' }
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
