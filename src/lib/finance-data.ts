

import type { Country, FiscalYear, FinanceTotal, CofogFunction, ExpenditureByFunction, DataSource, FinanceData, StateBudgetRow } from './types';

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

const expenditureLevel1: ExpenditureByFunction[] = [
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', name_no: 'Pensjon og sosiale ytelser', name_en: 'Social protection', amountBnNOK: 962 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', name_no: 'Helse', name_en: 'Health', amountBnNOK: 416 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '04', name_no: 'Næringsøkonomiske formål', name_en: 'Economic affairs', amountBnNOK: 280 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '01', name_no: 'Annen offentlig tjenesteyting', name_en: 'General public services (other)', amountBnNOK: 275 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', name_no: 'Utdanning', name_en: 'Education', amountBnNOK: 249 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '02', name_no: 'Forsvar', name_en: 'Defence', amountBnNOK: 115 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '08', name_no: 'Fritid, kultur og religion', name_en: 'Recreation, culture and religion', amountBnNOK: 77 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '03', name_no: 'Offentlig orden og trygghet', name_en: 'Public order and safety', amountBnNOK: 55 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '05', name_no: 'Miljøvern', name_en: 'Environmental protection', amountBnNOK: 50 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '06', name_no: 'Bolig og nærmiljø', name_en: 'Housing and community amenities', amountBnNOK: 45 },
];

const expenditureLevel2: ExpenditureByFunction[] = [
    // Breakdown for Health (07)
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', cofogL2: '07.1', name_no: 'Medisinske produkter og utstyr', name_en: 'Medical products, appliances and equipment', amountBnNOK: 50 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', cofogL2: '07.2', name_no: 'Polikliniske tjenester', name_en: 'Outpatient services', amountBnNOK: 120 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', cofogL2: '07.3', name_no: 'Sykehustjenester', name_en: 'Hospital services', amountBnNOK: 200 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '07', cofogL2: '07.4', name_no: 'Offentlige helsetjenester', name_en: 'Public health services', amountBnNOK: 46 },
    
    // Breakdown for Education (09)
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', cofogL2: '09.1', name_no: 'Førskole og grunnskole', name_en: 'Pre-primary and primary education', amountBnNOK: 100 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', cofogL2: '09.2', name_no: 'Videregående opplæring', name_en: 'Secondary education', amountBnNOK: 65 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', cofogL2: '09.4', name_no: 'Høyere utdanning', name_en: 'Tertiary education', amountBnNOK: 70 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '09', cofogL2: '09.8', name_no: 'Annen utdanning', name_en: 'Other education', amountBnNOK: 14 },
    
    // Breakdown for Social Protection (10)
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', cofogL2: '10.2', name_no: 'Alderspensjon', name_en: 'Old-age pension', amountBnNOK: 365.8 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', cofogL2: '10.1', name_no: 'Sykdom og uførhet', name_en: 'Sickness and disability', amountBnNOK: 349.9 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', cofogL2: '10.4', name_no: 'Barnehage, barnevern og barnetrygd', name_en: 'Family and children', amountBnNOK: 158.2 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', cofogL2: '10.7', name_no: 'Sosiale stønader', name_en: 'Social benefits', amountBnNOK: 53 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', cofogL2: '10.6', name_no: 'Arbeidsledighet', name_en: 'Unemployment', amountBnNOK: 15.5 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', cofogL2: '10.9', name_no: 'Annet', name_en: 'Other', amountBnNOK: 18 },
    { countryIso3: 'NOR', year: 2024, cofogL1: '10', cofogL2: '10.8', name_no: 'Forskning og utvikling', name_en: 'Research and development', amountBnNOK: 1.8 },
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
};

// Main export structure
export const allFinanceData = {
    countries,
    fiscalYears,
    data: [norway2024Data] // Add more country-year data here
};
