
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Label } from 'recharts';
import type { FinanceData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';

interface ExpenditureBarChartProps {
  data: FinanceData;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].fill }}/>
            <p className="font-bold">{`${payload[0].payload.name}`}</p>
        </div>
        <p className="text-sm text-muted-foreground">{`NOK ${payload[0].value.toLocaleString()} bn`}</p>
      </div>
    );
  }
  return null;
};

// A monochromatic green color scale for a professional look.
// These colors will work in both light and dark mode by varying lightness.
const generateGreenShades = (isDark: boolean) => {
  const baseLightness = isDark ? 65 : 25; // Dark mode starts lighter, light mode starts darker
  const step = isDark ? -5 : 6;
  return Array.from({ length: 10 }, (_, i) => `hsl(103, 31%, ${baseLightness + (i * step)}%)`);
};

export function ExpenditureBarChart({ data }: ExpenditureBarChartProps) {
  const { resolvedTheme } = useTheme();
  const [lang, setLang] = useState('en');
  const isMobile = useIsMobile();
  const [colors, setColors] = useState<string[]>([]);
  
  useEffect(() => {
    if (resolvedTheme) {
        setColors(generateGreenShades(resolvedTheme === 'dark'));
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'selectedLanguage') {
        setLang(event.newValue || 'en');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const { chartData, totalExpenditure } = useMemo(() => {
    if (colors.length === 0) return { chartData: [], totalExpenditure: 0 };
    const expenditureData = data.expenditure
      .map((item, index) => ({
        name: lang === 'nb' ? item.name_no : item.name_en,
        value: item.amountBnNOK,
        fill: colors[index % colors.length],
      }))
      .sort((a,b) => a.value - b.value);
    
    const total = expenditureData.reduce((sum, item) => sum + item.value, 0);

    return { chartData: expenditureData, totalExpenditure: total };
  }, [data, lang, colors]);
  
  const chartHeight = chartData.length * (isMobile ? 36 : 40) + 40;

  return (
    <Card>
      <CardHeader>
        <CardTitle>How Your Tax Money Is Spent ({data.year}) - Total: {totalExpenditure.toLocaleString()} bn NOK</CardTitle>
        <CardDescription>Government expenditure by function, in billions of NOK.</CardDescription>
      </CardHeader>
      <CardContent className="w-full pr-4" style={{ height: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                >
                  <Label value="NOK (billions)" offset={0} position="insideBottom" style={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                </XAxis>
                <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 120 : 200}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, width: isMobile ? 110 : 190 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" name="Expenditure" radius={[0, 4, 4, 0]}>
                   <LabelList
                        dataKey="value"
                        position="insideRight"
                        offset={8}
                        className="fill-background font-semibold"
                        formatter={(value: number) => value.toLocaleString()}
                        style={{ fontSize: 12 }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
