
'use client';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FinanceData } from '@/lib/types';

interface StateBudgetChartProps {
  data: FinanceData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold">{label}</p>
        {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }}/>
                <span className="text-sm text-muted-foreground">{item.name}: </span>
                <span className="text-sm font-medium">{item.value.toLocaleString()} mrd. kr</span>
            </div>
        ))}
      </div>
    );
  }
  return null;
};

export function StateBudgetChart({ data }: StateBudgetChartProps) {
  const chartData = useMemo(() => {
    return data.stateBudget.map(item => ({
      name: item.year,
      'Total Revenue': item.totalRevenue,
      'Total Expenditure': item.totalExpenditure,
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
                    tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Legend />
                <Bar dataKey="Total Revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Total Expenditure" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
