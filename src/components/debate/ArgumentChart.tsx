
'use client';

import { useMemo } from 'react';
import type { Argument } from '@/lib/types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ArgumentChartProps {
  args: Argument[];
}

interface TreeNode extends Argument {
  children: TreeNode[];
  color: string;
}

const COLORS = {
  for: ['#10B981', '#34D399', '#6EE7B7'], // Shades of green
  against: ['#EF4444', '#F87171', '#FCA5A5'], // Shades of red
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload.payload; // The actual treenode
    if (!data || !data.author) return null;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm max-w-xs">
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }}/>
            <p className="text-sm font-bold text-foreground">Argument by {data.author.name}</p>
        </div>
        <p className="text-xs text-muted-foreground truncate">{data.text}</p>
        <p className="text-xs text-muted-foreground mt-1">Upvotes: {data.upvotes}</p>
      </div>
    );
  }
  return null;
};


// This function transforms the flat list of arguments into a tree structure
const buildTree = (args: Argument[]): TreeNode[] => {
    const tree: TreeNode[] = [];
    const childrenOf: { [key: string]: TreeNode[] } = {};

    args.forEach(arg => {
        const node: TreeNode = {
            ...arg,
            children: [],
            // Assign a color based on the side and depth
            color: arg.side === 'for' 
                ? COLORS.for[0] 
                : COLORS.against[0],
        };

        if (arg.parentId) {
            childrenOf[arg.parentId] = childrenOf[arg.parentId] || [];
            childrenOf[arg.parentId].push(node);
        } else {
            tree.push(node);
        }
    });

    const assignChildren = (node: TreeNode, depth: number) => {
        if (childrenOf[node.id]) {
            node.children = childrenOf[node.id];
            node.children.forEach(child => {
                 // Assign varying shades based on depth
                 child.color = child.side === 'for'
                    ? COLORS.for[depth % COLORS.for.length]
                    : COLORS.against[depth % COLORS.against.length];
                assignChildren(child, depth + 1);
            });
        }
    };
    
    tree.forEach(node => assignChildren(node, 1));
    return tree;
};

// This function flattens the tree into layers for rendering with Pie charts
const flattenTreeToLayers = (tree: TreeNode[]) => {
    const layers: { data: any[], depth: number }[] = [];
    
    let currentLayerNodes = tree;
    let depth = 0;

    while (currentLayerNodes.length > 0) {
        const flattenedLayer = currentLayerNodes.map(node => ({
            name: node.id,
            value: node.upvotes + 1, // Add 1 to ensure even 0-vote args are visible
            payload: node, // Keep original node data for tooltip
        }));
        
        layers.push({ data: flattenedLayer, depth });

        currentLayerNodes = currentLayerNodes.flatMap(node => node.children);
        depth++;
    }
    
    return layers;
}


export function ArgumentChart({ args }: ArgumentChartProps) {
  const chartLayers = useMemo(() => {
    if (!args || args.length === 0) return [];
    
    const argumentTree = buildTree(args);
    return flattenTreeToLayers(argumentTree);

  }, [args]);

  if (chartLayers.length === 0) {
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

  const maxDepth = chartLayers.length;
  const outerRadius = 180;
  const radiusStep = (outerRadius / (maxDepth + 1));
  const centerCircleRadius = radiusStep;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Visualization</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
             <Tooltip content={<CustomTooltip />} />
             {chartLayers.map((layer, index) => (
                 <Pie
                    key={`layer-${index}`}
                    data={layer.data}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={centerCircleRadius + (index * radiusStep)}
                    outerRadius={centerCircleRadius + ((index + 1) * radiusStep)}
                    dataKey="value"
                    paddingAngle={1}
                 >
                     {layer.data.map((entry, cellIndex) => (
                        <Cell key={`cell-${cellIndex}`} fill={entry.payload.color} stroke={entry.payload.color} />
                    ))}
                 </Pie>
             ))}
             {/* Center circle */}
             <Pie 
                data={[{ value: 1 }]}
                cx="50%"
                cy="50%"
                outerRadius={centerCircleRadius - 5}
                fill="hsl(var(--muted))"
                dataKey="value"
                isAnimationActive={false}
              />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
