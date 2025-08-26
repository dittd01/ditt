

'use client';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import type { FinanceData } from '@/lib/types';

interface RevenueExpenditureChartProps {
  data: FinanceData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
        <p className="font-bold">{label}</p>
        {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }}/>
                <span className="text-muted-foreground">{item.name}: </span>
                <span className="font-medium">{item.value.toLocaleString()} mrd. kr</span>
            </div>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueExpenditureChart({ data }: RevenueExpenditureChartProps) {
  const l4q = data.totals.find(t => t.periodType === 'last4q');

  const chartData = useMemo(() => {
    if (!l4q) return [];
    
    const revenue = Math.round(l4q.totalRevenue / 1000);
    const expenditure = Math.round(l4q.totalExpenditure / 1000);
    const surplus = Math.round(l4q.surplusDeficit / 1000);
    
    return [
        {
            name: 'Total Revenue',
            revenue: revenue,
            expenditure: 0,
            surplus: 0,
        },
        {
            name: 'Expenditure & Surplus',
            revenue: 0,
            expenditure: expenditure,
            surplus: surplus,
        }
    ]
  }, [l4q]);

  if (!l4q) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs. Expenditure (L4Q)</CardTitle>
        <CardDescription>In billions (mrd.) of NOK. Last four quarters.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full pr-4">
        <ResponsiveContainer>
            <BarChart
                data={chartData}
                layout="horizontal"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis type="number" tickFormatter={(value) => `${value.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Legend />
                <Bar dataKey="revenue" name="Total Revenue" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenditure" name="Expenditure" stackId="a" fill="hsl(var(--chart-1))" />
                <Bar dataKey="surplus" name="Surplus" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
