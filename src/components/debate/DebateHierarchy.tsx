
'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Argument } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface DebateHierarchyProps {
  args: Argument[];
  topicQuestion: string;
  lang: 'en' | 'nb';
  onNodeClick: (argument: Argument) => void;
}

export function DebateHierarchy({ args, topicQuestion, lang, onNodeClick }: DebateHierarchyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width } = entries[0].contentRect;
            const height = isMobile ? Math.min(width * 1.5, 600) : Math.min(width, 700);
            setDimensions({ width, height });
        }
    });
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [isMobile, args.length]);

  useEffect(() => {
    if (!args || dimensions.width === 0 || !svgRef.current || !containerRef.current) {
      return;
    }
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    d3.select(containerRef.current).select('.d3-tooltip').remove();
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .attr('class', 'd3-tooltip fixed rounded-lg border bg-popover p-2 shadow-sm text-sm transition-opacity opacity-0 pointer-events-none max-w-xs z-50');

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
      
      // Use tree.size() to make the layout fit the container dimensions
      const treeLayout = d3.tree().size([dimensions.width - 40, dimensions.height - 80]);
      const hierarchy = treeLayout(rootNode);
      
      const g = svg.append('g')
        .attr('transform', `translate(20, 40)`); // Add padding

      const linkGenerator = d3.linkVertical()
        .x(d => (d as any).x)
        .y(d => (d as any).y);

      g.append('g')
        .attr('fill', 'none')
        .attr('stroke', 'hsl(var(--border))')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5)
        .selectAll('path')
        .data(hierarchy.links())
        .join('path')
          .attr('d', linkGenerator as any);

      const node = g.append('g')
        .selectAll('g')
        .data(hierarchy.descendants())
        .join('g')
          .attr('transform', d => `translate(${d.x},${d.y})`)
          .attr('class', 'cursor-pointer')
          .on('click', (event, d) => d.depth > 0 && onNodeClick(d.data));

      const getColor = (d: d3.HierarchyPointNode<Argument>) => {
        if (d.depth === 0) return 'hsl(var(--primary))';
        return d.data.side === 'for' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
      };

      // Define node dimensions
      const nodeWidth = 20;
      const nodeHeight = 12;

      node.append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', 'hsl(var(--card))')
        .attr('stroke', getColor)
        .attr('stroke-width', 2);
      
      // Only add text for the root node
      node.filter(d => d.depth === 0).append('text')
        .attr('dy', '0.31em')
        .attr('y', nodeHeight) // Position text below the root node
        .attr('text-anchor', 'middle')
        .text('Topic')
        .style('font-size', '10px')
        .style('fill', 'hsl(var(--muted-foreground))');


      node.on('mouseover', (event, d) => {
          const color = getColor(d);
          tooltip.style('opacity', 1)
            .html(`
              <div class="flex items-center gap-2 mb-1">
                <div class="h-2 w-2 rounded-full" style="background-color: ${color}"></div>
                <p class="font-semibold text-popover-foreground">${d.data.author?.name || 'Topic'} (${d.data.upvotes || 0} upvotes)</p>
              </div>
              <p class="text-muted-foreground">${d.data.text}</p>
            `);
        })
        .on('mousemove', (event) => {
          tooltip.style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY + 15) + 'px');
        })
        .on('mouseleave', () => {
          tooltip.style('opacity', 0);
        });
        
    } catch(e) {
      console.error("D3 Hierarchy error:", e);
    }
  }, [args, topicQuestion, dimensions, onNodeClick, lang, isMobile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Hierarchy</CardTitle>
        <CardDescription>A top-down tree view of the argument structure.</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef} className="h-[400px] md:h-[700px] w-full p-0 relative overflow-auto">
        {args.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Not enough data to display chart.</p>
          </div>
        ) : (
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        )}
      </CardContent>
    </Card>
  );
}
