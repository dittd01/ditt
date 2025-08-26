
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Label } from 'recharts';
import type { FinanceData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Use the existing theme's chart colors for a vibrant but consistent palette.
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(340, 82%, 52%)',
  'hsl(48, 96%, 50%)',
  'hsl(198, 93%, 48%)',
  'hsl(270, 75%, 60%)',
  'hsl(150, 65%, 45%)',
];

export function ExpenditureBarChart({ data }: ExpenditureBarChartProps) {
  const [lang, setLang] = useState('en');
  const isMobile = useIsMobile();

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

  const chartData = useMemo(() => {
    return data.expenditure
      .map((item, index) => ({
        name: lang === 'nb' ? item.name_no : item.name_en,
        value: item.amountBnNOK,
        fill: COLORS[index % COLORS.length],
      }))
      // Why: For a horizontal chart, sorting ascending (smallest bar at top) is often more readable.
      .sort((a,b) => a.value - b.value);
  }, [data, lang]);
  
  // Why: Dynamic height based on number of items ensures the chart is not cramped on any screen size.
  const chartHeight = chartData.length * (isMobile ? 36 : 40) + 40;

  return (
    <Card>
      <CardHeader>
        <CardTitle>How Your Tax Money Is Spent ({data.year})</CardTitle>
        <CardDescription>Government expenditure by function, in billions of NOK.</CardDescription>
      </CardHeader>
      <CardContent className="w-full pr-4" style={{ height: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                >
                  <Label value="NOK (billions)" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 120 : 200}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, width: isMobile ? 110 : 190 }}
                    // Why: Using a custom tick component allows for advanced text wrapping or truncation if needed.
                    // For now, the increased width from the horizontal layout is sufficient.
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" name="Expenditure" radius={[0, 4, 4, 0]}>
                   {/* Why: Placing the label inside the bar makes the value immediately clear without
                       needing to reference the axis, improving scannability. */}
                   <LabelList
                        dataKey="value"
                        position="insideRight"
                        offset={8}
                        className="fill-background font-semibold"
                        formatter={(value: number) => value.toLocaleString()}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
