
'use client';
import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { FinanceData } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface TrendsChartProps {
  data: FinanceData;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value);
};

export function TrendsChart({ data }: TrendsChartProps) {
  const [view, setView] = useState<'absolute' | 'percentage'>('absolute');

  const chartData = useMemo(() => {
    const quarterlyData = data.totals.filter(d => d.periodType === 'quarter').reverse(); // oldest first
    return quarterlyData.map(d => ({
        period: d.period,
        revenue: d.totalRevenue,
        expenditure: d.totalExpenditure,
        surplus: d.surplusDeficit,
        revenuePct: (d.totalRevenue / (d.totalRevenue + d.totalExpenditure)) * 100,
        expenditurePct: (d.totalExpenditure / (d.totalRevenue + d.totalExpenditure)) * 100,
    }));
  }, [data]);
  
  const yAxisKey = view === 'absolute' ? 'revenue' : 'revenuePct';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly Trends</CardTitle>
        <CardDescription>Revenue vs. expenditure over the last four quarters.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => view === 'absolute' ? formatCurrency(value) : `${value}%`}
            />
            <Tooltip 
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                formatter={(value: number, name: string) => [
                    view === 'absolute' ? `NOK ${formatCurrency(value)}` : `${value.toFixed(1)}%`,
                    name.charAt(0).toUpperCase() + name.slice(1)
                ]}
            />
             <Legend />
            <Area type="monotone" dataKey={view === 'absolute' ? 'revenue' : 'revenuePct'} stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" name="Revenue" />
            <Area type="monotone" dataKey={view === 'absolute' ? 'expenditure' : 'expenditurePct'} stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" name="Expenditure" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
       <CardFooter className="flex justify-end gap-2">
         <Button variant={view === 'absolute' ? 'default' : 'ghost'} size="sm" onClick={() => setView('absolute')}>NOK</Button>
         <Button variant={view === 'percentage' ? 'default' : 'ghost'} size="sm" onClick={() => setView('percentage')}>%</Button>
      </CardFooter>
    </Card>
  );
}
