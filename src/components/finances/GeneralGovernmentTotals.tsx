

'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Label, ReferenceLine } from 'recharts';
import { generalGovAnnual, generalGovRevenueBreakdown } from '@/lib/finance-data';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/lib/analytics';

const formatBnNOK = (value: number) => {
    return new Intl.NumberFormat('nb-NO', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const oilRevenue = payload.find(p => p.dataKey === 'oilRevenueBn');
    const otherRevenue = payload.find(p => p.dataKey === 'otherRevenueBn');
    const expenditure = payload.find(p => p.dataKey === 'expenditureBn');
    
    const totalRevenue = (oilRevenue?.value || 0) + (otherRevenue?.value || 0);
    const totalExpenditure = expenditure?.value || 0;
    const surplus = totalRevenue - totalExpenditure;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
        <p className="font-bold mb-2">{label}</p>
        <div className="space-y-1">
            {oilRevenue && otherRevenue && <p>Total Revenue: {formatBnNOK(totalRevenue)} bn NOK</p>}
            <div className="pl-2">
                {oilRevenue && <p className="text-xs">Oil: {formatBnNOK(oilRevenue.value)} bn NOK</p>}
                {otherRevenue && <p className="text-xs">Other: {formatBnNOK(otherRevenue.value)} bn NOK</p>}
            </div>
            {expenditure && <p>Expenditure: {formatBnNOK(expenditure.value)} bn NOK</p>}
            <p className="font-semibold pt-1 mt-1 border-t">Surplus: {formatBnNOK(surplus)} bn NOK</p>
        </div>
      </div>
    );
  }
  return null;
};

export function GeneralGovernmentTotals() {
    const [lang, setLang] = useState('en');
    
    useEffect(() => {
        const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
        setLang(selectedLang);
        trackEvent('fiscal_chart_view', { chart: 'general_gov_totals' });
    }, []);

    const chartData = useMemo(() => {
        const revenueBreakdownMap = new Map(generalGovRevenueBreakdown.map(item => [item.year, item]));

        return generalGovAnnual.map(item => {
            const breakdown = revenueBreakdownMap.get(item.year);
            return {
                name: item.year.toString(),
                oilRevenueBn: breakdown?.oilRevenueBn || 0,
                otherRevenueBn: breakdown?.otherRevenueBn || 0,
                expenditureBn: item.expenditureBn,
                surplusBn: item.surplusBn,
            };
        }).sort((a,b) => parseInt(a.name) - parseInt(b.name));
    }, []);

    const title = lang === 'nb' ? 'Inntekter vs. Utgifter (Alle Offentlige Nivåer)' : 'General Government Revenue vs. Expenditure (All Levels)';
    const description = lang === 'nb' ? 'Inkluderer stat, kommuner og trygdefond. Kilde: SSB. Tall i milliarder kroner.' : 'Includes state, municipalities, and social security funds. Source: SSB. Figures in billions of NOK.';

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
                        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                        
                        <Bar dataKey="otherRevenueBn" name="Other Revenue" stackId="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="oilRevenueBn" name="Oil Revenue" stackId="revenue" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        
                        <Bar dataKey="expenditureBn" name="Expenditure" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                         {chartData.map((entry, index) => (
                             <LabelList
                                key={index}
                                dataKey="surplusBn"
                                position="top"
                                offset={10}
                                content={({ x, y, width, value }) => {
                                    // Find the corresponding expenditure bar to position the label correctly
                                    const expenditureBarX = x;
                                    if (expenditureBarX && y && width && value === entry.surplusBn) {
                                       return (
                                        <g transform={`translate(${expenditureBarX + width * 1.5}, ${y})`}>
                                            <foreignObject x={-50} y={-22} width={100} height={20}>
                                                <div style={{ display: 'inline-block', textAlign: 'center', fontSize: '11px' }}>
                                                    <Badge variant="secondary" className="px-1.5 py-0.5">
                                                        Surplus: +{formatBnNOK(Number(value))}
                                                    </Badge>
                                                </div>
                                            </foreignObject>
                                        </g>
                                       )
                                    }
                                    return null;
                                }}
                                data={ [chartData[index]] }
                            />
                         ))}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
