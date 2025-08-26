
'use client';

import type { Argument } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowBigDown, ArrowBigUp, MessageSquare, Flag } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ArgumentCardProps {
  argument: Argument;
  onCounter: (argument: Argument) => Promise<void>;
}

export function ArgumentCard({ argument, onCounter }: ArgumentCardProps) {
  const netVotes = argument.upvotes - argument.downvotes;
  const createdAt = new Date(argument.createdAt);

  // Prevent rendering if author is missing
  if (!argument.author || !argument.author.name) {
    return null;
  }

  const sideColorClass = argument.side === 'for' ? 'border-l-[hsl(var(--chart-2))]' : 'border-l-[hsl(var(--chart-1))]';

  return (
    <Card className={cn("bg-card border-l-4", sideColorClass)}>
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={argument.author.avatarUrl} alt={argument.author.name} />
          <AvatarFallback>{argument.author.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-card-foreground">{argument.author.name}</span>
            <span className="text-muted-foreground">·</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-muted-foreground hover:underline" title={createdAt.toLocaleString()}>
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(createdAt, "PPP p")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <p className="text-card-foreground/90">{argument.text}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowBigUp className="h-5 w-5" />
            <span className="text-sm font-semibold">{argument.upvotes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowBigDown className="h-5 w-5" />
             <span className="text-sm font-semibold">{argument.downvotes}</span>
          </Button>
        </div>
        <div className="flex items-center flex-wrap justify-end gap-2">
           <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => onCounter(argument)}>
             <MessageSquare className="h-4 w-4" />
             <span className="text-sm">Counter ({argument.replyCount})</span>
           </Button>
           <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
             <Flag className="h-4 w-4" />
           </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
