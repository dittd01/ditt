
'use client';

import { useState } from 'react';
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
  LineChart,
  Line,
} from 'recharts';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type VoteChartProps = {
  topic: Topic;
};

const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const dataPoint = props.payload;

  if (!dataPoint || value === undefined || value === null || !width || !height || value === 0) {
    return null;
  }
  
  const total = dataPoint.total;
  const percentage = total > 0 ? (value / total) * 100 : 0;

  // Don't render label if the bar is too small
  if (percentage < 5 || height < 15) return null;

  return (
    <g>
      <text x={x + width / 2} y={y + height / 2} fill="#FFFFFF" textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium">
        {`${percentage.toFixed(0)}%`}
      </text>
    </g>
  );
};


export function VoteChart({ topic }: VoteChartProps) {
  const [timeframe, setTimeframe] = useState('1W');

  const chartData = topic.history.map(hist => {
    const total = topic.options.reduce((acc, opt) => acc + (Number(hist[opt.id]) || 0), 0);
    const data: {[key: string]: any} = { date: hist.date, total };
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

  return (
    <Card>
       <Tabs defaultValue="count">
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Vote History</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                    <TabsTrigger value="count">Vote Count</TabsTrigger>
                    <TabsTrigger value="percentage">Vote %</TabsTrigger>
                </TabsList>
                <div className="flex gap-1 bg-muted p-1 rounded-md w-full sm:w-auto">
                    {['1H', '1D', 'W', '1M'].map((tf) => (
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
             <TabsContent value="count">
                <div className="h-[300px] w-full">
                <ResponsiveContainer>
                    <BarChart data={chartData}>
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
                        tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        }}
                        formatter={(value: number, name, props) => {
                        const { payload } = props;
                        const total = payload.total;
                        const percentage = total > 0 ? (value / total) * 100 : 0;
                        return `${value.toLocaleString()} votes (${percentage.toFixed(1)}%)`;
                        }}
                    />
                    <Legend />
                    {topic.options.map((option) => (
                        <Bar
                        key={option.id}
                        dataKey={option.id}
                        name={option.label}
                        fill={option.color}
                        stackId="a"
                        radius={[4, 4, 0, 0]}
                        >
                            <LabelList dataKey={option.id} content={<CustomLabel />} />
                        </Bar>
                    ))}
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </TabsContent>
            <TabsContent value="percentage">
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
                            {topic.options.map((option) => (
                                <Line
                                    key={option.id}
                                    type="monotone"
                                    dataKey={`${option.id}_percent`}
                                    name={option.label}
                                    stroke={option.color}
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: option.color }}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
