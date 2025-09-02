

import type { Topic, Category, VoteHistory, Argument } from './types';
import { electionTopic as initialElectionTopic, parties as partyDetails } from './election-data';
import type { LucideIcon } from 'lucide-react';
import { subDays, subHours, subMonths, subWeeks, subYears, format } from 'date-fns';
import { currentUser } from '@/lib/user-data';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    // Replace sequences of non-alphanumeric characters with a single dash
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading or trailing dashes
    .replace(/^-+|-+$/g, '');
}

const categoryData: { label: string, label_nb: string; icon: string }[] = [
  { label: 'Elections & Governance', label_nb: 'Valg og styresett', icon: 'Landmark' },
  { label: 'Taxation', label_nb: 'Skatt', icon: 'Scale' },
  { label: 'Budget & Public Finance', label_nb: 'Budsjett og offentlige finanser', icon: 'Banknote' },
  { label: 'Economy & Business', label_nb: 'Økonomi og næringsliv', icon: 'Building2' },
  { label: 'Labor & Welfare', label_nb: 'Arbeid og velferd', icon: 'UserCheck' },
  { label: 'Health', label_nb: 'Helse', icon: 'Stethoscope' },
  { label: 'Education & Research', label_nb: 'Utdanning og forskning', icon: 'School' },
  { label: 'Environment & Energy', label_nb: 'Miljø og energi', icon: 'Leaf' },
  { label: 'Infrastructure & Transport', label_nb: 'Infrastruktur og transport', icon: 'Train' },
  { label: 'Housing & Urban Development', label_nb: 'Bolig og byutvikling', icon: 'Home' },
  { label: 'Justice, Rights & Public Safety', label_nb: 'Justis, rettigheter og samfunnssikkerhet', icon: 'Gavel' },
  { label: 'Digital, Data & AI', label_nb: 'Digitalisering, data og KI', icon: 'BrainCircuit' },
  { label: 'Immigration & Integration', label_nb: 'Innvandring og integrering', icon: 'Users' },
  { label: 'Defense & Foreign Affairs', label_nb: 'Forsvar og utenrikssaker', icon: 'Shield' },
  { label: 'Agriculture, Fisheries & Rural', label_nb: 'Landbruk, fiskeri og distrikter', icon: 'Tractor' },
  { label: 'Culture, Media & Sports', label_nb: 'Kultur, media og idrett', icon: 'Film' },
];

const categoryDataWithIds = categoryData.map(cat => ({
    ...cat,
    id: generateSlug(cat.label),
}));


const subCategoryData = [
    // Elections & Governance
    { id: "electoral_system", label: "Electoral System", label_nb: "Valgsystem", categoryId: "elections-governance", topic: "Innføre rangert stemming ved nasjonale valg?", topic_en: "Introduce ranked-choice voting in national elections?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'voting ballot', voteType: 'ranked' },
    { id: "direct_democracy", label: "Direct Democracy", label_nb: "Direkte demokrati", categoryId: "elections-governance", topic: "Innføre nasjonalt innbyggerinitiativ (50k signaturer)?", topic_en: "Introduce a national citizens' initiative (50k signatures)?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'people meeting', voteType: 'yesno' },
    { id: "party_finance", label: "Party Finance", label_nb: "Partifinansiering", categoryId: "elections-governance", topic: "Forby private donasjoner over 100k NOK?", topic_en: "Ban private donations over 100k NOK?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'money cash', voteType: 'yesno' },
    { id: "municipal_reform", label: "Municipal Reform", label_nb: "Kommunereform", categoryId: "elections-governance", topic: "Slå sammen kommuner med <5k innbyggere?", topic_en: "Merge municipalities with <5k inhabitants?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'norway map', voteType: 'yesno' },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", label_nb: "Formuesskatt", categoryId: "taxation", topic: "Heve terskelen for formuesskatt til 10m NOK?", topic_en: "Raise the threshold for wealth tax to 10M NOK?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'luxury yacht', voteType: 'likert' },
    { id: "inheritance_tax", label: "Inheritance Tax", label_nb: "Arveavgift", categoryId: "taxation", topic: "Gjeninnføre arveavgift over 5m NOK på 10%?", topic_en: "Reintroduce inheritance tax over 5M NOK at 10%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'family hands', voteType: 'yesno' },
    { id: "corporate_tax", label: "Corporate Tax", label_nb: "Selskapsskatt", categoryId: "taxation", topic: "Redusere selskapsskatten til 20%?", topic_en: "Reduce corporate tax to 20%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'office building', voteType: 'yesno' },
    { id: "vat_gst", label: "VAT", label_nb: "MVA", categoryId: "taxation", topic: "Senke matmomsen til 10%?", topic_en: "Lower the VAT on food to 10%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'supermarket groceries', voteType: 'yesno' },
    { id: "carbon_tax", label: "Carbon Tax", label_nb: "Karbonavgift", categoryId: "taxation", topic: "Øke karbonavgiften til 2000 NOK/tonn?", topic_en: "Increase the carbon tax to 2000 NOK/tonne?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'factory smoke', voteType: 'quadratic' },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", label_nb: "Handlingsregelen", categoryId: "budget-public-finance", topic: "Endre handlingsregelen til 2.5%?", topic_en: "Change the fiscal rule (Handlingsregelen) to 2.5%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'norway flag', voteType: 'yesno' },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", label_nb: "Oljefondet", categoryId: "budget-public-finance", topic: "La Oljefondet investere 10% i norsk infrastruktur?", topic_en: "Allow the Oil Fund to invest 10% in Norwegian infrastructure?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'stock chart', voteType: 'yesno' },
    { id: "spending_priorities", label: "Spending Priorities", label_nb: "Budsjettprioriteringer", categoryId: "budget-public-finance", topic: "Øke forsvarsbudsjettet til 2.5% av BNP?", topic_en: "Increase the defense budget to 2.5% of GDP?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fighter jet', voteType: 'yesno' },
    { id: "debt_rule", label: "Debt Rule", label_nb: "Gjeldsregel", categoryId: "budget-public-finance", topic: "Innføre krav om balansert budsjett?", topic_en: "Introduce a balanced budget requirement?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'piggy bank', voteType: 'yesno' },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", label_nb: "Små og mellomstore bedrifter", categoryId: "economy-business", topic: "Kutte arbeidsgiveravgift for bedrifter med <20 ansatte?", topic_en: "Cut payroll tax for companies with <20 employees?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'small business', voteType: 'yesno' },
    { id: "competition", label: "Competition", label_nb: "Konkurranse", categoryId: "economy-business", topic: "Bryte opp dominerende dagligvarekjeder?", topic_en: "Break up dominant grocery chains?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'grocery aisle', voteType: 'yesno' },
    { id: "trade_policy", label: "Trade", label_nb: "Handel", categoryId: "economy-business", topic: "Søke nye frihandelsavtaler med asiatiske partnere?", topic_en: "Seek new free trade agreements with Asian partners?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'shipping containers', voteType: 'yesno' },
    { id: "industrial", label: "Industrial Policy", label_nb: "Industripolitikk", categoryId: "economy-business", topic: "Subsidere et nasjonalt program for batterifabrikker?", topic_en: "Subsidize a national program for battery factories?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'battery factory', voteType: 'yesno' },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", label_nb: "Minelønn", categoryId: "labor-welfare", topic: "Innføre nasjonal minstelønn?", topic_en: "Introduce a national minimum wage?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'diverse workers', voteType: 'yesno' },
    { id: "unemployment", label: "Unemployment Benefits", label_nb: "Dagpenger", categoryId: "labor-welfare", topic: "Utvide dagpengeperioden til 18 måneder?", topic_en: "Extend the unemployment benefit period to 18 months?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'helping hands', voteType: 'yesno' },
    { id: "parental_leave", label: "Parental Leave", label_nb: "Foreldrepermisjon", categoryId: "labor-welfare", topic: "Øke betalt permisjon til 60 uker (delt)?", topic_en: "Increase paid parental leave to 60 weeks (shared)?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'parent baby', voteType: 'yesno' },
    { id: "pensions", label: "Pensions", label_nb: "Pensjon", categoryId: "labor-welfare", topic: "Gradvis heve pensjonsalderen til 69 år?", topic_en: "Gradually raise the retirement age to 69?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'older couple', voteType: 'yesno' },
    // Health
    { id: "funding", label: "Funding", label_nb: "Finansiering", categoryId: "health", topic: "Øke sykehusbevilgningene med 5% neste år?", topic_en: "Increase hospital funding by 5% next year?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'hospital corridor', voteType: 'yesno' },
    { id: "private_role", label: "Private Providers", label_nb: "Private aktører", categoryId: "health", topic: "Utvide bruken av private aktører i offentlig helsevesen?", topic_en: "Expand the use of private providers in the public healthcare system?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'doctor patient', voteType: 'yesno' },
    { id: "pharma", label: "Prescription Drugs", label_nb: "Reseptbelagte legemidler", categoryId: "health", topic: "Sette et tak på egenandeler for medisiner på 5000 NOK/år?", topic_en: "Set a cap on co-payments for medicines at 5000 NOK/year?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'pills medication', voteType: 'yesno' },
    { id: "mental_health", label: "Mental Health", label_nb: "Psykisk helse", categoryId: "health", topic: "Garantere 10 gratis psykologtimer per år?", topic_en: "Guarantee 10 free psychologist sessions per year?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'calm person', voteType: 'yesno' },
    // Education & Research
    { id: "schools", label: "Schools", label_nb: "Skole", categoryId: "education-research", topic: "Heve lærernes lønn med 10%?", topic_en: "Raise teacher salaries by 10%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'students classroom', voteType: 'yesno' },
    { id: "higher_ed", label: "Higher Education", label_nb: "Høyere utdanning", categoryId: "education-research", topic: "Innføre skolepenger for studenter utenfor EU?", topic_en: "Introduce tuition fees for non-EU students?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'university campus', voteType: 'yesno' },
    { id: "vocational", label: "Vocational Training", label_nb: "Yrkesfag", categoryId: "education-research", topic: "Opprette 20 000 nye lærlingplasser?", topic_en: "Create 20,000 new apprenticeships?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'workshop training', voteType: 'yesno' },
    { id: "research", label: "R&D", label_nb: "Forskning og utvikling", categoryId: "education-research", topic: "Doble den nasjonale satsingen på KI-forskning?", topic_en: "Double the national investment in AI research?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'science laboratory', voteType: 'yesno' },
    // Environment & Energy
    { id: "renewables", label: "Renewables", label_nb: "Fornybar energi", categoryId: "environment-energy", topic: "Bygge 5 GW havvind innen 2030?", topic_en: "Build 5 GW of offshore wind by 2030?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'wind turbines', voteType: 'yesno' },
    { id: "oil_gas", label: "Oil & Gas", label_nb: "Olje og gass", categoryId: "environment-energy", topic: "Stanse tildeling av nye letelisenser?", topic_en: "Stop awarding new oil and gas exploration licenses?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'oil rig', voteType: 'yesno' },
    { id: "nuclear", label: "Nuclear", label_nb: "Kjernekraft", categoryId: "environment-energy", topic: "Tillate små modulære reaktorer (SMR)?", topic_en: "Allow small modular reactors (SMRs)?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'nuclear power', voteType: 'yesno' },
    { id: "climate_targets", label: "Climate Targets", label_nb: "Klimamål", categoryId: "environment-energy", topic: "Lovfeste netto-nullutslipp innen 2040?", topic_en: "Legislate net-zero emissions by 2040?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'earth globe', voteType: 'yesno' },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", label_nb: "Jernbane", categoryId: "infrastructure-transport", topic: "Bygge høyhastighetstog mellom Oslo og Trondheim?", topic_en: "Build a high-speed train between Oslo and Trondheim?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'high-speed train', voteType: 'yesno' },
    { id: "roads", label: "Roads/Tolls", label_nb: "Vei/Bompenger", categoryId: "infrastructure-transport", topic: "Fjerne bompenger i byene?", topic_en: "Remove road tolls in cities?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'traffic highway', voteType: 'yesno' },
    { id: "public_transit", label: "Public Transit", label_nb: "Kollektivtransport", categoryId: "infrastructure-transport", topic: "Innføre gratis kollektivtransport for personer under 18 år?", topic_en: "Introduce free public transport for people under 18?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'city bus', voteType: 'yesno' },
    { id: "broadband", label: "Broadband", label_nb: "Bredbånd", categoryId: "infrastructure-transport", topic: "Sikre universell tilgang til 1 Gbps-internett innen 2028?", topic_en: "Ensure universal access to 1 Gbps internet by 2028?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fiber optics', voteType: 'yesno' },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", label_nb: "Boligbygging", categoryId: "housing-urban-development", topic: "Sette et mål om 30 000 nye boliger med overkommelig pris per år?", topic_en: "Set a goal of 30,000 new affordable homes per year?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'modern houses', voteType: 'yesno' },
    { id: "rent", label: "Rent Regulation", label_nb: "Leieregulering", categoryId: "housing-urban-development", topic: "Begrense årlig leieøkning til konsumprisindeksen (KPI)?", topic_en: "Limit annual rent increases to the consumer price index (CPI)?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'apartment building', voteType: 'yesno' },
    { id: "zoning", label: "Zoning", label_nb: "Reguleringsplaner", categoryId: "housing-urban-development", topic: "Tillate høyere utnyttelse for boligbygging nær kollektivknutepunkter?", topic_en: "Allow higher density housing development near public transport hubs?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'city street', voteType: 'yesno' },
    { id: "homelessness", label: "Homelessness", label_nb: "Bostedsløshet", categoryId: "housing-urban-development", topic: "Innføre et nasjonalt 'Housing First'-program?", topic_en: "Introduce a national 'Housing First' program?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'homeless person', voteType: 'yesno' },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", label_nb: "Politi", categoryId: "justice-rights-public-safety", topic: "Innføre obligatorisk bruk av kroppskamera for politiet nasjonalt?", topic_en: "Introduce mandatory use of body cameras for police nationally?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'police officer', voteType: 'yesno' },
    { id: "drug_policy", label: "Drugs", label_nb: "Ruspolitikk", categoryId: "justice-rights-public-safety", topic: "Avkriminalisere besittelse av små mengder narkotika?", topic_en: "Decriminalize possession of small amounts of drugs?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'cannabis leaf', voteType: 'yesno' },
    { id: "privacy", label: "Civil Liberties", label_nb: "Personvern", categoryId: "justice-rights-public-safety", topic: "Forby bruk av masseansiktsgjenkjenning i offentlige rom?", topic_en: "Ban the use of mass facial recognition in public spaces?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'cctv camera', voteType: 'yesno' },
    { id: "prison_reform", label: "Prisons", label_nb: "Kriminalomsorg", categoryId: "justice-rights-public-safety", topic: "Utvide rehabiliteringsprogrammer fremfor å øke soningskapasiteten?", topic_en: "Expand rehabilitation programs rather than increasing prison capacity?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'prison cell', voteType: 'yesno' },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", label_nb: "Datavern", categoryId: "digital-data-ai", topic: "Kreve eksplisitt samtykke for datadeling mellom tjenester?", topic_en: "Require explicit consent for data sharing between services?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'code screen', voteType: 'yesno' },
    { id: "cybersecurity", label: "Cybersecurity", label_nb: "Cybersikkerhet", categoryId: "digital-data-ai", topic: "Lansere et nasjonalt 'bug bounty'-program?", topic_en: "Launch a national 'bug bounty' program?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'hacker code', voteType: 'yesno' },
    { id: "ai_governance", label: "AI Governance", label_nb: "Styring av KI", categoryId: "digital-data-ai", topic: "Vedta en lov om algoritmisk ansvarlighet?", topic_en: "Adopt an algorithmic accountability act?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'robot hand', voteType: 'yesno' },
    { id: "digital_id", label: "Digital ID", label_nb: "Digital ID", categoryId: "digital-data-ai", topic: "Åpne BankID-APIer for integrasjon med offentlige tjenester?", topic_en: "Open BankID APIs for integration with public services?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fingerprint scan', voteType: 'yesno' },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", label_nb: "Asyl", categoryId: "immigration-integration", topic: "Øke den årlige flyktningkvoten?", topic_en: "Increase the annual refugee quota?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'people waiting', voteType: 'yesno' },
    { id: "work_visas", label: "Work Visas", label_nb: "Arbeidsinnvandring", categoryId: "immigration-integration", topic: "Innføre hurtigspor for faglærte arbeidsinnvandrere?", topic_en: "Introduce a fast track for skilled immigrant workers?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'passport stamp', voteType: 'yesno' },
    { id: "integration_policy", label: "Integration", label_nb: "Integrering", categoryId: "immigration-integration", topic: "Innføre obligatoriske norskkurs for nyankomne?", topic_en: "Introduce mandatory Norwegian courses for newcomers?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'language class', voteType: 'yesno' },
    { id: "citizenship", label: "Citizenship", label_nb: "Statsborgerskap", categoryId: "immigration-integration", topic: "Redusere botidskravet for statsborgerskap?", topic_en: "Reduce the residency requirement for citizenship?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'norwegian passport', voteType: 'yesno' },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", label_nb: "NATO/Allianser", categoryId: "defense-foreign-affairs", topic: "Øke forsvarsbudsjettet til 2,5% av BNP og utvide NATO-deployeringer?", topic_en: "Increase defense budget to 2.5% of GDP and expand NATO deployments?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'nato flag', voteType: 'yesno' },
    { id: "conscription", label: "Conscription", label_nb: "Verneplikt", categoryId: "defense-foreign-affairs", topic: "Utvide den allmenne verneplikten til 12 måneder?", topic_en: "Extend general conscription to 12 months?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'soldiers marching', voteType: 'yesno' },
    { id: "foreign_aid", label: "Foreign Aid", label_nb: "Bistand", categoryId: "defense-foreign-affairs", topic: "Sette bistandsbudsjettet til 1% av BNI?", topic_en: "Set the foreign aid budget to 1% of GNI?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'aid worker', voteType: 'yesno' },
    { id: "arctic", label: "Arctic Policy", label_nb: "Arktisk politikk", categoryId: "defense-foreign-affairs", topic: "Øke patruljering og infrastruktur i Arktis?", topic_en: "Increase patrols and infrastructure in the Arctic?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'icebreaker ship', voteType: 'yesno' },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", label_nb: "Landbruksstøtte", categoryId: "agriculture-fisheries-rural", topic: "Vri subsidier mot små og mellomstore gårdsbruk?", topic_en: "Shift subsidies towards small and medium-sized farms?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'farmer field', voteType: 'yesno' },
    { id: "fisheries", label: "Fisheries", label_nb: "Fiskeri", categoryId: "agriculture-fisheries-rural", topic: "Forby bunntråling i sårbare områder?", topic_en: "Ban bottom trawling in vulnerable areas?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fishing boat', voteType: 'yesno' },
    { id: "animal_welfare", label: "Animal Welfare", label_nb: "Dyrevelferd", categoryId: "agriculture-fisheries-rural", topic: "Avvikle pelsdyroppdrett?", topic_en: "Phase out fur farming?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fox animal', voteType: 'yesno' },
    { id: "rural_services", label: "Rural Services", label_nb: "Distriktstjenester", categoryId: "agriculture-fisheries-rural", topic: "Innføre skatteinsentiver for leger og lærere i distriktene?", topic_en: "Introduce tax incentives for doctors and teachers in rural districts?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'rural landscape', voteType: 'yesno' },
    { id: "foreign_fishing", label: "Fisheries", label_nb: "Utenlandsk fiske", categoryId: "agriculture-fisheries-rural", topic: "Forby utenlandske fiskebåter i norske farvann?", topic_en: "Ban foreign fishing boats in Norwegian waters?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fishing trawler', voteType: 'yesno' },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", label_nb: "Kulturfinansiering", categoryId: "culture-media-sports", topic: "Øke regional kunststøtte med 20%?", topic_en: "Increase regional arts funding by 20%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'music concert', voteType: 'yesno' },
    { id: "media_policy", label: "Media", label_nb: "Mediepolitikk", categoryId: "culture-media-sports", topic: "Utvide budsjettet til allmennkringkasteren?", topic_en: "Expand the public broadcaster's budget?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'retro tv', voteType: 'yesno' },
    { id: "sports", label: "Sports", label_nb: "Idrett", categoryId: "culture-media-sports", topic: "Innføre et nasjonalt stipendprogram for skoleidrett?", topic_en: "Introduce a national scholarship program for school sports?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'soccer ball', voteType: 'yesno' },
    { id: "gambling", label: "Gambling", label_nb: "Pengespill", categoryId: "culture-media-sports", topic: "Innføre strengere grenser for pengespillreklame?", topic_en: "Introduce stricter limits on gambling advertising?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'poker chips', voteType: 'yesno' }
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
        { id: 'abstain', label: 'Abstain', color: 'hsl(var(--muted))' }
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

export const mockUserNames = [
    'Anne Olsen', 'Per Hansen', 'Ingrid Johansen', 'Lars Nilsen', 'Kari Berg', 'Ole Larsen',
    'Sigrid Andersen', 'Torbjorn Kristiansen', 'Marit Dahl', 'Hans Pettersen', 'Solveig Jensen',
    'Knut Lien', 'Astrid Moen', 'Jan Eriksen', 'Berit Andreassen', 'Arne Solberg'
];

const electoralReformTopic: Topic = {
    id: 'electoral-reform-topic',
    slug: 'should-norway-abolish-the-national-4-election-threshold',
    question: "Bør Norge avskaffe den nasjonale sperregrensen på 4 % ved stortingsvalg?",
    question_en: "Should Norway abolish the 4% national electoral threshold (sperregrense) for Storting elections?",
    description: "Norge bruker forholdstallsvalg med partilister ved stortingsvalg. En nasjonal sperregrense på 4 % avgjør om partier får tilgang til utjevningsmandater, som skal gjøre forholdet mellom stemmer og mandater mer proporsjonalt. Å avskaffe sperregrensen vil endre hvilke partier som kan få slike mandater og kan påvirke regjeringsdannelsen.",
    description_en: "Norway’s parliamentary elections use proportional representation with party lists. A national 4% electoral threshold determines whether parties are eligible for leveling seats (utjevningsmandater), which help align seat shares with national vote shares. Abolishing the threshold would change which parties can gain representation via these seats and could affect government formation.",
    background_md: "Stortingsvalget i Norge er et forholdstallsvalg basert på partilister, innført for å omsette stemmer til mandater mer proporsjonalt enn enmannskretser. Utjevningsmandater brukes for å redusere skjevheter mellom stemmeandel og mandatsammensetning på tvers av valgdistrikter. Tilgang til disse mandatene forutsetter i dag en nasjonal sperregrense på 4 %, en regel som skal balansere hensynet til representativitet mot styringsdyktighet. Spørsmålet om sperregrensen behandles jevnlig i gjennomganger av valgloven og henger sammen med andre temaer som distriktsinndeling, mandatfordeling og i hvilken grad velgerne bør kunne påvirke personvalg på listene. Kommunestyre- og fylkestingsvalg har ordninger for personstemmer, mens stortingsvalget i hovedsak er partibasert. Å avskaffe sperregrensen vil ikke fjerne distriktsmandatene, men endrer kriteriene for utjevningsmandater og dermed partienes strategier og velgernes insentiver. Eventuelle reformer må veie gevinster i representativitet opp mot risiko for fragmentering og mer krevende regjeringsdannelser.",
    pros: [
        "Øker proporsjonaliteten ved å gi små partier bedre mulighet til representasjon, slik at velgerpreferanser speiles mer presist.",
        "Reduserer insentiver til taktisk stemming rundt sperregrensen og lar velgere stemme på partiet de faktisk foretrekker.",
        "Fremmer idé-mangfold og konkurranse i Stortinget, som kan øke responsen på nye eller smale samfunnstemaer."
    ],
    cons: [
        "Kan gi flere partier i Stortinget og dermed mer fragmentering, som kan gjøre koalisjonsarbeid og styring vanskeligere.",
        "Kan gi uforholdsmessig innflytelse til svært små eller enkeltsakspartier, noe som kan komplisere langsiktig budsjett- og reformarbeid.",
        "Kan svekke tydelig ansvarliggjøring dersom regjeringer blir avhengige av mange små partier for å få vedtak gjennom."
    ],
    sources: [
        { "title": "Regjeringen – NOU 2020: 6 Ny valglov", "url": "https://www.regjeringen.no/no/dokumenter/nou-2020-6/id2703131/" },
        { "title": "Regjeringen – Ot.prp. nr. 45 (2001–2002) Om lov om valg til Stortinget, fylkesting og kommunestyrer", "url": "https://www.regjeringen.no/no/dokumenter/otprp-nr-45-2001-2002-/id167521/" },
        { "title": "SSB – Stortingsvalg (statistikk og bakgrunn)", "url": "https://www.ssb.no/valg/stortingsvalg" }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541870729283-11ee07844a4b?q=80&w=600&auto=format&fit=crop',
    aiHint: 'parliament building',
    options: topicOptions['yesno'],
    votes: { yes: 12345, no: 8765, abstain: 1200 },
    totalVotes: 22310,
    votesLastWeek: 1500,
    votesLastMonth: 6000,
    votesLastYear: 22310,
    history: generateVoteHistory(topicOptions['yesno'], 365),
    categoryId: 'elections-governance',
    subcategoryId: 'electoral_reform',
    status: 'live',
    voteType: 'yesno',
    averageImportance: 3.8,
    author: currentUser.displayName,
};


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

    const author = index % 3 === 0 ? currentUser.displayName : mockUserNames[index % mockUserNames.length];


    return {
        id: (index + 1).toString(),
        slug: generateSlug(sub.topic_en),
        question: sub.topic,
        question_en: sub.topic_en,
        description: `Dette er en offentlig avstemning om ${sub.label_nb.toLowerCase()} under kategorien ${categoryDataWithIds.find(c => c.id === sub.categoryId)?.label_nb}. Din anonyme stemme bidrar til den offentlige opinionen i denne saken.`,
        description_en: `This is a public poll regarding ${sub.label.toLowerCase()} under the ${categoryDataWithIds.find(c => c.id === sub.categoryId)?.label} category. Your anonymous vote contributes to the public sentiment on this issue.`,
        background_md: "This topic has been a subject of public debate for several years, with significant attention from major political parties and media outlets. Recent polling data shows a divided public opinion.",
        pros: ["Boosts economic growth by encouraging investment.", "Simplifies the tax code for individuals and businesses.", "Aligns Norway with international tax norms."],
        cons: ["Increases wealth inequality.", "Reduces public revenue for essential services.", "May not significantly impact investment decisions."],
        sources: [
            { title: "Official Government Report on the matter", url: "https://www.regjeringen.no/" },
            { title: "Statistics Norway - Related Data", url: "https://www.ssb.no/" }
        ],
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
        averageImportance: Math.random() * 4,
        author: author,
    }
});

const electionTopic: Topic = {
    ...initialElectionTopic,
    averageImportance: 4, // Max importance
    votesLastWeek: initialElectionTopic.totalVotes - (initialElectionTopic.history.find(h => h.date === subWeeks(new Date(), 1).toISOString())?.total || 0),
    votesLastMonth: initialElectionTopic.totalVotes - (initialElectionTopic.history.find(h => h.date === subMonths(new Date(), 1).toISOString())?.total || 0),
    votesLastYear: initialElectionTopic.totalVotes,
    author: 'System',
}

subCategoryData.unshift({
    id: "electoral_reform",
    label: "Electoral Reform",
    label_nb: "Valgreform",
    categoryId: "elections-governance",
    topic: electoralReformTopic.question,
    topic_en: electoralReformTopic.question_en,
    imageUrl: electoralReformTopic.imageUrl,
    aiHint: electoralReformTopic.aiHint,
    voteType: electoralReformTopic.voteType,
});

export const allTopics: Topic[] = [electionTopic, electoralReformTopic, ...standardTopics];


export const categories: Category[] = [
    { id: 'election_2025', label: 'Election 2025', label_nb: 'Stortingsvalg 2025', icon: 'Landmark', subcategories: [] },
    ...categoryDataWithIds.map(cat => ({
        ...cat,
        subcategories: subCategoryData
            .filter(sub => sub.categoryId === cat.id)
            .map(sub => ({ id: sub.id, label: sub.label, label_nb: sub.label_nb, categoryId: sub.categoryId })),
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

// --- New Data Fetching Function for Server Components ---
/**
 * Fetches a single topic by its slug.
 * In a real application, this would query a database.
 * For this prototype, it searches the in-memory `allTopics` array.
 * NOTE: This function is intended for server-side use and does not access localStorage.
 * @param slug The URL slug of the topic to find.
 * @returns The Topic object or undefined if not found.
 */
export function getTopicBySlug(slug: string): Topic | undefined {
    // This is a simplified lookup. A real app might use a more efficient data structure
    // or a database with an index on the slug.
    return allTopics.find(topic => topic.slug === slug);
}


// MOCK DATA GENERATION
const norwegianNames = [
  'Anne Olsen', 'Per Hansen', 'Ingrid Johansen', 'Lars Nilsen', 'Kari Berg', 'Ole Larsen',
  'Sigrid Andersen', 'Torbjorn Kristiansen', 'Marit Dahl', 'Hans Pettersen', 'Solveig Jensen',
  'Knut Lien', 'Astrid Moen', 'Jan Eriksen', 'Berit Andreassen', 'Arne Solberg'
];

const forStatementsByTopic: Record<string, string[]> = {
    '3': [ // Ban private donations
        "Banning large donations reduces the risk of 'cash for access' and political corruption.", "It levels the playing field, so that political influence isn't tied to wealth.", "This encourages parties to seek broader support from many small donors instead of a few large ones.", "Large, undisclosed donations create public distrust in the political system.", "A ban prevents wealthy special interests from dominating political discourse.", "It helps maintain the principle of 'one person, one vote' by limiting financial influence.", "This would force parties to be more transparent about their funding sources.", "Capping donations can lead to more grassroots engagement and volunteering.", "It reduces the pressure on politicians to cater to the demands of their biggest donors.", "This policy would help to restore faith in democracy and political integrity.", "It limits the ability of foreign entities or individuals to influence domestic politics.", "A cap makes politics more accessible for candidates who don't have wealthy networks.", "It's a simple, effective measure to curb the power of money in politics.", "This would shift focus from fundraising to policy and public debate.", "Other democracies have similar caps, and it works to improve fairness."
    ],
    '5': [ // Raise wealth tax threshold
        "Raising the threshold protects family businesses and farms from being taxed on essential equipment and assets.", "A higher threshold encourages entrepreneurs to reinvest their capital in Norway instead of moving it abroad.", "The current wealth tax is effectively a double tax on already-taxed income; this change mitigates that unfairness.", "It simplifies the tax system for thousands of people with illiquid assets like property or shares in small companies.", "This adjustment is necessary to keep Norwegian capital competitive with other European countries that have lower or no wealth tax.", "By reducing the tax burden on working capital, we stimulate job creation and economic growth.", "The state's revenue loss is minimal compared to the economic benefit of retaining investment capital within the country.", "This is a modernization of the tax code, recognizing that most 'wealth' for small business owners is not liquid cash.", "It prevents the forced sale of assets or businesses simply to pay an annual tax bill, ensuring stability.", "A higher threshold allows more individuals to build a financial buffer, increasing overall economic resilience.", "The tax disproportionately affects retirees whose property values have increased but whose incomes have not.", "Focusing wealth tax on the truly super-rich makes the system more efficient and targeted.", "This change would reduce the administrative burden on both taxpayers and the tax authority.", "Less tax on capital means more money available for innovation and new technology development.", "It's a matter of principle: people should not be taxed year after year on assets they have already paid tax on."
    ],
    '21': [ // Gradually raise the retirement age to 69?
        "With increasing life expectancy, raising the retirement age is a necessary step to ensure the pension system remains solvent for future generations.",
        "A higher retirement age keeps experienced, valuable workers in the workforce longer, boosting national productivity and GDP.",
        "It aligns Norway with trends in other developed countries that are also adjusting their retirement ages upwards.",
        "This gradual change gives people decades to plan and adjust their financial futures accordingly.",
        "Keeping people in work longer contributes more tax revenue, which can be used to fund healthcare and other public services for an aging population.",
        "Many people are healthier and more able to work past 67; this allows them to continue contributing and earning.",
        "A higher retirement age provides a stronger incentive for businesses to invest in retraining and upskilling older employees.",
        "It reduces the dependency ratio (the number of non-workers to workers), which is crucial for long-term economic stability.",
        "This is a more responsible solution than cutting pension benefits or significantly increasing taxes on the current workforce.",
        "It encourages a culture of lifelong learning and adaptation, which is essential in a modern economy.",
        "The change is gradual, which mitigates the impact on those closest to retirement age.",
        "A robust pension system is a cornerstone of our welfare state; this adjustment is a pragmatic way to protect it.",
        "It provides more flexibility for individuals who may want to work longer for personal or financial reasons.",
        "This addresses the demographic challenge head-on, rather than passing the problem onto our children and grandchildren.",
        "A later retirement age can lead to better health outcomes, as work provides social engagement and a sense of purpose."
    ]
};

const againstStatementsByTopic: Record<string, string[]> = {
    '3': [ // Ban private donations
        "Banning donations is a restriction on free speech and the right to support a cause.", "Parties need significant funding to run campaigns and communicate with voters effectively.", "A cap could drive donations underground to less transparent 'dark money' groups.", "Wealthy individuals should be free to support the political causes they believe in.", "This could lead to parties becoming more dependent on state funding, reducing their independence.", "It's not the government's role to decide how much an individual can support a political party.", "A ban might not solve the problem, as influence can be wielded in other ways (e.g., media ownership).", "This penalizes parties that rely on a few large donors but have legitimate public support.", "Defining what constitutes a 'donation' can be complex and lead to legal loopholes.", "It could inadvertently give more power to unions or other organizations that can mobilize members.", "Transparency reports on donations are a better solution than an outright ban.", "A cap could weaken political parties and make them less effective.", "This is an overreach of state power into the voluntary association of citizens.", "If donations are public, voters can decide for themselves if a politician is 'bought'.", "It could lead to a system where only the independently wealthy can afford to run for office."
    ],
    '5': [ // Raise wealth tax threshold
        "This is a significant tax cut for the wealthiest, increasing the gap between rich and poor.", "It would reduce public revenue by billions, forcing cuts to schools, healthcare, and infrastructure.", "The current threshold is already high enough to protect average citizens; this only benefits the top 1%.", "Wealth concentration is a major social problem, and this change would make it worse.", "The wealth tax is a vital tool for redistribution and ensuring the richest contribute their fair share.", "Claims that capital will flee are exaggerated; Norway remains an attractive place to invest regardless.", "This argument ignores the fact that wealth generates returns; a small tax on large fortunes is reasonable.", "It sends the wrong signal at a time when many are struggling with the cost of living.", "Public services, which benefit everyone, are a better use of this money than giving a tax break to the rich.", "The 'working capital' argument is a red herring; exemptions for business assets already exist.", "This change would further entrench generational wealth and reduce social mobility.", "A strong wealth tax ensures that untaxed capital gains on assets like property contribute to society.", "It undermines the progressive nature of the Norwegian tax system.", "The majority of the population, who would not benefit from this change, would have to bear the cost through reduced services.", "This is a step backward in our collective effort to build a more egalitarian society."
    ],
    '21': [ // Gradually raise the retirement age to 69?
        "This unfairly penalizes people in physically demanding jobs who may not be able to work until 69.",
        "Life expectancy gains are not evenly distributed; this change disproportionately affects those with lower incomes and poorer health.",
        "It breaks the social contract with citizens who have paid into the pension system for decades with a certain retirement age in mind.",
        "A higher retirement age can lead to increased unemployment among older workers, who may find it harder to get rehired if they lose their job.",
        "This could block career progression for younger generations, as older workers remain in senior positions for longer.",
        "It ignores the value of unpaid work, such as childcare for grandchildren, that many retirees provide.",
        "This is a blanket solution that doesn't account for the vast differences in career paths and physical ability.",
        "Productivity can decline in some professions after a certain age, making this economically inefficient.",
        "It could lead to an increase in people on long-term disability benefits as they are unable to work but not yet eligible for a pension.",
        "The government should look at other ways to fund the pension system, such as closing tax loopholes or increasing taxes on wealth and corporations.",
        "This reduces the amount of quality time people get to enjoy in retirement after a lifetime of work.",
        "The 'healthy aging' argument doesn't apply to everyone; many people are worn out by their late 60s.",
        "It could create a two-tiered system where the wealthy can afford to retire early, while the less well-off are forced to work longer.",
        "This policy fails to address the root causes of the pension funding issue, such as wage stagnation.",
        "It's a simple but brutal solution that places the burden of demographic change squarely on the shoulders of individual workers."
    ]
};

let allMockArguments: Argument[] = [];

const createArgsForTopic = (topicId: string, forStatements: string[], againstStatements: string[]) => {
    const users = Array.from({ length: 100 }, (_, i) => {
        const name = norwegianNames[i % norwegianNames.length];
        const suffix = Math.floor(10 + Math.random() * 90);
        return {
            id: `user_${topicId}_${i + 1}`,
            username: `${name.toLowerCase()}${suffix}`,
            role: i < 30 ? 'arguer' : 'voter',
            avatarUrl: `https://placehold.co/40x40.png`,
        };
    });

    const arguers = users.filter(u => u.role === 'arguer');
    const voters = users.filter(u => u.role === 'voter');
    const forArguers = arguers.slice(0, 15);
    const againstArguers = arguers.slice(15, 30);
    
    let argIdCounter = (allMockArguments.length + 1) * 100;

    forStatements.forEach((statement, i) => {
        const arguer = forArguers[i % forArguers.length];
        allMockArguments.push({
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
        allMockArguments.push({
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

    const topicArguments = allMockArguments.filter(arg => arg.topicId === topicId);

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
                 createdAt: subHours(new Date(parent.createdAt), Math.floor(Math.random() * -48)).toISOString(),
            };
            
            parent.replyCount++;
            allMockArguments.push(reply);
        }
    };
    addReplies(20);
};

// Clear existing arguments before regenerating to avoid duplicates on hot-reload
allMockArguments = [];
createArgsForTopic('3', forStatementsByTopic['3'] || [], againstStatementsByTopic['3'] || []);
createArgsForTopic('5', forStatementsByTopic['5'] || [], againstStatementsByTopic['5'] || []);
createArgsForTopic('21', forStatementsByTopic['21'] || [], againstStatementsByTopic['21'] || []);

export const mockArguments: Argument[] = allMockArguments;

export const getArgumentsForTopic = (topicId: string): Argument[] => {
  // This function now correctly filters the comprehensive, globally generated mock argument list.
  return allMockArguments.filter(arg => arg.topicId === topicId);
};
