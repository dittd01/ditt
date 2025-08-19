
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

const CustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const { payload } = props; // The full data object for the bar
    const voteCount = payload.votes;
    const percentage = payload.percentage;

    if (width < 40) { // Don't render label if the bar is too small
        return null;
    }
    
    return (
        <text 
            x={x + width + 5} 
            y={y + height / 2} 
            fill="hsl(var(--foreground))"
            className="text-sm font-medium"
            textAnchor="start" 
            dominantBaseline="middle"
        >
            {`${percentage.toFixed(1)}% (${voteCount.toLocaleString()})`}
        </text>
    );
};


export function ElectionChart({ topic }: ElectionChartProps) {
  const { votes, totalVotes, options } = topic;

  const chartData = options
    .map(option => ({
      id: option.id,
      name: option.label,
      votes: votes[option.id] || 0,
      percentage: totalVotes > 0 ? ((votes[option.id] || 0) / totalVotes) * 100 : 0,
      fill: option.color,
    }))
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="relative aspect-video w-full">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 100, left: 5, bottom: 5 }} // Increased right margin for labels
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={40}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
          <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
             <LabelList
                content={<CustomizedLabel />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
