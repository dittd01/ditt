

import type { Country, FiscalYear, FinanceTotal, CofogFunction, ExpenditureByFunction, DataSource, FinanceData, StateBudgetRow, GeneralGovernmentAnnual } from './types';

const countries: Country[] = [
  { iso3: 'NOR', name: 'Norway', currency: 'NOK', decimals: 0, defaultYear: 2024, cofogVersion: 'UN-COFOG-2019' }
];

const fiscalYears: FiscalYear[] = [
  { countryIso3: 'NOR', year: 2024, currency: 'NOK' },
  { countryIso3: 'NOR', year: 2025, currency: 'NOK' }
];

const cofogFunctions: CofogFunction[] = [
  { code: '01', name_no: 'Generelle offentlige tjenester', name_en: 'General public services' },
  { code: '02', name_no: 'Forsvar', name_en: 'Defence' },
  { code: '03', name_no: 'Offentlig orden og trygghet', name_en: 'Public order and safety' },
  { code: '04', name_no: 'Næringsøkonomiske formål', name_en: 'Economic affairs' },
  { code: '05', name_no: 'Miljøvern', name_en: 'Environmental protection' },
  { code: '06', name_no: 'Bolig og nærmiljø', name_en: 'Housing and community amenities' },
  { code: '07', name_no: 'Helse', name_en: 'Health' },
  { code: '08', name_no: 'Fritid, kultur og religion', name_en: 'Recreation, culture and religion' },
  { code: '09', name_no: 'Utdanning', name_en: 'Education' },
  { code: '10', name_no: 'Sosial beskyttelse', name_en: 'Social protection' }
];

const sources: DataSource[] = [
  { id: 'ssb_slik_skattepengene_2024', title: 'Slik brukes skattepengene (2024 totals)', url: 'https://www.ssb.no/offentlig-sektor/faktaside/slik-brukes-skattepengene', publisher: 'SSB', method: 'manual', lastCheckedAt: '2025-08-26T00:00:00Z' },
  { id: 'ssb_general_gov_last4q_2025q1', title: 'General government revenue/expenditure (last 4 quarters ending 2025Q1)', url: 'https://www.ssb.no/en/offentlig-sektor/offentlig-forvaltning/statistikk/offentlig-forvaltnings-inntekter-og-utgifter', publisher: 'SSB', method: 'manual', lastCheckedAt: '2025-08-26T00:00:00Z' },
  { id: 'regjeringen_budget_2025', title: 'Statsbudsjettet 2025: Statens inntekter og utgifter', url: 'https://www.regjeringen.no/no/statsbudsjett/2025/statsbudsjettet-2025-statens-inntekter-og-utgifter/id3055676/', publisher: 'Regjeringen', method: 'manual', lastCheckedAt: '2025-08-26T00:00:00Z' },
  { id: 'regjeringen_rnb_2025_keyfigures', title: 'Nøkkeltall i revidert budsjett 2025 (oljepengebruk)', url: 'https://www.regjeringen.no/no/aktuelt/nokkeltall-i-revidert-budsjett-for-2025/id3100525/', publisher: 'Regjeringen', method: 'manual', lastCheckedAt: '2025-08-26T00:00:00Z' }
];

const stateBudget: StateBudgetRow[] = [
    { year: 2023, totalRevenue: 2494.4, petroleumRevenue: 1008.5, nonPetroleumRevenue: 1485.9, totalExpenditure: 1806.8, petroleumExpenditure: 30.4, nonPetroleumExpenditure: 1776.4, budgetSurplus: 687.6, oilCorrectedSurplus: -290.5, transferFromGPF: 286.2, totalSurplus: -4.2 },
    { year: 2024, totalRevenue: 2259.0, petroleumRevenue: 710.5, nonPetroleumRevenue: 1548.5, totalExpenditure: 1926.4, petroleumExpenditure: 30.1, nonPetroleumExpenditure: 1896.3, budgetSurplus: 332.6, oilCorrectedSurplus: -347.8, transferFromGPF: 347.8, totalSurplus: 0.0 },
    { year: 2025, totalRevenue: 2250.0, petroleumRevenue: 672.4, nonPetroleumRevenue: 1577.6, totalExpenditure: 2020.8, petroleumExpenditure: 29.6, nonPetroleumExpenditure: 1991.2, budgetSurplus: 229.1, oilCorrectedSurplus: -413.6, transferFromGPF: 413.6, totalSurplus: 0.0 }
];

// Source: SSB page “General government revenue and expenditure” -> Table 3 (Annual).
// Values converted from millions to billions NOK.
export const generalGovAnnual: GeneralGovernmentAnnual[] = [
  { year: 2024, revenueBn: 3203.407, expenditureBn: 2524.615, surplusBn: 678.792 },
  { year: 2023, revenueBn: 3188.374, expenditureBn: 2347.156, surplusBn: 841.219 },
  { year: 2022, revenueBn: 3615.516, expenditureBn: 2151.437, surplusBn: 1464.078 },
];

const expenditureLevel1: ExpenditureByFunction[] = [
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Pensjon og sosiale ytelser', name_en: 'Social protection', amountBnNOK: 962 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', name_no: 'Helse', name_en: 'Health', amountBnNOK: 416 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '04', name_no: 'Næringsøkonomiske formål', name_en: 'Economic affairs', amountBnNOK: 280 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Annen offentlig tjenesteyting', name_en: 'General public services', amountBnNOK: 275 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Utdanning', name_en: 'Education', amountBnNOK: 249 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '02', name_no: 'Forsvar', name_en: 'Defence', amountBnNOK: 115 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '08', name_no: 'Fritid, kultur og religion', name_en: 'Recreation, culture and religion', amountBnNOK: 77 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '03', name_no: 'Offentlig orden og trygghet', name_en: 'Public order and safety', amountBnNOK: 55 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '05', name_no: 'Miljøvern', name_en: 'Environmental protection', amountBnNOK: 50 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '06', name_no: 'Bolig og nærmiljø', name_en: 'Housing and community amenities', amountBnNOK: 45 },
];

const expenditureLevel2: ExpenditureByFunction[] = [
    // 10: Pensjon og sosiale ytelser
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Alderspensjon', name_en: 'Old-age pension', amountBnNOK: 365.8 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Sykdom og uførhet', name_en: 'Sickness and disability', amountBnNOK: 349.9 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Barnehage, barnevern og barnetrygd', name_en: 'Family and children', amountBnNOK: 158.2 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Sosiale stønader', name_en: 'Social benefits', amountBnNOK: 53 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Arbeidsledighet', name_en: 'Unemployment', amountBnNOK: 15.5 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 1.8 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Annet', name_en: 'Other', amountBnNOK: 18 },
    
    // 07: Helse
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', name_no: 'Sykehustjenester', name_en: 'Hospital services', amountBnNOK: 248.4 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', name_no: 'Legetjenester', name_en: 'Medical services', amountBnNOK: 101 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', name_no: 'Legemidler, hjelpemidler og utstyr', name_en: 'Medicines, aids and equipment', amountBnNOK: 25.9 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', name_no: 'Annet', name_en: 'Other', amountBnNOK: 16.6 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', name_no: 'Forebyggende helsearbeid', name_en: 'Preventive health care', amountBnNOK: 14.5 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 9.8 },

    // 09: Utdanning
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Grunnskole', name_en: 'Primary school', amountBnNOK: 106.8 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Universitets- og høgskoleutdanning', name_en: 'University and college education', amountBnNOK: 55.6 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Videregående skole', name_en: 'High school', amountBnNOK: 49.6 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Utdanning på andre nivåer', name_en: 'Education at other levels', amountBnNOK: 20.9 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Støttetjenester tilknyttet utdanning', name_en: 'Support services related to education', amountBnNOK: 9.9 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Annet', name_en: 'Other', amountBnNOK: 4.5 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 1.0 },

    // 04: Næringsøkonomiske formål
    { countryIso3: 'NOR', year: 2024, cofogL1: '04', name_no: 'Transport', name_en: 'Transport', amountBnNOK: 194 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '04', name_no: 'Jordbruk og fiske', name_en: 'Agriculture and fisheries', amountBnNOK: 26.7 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '04', name_no: 'Arbeidsmarked', name_en: 'Labor market', amountBnNOK: 22.7 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '04', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 15.5 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '04', name_no: 'Annet', name_en: 'Other', amountBnNOK: 11.8 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '04', name_no: 'Energi', name_en: 'Energy', amountBnNOK: 9.3 },

    // 08: Fritid, kultur og religion
    { countryIso3: 'NOR', year: 2024, cofogL1: '08', name_no: 'Kultur', name_en: 'Culture', amountBnNOK: 27.3 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '08', name_no: 'Fritid og sport', name_en: 'Leisure and sports', amountBnNOK: 21.7 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '08', name_no: 'Den norske kirke og andre trossamfunn', name_en: 'The Church of Norway and other religious communities', amountBnNOK: 13.1 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '08', name_no: 'Kringkasting og forlagsvirksomhet', name_en: 'Broadcasting and publishing', amountBnNOK: 7.6 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '08', name_no: 'Annet', name_en: 'Other', amountBnNOK: 4.1 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '08', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 3.0 },

    // 02: Forsvar
    { countryIso3: 'NOR', year: 2024, cofogL1: '02', name_no: 'Militært forsvar', name_en: 'Military defence', amountBnNOK: 96.6 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '02', name_no: 'Utenlandsk militær bistand', name_en: 'Foreign military aid', amountBnNOK: 12.8 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '02', name_no: 'Sivilforsvar', name_en: 'Civil defence', amountBnNOK: 2.4 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '02', name_no: 'Annet', name_en: 'Other', amountBnNOK: 2.0 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '02', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 1.3 },
    
    // 03: Offentlig orden og trygghet
    { countryIso3: 'NOR', year: 2024, cofogL1: '03', name_no: 'Politi', name_en: 'Police', amountBnNOK: 28.1 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '03', name_no: 'Brannvesen og redningstjenester', name_en: 'Fire and rescue services', amountBnNOK: 11.5 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '03', name_no: 'Domstoler', name_en: 'Courts', amountBnNOK: 7.1 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '03', name_no: 'Fengsler', name_en: 'Prisons', amountBnNOK: 6.1 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '03', name_no: 'Annet', name_en: 'Other', amountBnNOK: 1.0 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '03', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 0.8 },
    
    // 05: Miljøvern
    { countryIso3: 'NOR', year: 2024, cofogL1: '05', name_no: 'Avløp og kloakk', name_en: 'Sewerage', amountBnNOK: 19.4 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '05', name_no: 'Avfallshåndtering', name_en: 'Waste management', amountBnNOK: 11.5 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '05', name_no: 'Bekjempelse av forurensing', name_en: 'Pollution abatement', amountBnNOK: 11.4 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '05', name_no: 'Annet', name_en: 'Other', amountBnNOK: 3.8 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '05', name_no: 'Landskapsvern og biologisk mangfold', name_en: 'Protection of biodiversity and landscape', amountBnNOK: 2.4 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '05', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 1.5 },

    // 06: Bolig og nærmiljø
    { countryIso3: 'NOR', year: 2024, cofogL1: '06', name_no: 'Vannforsyning', name_en: 'Water supply', amountBnNOK: 22.7 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '06', name_no: 'Bolig og regulering i kommunene', name_en: 'Housing and municipal planning', amountBnNOK: 22.1 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '06', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 0 },
    
    // 01: Annen offentlig tjenesteyting
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Stortinget og andre myndigheter ikke i andre kategorier', name_en: 'Parliament and other authorities not in other categories', amountBnNOK: 97.8 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Renteutgifter', name_en: 'Interest payments', amountBnNOK: 79.7 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Internasjonal bistand', name_en: 'International aid', amountBnNOK: 48.6 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Diverse offentlig administrasjon', name_en: 'Miscellaneous public administration', amountBnNOK: 32.0 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Grunnforskning', name_en: 'Basic research', amountBnNOK: 13.0 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 3.3 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Annet', name_en: 'Other', amountBnNOK: 1.0 },
];


const norway2024Data: FinanceData = {
    countryIso3: 'NOR',
    year: 2024,
    cofog: cofogFunctions,
    sources,
    stateBudget,
    totals: [
        { periodType: 'last4q', period: '2025Q1-L4Q', totalRevenue: 3294000, totalExpenditure: 2547000, surplusDeficit: 746000, notes: 'NOK million; exp.≈47.9% of GDP (L4Q)' },
        { periodType: 'quarter', period: '2024Q2', totalRevenue: 834716, totalExpenditure: 614129, surplusDeficit: 220587 },
        { periodType: 'quarter', period: '2024Q3', totalRevenue: 779614, totalExpenditure: 600410, surplusDeficit: 179204 },
        { periodType: 'quarter', period: '2024Q4', totalRevenue: 819399, totalExpenditure: 639860, surplusDeficit: 179539 },
        { periodType: 'quarter', period: '2025Q1', totalRevenue: 859964, totalExpenditure: 608404, surplusDeficit: 251560 },
        { periodType: 'annual', period: '2025-budget', totalRevenue: 2250.0, totalExpenditure: 2020.8, surplusDeficit: 229.2, notes: 'Central government totals; excl. lending. Non-oil revenue: 1577.6; non-oil expenditure: 1991.2 (NOK bn). Fund use (oljepengebruk): 542 (2.7% of GPFG value).' }
    ],
    expenditure: expenditureLevel1,
    expenditureL2: expenditureLevel2,
    generalGovernmentAnnual: generalGovAnnual,
};

// Main export structure
export const allFinanceData = {
    countries,
    fiscalYears,
    data: [norway2024Data] // Add more country-year data here
};
