
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Argument } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface ArgumentChartProps {
  args: Argument[];
  topicQuestion: string;
}

interface HierarchyNode extends d3.HierarchyNode<Argument> {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

const COLORS = {
  for: '#10B981', // green-600
  against: '#EF4444', // red-500
  neutral: '#64748B', // slate-500
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload.data as Argument;
        if (!data || !data.author) return null;

        const color = data.side === 'for' ? COLORS.for : COLORS.against;

        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm max-w-xs text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <p className="font-bold text-foreground">Argument by {data.author.name}</p>
                </div>
                <p className="text-muted-foreground line-clamp-3">{data.text}</p>
                <p className="text-muted-foreground mt-1">Upvotes: {data.upvotes}</p>
            </div>
        );
    }
    return null;
};

export function ArgumentChart({ args, topicQuestion }: ArgumentChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isMobile = useIsMobile();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        }
    });
    if (svgRef.current?.parentElement) {
        resizeObserver.observe(svgRef.current.parentElement);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const { rootNode, allNodes } = useMemo(() => {
    if (!args || args.length === 0 || dimensions.width === 0) {
        return { rootNode: null, allNodes: [] };
    }

    const topicRoot: Argument = {
        id: 'root',
        topicId: args[0]?.topicId || '',
        parentId: null,
        side: 'for', // neutral, but needs a value
        author: { name: 'Topic' },
        text: topicQuestion,
        upvotes: 0, downvotes: 0, replyCount: 0, createdAt: ''
    };
    
    const stratifiedData = d3.stratify<Argument>()
        .id(d => d.id)
        .parentId(d => d.parentId === null ? 'root' : d.parentId)
        ([topicRoot, ...args]);
    
    stratifiedData.sum(d => (d.id === 'root' ? 0 : 1)); // Give each argument equal weight for now

    const radius = Math.min(dimensions.width, dimensions.height) / 2;
    
    const partition = d3.partition<Argument>()
        .size([2 * Math.PI, radius])
        .padding(0.005);
        
    const root = partition(stratifiedData) as HierarchyNode;

    return { rootNode: root, allNodes: root.descendants() as HierarchyNode[] };
  }, [args, topicQuestion, dimensions]);

  const arcGenerator = d3.arc<HierarchyNode>()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);

  if (!rootNode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debate Visualization</CardTitle>
          <CardDescription>A radial map of the argument structure.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Not enough data to display chart.</p>
        </CardContent>
      </Card>
    );
  }

  const getColor = (d: HierarchyNode) => {
    if (d.depth === 0) return COLORS.neutral;
    const voteScore = (d.data.upvotes || 0) - (d.data.downvotes || 0);
    const baseColor = d.data.side === 'for' ? COLORS.for : COLORS.against;
    // Simple saturation effect - can be refined
    const saturation = 50 + Math.min(50, Math.log2(Math.max(1, d.data.upvotes + 1)) * 10);
    const lightness = 60 - Math.min(20, Math.log2(Math.max(1, d.data.downvotes + 1)) * 5);
    
    // d3-color could be used for more precise control if added as a dependency
    return d3.hsl(baseColor).s(saturation/100).l(lightness/100).toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Visualization</CardTitle>
        <CardDescription>A radial map of the argument structure. Inner rings are top-level arguments.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] md:h-[500px] w-full p-0">
        <svg ref={svgRef} width="100%" height="100%">
          <g transform={`translate(${dimensions.width / 2},${dimensions.height / 2})`}>
            {allNodes.map((d, i) => (
                <path
                    key={d.data.id || i}
                    d={arcGenerator(d) || ''}
                    fill={getColor(d)}
                    stroke="hsl(var(--card))"
                    strokeWidth={0.5}
                    className="transition-opacity hover:opacity-80"
                >
                    <title>{d.data.author.name}: {d.data.text}</title>
                </path>
            ))}
             <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-card-foreground font-semibold text-xs md:text-sm pointer-events-none"
             >
                Thesis
             </text>
          </g>
        </svg>
      </CardContent>
    </Card>
  );
}
