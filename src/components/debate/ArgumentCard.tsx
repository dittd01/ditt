
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
import { useState, useEffect } from 'react';

interface ArgumentCardProps {
  argument: Argument;
  onCounter: (argument: Argument) => Promise<void>;
}

export function ArgumentCard({ argument, onCounter }: ArgumentCardProps) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [displayUpvotes, setDisplayUpvotes] = useState(argument.upvotes);
  const [displayDownvotes, setDisplayDownvotes] = useState(argument.downvotes);
  
  const createdAt = new Date(argument.createdAt);
  
  // Why: This effect runs once on the client to safely initialize the vote state
  // from localStorage, preventing SSR hydration mismatches.
  useEffect(() => {
    const storedVote = localStorage.getItem(`vote_on_arg_${argument.id}`);
    if (storedVote === 'up' || storedVote === 'down') {
      setUserVote(storedVote);
    }
  }, [argument.id]);

  // Prevent rendering if author is missing
  if (!argument.author || !argument.author.name) {
    return null;
  }

  const handleVote = (voteType: 'up' | 'down') => {
    let newUpvotes = displayUpvotes;
    let newDownvotes = displayDownvotes;
    let newUserVote: 'up' | 'down' | null = null;
    
    // Logic to toggle votes
    if (voteType === userVote) { // User is retracting their vote
      newUserVote = null;
      if (voteType === 'up') newUpvotes--;
      else newDownvotes--;
    } else { // User is casting a new vote or changing their vote
      newUserVote = voteType;
      if (voteType === 'up') {
        newUpvotes++;
        if (userVote === 'down') newDownvotes--; // Changed from down to up
      } else { // voteType is 'down'
        newDownvotes++;
        if (userVote === 'up') newUpvotes--; // Changed from up to down
      }
    }

    // Optimistically update the UI
    setDisplayUpvotes(newUpvotes);
    setDisplayDownvotes(newDownvotes);
    setUserVote(newUserVote);

    // Persist the vote to localStorage
    if (newUserVote) {
        localStorage.setItem(`vote_on_arg_${argument.id}`, newUserVote);
    } else {
        localStorage.removeItem(`vote_on_arg_${argument.id}`);
    }
    
    // In a real app, you'd also call a server action here to record the vote.
  };

  const sideColorClass = argument.side === 'for' ? 'border-l-[hsl(var(--chart-2))]' : 'border-l-[hsl(var(--chart-1))]';

  return (
    <Card className={cn("border border-l-4", sideColorClass)}>
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={argument.author.avatarUrl} alt={argument.author.name} />
          <AvatarFallback>{argument.author.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-semibold text-card-foreground">{argument.author.name}</span>
            <span className="text-muted-foreground text-xs">·</span>
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
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => handleVote('up')}>
            <ArrowBigUp className={cn("h-5 w-5", userVote === 'up' && "text-primary fill-current")} />
            <span className="text-sm font-semibold">{displayUpvotes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => handleVote('down')}>
            <ArrowBigDown className={cn("h-5 w-5", userVote === 'down' && "text-destructive fill-current")} />
             <span className="text-sm font-semibold">{displayDownvotes}</span>
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
