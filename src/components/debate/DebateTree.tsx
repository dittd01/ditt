
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Argument } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DebateTreeProps {
  args: Argument[];
  topicQuestion: string;
  lang: 'en' | 'nb';
  onNodeClick: (argument: Argument) => void;
}

interface HierarchyNode extends d3.HierarchyNode<Argument> {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

const HSL_FOR = { h: 103, s: 0.31, l: 0.25 };
const HSL_AGAINST = { h: 0, s: 0.78, l: 0.34 };

export function DebateTree({ args, topicQuestion, lang, onNodeClick }: DebateTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width } = entries[0].contentRect;
            const height = isMobile ? Math.min(width, 400) : Math.min(width, 500);
            setDimensions({ width, height });
        }
    });
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (!args || dimensions.width === 0 || !svgRef.current || !tooltipRef.current) {
      return;
    }
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const tooltip = d3.select(tooltipRef.current);

    const g = svg.append('g')
      .attr('transform', `translate(${dimensions.width / 2},${dimensions.height / 2})`);

    try {
      const topicRoot: Argument = {
        id: 'root',
        topicId: args[0]?.topicId || '',
        parentId: '',
        side: 'for', 
        author: { name: 'Topic' },
        text: topicQuestion,
        upvotes: 0, downvotes: 0, replyCount: 0, createdAt: new Date().toISOString()
      };

      const validIds = new Set(args.map(arg => arg.id));
      validIds.add(topicRoot.id);
      const sanitizedArgs = args.map(arg => ({ ...arg, parentId: arg.parentId && validIds.has(arg.parentId) ? arg.parentId : 'root' }));
      const dataForStratify = [topicRoot, ...sanitizedArgs];
      
      const rootNode = d3.stratify<Argument>().id(d => d.id).parentId(d => d.parentId)(dataForStratify);
      rootNode.sum(d => (d.id === 'root' ? 0 : 1 + (d.replyCount > 0 ? d.replyCount * 0.5 : 0)));

      const radius = Math.min(dimensions.width, dimensions.height) / 2;
      const partition = d3.partition<Argument>().size([2 * Math.PI, radius * 0.9]).padding(0.01);
      const partitionedRoot = partition(rootNode);
      const nodes = partitionedRoot.descendants() as HierarchyNode[];

      const arcGenerator = d3.arc<HierarchyNode>()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(1)
        .innerRadius(d => d.y0 + 4)
        .outerRadius(d => Math.max(d.y0 + 4, d.y1 - 2))
        .cornerRadius(d => d.depth > 1 ? 4 : 2);

      const getColor = (d: HierarchyNode) => {
        if (d.depth === 0) return 'none';
        const baseColor = d.data.side === 'for' ? HSL_FOR : HSL_AGAINST;
        const hslColor = d3.hsl(baseColor.h, baseColor.s, baseColor.l);
        if (d.depth > 1) { 
          hslColor.l -= (d.depth - 1) * 0.08;
          hslColor.s -= (d.depth - 1) * 0.06;
        }
        return hslColor.toString();
      };
      
      g.append('circle').attr('r', nodes.length > 1 ? nodes[1].y0 : 0).attr('fill', 'hsl(var(--muted))').attr('stroke', 'hsl(var(--border))').attr('stroke-width', 1);

      g.selectAll('path')
        .data(nodes)
        .join('path')
          .attr('d', d => arcGenerator(d) || '')
          .attr('fill', d => getColor(d))
          .attr('stroke', 'hsl(var(--card))')
          .attr('stroke-width', 1)
          .attr('class', 'transition-opacity hover:opacity-80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring')
          .on('click', (event, d) => d.depth > 0 && onNodeClick(d.data))
          .on('mouseover', (event, d) => {
            if (d.depth > 0) {
              const color = d.data.side === 'for' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
              tooltip
                .style('opacity', 1)
                .html(`
                  <div class="flex items-center gap-2 mb-1">
                    <div class="h-2 w-2 rounded-full" style="background-color: ${color}"></div>
                    <p class="font-semibold text-popover-foreground">${d.data.author?.name}</p>
                  </div>
                  <p class="text-muted-foreground">${d.data.text}</p>
                `);
            }
          })
          .on('mousemove', (event) => {
            tooltip
              .style('left', (event.pageX + 15) + 'px')
              .style('top', (event.pageY + 15) + 'px');
          })
          .on('mouseleave', () => {
            tooltip.style('opacity', 0);
          });

    } catch(e) {
      console.error("D3 Stratify error:", e);
    }
  }, [args, topicQuestion, dimensions, onNodeClick]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Visualization</CardTitle>
        <CardDescription>A radial map of the argument structure. Inner rings are top-level arguments.</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef} className="h-[300px] md:h-[500px] w-full p-0 relative">
        {args.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Not enough data to display chart.</p>
          </div>
        ) : (
          <svg ref={svgRef} width="100%" height="100%" />
        )}
      </CardContent>
       <div 
        ref={tooltipRef} 
        className="fixed rounded-lg border bg-popover p-2 shadow-sm text-sm transition-opacity opacity-0 pointer-events-none max-w-xs z-50"
       />
    </Card>
  );
}
