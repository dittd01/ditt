
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import type { FinanceData } from '@/lib/types';

interface StateBudgetChartProps {
  data: FinanceData;
}

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const [lang, setLang] = useState('en');
  useEffect(() => {
    setLang(localStorage.getItem('selectedLanguage') || 'en');
  }, []);

  if (active && payload && payload.length) {
    const totalRevenueText = lang === 'nb' ? 'Totale inntekter' : 'Total Revenue';
    const totalExpenditureText = lang === 'nb' ? 'Totale utgifter' : 'Total Expenditure';

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
        <p className="font-bold mb-2">{label}</p>
        <div className="space-y-1">
            {payload.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }}/>
                    <span className="text-muted-foreground">{item.name}: </span>
                    <span className="font-medium">{formatNumber(item.value)} {lang === 'nb' ? 'mrd. kr' : 'bn NOK'}</span>
                </div>
            ))}
             <div className="pt-2 mt-2 border-t">
                <p className="font-medium">{totalRevenueText}: {formatNumber(payload[0].payload.totalRevenue)} {lang === 'nb' ? 'mrd. kr' : 'bn NOK'}</p>
                <p className="font-medium">{totalExpenditureText}: {formatNumber(payload[0].payload.totalExpenditure)} {lang === 'nb' ? 'mrd. kr' : 'bn NOK'}</p>
             </div>
        </div>
      </div>
    );
  }
  return null;
};

const valueFormatter = (value: number) => {
    if (value < 100) return ''; // Don't show labels for very small segments
    return formatNumber(value);
}

export function StateBudgetChart({ data }: StateBudgetChartProps) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);
  }, []);

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

  const petroleumRevenueText = lang === 'nb' ? 'Petroleumsinntekter' : 'Petroleum Revenue';
  const nonPetroleumRevenueText = lang === 'nb' ? 'Inntekter utenom petroleum' : 'Non-Petroleum Revenue';
  const petroleumExpenditureText = lang === 'nb' ? 'Petroleumsutgifter' : 'Petroleum Expenditure';
  const nonPetroleumExpenditureText = lang === 'nb' ? 'Utgifter utenom petroleum' : 'Non-Petroleum Expenditure';

  const title = lang === 'nb' ? 'Nøkkeltall i statsbudsjettet' : 'Key Figures in the State Budget';
  const description = lang === 'nb' ? 'Totale inntekter mot utgifter i milliarder kroner for 2023, 2024 og 2025.' : 'Total revenue vs. expenditure in billions of NOK for 2023, 2024, and 2025.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
                    tickFormatter={(value) => formatNumber(value)}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Non-Petroleum Revenue" name={nonPetroleumRevenueText} stackId="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Non-Petroleum Revenue" position="center" className="fill-primary-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                </Bar>
                <Bar dataKey="Petroleum Revenue" name={petroleumRevenueText} stackId="revenue" fill="hsl(120, 40%, 60%)" >
                    <LabelList dataKey="Petroleum Revenue" position="center" className="fill-primary-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                </Bar>
                <Bar dataKey="Non-Petroleum Expenditure" name={nonPetroleumExpenditureText} stackId="expenditure" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Non-Petroleum Expenditure" position="center" className="fill-destructive-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                </Bar>
                <Bar dataKey="Petroleum Expenditure" name={petroleumExpenditureText} stackId="expenditure" fill="hsl(0, 85%, 65%)" >
                    <LabelList dataKey="Petroleum Expenditure" position="center" className="fill-destructive-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
