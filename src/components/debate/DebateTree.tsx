
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Argument } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DebateTreeProps {
  args: Argument[];
  topicQuestion: string;
  lang: 'en' | 'nb';
}

interface HierarchyNode extends d3.HierarchyNode<Argument> {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

const COLORS = {
  for: 'hsl(var(--chart-2))', // Emerald-600
  against: 'hsl(var(--chart-1))', // Rose-600
  neutral: 'hsl(var(--muted-foreground))', // Slate-500
};

const CustomTooltipContent = ({ argument }: { argument: Argument }) => {
    if (!argument || !argument.author) {
        return null;
    }
    return (
        <div className="max-w-xs text-sm">
            <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: argument.side === 'for' ? COLORS.for : COLORS.against }}/>
                <p className="font-semibold text-popover-foreground">{argument.author.name}</p>
            </div>
            <p className="text-muted-foreground">{argument.text}</p>
        </div>
    );
};

export function DebateTree({ args, topicQuestion, lang }: DebateTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodes, setNodes] = useState<HierarchyNode[]>([]);

  // Step 1: Set up a ResizeObserver to get the container's dimensions.
  // This effect runs first.
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width } = entries[0].contentRect;
            const height = isMobile ? 300 : Math.min(width, 500); 
            setDimensions({ width, height });
        }
    });
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [isMobile]);

  // Step 2: Process data and generate D3 nodes.
  // This effect runs whenever the data (args) or dimensions change.
  // Crucially, it will run *after* the dimensions are first measured.
  useEffect(() => {
    if (!args || args.length === 0 || dimensions.width === 0) {
      setNodes([]); // Clear nodes if there's no data or container size
      return;
    }

    try {
      // Create a synthetic root node for the topic.
      const topicRoot: Argument = {
        id: 'root',
        topicId: args[0]?.topicId || '',
        parentId: '', // An empty or non-existent parentId signals this is the root for d3.stratify
        side: 'for', 
        author: { name: 'Topic' },
        text: topicQuestion,
        upvotes: 0, downvotes: 0, replyCount: 0, createdAt: new Date().toISOString()
      };

      // Sanitize arguments to ensure valid parent-child relationships.
      const idToNodeMap = new Map(args.map(arg => [arg.id, arg]));
      idToNodeMap.set(topicRoot.id, topicRoot);

      const sanitizedArgs = args.map(arg => ({
        ...arg,
        parentId: idToNodeMap.has(arg.parentId) ? arg.parentId : 'root'
      }));

      const dataForStratify = [topicRoot, ...sanitizedArgs];

      // Create the hierarchy.
      const root = d3.stratify<Argument>()
        .id(d => d.id)
        .parentId(d => d.parentId)(dataForStratify);
      
      root.sum(d => (d.id === 'root' ? 0 : 1));

      // Define the partition layout.
      const radius = Math.min(dimensions.width, dimensions.height) / 2;
      const partition = d3.partition<Argument>()
        .size([2 * Math.PI, radius])
        .padding(0.005);
        
      const partitionedRoot = partition(root) as HierarchyNode;
      setNodes(partitionedRoot.descendants() as HierarchyNode[]);
    } catch(e) {
      console.error("D3 Stratify error:", e);
      setNodes([]); // Clear nodes on error
    }
  }, [args, topicQuestion, dimensions]);


  const arcGenerator = d3.arc<HierarchyNode>()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(0.01)
    .padRadius(1)
    .innerRadius(d => d.y0 + 4)
    .outerRadius(d => Math.max(d.y0 + 4, d.y1 - 2));


  const getColor = (d: HierarchyNode) => {
    if (d.depth === 0) return COLORS.neutral;
    
    const baseColor = d.data.side === 'for' ? COLORS.for : COLORS.against;
    const hslColor = d3.hsl(baseColor);
    
    const totalVotes = d.data.upvotes + d.data.downvotes;
    const saturation = 0.4 + Math.min(0.6, (totalVotes / 50) * 0.6);
    hslColor.s = saturation;

    return hslColor.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Visualization</CardTitle>
        <CardDescription>A radial map of the argument structure. Inner rings are top-level arguments.</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef} className="h-[300px] md:h-[500px] w-full p-0 relative">
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Not enough data to display chart.</p>
          </div>
        ) : (
          <svg ref={svgRef} width="100%" height="100%">
            <g transform={`translate(${dimensions.width / 2},${dimensions.height / 2})`}>
              <TooltipProvider>
              {nodes.map((d, i) => (
                  <Tooltip key={d.data.id || i} delayDuration={150}>
                      <TooltipTrigger asChild>
                           <path
                              d={arcGenerator(d) || ''}
                              fill={getColor(d)}
                              stroke="hsl(var(--card))"
                              strokeWidth={0.5}
                              className="transition-opacity hover:opacity-80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                      </TooltipTrigger>
                       {d.depth > 0 && (
                          <TooltipContent>
                             <CustomTooltipContent argument={d.data} />
                          </TooltipContent>
                       )}
                  </Tooltip>
              ))}
              </TooltipProvider>
               <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-card-foreground font-semibold text-xs md:text-sm pointer-events-none"
               >
                  {lang === 'nb' ? 'Tese' : 'Thesis' }
               </text>
            </g>
          </svg>
        )}
      </CardContent>
    </Card>
  );
}

