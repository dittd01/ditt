
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { Topic } from '@/lib/types';
import { parties } from '@/lib/election-data';

type ElectionChartProps = {
  topic: Topic;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const partyId = payload[0].payload.id;
    const party = parties.find(p => p.id === partyId);
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

  const chartData = parties
    .map(party => ({
      id: party.id,
      name: party.name,
      abbreviation: party.abbreviation,
      votes: votes[party.id] || 0,
      percentage: totalVotes > 0 ? ((votes[party.id] || 0) / totalVotes) * 100 : 0,
      fill: party.color,
    }))
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="relative aspect-video w-full">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 50, left: 5, bottom: 5 }} 
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="abbreviation"
            width={40}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
          <Bar dataKey="votes" radius={[4, 4, 4, 4]}>
            <LabelList
              dataKey="percentage"
              position="right"
              offset={5}
              className="text-sm font-medium"
              formatter={(value: number) => {
                if (value === 0) return '';
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
