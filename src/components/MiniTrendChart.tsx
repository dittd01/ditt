
'use client';

import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import type { Topic } from '@/lib/types';

interface MiniTrendChartProps {
  topic: Topic;
}

export function MiniTrendChart({ topic }: MiniTrendChartProps) {
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


  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <YAxis
          domain={[0, 100]}
          hide={true}
        />
        <Tooltip
            cursor={false}
            contentStyle={{ display: 'none' }}
        />
        <Line
          type="monotone"
          dataKey="yes_percent"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
         <Line
          type="monotone"
          dataKey="no_percent"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
