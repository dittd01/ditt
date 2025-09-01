
'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import financeDetails from '@/lib/db/gov-finance-detail.json';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/lib/analytics';
import { LabelProps } from 'recharts';

const revenueKeys = [
  'taxes_on_income_wealth',
  'taxes_on_goods_services',
  'property_income_revenue',
  'social_security_contributions',
  'admin_fees_sales',
  'current_transfers_revenue',
  'capital_taxes',
];

const expenseKeys = [
  'social_benefits_in_cash',
  'compensation_of_employees',
  'use_of_goods_services',
  'consumption_of_fixed_capital',
  'current_transfers_expense',
  'subsidies',
  'social_benefits_in_kind',
  'net_acquisitions_non_financial_assets',
  'property_expense',
  'capital_transfers',
];


const generateShades = (h: number, s: number, isDark: boolean) => {
  const baseL = isDark ? 60 : 30;
  const step = isDark ? -4 : 6;
  return Array.from({ length: 12 }, (_, i) => `hsl(${h}, ${s}%, ${baseL + i * step}%)`);
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const revenueItems = payload.filter((p: any) => revenueKeys.includes(p.dataKey.replace('_pct', '')));
    const expenseItems = payload.filter((p: any) => expenseKeys.includes(p.dataKey.replace('_pct', '')));
    
    // Calculate totals from the original data payload for the hovered year
    const yearData = payload[0].payload;
    const totalRevenue = yearData.totalRevenue;
    const totalExpense = yearData.totalExpenditure;

    const formatBn = (value: number) => `${(value / 1000).toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} bn NOK`;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm text-sm max-w-sm">
        <p className="font-bold mb-2 text-lg">{label}</p>
        <div className="space-y-2">
            {revenueItems.length > 0 && (
                <div>
                     <p className="font-semibold text-green-600">Revenue: {formatBn(totalRevenue)}</p>
                     <div className="pl-2 border-l-2 border-green-200 ml-1 space-y-1 py-1">
                        {revenueItems.sort((a,b) => b.payload[a.dataKey.replace('_pct','')] - a.payload[b.dataKey.replace('_pct','')]).map((item: any) => (
                            <p key={item.dataKey} className="text-xs text-muted-foreground">{item.name}: {formatBn(item.payload[item.dataKey.replace('_pct','')])}</p>
                        ))}
                     </div>
                </div>
            )}
            {expenseItems.length > 0 && (
                <div>
                     <p className="font-semibold text-red-600">Expenditure: {formatBn(totalExpense)}</p>
                     <div className="pl-2 border-l-2 border-red-200 ml-1 space-y-1 py-1">
                        {expenseItems.sort((a,b) => b.payload[a.dataKey.replace('_pct','')] - a.payload[b.dataKey.replace('_pct','')]).map((item: any) => (
                             <p key={item.dataKey} className="text-xs text-muted-foreground">{item.name}: {formatBn(item.payload[item.dataKey.replace('_pct','')])}</p>
                        ))}
                     </div>
                </div>
            )}
        </div>
        <p className="font-bold pt-2 mt-2 border-t">Surplus: {formatBn(totalRevenue - totalExpense)}</p>
      </div>
    );
  }
  return null;
};

const TotalLabel = (props: LabelProps & { total: number }) => {
    const { x, y, width, value, total } = props;
    
    if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || total === 0) {
        return null;
    }

    const formattedTotal = `${new Intl.NumberFormat('nb-NO').format(Math.round(total / 1000))} bn`;
    
    return (
        <text 
            x={x + width / 2} 
            y={y} 
            fill="hsl(var(--foreground))" 
            textAnchor="middle"
            dominantBaseline="text-after-edge"
            dy={-4}
            fontSize={12}
            fontWeight="600"
        >
            {formattedTotal}
        </text>
    );
};


export function DetailedFinanceChart() {
    const { resolvedTheme } = useTheme();
    const isMobile = useIsMobile();
    const [view, setView] = React.useState<'amount' | 'percentage'>('amount');
    const [lang, setLang] = React.useState('en');
    
    React.useEffect(() => {
        setLang(localStorage.getItem('selectedLanguage') || 'en');
        trackEvent('fiscal_chart_view', { chart: 'detailed_finance_chart' });
    }, []);

    const chartData = React.useMemo(() => {
        return financeDetails.years.map(yearData => {
            const totalRevenue = revenueKeys.reduce((sum, key) => sum + (yearData[key as keyof typeof yearData] as number), 0);
            const totalExpenditure = expenseKeys.reduce((sum, key) => sum + (yearData[key as keyof typeof yearData] as number), 0);

            const revenuePercentages = Object.fromEntries(
                revenueKeys.map(key => [`${key}_pct`, totalRevenue > 0 ? (yearData[key as keyof typeof yearData] as number / totalRevenue) * 100 : 0])
            );
            const expensePercentages = Object.fromEntries(
                expenseKeys.map(key => [`${key}_pct`, totalExpenditure > 0 ? (yearData[key as keyof typeof yearData] as number / totalExpenditure) * 100 : 0])
            );
            
            return {
                year: yearData.year,
                totalRevenue,
                totalExpenditure,
                ...yearData,
                ...revenuePercentages,
                ...expensePercentages,
            };
        });
    }, []);

    const greenShades = generateShades(142, 71, resolvedTheme === 'dark');
    const redShades = generateShades(0, 84, resolvedTheme === 'dark');

    const labels = financeDetails.labels;

    const valueFormatter = (value: number) => {
        const threshold = view === 'amount' ? 200000 : 10;
        if (value < threshold) return '';
        return view === 'amount'
            ? new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(Math.round(value / 1000))
            : `${value.toFixed(0)}%`;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <CardTitle>{lang === 'nb' ? 'Detaljert oversikt over offentlige finanser' : 'Detailed General Government Finances'}</CardTitle>
                        <CardDescription>{lang === 'nb' ? 'Årlig inntekt og utgift brutt ned etter type. Tall i milliarder NOK.' : 'Annual revenue and expenditure by type. Figures in NOK billion.'}</CardDescription>
                    </div>
                    <Select value={view} onValueChange={(v) => setView(v as any)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="amount">Show Amounts</SelectItem>
                            <SelectItem value="percentage">Show Percentage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="h-[500px] w-full">
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }} barGap={20}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis 
                            tick={{ fontSize: 12 }} 
                            tickFormatter={(value) => view === 'amount' ? `${new Intl.NumberFormat('nb-NO').format(value / 1000)} bn` : `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip />}/>
                        <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}/>
                        
                        {/* Revenue Bars */}
                        {revenueKeys.map((key, index) => (
                            <Bar 
                                key={key} 
                                dataKey={view === 'amount' ? key : `${key}_pct`} 
                                stackId="revenue" 
                                name={labels[key as keyof typeof labels][lang as 'en' | 'nb']}
                                fill={greenShades[index]} 
                                radius={index === revenueKeys.length - 1 ? [4, 4, 0, 0] : [0,0,0,0]}
                            >
                                <LabelList 
                                    dataKey={view === 'amount' ? key : `${key}_pct`} 
                                    position="center" 
                                    className="fill-primary-foreground font-semibold"
                                    style={{ fontSize: 10 }}
                                    formatter={valueFormatter}
                                />
                            </Bar>
                        ))}
                        
                        {/* Expense Bars */}
                        {expenseKeys.map((key, index) => (
                             <Bar 
                                key={key} 
                                dataKey={view === 'amount' ? key : `${key}_pct`} 
                                stackId="expense"
                                name={labels[key as keyof typeof labels][lang as 'en' | 'nb']}
                                fill={redShades[index]} 
                                radius={index === expenseKeys.length -1 ? [4, 4, 0, 0] : [0,0,0,0]}
                            >
                                <LabelList 
                                    dataKey={view === 'amount' ? key : `${key}_pct`} 
                                    position="center" 
                                    className="fill-destructive-foreground font-semibold"
                                    style={{ fontSize: 10 }}
                                    formatter={valueFormatter}
                                />
                            </Bar>
                        ))}
                        
                        {/* Transparent bars for total labels */}
                        {view === 'amount' && (
                            <>
                                <Bar dataKey="totalRevenue" stackId="revenue" fill="transparent" isAnimationActive={false}>
                                    <LabelList
                                        dataKey="totalRevenue"
                                        content={(props) => <TotalLabel {...props} total={props.value as number} />}
                                    />
                                </Bar>
                                 <Bar dataKey="totalExpenditure" stackId="expense" fill="transparent" isAnimationActive={false}>
                                    <LabelList
                                        dataKey="totalExpenditure"
                                        content={(props) => <TotalLabel {...props} total={props.value as number} />}
                                    />
                                </Bar>
                            </>
                        )}

                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
