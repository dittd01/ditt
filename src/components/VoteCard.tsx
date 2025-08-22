
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Topic, Category, Subcategory } from '@/lib/types';
import { categories } from '@/lib/data';
import { Skeleton } from './ui/skeleton';
import { Icon } from './Icon';
import { trackEvent } from '@/lib/analytics';
import { useEffect, useRef, useState } from 'react';
import { MiniTrendChart } from './MiniTrendChart';


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
  
  const voteNowText = lang === 'nb' ? 'Stem nå' : 'Vote Now';
  const changeVoteText = lang === 'nb' ? 'Endre stemme' : 'Change Vote';

  const categoryLabel = lang === 'nb' ? category?.label_nb : category?.label;
  const subcategoryLabel = lang === 'nb' ? subcategory?.label_nb : subcategory?.label;
  const question = lang === 'nb' ? topic.question : topic.question_en;

  return (
    <Card ref={cardRef} className="flex h-full flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <Link href={link} className="group" onClick={handleCardClick}>
            <CardHeader className="p-0 border-b">
                <div className="aspect-video relative bg-muted">
                    {topic.imageUrl && (
                        <Image
                            src={topic.imageUrl}
                            alt={question}
                            fill
                            sizes="350px"
                            className="rounded-t-lg object-cover"
                            data-ai-hint={topic.aiHint}
                        />
                    )}
                </div>
            </CardHeader>
        </Link>
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
                <div className="space-y-1 mt-4">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>{lang === 'nb' ? 'Ja' : 'Yes'} {yesPercentage.toFixed(0)}%</span>
                        <span>{lang === 'nb' ? 'Nei' : 'No'} {(100 - yesPercentage).toFixed(0)}%</span>
                    </div>
                     <div className="h-10 w-full">
                       <MiniTrendChart topic={topic} />
                     </div>
                </div>
            )}

        </div>
        <CardFooter className="pt-0 p-4 border-t flex justify-between items-center">
             <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                <span>{topic.totalVotes.toLocaleString()}</span>
              </div>
            <Button asChild size="sm" className="h-9 text-sm" onClick={handleCardClick}>
              <Link href={link}>
                {hasVoted ? changeVoteText : voteNowText}
              </Link>
            </Button>
        </CardFooter>
    </Card>
  );
}

VoteCard.Skeleton = function VoteCardSkeleton() {
    return (
        <Card className="flex h-full flex-col">
            <Skeleton className="aspect-video w-full rounded-b-none" />
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
