
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Argument } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  for: '#10B981', // green-500
  against: '#EF4444', // red-500
  neutral: '#64748B', // slate-500
};

interface TooltipData {
    x: number;
    y: number;
    visible: boolean;
    argument: Argument | null;
}

export function ArgumentChart({ args, topicQuestion }: ArgumentChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, visible: false, argument: null });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width } = entries[0].contentRect;
            // Keep height proportional or fixed for better sunburst aspect ratio
            const height = Math.min(width, 500); 
            setDimensions({ width, height });
        }
    });
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const rootNode = useMemo(() => {
    if (!args || args.length === 0 || dimensions.width === 0) {
        return null;
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
    
    // Give each node equal weight for equal slices
    stratifiedData.sum(d => (d.id === 'root' ? 0 : 1));

    const radius = Math.min(dimensions.width, dimensions.height) / 2;
    
    const partition = d3.partition<Argument>()
        .size([2 * Math.PI, radius])
        .padding(0.005);
        
    return partition(stratifiedData) as HierarchyNode;

  }, [args, topicQuestion, dimensions]);

  const allNodes = useMemo(() => rootNode ? rootNode.descendants() as HierarchyNode[] : [], [rootNode]);

  const arcGenerator = d3.arc<HierarchyNode>()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(0.01)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);

  const handleMouseOver = (event: React.MouseEvent<SVGPathElement>, d: HierarchyNode) => {
    if (d.depth === 0) return;
    d3.select(event.currentTarget).attr('stroke', 'hsl(var(--primary))').attr('stroke-width', 2);
    setTooltip({
        x: event.clientX,
        y: event.clientY,
        visible: true,
        argument: d.data
    });
  };

  const handleMouseLeave = (event: React.MouseEvent<SVGPathElement>) => {
     d3.select(event.currentTarget).attr('stroke', 'hsl(var(--card))').attr('stroke-width', 0.5);
     setTooltip({ x: 0, y: 0, visible: false, argument: null });
  };
  
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
    
    const baseColor = d.data.side === 'for' ? COLORS.for : COLORS.against;
    const hslColor = d3.hsl(baseColor);

    // Adjust saturation and lightness based on votes
    // More upvotes -> more saturated
    // More downvotes -> less light (darker)
    const saturation = 0.5 + Math.min(0.5, Math.log10(Math.max(1, d.data.upvotes + 1)) * 0.2);
    const lightness = 0.6 - Math.min(0.2, Math.log10(Math.max(1, d.data.downvotes + 1)) * 0.1);
    
    hslColor.s = saturation;
    hslColor.l = lightness;

    return hslColor.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Visualization</CardTitle>
        <CardDescription>A radial map of the argument structure. Inner rings are top-level arguments.</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef} className="h-[500px] w-full p-0 relative">
        <svg ref={svgRef} width="100%" height="100%">
          <g transform={`translate(${dimensions.width / 2},${dimensions.height / 2})`}>
            {allNodes.map((d, i) => (
                <path
                    key={d.data.id || i}
                    d={arcGenerator(d) || ''}
                    fill={getColor(d)}
                    stroke="hsl(var(--card))"
                    strokeWidth={0.5}
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                    onMouseOver={(e) => handleMouseOver(e, d)}
                    onMouseLeave={handleMouseLeave}
                />
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
        {tooltip.visible && tooltip.argument && (
             <div 
                className="absolute rounded-lg border bg-popover p-2 shadow-lg max-w-xs text-xs pointer-events-none transition-opacity"
                style={{
                    left: tooltip.x + 10,
                    top: tooltip.y + 10,
                    transform: `translate(-${tooltip.x > window.innerWidth / 2 ? '100%' : '0'}, -${tooltip.y > window.innerHeight / 2 ? '100%' : '0'})`,
                    opacity: tooltip.visible ? 1 : 0,
                }}
            >
                {tooltip.argument.id !== 'root' && tooltip.argument.author && (
                    <>
                        <p className="font-bold text-popover-foreground">Argument by {tooltip.argument.author.name}</p>
                        <p className="text-muted-foreground line-clamp-4 mt-1">{tooltip.argument.text}</p>
                        <p className="text-muted-foreground mt-1">Upvotes: {tooltip.argument.upvotes}</p>
                    </>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
