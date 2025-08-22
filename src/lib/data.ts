

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
    { id: "electoral_system", label: "Electoral System", label_nb: "Valgsystem", categoryId: "elections-governance", topic: "Innføre rangert stemming ved nasjonale valg?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'voting ballot', voteType: 'ranked' },
    { id: "direct_democracy", label: "Direct Democracy", label_nb: "Direkte demokrati", categoryId: "elections-governance", topic: "Innføre nasjonalt innbyggerinitiativ (50k signaturer)?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'people meeting', voteType: 'yesno' },
    { id: "party_finance", label: "Party Finance", label_nb: "Partifinansiering", categoryId: "elections-governance", topic: "Forby private donasjoner over 100k NOK?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'money cash', voteType: 'yesno' },
    { id: "municipal_reform", label: "Municipal Reform", label_nb: "Kommunereform", categoryId: "elections-governance", topic: "Slå sammen kommuner med <5k innbyggere?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'norway map', voteType: 'yesno' },
    // Taxation
    { id: "wealth_tax", label: "Wealth Tax", label_nb: "Formuesskatt", categoryId: "taxation", topic: "Heve terskelen for formuesskatt til 10m NOK?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'luxury yacht', voteType: 'likert' },
    { id: "inheritance_tax", label: "Inheritance Tax", label_nb: "Arveavgift", categoryId: "taxation", topic: "Gjeninnføre arveavgift over 5m NOK på 10%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'family hands', voteType: 'yesno' },
    { id: "corporate_tax", label: "Corporate Tax", label_nb: "Selskapsskatt", categoryId: "taxation", topic: "Redusere selskapsskatten til 20%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'office building', voteType: 'yesno' },
    { id: "vat_gst", label: "VAT", label_nb: "MVA", categoryId: "taxation", topic: "Senke matmomsen til 10%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'supermarket groceries', voteType: 'yesno' },
    { id: "carbon_tax", label: "Carbon Tax", label_nb: "Karbonavgift", categoryId: "taxation", topic: "Øke karbonavgiften til 2000 NOK/tonn?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'factory smoke', voteType: 'quadratic' },
    // Budget & Public Finance
    { id: "fiscal_rule", label: "Fiscal Rule", label_nb: "Handlingsregelen", categoryId: "budget-public-finance", topic: "Endre handlingsregelen til 2.5%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'norway flag', voteType: 'yesno' },
    { id: "sovereign_fund", label: "Sovereign Wealth Fund", label_nb: "Oljefondet", categoryId: "budget-public-finance", topic: "La Oljefondet investere 10% i norsk infrastruktur?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'stock chart', voteType: 'yesno' },
    { id: "spending_priorities", label: "Spending Priorities", label_nb: "Budsjettprioriteringer", categoryId: "budget-public-finance", topic: "Øke forsvarsbudsjettet til 2.5% av BNP?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fighter jet', voteType: 'yesno' },
    { id: "debt_rule", label: "Debt Rule", label_nb: "Gjeldsregel", categoryId: "budget-public-finance", topic: "Innføre krav om balansert budsjett?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'piggy bank', voteType: 'yesno' },
    // Economy & Business
    { id: "sme_policy", label: "SMEs", label_nb: "Små og mellomstore bedrifter", categoryId: "economy-business", topic: "Kutte arbeidsgiveravgift for bedrifter med <20 ansatte?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'small business', voteType: 'yesno' },
    { id: "competition", label: "Competition", label_nb: "Konkurranse", categoryId: "economy-business", topic: "Bryte opp dominerende dagligvarekjeder?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'grocery aisle', voteType: 'yesno' },
    { id: "trade_policy", label: "Trade", label_nb: "Handel", categoryId: "economy-business", topic: "Søke nye frihandelsavtaler med asiatiske partnere?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'shipping containers', voteType: 'yesno' },
    { id: "industrial", label: "Industrial Policy", label_nb: "Industripolitikk", categoryId: "economy-business", topic: "Subsidere et nasjonalt program for batterifabrikker?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'battery factory', voteType: 'yesno' },
    // Labor & Welfare
    { id: "minimum_wage", label: "Minimum Wage", label_nb: "Minelønn", categoryId: "labor-welfare", topic: "Innføre nasjonal minstelønn?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'diverse workers', voteType: 'yesno' },
    { id: "unemployment", label: "Unemployment Benefits", label_nb: "Dagpenger", categoryId: "labor-welfare", topic: "Utvide dagpengeperioden til 18 måneder?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'helping hands', voteType: 'yesno' },
    { id: "parental_leave", label: "Parental Leave", label_nb: "Foreldrepermisjon", categoryId: "labor-welfare", topic: "Øke betalt permisjon til 60 uker (delt)?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'parent baby', voteType: 'yesno' },
    { id: "pensions", label: "Pensions", label_nb: "Pensjon", categoryId: "labor-welfare", topic: "Gradvis heve pensjonsalderen til 69 år?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'older couple', voteType: 'yesno' },
    // Health
    { id: "funding", label: "Funding", label_nb: "Finansiering", categoryId: "health", topic: "Øke sykehusbevilgningene med 5% neste år?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'hospital corridor', voteType: 'yesno' },
    { id: "private_role", label: "Private Providers", label_nb: "Private aktører", categoryId: "health", topic: "Utvide bruken av private aktører i offentlig helsevesen?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'doctor patient', voteType: 'yesno' },
    { id: "pharma", label: "Prescription Drugs", label_nb: "Reseptbelagte legemidler", categoryId: "health", topic: "Sette et tak på egenandeler for medisiner på 5000 NOK/år?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'pills medication', voteType: 'yesno' },
    { id: "mental_health", label: "Mental Health", label_nb: "Psykisk helse", categoryId: "health", topic: "Garantere 10 gratis psykologtimer per år?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'calm person', voteType: 'yesno' },
    // Education & Research
    { id: "schools", label: "Schools", label_nb: "Skole", categoryId: "education-research", topic: "Heve lærernes lønn med 10%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'students classroom', voteType: 'yesno' },
    { id: "higher_ed", label: "Higher Education", label_nb: "Høyere utdanning", categoryId: "education-research", topic: "Innføre skolepenger for studenter utenfor EU?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'university campus', voteType: 'yesno' },
    { id: "vocational", label: "Vocational Training", label_nb: "Yrkesfag", categoryId: "education-research", topic: "Opprette 20 000 nye lærlingplasser?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'workshop training', voteType: 'yesno' },
    { id: "research", label: "R&D", label_nb: "Forskning og utvikling", categoryId: "education-research", topic: "Doble den nasjonale satsingen på KI-forskning?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'science laboratory', voteType: 'yesno' },
    // Environment & Energy
    { id: "renewables", label: "Renewables", label_nb: "Fornybar energi", categoryId: "environment-energy", topic: "Bygge 5 GW havvind innen 2030?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'wind turbines', voteType: 'yesno' },
    { id: "oil_gas", label: "Oil & Gas", label_nb: "Olje og gass", categoryId: "environment-energy", topic: "Stanse tildeling av nye letelisenser?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'oil rig', voteType: 'yesno' },
    { id: "nuclear", label: "Nuclear", label_nb: "Kjernekraft", categoryId: "environment-energy", topic: "Tillate små modulære reaktorer (SMR)?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'nuclear power', voteType: 'yesno' },
    { id: "climate_targets", label: "Climate Targets", label_nb: "Klimamål", categoryId: "environment-energy", topic: "Lovfeste netto-nullutslipp innen 2040?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'earth globe', voteType: 'yesno' },
    // Infrastructure & Transport
    { id: "rail", label: "Rail", label_nb: "Jernbane", categoryId: "infrastructure-transport", topic: "Bygge høyhastighetstog mellom Oslo og Trondheim?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'high-speed train', voteType: 'yesno' },
    { id: "roads", label: "Roads/Tolls", label_nb: "Vei/Bompenger", categoryId: "infrastructure-transport", topic: "Fjerne bompenger i byene?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'traffic highway', voteType: 'yesno' },
    { id: "public_transit", label: "Public Transit", label_nb: "Kollektivtransport", categoryId: "infrastructure-transport", topic: "Innføre gratis kollektivtransport for personer under 18 år?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'city bus', voteType: 'yesno' },
    { id: "broadband", label: "Broadband", label_nb: "Bredbånd", categoryId: "infrastructure-transport", topic: "Sikre universell tilgang til 1 Gbps-internett innen 2028?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fiber optics', voteType: 'yesno' },
    // Housing & Urban Development
    { id: "affordable", label: "Affordable Housing", label_nb: "Boligbygging", categoryId: "housing-urban-development", topic: "Sette et mål om 30 000 nye boliger med overkommelig pris per år?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'modern houses', voteType: 'yesno' },
    { id: "rent", label: "Rent Regulation", label_nb: "Leieregulering", categoryId: "housing-urban-development", topic: "Begrense årlig leieøkning til konsumprisindeksen (KPI)?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'apartment building', voteType: 'yesno' },
    { id: "zoning", label: "Zoning", label_nb: "Reguleringsplaner", categoryId: "housing-urban-development", topic: "Tillate høyere utnyttelse for boligbygging nær kollektivknutepunkter?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'city street', voteType: 'yesno' },
    { id: "homelessness", label: "Homelessness", label_nb: "Bostedsløshet", categoryId: "housing-urban-development", topic: "Innføre et nasjonalt 'Housing First'-program?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'homeless person', voteType: 'yesno' },
    // Justice, Rights & Public Safety
    { id: "policing", label: "Policing", label_nb: "Politi", categoryId: "justice-rights-public-safety", topic: "Innføre obligatorisk bruk av kroppskamera for politiet nasjonalt?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'police officer', voteType: 'yesno' },
    { id: "drug_policy", label: "Drugs", label_nb: "Ruspolitikk", categoryId: "justice-rights-public-safety", topic: "Avkriminalisere besittelse av små mengder narkotika?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'cannabis leaf', voteType: 'yesno' },
    { id: "privacy", label: "Civil Liberties", label_nb: "Personvern", categoryId: "justice-rights-public-safety", topic: "Forby bruk av masseansiktsgjenkjenning i offentlige rom?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'cctv camera', voteType: 'yesno' },
    { id: "prison_reform", label: "Prisons", label_nb: "Kriminalomsorg", categoryId: "justice-rights-public-safety", topic: "Utvide rehabiliteringsprogrammer fremfor å øke soningskapasiteten?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'prison cell', voteType: 'yesno' },
    // Digital, Data & AI
    { id: "privacy_data", label: "Data Privacy", label_nb: "Datavern", categoryId: "digital-data-ai", topic: "Kreve eksplisitt samtykke for datadeling mellom tjenester?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'code screen', voteType: 'yesno' },
    { id: "cybersecurity", label: "Cybersecurity", label_nb: "Cybersikkerhet", categoryId: "digital-data-ai", topic: "Lansere et nasjonalt 'bug bounty'-program?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'hacker code', voteType: 'yesno' },
    { id: "ai_governance", label: "AI Governance", label_nb: "Styring av KI", categoryId: "digital-data-ai", topic: "Vedta en lov om algoritmisk ansvarlighet?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'robot hand', voteType: 'yesno' },
    { id: "digital_id", label: "Digital ID", label_nb: "Digital ID", categoryId: "digital-data-ai", topic: "Åpne BankID-APIer for integrasjon med offentlige tjenester?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fingerprint scan', voteType: 'yesno' },
    // Immigration & Integration
    { id: "asylum", label: "Asylum", label_nb: "Asyl", categoryId: "immigration-integration", topic: "Øke den årlige flyktningkvoten?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'people waiting', voteType: 'yesno' },
    { id: "work_visas", label: "Work Visas", label_nb: "Arbeidsinnvandring", categoryId: "immigration-integration", topic: "Innføre hurtigspor for faglærte arbeidsinnvandrere?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'passport stamp', voteType: 'yesno' },
    { id: "integration_policy", label: "Integration", label_nb: "Integrering", categoryId: "immigration-integration", topic: "Innføre obligatoriske norskkurs for nyankomne?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'language class', voteType: 'yesno' },
    { id: "citizenship", label: "Citizenship", label_nb: "Statsborgerskap", categoryId: "immigration-integration", topic: "Redusere botidskravet for statsborgerskap?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'norwegian passport', voteType: 'yesno' },
    // Defense & Foreign Affairs
    { id: "nato", label: "NATO/Alliances", label_nb: "NATO/Allianser", categoryId: "defense-foreign-affairs", topic: "Øke forsvarsbudsjettet til 2,5% av BNP og utvide NATO-deployeringer?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'nato flag', voteType: 'yesno' },
    { id: "conscription", label: "Conscription", label_nb: "Verneplikt", categoryId: "defense-foreign-affairs", topic: "Utvide den allmenne verneplikten til 12 måneder?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'soldiers marching', voteType: 'yesno' },
    { id: "foreign_aid", label: "Foreign Aid", label_nb: "Bistand", categoryId: "defense-foreign-affairs", topic: "Sette bistandsbudsjettet til 1% av BNI?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'aid worker', voteType: 'yesno' },
    { id: "arctic", label: "Arctic Policy", label_nb: "Arktisk politikk", categoryId: "defense-foreign-affairs", topic: "Øke patruljering og infrastruktur i Arktis?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'icebreaker ship', voteType: 'yesno' },
    // Agriculture, Fisheries & Rural
    { id: "farm_support", label: "Farm Support", label_nb: "Landbruksstøtte", categoryId: "agriculture-fisheries-rural", topic: "Vri subsidier mot små og mellomstore gårdsbruk?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'farmer field', voteType: 'yesno' },
    { id: "fisheries", label: "Fisheries", label_nb: "Fiskeri", categoryId: "agriculture-fisheries-rural", topic: "Forby bunntråling i sårbare områder?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fishing boat', voteType: 'yesno' },
    { id: "animal_welfare", label: "Animal Welfare", label_nb: "Dyrevelferd", categoryId: "agriculture-fisheries-rural", topic: "Avvikle pelsdyroppdrett?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fox animal', voteType: 'yesno' },
    { id: "rural_services", label: "Rural Services", label_nb: "Distriktstjenester", categoryId: "agriculture-fisheries-rural", topic: "Innføre skatteinsentiver for leger og lærere i distriktene?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'rural landscape', voteType: 'yesno' },
    { id: "foreign_fishing", label: "Fisheries", label_nb: "Utenlandsk fiske", categoryId: "agriculture-fisheries-rural", topic: "Forby utenlandske fiskebåter i norske farvann?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'fishing trawler', voteType: 'yesno' },
    // Culture, Media & Sports
    { id: "culture_funding", label: "Culture Funding", label_nb: "Kulturfinansiering", categoryId: "culture-media-sports", topic: "Øke regional kunststøtte med 20%?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'music concert', voteType: 'yesno' },
    { id: "media_policy", label: "Media", label_nb: "Mediepolitikk", categoryId: "culture-media-sports", topic: "Utvide budsjettet til allmennkringkasteren?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'retro tv', voteType: 'yesno' },
    { id: "sports", label: "Sports", label_nb: "Idrett", categoryId: "culture-media-sports", topic: "Innføre et nasjonalt stipendprogram for skoleidrett?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'soccer ball', voteType: 'yesno' },
    { id: "gambling", label: "Gambling", label_nb: "Pengespill", categoryId: "culture-media-sports", topic: "Innføre strengere grenser for pengespillreklame?", imageUrl: 'https://placehold.co/600x400.png', aiHint: 'poker chips', voteType: 'yesno' }
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
        description: `This is a public poll regarding ${sub.label_nb.toLowerCase()} under the ${categoryDataWithIds.find(c => c.id === sub.categoryId)?.label_nb} category. Your anonymous vote contributes to the public sentiment on this issue.`,
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
            avatarUrl: `https://placehold.co/40x40.png`,
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
              avatarUrl: `https://placehold.co/40x40.png`,
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
