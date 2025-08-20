
'use client';

import { useMemo } from 'react';
import type { Argument } from '@/lib/types';
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip, Legend, PolarAngleAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ArgumentChartProps {
  args: Argument[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm max-w-xs">
        <p className="text-sm font-bold text-foreground">{data.name}</p>
        <p className="text-xs text-muted-foreground truncate">{data.text}</p>
        <p className="text-xs text-muted-foreground">Upvotes: {data.uv}</p>
      </div>
    );
  }
  return null;
};

export function ArgumentChart({ args }: ArgumentChartProps) {
  const chartData = useMemo(() => {
    if (!args || args.length === 0) return [];
    
    // Sort arguments by upvotes descending to place most upvoted ones closer to the center in the chart
    const sortedArgs = [...args].sort((a, b) => b.upvotes - a.upvotes);

    return sortedArgs.map((arg, index) => ({
      name: `Argument by ${arg.author.name}`,
      text: arg.text,
      uv: arg.upvotes,
      pv: 100, // Background value
      fill: arg.side === 'for' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))',
    }));
  }, [args]);

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Debate Visualization</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Not enough data to display chart.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Visualization</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="10%"
            outerRadius="80%"
            barSize={10}
            data={chartData}
            startAngle={180}
            endAngle={-180}
          >
            <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
            />
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="uv"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
