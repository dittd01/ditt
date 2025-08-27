
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
            const height = isMobile ? Math.min(width, 400) : Math.min(width, 700);
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
        const forArgs = args.filter(arg => arg.side === 'for');
        const againstArgs = args.filter(arg => arg.side === 'against');

        const topicRoot: Argument = {
            id: 'root', topicId: args[0]?.topicId || '', parentId: '', side: 'for',
            author: { name: 'Topic' }, text: topicQuestion,
            upvotes: 0, downvotes: 0, replyCount: 0, createdAt: new Date().toISOString()
        };

        const createHierarchy = (filteredArgs: Argument[]) => {
            const validIds = new Set(filteredArgs.map(arg => arg.id));
            validIds.add(topicRoot.id);
            const sanitized = filteredArgs.map(arg => ({ ...arg, parentId: arg.parentId && validIds.has(arg.parentId) ? arg.parentId : 'root' }));
            const dataForStratify = [topicRoot, ...sanitized];
            return d3.stratify<Argument>().id(d => d.id).parentId(d => d.parentId)(dataForStratify);
        };
        
        const forRoot = createHierarchy(forArgs);
        const againstRoot = createHierarchy(againstArgs);

        const treeLayout = d3.tree().nodeSize([40, 150]);
        const forHierarchy = treeLayout(forRoot);
        const againstHierarchy = treeLayout(againstRoot);

        const g = svg.append('g').attr('transform', `translate(${dimensions.width / 2}, 40)`);

        const maxUpvotes = d3.max(args, d => d.upvotes) || 1;
        const widthScale = d3.scaleLinear().domain([0, maxUpvotes]).range([40, 140]).clamp(true);

        const drawTree = (hierarchy: d3.HierarchyPointNode<Argument>, direction: 'right' | 'left') => {
            const linkGenerator = d3.linkHorizontal()
              .x(d => (d as any).y * (direction === 'right' ? 1 : -1))
              .y(d => (d as any).x);
            
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
                .data(hierarchy.descendants().filter(d => d.depth > 0)) // Exclude root from drawing
                .join('g')
                  .attr('transform', d => `translate(${d.y * (direction === 'right' ? 1 : -1)},${d.x})`)
                  .attr('class', 'cursor-pointer')
                  .on('click', (event, d) => onNodeClick(d.data));
            
            const color = direction === 'right' ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
            
            node.append('rect')
              .attr('x', d => direction === 'right' ? 0 : -widthScale(d.data.upvotes || 0))
              .attr('y', -20)
              .attr('width', d => widthScale(d.data.upvotes || 0))
              .attr('height', 40)
              .attr('rx', 3)
              .attr('ry', 3)
              .attr('fill', 'hsl(var(--card))')
              .attr('stroke', color)
              .attr('stroke-width', 2);
              
            node.on('mouseover', (event, d) => {
                tooltip.style('opacity', 1)
                  .html(`
                    <div class="flex items-center gap-2 mb-1">
                      <div class="h-2 w-2 rounded-full" style="background-color: ${color}"></div>
                      <p class="font-semibold text-popover-foreground">${d.data.author?.name} (${d.data.upvotes || 0} upvotes)</p>
                    </div>
                    <p class="text-muted-foreground">${d.data.text}</p>
                  `);
            })
            .on('mousemove', (event) => {
                tooltip.style('left', (event.pageX + 15) + 'px').style('top', (event.pageY + 15) + 'px');
            })
            .on('mouseleave', () => {
                tooltip.style('opacity', 0);
            });
        };

        drawTree(forHierarchy, 'right');
        drawTree(againstHierarchy, 'left');

        // Draw root topic node
        const rootNode = g.append('g').attr('transform', `translate(0, 0)`);
        rootNode.append('rect')
            .attr('x', -50)
            .attr('y', -15)
            .attr('width', 100)
            .attr('height', 30)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', 'hsl(var(--primary))')
            .attr('stroke', 'hsl(var(--primary-foreground))');
            
        rootNode.append('text')
            .attr('dy', '0.31em')
            .attr('text-anchor', 'middle')
            .text('Topic')
            .style('font-size', '12px')
            .style('fill', 'hsl(var(--primary-foreground))')
            .style('font-weight', 'bold');

    } catch(e) {
      console.error("D3 Hierarchy error:", e);
    }
  }, [args, topicQuestion, dimensions, onNodeClick, lang, isMobile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Hierarchy</CardTitle>
        <CardDescription>Arguments for (green, right) and against (red, left). Box width shows upvotes.</CardDescription>
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
