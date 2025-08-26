

'use client';

import { useState } from 'react';
import { FinanceHeader } from '@/components/finances/FinanceHeader';
import { KpiCards } from '@/components/finances/KpiCards';
import { ExpenditureBarChart } from '@/components/finances/ExpenditureBarChart';
import { StateBudgetChart } from '@/components/finances/StateBudgetChart';
import { Sources } from '@/components/finances/Sources';
import { getFinanceDataForCountry } from './actions';
import { allFinanceData } from '@/lib/finance-data';
import { ExpenditureChart } from '@/components/finances/ExpenditureChart';
import type { ExpenditureByFunction } from '@/lib/types';


export default function FinancesPage() {
  const [countryData, setCountryData] = useState(allFinanceData.data[0]);
  const [selectedL1, setSelectedL1] = useState<ExpenditureByFunction | null>(null);

  if (!countryData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>No data available for the selected country and year.</p>
      </div>
    );
  }

  const handleL1Select = (data: ExpenditureByFunction | null) => {
    setSelectedL1(data);
  }

  const l2Data = selectedL1 
    ? countryData.expenditureL2?.filter(item => item.cofogL1 === selectedL1.cofogL1) 
    : undefined;

  const country = allFinanceData.countries[0];
  const year = allFinanceData.fiscalYears.find(fy => fy.year === country.defaultYear)!;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <FinanceHeader
        countries={allFinanceData.countries}
        years={allFinanceData.fiscalYears.filter(fy => fy.countryIso3 === country.iso3)}
        selectedCountry={country}
        selectedYear={year}
      />
      <KpiCards data={countryData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StateBudgetChart data={countryData} />
      </div>
      <ExpenditureBarChart 
        data={countryData.expenditure} 
        onBarClick={handleL1Select}
        title="How Your Tax Money Is Spent (2024)"
      />
      <ExpenditureBarChart 
        data={l2Data}
        title={`Breakdown: ${selectedL1?.name_en || '...'}`}
        isDrilldown={true}
      />
      <ExpenditureChart data={countryData} />
      <Sources sources={countryData.sources} />
    </div>
  );
}
