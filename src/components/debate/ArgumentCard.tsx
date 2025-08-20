
'use client';

import type { Argument } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowBigDown, ArrowBigUp, MessageSquare, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ArgumentCardProps {
  argument: Argument;
  onCounter: (argumentId: string) => void;
}

export function ArgumentCard({ argument, onCounter }: ArgumentCardProps) {
  const netVotes = argument.upvotes - argument.downvotes;
  const createdAt = new Date(argument.createdAt);

  // Prevent rendering if author is missing, which is the cause of the bug
  if (!argument.author?.name) {
    return null;
  }

  return (
    <Card className="bg-card/50">
      <CardHeader className="flex flex-row items-start gap-3 p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={argument.author.avatarUrl} alt={argument.author.name} />
          <AvatarFallback>{argument.author.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-card-foreground">{argument.author.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground" title={createdAt.toLocaleString()}>
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <p className="text-card-foreground/90">{argument.text}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowBigUp className="h-5 w-5" />
            <span className="text-sm font-semibold">{argument.upvotes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowBigDown className="h-5 w-5" />
             <span className="text-sm font-semibold">{argument.downvotes}</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => onCounter(argument.id)}>
             <MessageSquare className="h-4 w-4" />
             <span className="text-sm">Counter ({argument.replyCount})</span>
           </Button>
           <Button variant="ghost" size="sm" className="text-muted-foreground">
             <Flag className="h-4 w-4" />
           </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
