
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FinanceData } from '@/lib/types';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';

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
  const l4q = data.totals.find(t => t.periodType === 'last4q');
  
  if (!l4q) return null;

  const revenue = l4q.totalRevenue * 1000000;
  const expenditure = l4q.totalExpenditure * 1000000;
  const surplus = l4q.surplusDeficit * 1000000;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue (L4Q)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{new Intl.NumberFormat('nb-NO', { notation: 'compact', compactDisplay: 'short' }).format(revenue)} kr</div>
          <p className="text-xs text-muted-foreground">Last Four Quarters</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenditure (L4Q)</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{new Intl.NumberFormat('nb-NO', { notation: 'compact', compactDisplay: 'short' }).format(expenditure)} kr</div>
          <p className="text-xs text-muted-foreground">{l4q.notes}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Surplus / Deficit (L4Q)</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{new Intl.NumberFormat('nb-NO', { notation: 'compact', compactDisplay: 'short' }).format(surplus)} kr</div>
          <Badge variant={surplus > 0 ? 'default' : 'destructive'}>
            {surplus > 0 ? 'Surplus' : 'Deficit'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
