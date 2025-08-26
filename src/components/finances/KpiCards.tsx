

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

  const l4q = data.totals.find(t => t.periodType === 'last4q');
  
  if (!l4q) return null;

  const revenue = l4q.totalRevenue * 1000000;
  const expenditure = l4q.totalExpenditure * 1000000;
  const surplus = l4q.surplusDeficit * 1000000;

  const totalRevenueText = lang === 'nb' ? 'Totale inntekter (siste 4 kvartal)' : 'Total Revenue (L4Q)';
  const totalExpenditureText = lang === 'nb' ? 'Totale utgifter (siste 4 kvartal)' : 'Total Expenditure (L4Q)';
  const surplusDeficitText = lang === 'nb' ? 'Overskudd / Underskudd (siste 4 kvartal)' : 'Surplus / Deficit (L4Q)';
  const lastFourQuartersText = lang === 'nb' ? 'Siste fire kvartaler' : 'Last Four Quarters';
  const surplusText = lang === 'nb' ? 'Overskudd' : 'Surplus';
  const deficitText = lang === 'nb' ? 'Underskudd' : 'Deficit';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{totalRevenueText}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{new Intl.NumberFormat('nb-NO', { notation: 'compact', compactDisplay: 'short' }).format(revenue)} kr</div>
          <p className="text-xs text-muted-foreground">{lastFourQuartersText}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{totalExpenditureText}</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{new Intl.NumberFormat('nb-NO', { notation: 'compact', compactDisplay: 'short' }).format(expenditure)} kr</div>
          <p className="text-xs text-muted-foreground">{l4q.notes}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{surplusDeficitText}</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{new Intl.NumberFormat('nb-NO', { notation: 'compact', compactDisplay: 'short' }).format(surplus)} kr</div>
          <Badge variant={surplus > 0 ? 'default' : 'destructive'}>
            {surplus > 0 ? surplusText : deficitText}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
