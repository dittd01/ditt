
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
  const handleCountryChange = (iso3: string) => {
    // Logic to re-fetch data for the new country will be added here.
    console.log("Country changed to:", iso3);
  };

  const handleYearChange = (yearStr: string) => {
    // Logic to re-fetch data for the new year will be added here.
    console.log("Year changed to:", yearStr);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Government Finances</h1>
        <p className="text-muted-foreground">An overview of public revenue and expenditure.</p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          defaultValue={selectedCountry.iso3}
          onValueChange={handleCountryChange}
        >
          <SelectTrigger className="w-[150px]">
            <Globe className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country.iso3} value={country.iso3}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
