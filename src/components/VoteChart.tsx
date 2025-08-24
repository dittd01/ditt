

'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
} from 'recharts';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { parseISO, format } from 'date-fns';

type VoteChartProps = {
  topic: Topic;
  showControls?: boolean;
};

export function VoteChart({ topic, showControls = true }: VoteChartProps) {
  const [timeframe, setTimeframe] = useState('All');

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'W':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '1M':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '1Y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'All':
      default:
        startDate = new Date(0); // Epoch start to include all data
        break;
    }
    
    let filteredHistory = showControls ? topic.history.filter(hist => parseISO(hist.date) >= startDate) : topic.history;
    if (filteredHistory.length === 0 && topic.history.length > 0) {
        filteredHistory = [topic.history[0]];
    }

    const processedHistory = filteredHistory.map(hist => {
        const total = topic.options.reduce((acc, opt) => acc + (Number(hist[opt.id]) || 0), 0);
        const data: { [key: string]: any } = { 
            date: format(parseISO(hist.date), 'MMM d, yyyy'),
            total 
        };
        topic.options.forEach(opt => {
            data[opt.id] = hist[opt.id];
            if (total > 0) {
                data[`${opt.id}_percent`] = (Number(hist[opt.id]) / total) * 100;
            } else {
                data[`${opt.id}_percent`] = 0;
            }
        });
        return data;
    });

    const currentData: { [key: string]: any } = {
        date: format(new Date(), 'MMM d, yyyy'),
        total: topic.totalVotes
    };
    topic.options.forEach(option => {
        currentData[option.id] = topic.votes[option.id] || 0;
        if (topic.totalVotes > 0) {
            currentData[`${option.id}_percent`] = ((topic.votes[option.id] || 0) / topic.totalVotes) * 100;
        } else {
            currentData[`${option.id}_percent`] = 0;
        }
    });

    if (processedHistory.length > 0 && processedHistory[processedHistory.length - 1].date === currentData.date) {
        processedHistory[processedHistory.length - 1] = currentData;
        return processedHistory;
    } else {
        return [...processedHistory, currentData];
    }
    
  }, [topic, timeframe, showControls]);
  
  const barChartData = useMemo(() => {
    const yes = topic.votes.yes || 0;
    const no = topic.votes.no || 0;
    const abstain = topic.votes.abstain || 0;
    const total = yes + no + abstain;

    if (total === 0) {
        return [{ name: 'Votes', yes_percent: 0, no_percent: 0, abstain_percent: 0 }];
    }

    return [{
        name: 'Votes',
        yes_percent: (yes / total) * 100,
        no_percent: (no / total) * 100,
        abstain_percent: (abstain / total) * 100,
    }]
  }, [topic.votes]);

  const renderLineChart = (view: 'percentage' | 'count') => (
     <div className="h-[300px] w-full">
        <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={view === 'percentage' ? [0, 100] : undefined}
                    tickFormatter={(value) => view === 'percentage' ? `${value}%` : new Intl.NumberFormat('en-US', {
                        notation: "compact",
                        compactDisplay: "short"
                    }).format(value)}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                     formatter={(value: number, name: string) => [
                        view === 'percentage' ? `${value.toFixed(1)}%` : value.toLocaleString(),
                        name
                    ]}
                />
                <Legend />
                {topic.options.filter(opt => opt.id !== 'abstain').map((option) => (
                    <Line
                        key={option.id}
                        type="monotone"
                        dataKey={view === 'percentage' ? `${option.id}_percent` : option.id}
                        name={option.label}
                        stroke={option.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
  )

  const renderBarChart = () => (
     <div className="h-[120px] w-full">
        <ResponsiveContainer>
            <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                     contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage']}
                />
                <Legend />
                <Bar dataKey="yes_percent" stackId="a" fill="hsl(var(--chart-2))" name="Yes">
                    <LabelList 
                        dataKey="yes_percent" 
                        position="center" 
                        className="fill-primary-foreground font-semibold" 
                        formatter={(value: number) => value > 5 ? `${value.toFixed(0)}%` : ''} 
                    />
                </Bar>
                <Bar dataKey="no_percent" stackId="a" fill="hsl(var(--chart-1))" name="No">
                     <LabelList 
                        dataKey="no_percent" 
                        position="center" 
                        className="fill-destructive-foreground font-semibold" 
                        formatter={(value: number) => value > 5 ? `${value.toFixed(0)}%` : ''} 
                    />
                </Bar>
                <Bar dataKey="abstain_percent" stackId="a" fill="hsl(var(--muted))" name="Abstain">
                     <LabelList 
                        dataKey="abstain_percent" 
                        position="center" 
                        className="fill-muted-foreground font-semibold" 
                        formatter={(value: number) => value > 5 ? `${value.toFixed(0)}%` : ''} 
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  )

  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Vote History</CardTitle>
            {showControls && (
              <div className="flex gap-1 bg-muted p-1 rounded-md w-full sm:w-auto">
                  {['W', '1M', '1Y', 'All'].map((tf) => (
                  <Button
                      key={tf}
                      size="sm"
                      variant={timeframe === tf ? 'default' : 'ghost'}
                      onClick={() => setTimeframe(tf)}
                      className="px-2 h-7 flex-1 sm:flex-initial"
                  >
                      {tf}
                  </Button>
                  ))}
              </div>
            )}
            </div>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
              <CardDescription className="mb-4 text-center font-medium">Percentage Over Time</CardDescription>
              {renderLineChart('percentage')}
            </div>
             <div>
              <CardDescription className="mb-4 text-center font-medium">Vote Count Over Time</CardDescription>
              {renderLineChart('count')}
            </div>
            <div>
              <CardDescription className="mb-4 text-center font-medium">Current Vote Distribution</CardDescription>
              {renderBarChart()}
            </div>
        </CardContent>
    </Card>
  );
}
