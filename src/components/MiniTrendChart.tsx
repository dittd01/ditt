
'use client';

import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import type { Topic } from '@/lib/types';
import { useTheme } from 'next-themes';

interface MiniTrendChartProps {
  topic: Topic;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const yesData = payload.find((p: any) => p.dataKey === 'yes_percent');
    const noData = payload.find((p: any) => p.dataKey === 'no_percent');

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1 text-xs">
          {yesData && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: yesData.stroke }}/>
              <p className="text-muted-foreground">Yes: <span className="font-medium text-foreground">{yesData.value.toFixed(1)}%</span></p>
            </div>
          )}
          {noData && (
             <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: noData.stroke }}/>
              <p className="text-muted-foreground">No: <span className="font-medium text-foreground">{noData.value.toFixed(1)}%</span></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};


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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
      >
        <YAxis domain={[0, 100]} hide={true} />
        <XAxis dataKey="date" hide={true} />
        <Tooltip
            cursor={{ stroke: 'hsl(var(--foreground))', strokeDasharray: '3 3' }}
            contentStyle={{ display: 'none' }}
            wrapperStyle={{ zIndex: 50 }}
            content={<CustomTooltip />}
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
