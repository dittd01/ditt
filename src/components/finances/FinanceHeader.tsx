

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Calendar, Info } from 'lucide-react';
import type { Country, FiscalYear } from '@/lib/types';

interface FinanceHeaderProps {
  countries: Country[];
  years: FiscalYear[];
  selectedCountry: Country;
  selectedYear: FiscalYear;
  // onCountryChange and onYearChange will be implemented in a future step
}

export function FinanceHeader({
  countries,
  years,
  selectedCountry,
  selectedYear,
}: FinanceHeaderProps) {
  const [lang, setLang] = React.useState('en');
  
  React.useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);
  }, []);

  const handleCountryChange = (iso3: string) => {
    // Logic to re-fetch data for the new country will be added here.
    console.log("Country changed to:", iso3);
  };

  const handleYearChange = (yearStr: string) => {
    // Logic to re-fetch data for the new year will be added here.
    console.log("Year changed to:", yearStr);
  };

  const title = lang === 'nb' ? 'Offentlige Finanser' : 'Government Finances';
  const subtitle = lang === 'nb' ? `En oversikt over offentlige inntekter og utgifter for ${selectedCountry.name}.` : `An overview of public revenue and expenditure for ${selectedCountry.name}.`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          defaultValue={String(selectedYear.year)}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[120px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(fy => (
              <SelectItem key={fy.year} value={String(fy.year)}>
                {fy.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
