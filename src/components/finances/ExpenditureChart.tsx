
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { FinanceData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

interface ExpenditureChartProps {
  data: FinanceData;
}

const generateGreenShades = (isDark: boolean) => {
  const baseLightness = isDark ? 65 : 25; // Dark mode starts lighter, light mode starts darker
  const step = isDark ? -5 : 6;
  return Array.from({ length: 10 }, (_, i) => `hsl(103, 31%, ${baseLightness + (i * step)}%)`);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-sm text-muted-foreground">{`NOK ${payload[0].value.toLocaleString()} bn (${payload[0].payload.share.toFixed(1)}%)`}</p>
      </div>
    );
  }
  return null;
};

export function ExpenditureChart({ data }: ExpenditureChartProps) {
  const [lang, setLang] = useState('en');
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    if (resolvedTheme) {
        setColors(generateGreenShades(resolvedTheme === 'dark'));
    }
  }, [resolvedTheme]);


  const chartData = useMemo(() => {
    if (colors.length === 0) return [];
    const totalExpenditure = data.expenditure.reduce((sum, item) => sum + item.amountBnNOK, 0);
    return data.expenditure.map((item, index) => ({
      name: lang === 'nb' ? item.name_no : item.name_en,
      value: item.amountBnNOK,
      share: (item.amountBnNOK / totalExpenditure) * 100,
      fill: colors[index % colors.length],
    })).sort((a,b) => b.value - a.value);
  }, [data, lang, colors]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>How Your Tax Money Is Spent ({data.year})</CardTitle>
        <CardDescription>Breakdown of general government expenditure by function.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
             <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
         <Button variant={lang === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLang('en')}>EN</Button>
         <Button variant={lang === 'nb' ? 'default' : 'ghost'} size="sm" onClick={() => setLang('nb')}>NO</Button>
      </CardFooter>
    </Card>
  );
}
