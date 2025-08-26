
'use client';

import { useState, useMemo } from 'react';
import { FinanceHeader } from '@/components/finances/FinanceHeader';
import { KpiCards } from '@/components/finances/KpiCards';
import { ExpenditureChart } from '@/components/finances/ExpenditureChart';
import { TrendsChart } from '@/components/finances/TrendsChart';
import { Sources } from '@/components/finances/Sources';
import { allFinanceData } from '@/lib/finance-data';
import type { Country, FiscalYear, FinanceData } from '@/lib/types';

export default function FinancesPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(allFinanceData.countries[0]);
  const [selectedYear, setSelectedYear] = useState<FiscalYear>(allFinanceData.fiscalYears.find(fy => fy.year === selectedCountry.defaultYear)!);

  const countryData: FinanceData | undefined = useMemo(() => {
    return allFinanceData.data.find(d => d.countryIso3 === selectedCountry.iso3 && d.year === selectedYear.year);
  }, [selectedCountry, selectedYear]);

  if (!countryData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>No data available for the selected country and year.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <FinanceHeader
        countries={allFinanceData.countries}
        years={allFinanceData.fiscalYears.filter(fy => fy.countryIso3 === selectedCountry.iso3)}
        selectedCountry={selectedCountry}
        selectedYear={selectedYear}
        onCountryChange={setSelectedCountry}
        onYearChange={setSelectedYear}
      />
      <KpiCards data={countryData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenditureChart data={countryData} />
        <TrendsChart data={countryData} />
      </div>
      <Sources sources={countryData.sources} />
    </div>
  );
}
