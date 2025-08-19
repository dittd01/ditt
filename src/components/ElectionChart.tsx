
'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { Topic } from '@/lib/types';
import { parties } from '@/lib/election-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type ElectionChartProps = {
  topic: Topic;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const party = parties.find(p => p.abbreviation === label);
    const percentage = payload[0].payload.percentage;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-[auto,1fr] items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].fill }}/>
            <p className="text-sm font-bold text-foreground">{party?.name}</p>
        </div>
        <p className="text-sm text-muted-foreground">{`${payload[0].value.toLocaleString()} votes (${percentage.toFixed(1)}%)`}</p>
      </div>
    );
  }

  return null;
};


export function ElectionChart({ topic }: ElectionChartProps) {
  const { votes, totalVotes } = topic;
  const isMobile = useIsMobile();

  const chartData = useMemo(() => {
    return parties
      .map(party => ({
        id: party.id,
        name: party.name,
        abbreviation: party.abbreviation,
        votes: votes[party.id] || 0,
        percentage: totalVotes > 0 ? ((votes[party.id] || 0) / totalVotes) * 100 : 0,
        fill: party.color,
      }))
      .sort((a, b) => b.votes - a.votes);
  }, [votes, totalVotes]);

  const tickFontSize = isMobile ? '0.75rem' : '1.0rem';

  return (
    <div className={cn("relative w-full", isMobile ? "h-[400px]" : "aspect-video")}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 10, left: 10, bottom: 40 }} 
          barCategoryGap="10%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="abbreviation"
            angle={-90}
            textAnchor="end"
            height={50}
            interval={0}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: tickFontSize }}
            // Styling for the X-axis ticks (party abbreviations)
          />
          <YAxis
            // Formatter for Y-axis ticks, showing values in thousands with a 'k' suffix
            tickFormatter={(value) => `${value / 1000}k`}
            width={40}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: tickFontSize }}
            // Styling for the Y-axis ticks (vote counts)
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
          <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="percentage"
              position="top"
              offset={isMobile ? 10 : 5}
              angle={isMobile ? -90 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              className="text-[10px] md:text-[14px] font-medium"
              formatter={(value: number) => {
                return `${value.toFixed(1)}%`;
              }}
              style={{ fill: 'hsl(var(--foreground))' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
