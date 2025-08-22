
'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Topic } from '@/lib/types';
import { useTheme } from 'next-themes';

interface MiniTrendChartProps {
  topic: Topic;
}

export function MiniTrendChart({ topic }: MiniTrendChartProps) {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    if (!topic.history || topic.history.length === 0) {
      return [{ yes_percent: 50, no_percent: 50 }];
    }

    const processedHistory = topic.history.map((hist) => {
      const yesVotes = Number(hist.yes) || 0;
      const noVotes = Number(hist.no) || 0;
      const total = yesVotes + noVotes;
      
      if (total > 0) {
        return { 
          yes_percent: (yesVotes / total) * 100,
          no_percent: (noVotes / total) * 100,
        };
      }
      return { yes_percent: 50, no_percent: 50 };
    });

    const currentYesVotes = topic.votes.yes || 0;
    const currentNoVotes = topic.votes.no || 0;
    const currentTotal = currentYesVotes + currentNoVotes;
    const currentYesPercentage = currentTotal > 0 ? (currentYesVotes / currentTotal) * 100 : 50;
    const currentNoPercentage = currentTotal > 0 ? (currentNoVotes / currentTotal) * 100 : 50;

    return [...processedHistory, { yes_percent: currentYesPercentage, no_percent: currentNoPercentage }];

  }, [topic]);

  const gradientOffset = () => {
    if (chartData.length === 0) return 0.5;
    const lastPoint = chartData[chartData.length - 1];
    const y = lastPoint.yes_percent / 100;
    return y;
  };
  
  const off = gradientOffset();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
      >
        <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
              <stop offset={off} stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
            </linearGradient>
        </defs>
        <YAxis domain={[0, 100]} hide={true} />
        <XAxis dataKey="date" hide={true} />
        <Tooltip
            cursor={false}
            contentStyle={{ display: 'none' }}
        />
        <Area
          type="monotone"
          dataKey="yes_percent"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#splitColor)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
