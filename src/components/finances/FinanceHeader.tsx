
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
  onCountryChange: (country: Country) => void;
  onYearChange: (year: FiscalYear) => void;
}

export function FinanceHeader({
  countries,
  years,
  selectedCountry,
  selectedYear,
  onCountryChange,
  onYearChange,
}: FinanceHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Government Finances</h1>
        <p className="text-muted-foreground">An overview of public revenue and expenditure.</p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={selectedCountry.iso3}
          onValueChange={(iso3) => {
            const country = countries.find(c => c.iso3 === iso3);
            if (country) onCountryChange(country);
          }}
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
          value={String(selectedYear.year)}
          onValueChange={(yearStr) => {
            const year = years.find(y => y.year === parseInt(yearStr));
            if (year) onYearChange(year);
          }}
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
