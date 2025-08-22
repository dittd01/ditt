
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ThumbsUp, ThumbsDown, InfoIcon, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Topic, Category, Subcategory } from '@/lib/types';
import { categories } from '@/lib/data';
import { Skeleton } from './ui/skeleton';
import { Icon } from './Icon';
import { trackEvent } from '@/lib/analytics';
import { useEffect, useRef, useState } from 'react';
import { MiniTrendChart } from './MiniTrendChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface VoteCardProps {
  topic: Topic;
  hasVoted: boolean;
}

const getCategory = (categoryId: string): Category | undefined => {
    return categories.find(c => c.id === categoryId);
}

const getSubcategory = (category: Category | undefined, subcategoryId: string): Subcategory | undefined => {
    return category?.subcategories.find(s => s.id === subcategoryId);
}

const getCategoryIconName = (categoryId: string): string | null => {
    const category = getCategory(categoryId);
    return category?.icon || null;
}


export function VoteCard({ topic, hasVoted }: VoteCardProps) {
  const iconName = getCategoryIconName(topic.categoryId);
  const link = topic.voteType === 'election' ? '/election-2025' : `/t/${topic.slug}`;
  const cardRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState('en');

  const category = getCategory(topic.categoryId);
  const subcategory = getSubcategory(category, topic.subcategoryId);

  useEffect(() => {
    const handleStorageChange = () => {
        const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
        setLang(selectedLang);
    };

    handleStorageChange(); // Set initial language

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
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [topic.id, topic.categoryId]);
  
  const handleCardClick = () => {
    trackEvent('open_card', { topicId: topic.id, from: 'homepage' });
  };
  
  const yesVotes = topic.votes?.yes || 0;
  const noVotes = topic.votes?.no || 0;
  const primaryVotes = yesVotes + noVotes;
  const yesPercentage = primaryVotes > 0 ? (yesVotes / primaryVotes) * 100 : 50;
  
  const infoText = lang === 'nb' ? 'Info' : 'Info';
  const yesText = lang === 'nb' ? 'Ja' : 'Yes';
  const noText = lang === 'nb' ? 'Nei' : 'No';

  const categoryLabel = lang === 'nb' ? category?.label_nb : category?.label;
  const subcategoryLabel = lang === 'nb' ? subcategory?.label_nb : subcategory?.label;
  const question = lang === 'nb' ? topic.question : topic.question_en;
  const tooltipText = lang === 'nb' ? 'Antall som har stemt' : 'Number of voters';

  return (
    <Card ref={cardRef} className="flex h-full flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="flex-1 flex flex-col p-4">
            <div className="flex-1">
                {category && subcategory && topic.voteType !== 'election' && (
                     <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                        {iconName && <Icon name={iconName} className="h-4 w-4" />}
                        <span>{categoryLabel} &middot; {subcategoryLabel}</span>
                     </div>
                )}
                <Link href={link} className="group" onClick={handleCardClick}>
                  <CardTitle className="text-base font-semibold leading-snug line-clamp-3 group-hover:text-primary">
                    {question}
                  </CardTitle>
                </Link>
            </div>
            
             {topic.voteType === 'yesno' && (
                <div className="space-y-6 mt-4">
                    <div className="w-full h-10 rounded-full overflow-hidden bg-[hsl(var(--chart-1))]">
                        <div className="flex items-center justify-center bg-[hsl(var(--chart-2))] h-full transition-all duration-500" style={{ width: `${yesPercentage}%`}}>
                           <span className="text-[10px] font-bold text-white mix-blend-plus-lighter">{yesPercentage > 5 && yesPercentage.toFixed(0) + '%'}</span>
                        </div>
                    </div>
                     <div className="h-24 w-full">
                       <MiniTrendChart topic={topic} />
                     </div>
                </div>
            )}

        </div>
        <CardFooter className="pt-0 p-4 border-t flex flex-col items-center justify-center gap-3">
             <div className="flex w-full items-center justify-center gap-2">
                <Button variant="outline" size="sm" className="h-9 flex-1 hover:bg-primary hover:text-primary-foreground group">
                    <ThumbsUp className="h-4 w-4 text-[hsl(var(--chart-2))] group-hover:text-primary-foreground" />
                    <span className="ml-2">{yesText}</span>
                </Button>
                <Button variant="outline" size="sm" className="h-9 flex-1 hover:bg-destructive hover:text-destructive-foreground group">
                     <ThumbsDown className="h-4 w-4 text-[hsl(var(--chart-1))] group-hover:text-destructive-foreground" />
                     <span className="ml-2">{noText}</span>
                </Button>
            </div>
            <div className="w-full flex justify-between items-center mt-2">
                <Button asChild size="sm" className="h-8 text-sm px-4 hover:bg-accent/50" onClick={handleCardClick} variant="ghost">
                    <Link href={link}>
                        <InfoIcon className="mr-2 h-4 w-4" />
                        {infoText}
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>{topic.totalVotes.toLocaleString()}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tooltipText}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Bookmark className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardFooter>
    </Card>
  );
}

VoteCard.Skeleton = function VoteCardSkeleton() {
    return (
        <Card className="flex h-full flex-col">
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-5 w-2/5 mt-1" />
                </div>
                <div className="space-y-2 mt-4">
                    <div className="flex justify-between">
                         <Skeleton className="h-4 w-1/4" />
                         <Skeleton className="h-4 w-1/4" />
                    </div>
                     <Skeleton className="h-2 w-full mb-1" />
                     <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <CardFooter className="pt-0 p-4 border-t flex justify-between items-center">
                 <Skeleton className="h-5 w-16" />
                 <Skeleton className="h-9 w-24" />
            </CardFooter>
        </Card>
    )
}
