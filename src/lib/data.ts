import type { Topic, Category } from './types';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

const categoryData: Omit<Category, 'subcategories'>[] = [
  { id: 'elections_governance', label: 'Elections & Governance' },
  { id: 'taxation', label: 'Taxation' },
  { id: 'budget_public_finance', label: 'Budget & Public Finance' },
  { id: 'economy_business', label: 'Economy & Business' },
  { id: 'labor_welfare', label: 'Labor & Welfare' },
  { id: 'health', label: 'Health' },
  { id: 'education_research', label: 'Education & Research' },
  { id: 'environment_energy', label: 'Environment & Energy' },
  { id: 'infrastructure_transport', label: 'Infrastructure & Transport' },
  { id: 'housing_urban', label: 'Housing & Urban Development' },
  { id: 'justice_rights_safety', label: 'Justice, Rights & Public Safety' },
  { id: 'digital_data_ai', label: 'Digital, Data & AI' },
  { id: 'immigration_integration', label: 'Immigration & Integration' },
  { id: 'defense_foreign', label: 'Defense & Foreign Affairs' },
  { id: 'agri_fisheries_rural', label: 'Agriculture, Fisheries & Rural' },
  { id: 'culture_media_sports', label: 'Culture, Media & Sports' },
];

const subCategoryData = [
    // Elections & Governance
    { id: "electoral_system", label: "Electoral System", categoryId: "elections_governance", topic: "Adopt ranked‑choice voting for national elections?" },
    { id: "direct_democracy", label: "Direct Democracy", categoryId: "elections_governance", topic: "Introduce national citizens’ initiative (50k signatures)?" },
    { id: "party_finance", label: "Party Finance", categoryId: "elections_governance", topic: "Ban private donations above NOK 100k?" },
    { id: "municipal_reform", label: "Municipal Reform", categoryId: "elections_governance", topic: "Merge municipalities with <5k residents?" },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", categoryId: "taxation", topic: "Raise wealth‑tax threshold to NOK 10m?" },
    { id: "inheritance_tax", label: "Inheritance Tax", categoryId: "taxation", topic: "Reintroduce inheritance tax above NOK 5m at 10%?" },
    { id: "corporate_tax", label: "Corporate Tax", categoryId: "taxation", topic: "Reduce corporate tax rate to 20%?" },
    { id: "vat_gst", label: "VAT", categoryId: "taxation", topic: "Lower VAT on food to 10%?" },
    { id: "carbon_tax", label: "Carbon Tax", categoryId: "taxation", topic: "Increase carbon tax to NOK 2,000/ton?" },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", categoryId: "budget_public_finance", topic: "Change structural non‑oil deficit rule to 2.5%?" },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", categoryId: "budget_public_finance", topic: "Allow Oljefondet to invest 10% in domestic infrastructure?" },
    { id: "spending_priorities", label: "Spending Priorities", categoryId: "budget_public_finance", topic: "Raise defense spending to 2.5% of GDP?" },
    { id: "debt_rule", label: "Debt Rule", categoryId: "budget_public_finance", topic: "Adopt balanced‑budget amendment?" },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", categoryId: "economy_business", topic: "Cut employer fees for firms with <20 employees?" },
    { id: "competition", label: "Competition", categoryId: "economy_business", topic: "Break up dominant grocery chains?" },
    { id: "trade_policy", label: "Trade", categoryId: "economy_business", topic: "Seek new FTA with key Asian partners?" },
    { id: "industrial", label: "Industrial Policy", categoryId: "economy_business", topic: "Subsidize a national battery gigafactory program?" },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", categoryId: "labor_welfare", topic: "Introduce a national minimum wage?" },
    { id: "unemployment", label: "Unemployment Benefits", categoryId: "labor_welfare", topic: "Extend benefits eligibility to 18 months?" },
    { id: "parental_leave", label: "Parental Leave", categoryId: "labor_welfare", topic: "Increase paid leave to 60 weeks (shared)?" },
    { id: "pensions", label: "Pensions", categoryId: "labor_welfare", topic: "Gradually raise retirement age to 69?" },
    // Health
    { id: "funding", label: "Funding", categoryId: "health", topic: "Increase hospital funding by 5% next year?" },
    { id: "private_role", label: "Private Providers", categoryId: "health", topic: "Expand private providers within public system?" },
    { id: "pharma", label: "Prescription Drugs", categoryId: "health", topic: "Cap out‑of‑pocket drug costs at NOK 5,000/year?" },
    { id: "mental_health", label: "Mental Health", categoryId: "health", topic: "Guarantee 10 free therapy sessions/year?" },
    // Education & Research
    { id: "schools", label: "Schools", categoryId: "education_research", topic: "Raise teacher salaries by 10%?" },
    { id: "higher_ed", label: "Higher Education", categoryId: "education_research", topic: "Tuition fees for non‑EU students in public universities?" },
    { id: "vocational", label: "Vocational Training", categoryId: "education_research", topic: "Add 20,000 apprenticeship seats?" },
    { id: "research", label: "R&D", categoryId: "education_research", topic: "Double national AI research funding?" },
    // Environment & Energy
    { id: "renewables", label: "Renewables", categoryId: "environment_energy", topic: "Build 5 GW offshore wind by 2030?" },
    { id: "oil_gas", label: "Oil & Gas", categoryId: "environment_energy", topic: "Halt new exploration licenses?" },
    { id: "nuclear", label: "Nuclear", categoryId: "environment_energy", topic: "Legalize small modular reactors (SMRs)?" },
    { id: "climate_targets", label: "Climate Targets", categoryId: "environment_energy", topic: "Make net‑zero by 2040 legally binding?" },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", categoryId: "infrastructure_transport", topic: "High‑speed rail Oslo–Trondheim?" },
    { id: "roads", label: "Roads/Tolls", categoryId: "infrastructure_transport", topic: "Abolish urban road tolls?" },
    { id: "public_transit", label: "Public Transit", categoryId: "infrastructure_transport", topic: "Free transit for under‑18s?" },
    { id: "broadband", label: "Broadband", categoryId: "infrastructure_transport", topic: "Universal 1 Gbps by 2028?" },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", categoryId: "housing_urban", topic: "Target 30k affordable units/year?" },
    { id: "rent", label: "Rent Regulation", categoryId: "housing_urban", topic: "Cap annual rent increases to CPI?" },
    { id: "zoning", label: "Zoning", categoryId: "housing_urban", topic: "Upzone near transit for mid‑rise housing?" },
    { id: "homelessness", label: "Homelessness", categoryId: "housing_urban", topic: "Adopt national Housing‑First program?" },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", categoryId: "justice_rights_safety", topic: "Mandate body‑worn cameras nationwide?" },
    { id: "drug_policy", label: "Drugs", categoryId: "justice_rights_safety", topic: "Decriminalize possession of small amounts?" },
    { id: "privacy", label: "Civil Liberties", categoryId: "justice_rights_safety", topic: "Ban mass facial recognition in public spaces?" },
    { id: "prison_reform", label: "Prisons", categoryId: "justice_rights_safety", topic: "Expand rehabilitation programs over incarceration?" },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", categoryId: "digital_data_ai", topic: "Require explicit opt‑in for cross‑service data sharing?" },
    { id: "cybersecurity", label: "Cybersecurity", categoryId: "digital_data_ai", topic: "Launch a national bug‑bounty program?" },
    { id: "ai_governance", label: "AI Governance", categoryId: "digital_data_ai", topic: "Adopt Algorithmic Accountability Act?" },
    { id: "digital_id", label: "Digital ID", categoryId: "digital_data_ai", topic: "Open BankID APIs for civic services integration?" },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", categoryId: "immigration_integration", topic: "Increase annual refugee quota to a higher target?" },
    { id: "work_visas", label: "Work Visas", categoryId: "immigration_integration", topic: "Fast‑track skilled worker permits?" },
    { id: "integration_policy", label: "Integration", categoryId: "immigration_integration", topic: "Mandatory Norwegian language courses for newcomers?" },
    { id: "citizenship", label: "Citizenship", categoryId: "immigration_integration", topic: "Reduce residency requirement for citizenship?" },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", categoryId: "defense_foreign", topic: "Raise defense to 2.5% of GDP and expand NATO deployments?" },
    { id: "conscription", label: "Conscription", categoryId: "defense_foreign", topic: "Extend universal conscription to 12 months?" },
    { id: "foreign_aid", label: "Foreign Aid", categoryId: "defense_foreign", topic: "Set aid budget to 1% of GNI?" },
    { id: "arctic", label: "Arctic Policy", categoryId: "defense_foreign", topic: "Increase Arctic patrols and infrastructure?" },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", categoryId: "agri_fisheries_rural", topic: "Shift subsidies toward small/medium farms?" },
    { id: "fisheries", label: "Fisheries", categoryId: "agri_fisheries_rural", topic: "Ban bottom trawling in sensitive areas?" },
    { id: "animal_welfare", label: "Animal Welfare", categoryId: "agri_fisheries_rural", topic: "Phase out fur farming?" },
    { id: "rural_services", label: "Rural Services", categoryId: "agri_fisheries_rural", topic: "Tax incentives for rural doctors and teachers?" },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", categoryId: "culture_media_sports", topic: "Increase regional arts funding by 20%?" },
    { id: "media_policy", label: "Media", categoryId: "culture_media_sports", topic: "Expand public broadcaster budget?" },
    { id: "sports", label: "Sports", categoryId: "culture_media_sports", topic: "Nationwide school sports grants program?" },
    { id: "gambling", label: "Gambling", categoryId: "culture_media_sports", topic: "Stricter limits on gambling advertising?" }
];


export const allTopics: Topic[] = subCategoryData.map((sub, index) => {
    const yesVotes = Math.floor(Math.random() * 100000);
    const noVotes = Math.floor(Math.random() * 80000);
    const totalVotes = yesVotes + noVotes;

    return {
        id: (index + 1).toString(),
        slug: generateSlug(sub.topic),
        question: sub.topic,
        description: `This is a public poll regarding ${sub.label.toLowerCase()} under the ${categoryData.find(c => c.id === sub.categoryId)?.label} category. Your anonymous vote contributes to the public sentiment on this issue.`,
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


export const categories: Category[] = categoryData.map(cat => ({
  ...cat,
  subcategories: subCategoryData
    .filter(sub => sub.categoryId === cat.id)
    .map(sub => ({ id: sub.id, label: sub.label, categoryId: sub.categoryId })),
}));
