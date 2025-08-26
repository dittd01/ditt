

'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Label } from 'recharts';
import type { ExpenditureByFunction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ExpenditureBarChartProps {
  data?: ExpenditureByFunction[];
  title: string;
  isDrilldown?: boolean;
  onBarClick?: (data: ExpenditureByFunction | null) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].fill }}/>
            <p className="font-bold">{`${payload[0].payload.name}`}</p>
        </div>
        <p className="text-sm text-muted-foreground">{`NOK ${payload[0].value.toLocaleString()} bn (${payload[0].payload.percentage.toFixed(1)}%)`}</p>
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

export function ExpenditureBarChart({ data, title, onBarClick, isDrilldown = false }: ExpenditureBarChartProps) {
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
    if (colors.length === 0 || !data) return { chartData: [], totalExpenditure: 0 };
    
    const total = data.reduce((sum, item) => sum + item.amountBnNOK, 0);

    const expenditureData = data
      .map((item, index) => ({
        ...item,
        name: lang === 'nb' ? item.name_no : item.name_en,
        value: item.amountBnNOK,
        percentage: total > 0 ? (item.amountBnNOK / total) * 100 : 0,
        fill: colors[index % colors.length],
      }))
      .sort((a,b) => a.value - b.value);
    
    return { chartData: expenditureData, totalExpenditure: total };
  }, [data, lang, colors]);
  
  if (!data) {
     if (isDrilldown) {
       return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                 <CardDescription>Click a category in the chart above to see a detailed breakdown.</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
                 <p className="text-muted-foreground">No category selected</p>
            </CardContent>
        </Card>
       )
     }
     return null;
  }
  
  const chartHeight = chartData.length * (isMobile ? 36 : 40) + 60;
  const cardTitle = isDrilldown ? title : `${title} - Total: ${totalExpenditure.toLocaleString()} bn NOK`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        {!isDrilldown && <CardDescription>Government expenditure by function, in billions of NOK.</CardDescription>}
      </CardHeader>
      <CardContent className="w-full pr-4" style={{ height: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 10, bottom: 20 }}
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
                <Bar dataKey="value" name="Expenditure" radius={[0, 4, 4, 0]} onClick={onBarClick} className={cn(onBarClick && "cursor-pointer")}>
                   <LabelList
                        dataKey="value"
                        position="insideRight"
                        offset={8}
                        className="fill-background font-semibold"
                        formatter={(value: number) => value.toLocaleString()}
                        style={{ fontSize: 12 }}
                    />
                    <LabelList 
                        dataKey="percentage"
                        position="right"
                        offset={8}
                        className="fill-muted-foreground"
                        formatter={(value: number) => `(${value.toFixed(1)}%)`}
                        style={{ fontSize: 12 }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
