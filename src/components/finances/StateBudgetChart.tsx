
'use client';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import type { FinanceData } from '@/lib/types';

interface StateBudgetChartProps {
  data: FinanceData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
        <p className="font-bold mb-2">{label}</p>
        <div className="space-y-1">
            {payload.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }}/>
                    <span className="text-muted-foreground">{item.name}: </span>
                    <span className="font-medium">{item.value.toLocaleString()} mrd. kr</span>
                </div>
            ))}
             <div className="pt-2 mt-2 border-t">
                <p className="font-medium">Total Revenue: {payload[0].payload.totalRevenue.toLocaleString()} mrd. kr</p>
                <p className="font-medium">Total Expenditure: {payload[0].payload.totalExpenditure.toLocaleString()} mrd. kr</p>
             </div>
        </div>
      </div>
    );
  }
  return null;
};

const valueFormatter = (value: number) => {
    if (value < 100) return ''; // Don't show labels for very small segments
    return Math.round(value).toLocaleString();
}

export function StateBudgetChart({ data }: StateBudgetChartProps) {
  const chartData = useMemo(() => {
    return data.stateBudget.map(item => ({
      name: item.year,
      'Petroleum Revenue': item.petroleumRevenue,
      'Non-Petroleum Revenue': item.nonPetroleumRevenue,
      'Petroleum Expenditure': item.petroleumExpenditure,
      'Non-Petroleum Expenditure': item.nonPetroleumExpenditure,
      totalRevenue: item.totalRevenue,
      totalExpenditure: item.totalExpenditure,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Figures in the State Budget</CardTitle>
        <CardDescription>Total revenue vs. expenditure in billions of NOK for 2023, 2024, and 2025.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full pr-4">
        <ResponsiveContainer>
            <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                />
                <YAxis
                    tickFormatter={(value) => value.toLocaleString()}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Non-Petroleum Revenue" stackId="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Non-Petroleum Revenue" position="center" className="fill-primary-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                </Bar>
                <Bar dataKey="Petroleum Revenue" stackId="revenue" fill="hsl(120, 40%, 60%)" >
                    <LabelList dataKey="Petroleum Revenue" position="center" className="fill-primary-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                </Bar>
                <Bar dataKey="Non-Petroleum Expenditure" stackId="expenditure" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Non-Petroleum Expenditure" position="center" className="fill-destructive-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                </Bar>
                <Bar dataKey="Petroleum Expenditure" stackId="expenditure" fill="hsl(0, 70%, 70%)" >
                    <LabelList dataKey="Petroleum Expenditure" position="center" className="fill-destructive-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
