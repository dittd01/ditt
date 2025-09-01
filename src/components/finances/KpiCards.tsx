

'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FinanceData } from '@/lib/types';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface KpiCardsProps {
  data: FinanceData;
}

const formatCurrency = (value: number, currency: string, compact = true) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value * (compact ? 1000000000 : 1000000));
};

export function KpiCards({ data }: KpiCardsProps) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);
  }, []);

  const budget2024 = data.stateBudget.find(b => b.year === 2024);
  
  if (!budget2024) return null;

  const revenue = budget2024.totalRevenue;
  const expenditure = budget2024.totalExpenditure;
  const oilCorrectedSurplus = budget2024.oilCorrectedSurplus;

  const totalRevenueText = lang === 'nb' ? 'Totale inntekter (Statsbudsjett 2024)' : 'Total Revenue (State Budget 2024)';
  const totalExpenditureText = lang === 'nb' ? 'Totale utgifter (Statsbudsjett 2024)' : 'Total Expenditure (State Budget 2024)';
  const surplusDeficitText = lang === 'nb' ? 'Oljekorrigert overskudd (Statsbudsjett 2024)' : 'Oil-Corrected Surplus (State Budget 2024)';
  const sourceText = lang === 'nb' ? 'Kilde: Regjeringen.no' : 'Source: Regjeringen.no';
  const surplusText = lang === 'nb' ? 'Overskudd' : 'Surplus';
  const deficitText = lang === 'nb' ? 'Underskudd' : 'Deficit';

  const formatBn = (value: number) => `${value.toLocaleString('nb-NO', {minimumFractionDigits: 1, maximumFractionDigits: 1})} mrd. kr`;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{totalRevenueText}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBn(revenue)}</div>
          <p className="text-xs text-muted-foreground">{sourceText}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{totalExpenditureText}</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBn(expenditure)}</div>
          <p className="text-xs text-muted-foreground">{sourceText}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{surplusDeficitText}</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBn(oilCorrectedSurplus)}</div>
          <Badge variant={oilCorrectedSurplus > 0 ? 'default' : 'destructive'}>
            {oilCorrectedSurplus > 0 ? surplusText : deficitText}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
