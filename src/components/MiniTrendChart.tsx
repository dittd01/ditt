
'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import type { Topic } from '@/lib/types';
import { parseISO } from 'date-fns';

interface MiniTrendChartProps {
  topic: Topic;
}

export function MiniTrendChart({ topic }: MiniTrendChartProps) {
  const chartData = useMemo(() => {
    if (!topic.history || topic.history.length === 0) {
      return [{ yes_percent: 50, no_percent: 50 }]; // Default if no history
    }

    const processedHistory = topic.history.map((hist) => {
      const yesVotes = Number(hist.yes) || 0;
      const noVotes = Number(hist.no) || 0;
      const total = yesVotes + noVotes;
      
      if (total > 0) {
        return { 
          yes_percent: (yesVotes / total) * 100,
        };
      }
      return { yes_percent: 50 };
    });

    const currentYesVotes = topic.votes.yes || 0;
    const currentNoVotes = topic.votes.no || 0;
    const currentTotal = currentYesVotes + currentNoVotes;
    const currentYesPercentage = currentTotal > 0 ? (currentYesVotes / currentTotal) * 100 : 50;

    return [...processedHistory, { yes_percent: currentYesPercentage }];

  }, [topic]);

  const gradientId = `colorYes-${topic.id}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis
          domain={[0, 100]}
          hide={true}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
            cursor={false}
            contentStyle={{ display: 'none' }}
        />
        <Area
          type="monotone"
          dataKey="yes_percent"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
