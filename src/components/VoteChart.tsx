
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
} from 'recharts';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseISO, format } from 'date-fns';

type VoteChartProps = {
  topic: Topic;
  showControls?: boolean;
};

export function VoteChart({ topic, showControls = true }: VoteChartProps) {
  const [timeframe, setTimeframe] = useState('All');
  const [view, setView] = useState<'count' | 'percentage'>('percentage');

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

  const ChartComponent = () => (
    <div className="h-[300px] w-full">
        <ResponsiveContainer>
            <LineChart data={chartData}>
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
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Percentage']}
                />
                <Legend />
                {topic.options.filter(opt => opt.id !== 'abstain').map((option) => (
                    <Line
                        key={option.id}
                        type="monotone"
                        dataKey={`${option.id}_percent`}
                        name={option.label}
                        stroke={option.color}
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );

  if (!showControls) {
    return <ChartComponent />;
  }

  return (
    <Card>
       <Tabs defaultValue={view} onValueChange={(v) => setView(v as 'count' | 'percentage')}>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Vote History</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
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
            </div>
            </div>
        </CardHeader>
        <CardContent>
             <ChartComponent />
        </CardContent>
      </Tabs>
    </Card>
  );
}
