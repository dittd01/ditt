
'use client';
import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import type { FinanceData } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ExpenditureBarChartProps {
  data: FinanceData;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold">{`${payload[0].payload.name}`}</p>
        <p className="text-sm text-muted-foreground">{`NOK ${payload[0].value.toLocaleString()} bn`}</p>
      </div>
    );
  }
  return null;
};

export function ExpenditureBarChart({ data }: ExpenditureBarChartProps) {
  const [lang, setLang] = useState('en');

  const chartData = useMemo(() => {
    return data.expenditure
      .map((item, index) => ({
        name: lang === 'nb' ? item.name_no : item.name_en,
        value: item.amountBnNOK,
        fill: 'hsl(var(--primary))',
      }))
      .sort((a,b) => a.value - b.value); // Sort ascending for horizontal bar chart
  }, [data, lang]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenditure Details ({data.year})</CardTitle>
        <CardDescription>Government expenditure by function, in billions of NOK.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] w-full pr-10">
        <ResponsiveContainer>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `${value}`} />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150} 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" name="Expenditure" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="value" position="right" offset={10} className="fill-foreground font-medium" />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
         <Button variant={lang === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLang('en')}>EN</Button>
         <Button variant={lang === 'nb' ? 'default' : 'ghost'} size="sm" onClick={() => setLang('nb')}>NO</Button>
      </CardFooter>
    </Card>
  );
}
