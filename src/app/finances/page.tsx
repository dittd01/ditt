

'use client';

import { useState, useEffect, useMemo } from 'react';
import { FinanceHeader } from '@/components/finances/FinanceHeader';
import { KpiCards } from '@/components/finances/KpiCards';
import { ExpenditureBarChart } from '@/components/finances/ExpenditureBarChart';
import { Sources } from '@/components/finances/Sources';
import { allFinanceData } from '@/lib/finance-data';
import type { ExpenditureByFunction, FinanceData } from '@/lib/types';
import { getFinanceDataForCountry } from '@/app/actions';
import { DetailedFinanceChart } from '@/components/finances/DetailedFinanceChart';


export default function FinancesPage() {
  const [countryData, setCountryData] = useState<FinanceData | null>(null);
  const [selectedL1, setSelectedL1] = useState<ExpenditureByFunction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);

    const fetchData = async () => {
      setIsLoading(true);
      const data = await getFinanceDataForCountry('NOR', 2024);
      setCountryData(data);
      if (data?.expenditure) {
        // Set "Social protection" as the default selected category
        const socialProtectionData = data.expenditure.find(item => item.cofogL1 === '10');
        setSelectedL1(socialProtectionData || null);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const totalL1Expenditure = useMemo(() => {
    if (!countryData?.expenditure) return 0;
    return countryData.expenditure.reduce((sum, item) => sum + item.amountBnNOK, 0);
  }, [countryData?.expenditure]);

  const l2Data = useMemo(() => {
    if (!selectedL1 || !countryData?.expenditureL2) return undefined;
    return countryData.expenditureL2.filter(item => item.cofogL1 === selectedL1.cofogL1);
  }, [selectedL1, countryData?.expenditureL2]);


  const breakdownTitle = useMemo(() => {
    if (!selectedL1) {
        return lang === 'nb' ? 'Fordeling' : 'Breakdown';
    }
    const percentage = totalL1Expenditure > 0 ? (selectedL1.amountBnNOK / totalL1Expenditure) * 100 : 0;
    const formattedPercentage = `(${(percentage).toFixed(1)}%)`;

    return lang === 'nb' 
      ? `Fordeling: ${selectedL1.name_no || '...'} - ${selectedL1.amountBnNOK} mrd. kr ${formattedPercentage}` 
      : `Breakdown: ${selectedL1.name_en || '...'} - ${selectedL1.amountBnNOK} bn NOK ${formattedPercentage}`;
  }, [selectedL1, lang, totalL1Expenditure]);

  const handleL1Select = (data: ExpenditureByFunction | null) => {
    setSelectedL1(data);
  }

  const country = allFinanceData.countries[0];
  const year = allFinanceData.fiscalYears.find(fy => fy.year === country.defaultYear)!;
  const mainChartTitle = lang === 'nb' ? 'Slik brukes skattepengene dine (2024)' : 'How Your Tax Money Is Spent (2024)';

  if (isLoading) {
    // You can return a loading skeleton here
    return (
        <div className="container mx-auto px-4 py-8">
            <p>Loading financial data...</p>
        </div>
    );
  }

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
        years={allFinanceData.fiscalYears.filter(fy => fy.countryIso3 === country.iso3)}
        selectedCountry={country}
        selectedYear={year}
      />
      <KpiCards data={countryData} />
      <div className="space-y-8">
        <DetailedFinanceChart />
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenditureBarChart 
          data={countryData.expenditure} 
          onBarClick={handleL1Select}
          title={mainChartTitle}
          colorTheme="green"
        />
        <ExpenditureBarChart 
          data={l2Data}
          title={breakdownTitle}
          isDrilldown={true}
          colorTheme="red"
        />
      </div>
      <Sources sources={countryData.sources} />
    </div>
  );
}
