
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Argument, Topic } from '@/lib/types';
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

const CustomTooltip = ({ data }: { data: TooltipData['argument'] }) => {
    if (!data || !data.author) {
        return null;
    }
    return (
        <div className="rounded-lg border bg-popover p-2 shadow-lg max-w-xs text-xs pointer-events-none">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.side === 'for' ? COLORS.for : COLORS.against }}/>
                <p className="text-sm font-bold text-popover-foreground">Argument by {data.author.name}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-1">{data.text}</p>
            <p className="text-xs text-muted-foreground mt-1">Upvotes: {data.upvotes}</p>
        </div>
    );
};


export function ArgumentChart({ args, topicQuestion }: ArgumentChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, visible: false, argument: null });
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const handleStorageChange = () => {
        const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
        setLang(selectedLang);
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width } = entries[0].contentRect;
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
        parentId: '', // Stratify expects empty string for root's parent
        side: 'for', 
        author: { name: 'Topic' },
        text: topicQuestion,
        upvotes: 0, downvotes: 0, replyCount: 0, createdAt: ''
    };
    
    const dataWithRoot = [topicRoot, ...args];
    
    const idToNodeMap = new Map(dataWithRoot.map(item => [item.id, item]));

    // Ensure parentId is either valid or null (for top-level)
    const sanitizedData = dataWithRoot.map(item => {
        if (item.parentId && !idToNodeMap.has(item.parentId)) {
            console.warn(`Invalid parentId "${item.parentId}" for item "${item.id}". Setting to root.`);
            return { ...item, parentId: 'root' };
        }
        return item;
    });

    if (sanitizedData.length <= 1) return null;

    try {
        const stratifiedData = d3.stratify<Argument>()
            .id(d => d.id)
            .parentId(d => d.parentId || 'root') // Default to root if parentId is null
            (sanitizedData);
        
        stratifiedData.sum(d => (d.id === 'root' ? 0 : 1));

        const radius = Math.min(dimensions.width, dimensions.height) / 2;
        
        const partition = d3.partition<Argument>()
            .size([2 * Math.PI, radius])
            .padding(0.005);
            
        return partition(stratifiedData) as HierarchyNode;
    } catch(e) {
        console.error("D3 Stratify error:", e);
        console.error("Invalid data provided to stratify:", sanitizedData);
        return null;
    }


  }, [args, topicQuestion, dimensions]);

  const allNodes = useMemo(() => rootNode ? rootNode.descendants() as HierarchyNode[] : [], [rootNode]);

  const arcGenerator = d3.arc<HierarchyNode>()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(0.01)
    .padRadius(1)
    .innerRadius(d => d.y0 + 4)
    .outerRadius(d => Math.max(d.y0 + 4, d.y1 - 2));

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
                {lang === 'nb' ? 'Tese' : 'Thesis' }
             </text>
          </g>
        </svg>
        {tooltip.visible && tooltip.argument && (
             <div 
                className="absolute z-50 transition-opacity"
                style={{
                    left: tooltip.x + 10,
                    top: tooltip.y + 10,
                    transform: `translate(-${tooltip.x > window.innerWidth / 2 ? '100%' : '0'}, -${tooltip.y > window.innerHeight / 2 ? '100%' : '0'})`,
                    opacity: tooltip.visible ? 1 : 0,
                    pointerEvents: 'none'
                }}
            >
               <CustomTooltip data={tooltip.argument} />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
