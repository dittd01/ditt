
import { FinanceHeader } from '@/components/finances/FinanceHeader';
import { KpiCards } from '@/components/finances/KpiCards';
import { ExpenditureBarChart } from '@/components/finances/ExpenditureBarChart';
import { StateBudgetChart } from '@/components/finances/StateBudgetChart';
import { Sources } from '@/components/finances/Sources';
import { getFinanceDataForCountry } from './actions';
import { allFinanceData } from '@/lib/finance-data';
import { ExpenditureChart } from '@/components/finances/ExpenditureChart';


export default async function FinancesPage() {
  // For this phase, we'll fetch data for Norway (NOR) for the default year.
  // The country and year selection will be wired up in a subsequent step.
  const country = allFinanceData.countries[0];
  const year = allFinanceData.fiscalYears.find(fy => fy.year === country.defaultYear)!;
  const countryData = await getFinanceDataForCountry(country.iso3, year.year);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StateBudgetChart data={countryData} />
      </div>
      <ExpenditureBarChart data={countryData} />
      <ExpenditureBarChart data={countryData} />
      <ExpenditureChart data={countryData} />
      <Sources sources={countryData.sources} />
    </div>
  );
}
