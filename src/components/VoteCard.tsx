
'use client';

import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Topic } from '@/lib/types';
import { categories } from '@/lib/data';
import { Skeleton } from './ui/skeleton';
import { Icon } from './Icon';
import { trackEvent } from '@/lib/analytics';
import { useEffect, useRef } from 'react';


interface VoteCardProps {
  topic: Topic;
  hasVoted: boolean;
}

const getCategoryIconName = (categoryId: string): string | null => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || null;
}

export function VoteCard({ topic, hasVoted }: VoteCardProps) {
  const iconName = getCategoryIconName(topic.categoryId);
  const link = topic.voteType === 'election' ? '/election-2025' : `/t/${topic.slug}`;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEvent('view_card', { topicId: topic.id, category: topic.categoryId });
          observer.disconnect(); // Track only once per page load
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [topic.id, topic.categoryId]);
  
  const handleCardClick = () => {
    trackEvent('open_card', { topicId: topic.id, from: 'homepage' });
  };

  return (
    <Card ref={cardRef} className="flex h-full flex-col">
        <Collapsible className="flex flex-col flex-1">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                {iconName && <Icon name={iconName} className="h-6 w-6 shrink-0 text-muted-foreground" />}
                <div className="flex-1">
                     <Link href={link} className="group" onClick={handleCardClick}>
                        <CardTitle className="text-lg font-semibold leading-snug line-clamp-2 group-hover:underline">
                            {topic.question}
                        </CardTitle>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">Closing in 3 days</p>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <CollapsibleContent>
                    <p className="text-base text-muted-foreground mb-4">{topic.description}</p>
                </CollapsibleContent>
                 <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                         <Button variant="ghost" size="sm" className="-ml-3 h-auto text-muted-foreground">
                            <ChevronDown className="h-4 w-4 mr-1 transition-transform [&[data-state=open]]:rotate-180" />
                            Details
                        </Button>
                    </CollapsibleTrigger>
                     <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{topic.totalVotes.toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full h-11 text-base" onClick={handleCardClick}>
                    <Link href={link}>
                        {hasVoted ? 'Change Vote' : 'Vote Now'}
                    </Link>
                </Button>
            </CardFooter>
        </Collapsible>
    </Card>
  );
}

VoteCard.Skeleton = function VoteCardSkeleton() {
    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                <Skeleton className="h-6 w-6 rounded-md" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-5 w-2/5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-11 w-full" />
            </CardFooter>
        </Card>
    )
}
