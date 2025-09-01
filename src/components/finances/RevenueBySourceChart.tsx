

'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Label } from 'recharts';
import { trackEvent } from '@/lib/analytics';
import type { GeneralGovernmentRevenueBreakdown } from '@/lib/types';

const formatBnNOK = (value: number) => {
    return new Intl.NumberFormat('nb-NO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const oilRevenue = payload.find(p => p.dataKey === 'oilRevenueBn');
    const otherRevenue = payload.find(p => p.dataKey === 'otherRevenueBn');
    const total = oilRevenue.value + otherRevenue.value;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
        <p className="font-bold mb-2">{label}</p>
        <div className="space-y-1">
            {oilRevenue && <p>Oil Revenue: {formatBnNOK(oilRevenue.value)} bn NOK</p>}
            {otherRevenue && <p>Other Revenue: {formatBnNOK(otherRevenue.value)} bn NOK</p>}
            <p className="font-semibold pt-1 mt-1 border-t">Total: {formatBnNOK(total)} bn NOK</p>
        </div>
      </div>
    );
  }
  return null;
};

interface RevenueBySourceChartProps {
    data: GeneralGovernmentRevenueBreakdown[];
}

export function RevenueBySourceChart({ data }: RevenueBySourceChartProps) {
    const [lang, setLang] = useState('en');
    
    useEffect(() => {
        const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
        setLang(selectedLang);
        trackEvent('fiscal_chart_view', { chart: 'revenue_by_source' });
    }, []);

    const chartData = useMemo(() => {
        return data.map(item => ({
            name: item.year.toString(),
            ...item
        })).sort((a,b) => a.year - b.year);
    }, [data]);

    const title = lang === 'nb' ? 'Inntekter etter kilde (Alle Offentlige Nivåer)' : 'General Government Revenue by Source';
    const description = lang === 'nb' ? 'Petroleumsinntekter vs. andre inntekter. Kilde: SSB. Tall i milliarder kroner.' : 'Oil/Petroleum vs. Other Revenue. Includes state, municipalities, social security. Source: SSB. Figures in billions NOK.';

    const valueFormatter = (value: number) => {
        if (value < 200) return '';
        return `${formatBnNOK(value)} bn`;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full pr-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'hsl(var(--muted))' }}
                        />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Bar dataKey="otherRevenueBn" stackId="a" name="Other Revenue" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]}>
                             <LabelList dataKey="otherRevenueBn" position="center" className="fill-primary-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                        </Bar>
                        <Bar dataKey="oilRevenueBn" stackId="a" name="Oil Revenue" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="oilRevenueBn" position="center" className="fill-primary-foreground font-semibold" style={{ fontSize: 12 }} formatter={valueFormatter} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
