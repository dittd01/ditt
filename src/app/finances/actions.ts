
'use server';

import { allFinanceData } from '@/lib/finance-data';
import type { FinanceData } from '@/lib/types';

/**
 * Fetches the financial data for a specific country and year.
 * 
 * In a real application, this function would query Firestore to get the data.
 * For this prototype, it simulates that by fetching from the static data file.
 * This establishes the server-side data fetching pattern.
 *
 * @param countryIso3 The ISO 3166-1 alpha-3 code for the country.
 * @param year The fiscal year to fetch data for.
 * @returns A promise that resolves to the FinanceData object or null if not found.
 */
export async function getFinanceDataForCountry(
  countryIso3: string,
  year: number
): Promise<FinanceData | null> {
  // Simulate a database lookup with a delay
  await new Promise(resolve => setTimeout(resolve, 50));

  const data = allFinanceData.data.find(
    d => d.countryIso3 === countryIso3 && d.year === year
  );

  return data || null;
}
