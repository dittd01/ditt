
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ThumbsUp, ThumbsDown, InfoIcon, Bookmark, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Topic, Category, Subcategory } from '@/lib/types';
import { categories, allTopics } from '@/lib/data';
import { Skeleton } from './ui/skeleton';
import { Icon } from './Icon';
import { trackEvent } from '@/lib/analytics';
import { useEffect, useRef, useState } from 'react';
import { MiniTrendChart } from './MiniTrendChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';


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


export function VoteCard({ topic: initialTopic, hasVoted: initialHasVoted }: VoteCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [topic, setTopic] = useState(initialTopic);
  const [votedOn, setVotedOn] = useState<string | null>(null);
  
  const iconName = getCategoryIconName(topic.categoryId);
  const link = topic.voteType === 'election' ? '/election-2025' : `/t/${topic.slug}`;
  const cardRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState('en');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [importance, setImportance] = useState<number | null>(null);

  const category = getCategory(topic.categoryId);
  const subcategory = getSubcategory(category, topic.subcategoryId);

   useEffect(() => {
    const checkStates = () => {
        const bookmarkedTopics = JSON.parse(localStorage.getItem('bookmarked_topics') || '[]');
        setIsBookmarked(bookmarkedTopics.includes(topic.id));

        const currentVote = localStorage.getItem(`voted_on_${topic.id}`);
        setVotedOn(currentVote);
        
        const savedImportance = localStorage.getItem(`importance_for_${topic.id}`);
        if (savedImportance) {
            setImportance(parseInt(savedImportance, 10));
        } else {
            setImportance(null);
        }
    };
    
    checkStates();

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'selectedLanguage') {
            setLang(event.newValue || 'en');
        }
        if (event.key === `voted_on_${topic.id}` || event.key === `importance_for_${topic.id}` || event.key === 'bookmarked_topics') {
            checkStates();
        }
        if (event.key === `votes_for_${topic.id}_yes` || event.key === `votes_for_${topic.id}_no`) {
            setTopic(prevTopic => {
                const newVotes = {...prevTopic.votes};
                if(event.key === `votes_for_${topic.id}_yes`) newVotes.yes = parseInt(event.newValue || '0', 10);
                if(event.key === `votes_for_${topic.id}_no`) newVotes.no = parseInt(event.newValue || '0', 10);
                
                const newPrimaryVotes = (newVotes.yes || 0) + (newVotes.no || 0);
                const totalVotes = Object.values(newVotes).reduce((sum, v) => sum + v, 0);

                return {...prevTopic, votes: newVotes, totalVotes: totalVotes};
            });
        }
    };
    
    setLang(localStorage.getItem('selectedLanguage') || 'en');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEvent('view_card', { topicId: topic.id, category: topic.categoryId });
          observer.disconnect(); 
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarkChange', checkStates);

    return () => {
      if(cardRef.current) {
        observer.disconnect();
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarkChange', checkStates);
    };
  }, [topic.id, topic.categoryId]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    let bookmarkedTopics: string[] = JSON.parse(localStorage.getItem('bookmarked_topics') || '[]');
    
    if (isBookmarked) {
        bookmarkedTopics = bookmarkedTopics.filter(id => id !== topic.id);
        toast({ title: "Bookmark Removed", description: `"${lang === 'nb' ? topic.question : topic.question_en}" removed from your bookmarks.` });
    } else {
        bookmarkedTopics.push(topic.id);
        toast({ title: "Bookmark Added", description: `"${lang === 'nb' ? topic.question : topic.question_en}" saved to your bookmarks.` });
    }
    
    localStorage.setItem('bookmarked_topics', JSON.stringify(bookmarkedTopics));
    setIsBookmarked(!isBookmarked);

    window.dispatchEvent(new Event('bookmarkChange'));
  };

  const handleCardClick = () => {
    trackEvent('open_card', { topicId: topic.id, from: 'homepage' });
  };
  
  const handleVote = (voteOption: 'yes' | 'no') => {
    const voterId = localStorage.getItem('anonymousVoterId');
    if (!voterId) {
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'You must be logged in to vote.',
        });
        router.push(`/auth/login?returnTo=${pathname}`);
        return;
    }

    const previouslyVotedOn = localStorage.getItem(`voted_on_${topic.id}`);
    if (previouslyVotedOn === voteOption) {
        return;
    }

    if (previouslyVotedOn) {
        trackEvent('vote_changed', { topicId: topic.id, from: previouslyVotedOn, to: voteOption });
    } else {
        trackEvent('vote_cast', { topicId: topic.id, choice: voteOption });
    }

    setTopic(currentTopic => {
        if (!currentTopic) return currentTopic;

        const newVotes = { ...currentTopic.votes };
        let newTotalVotes = currentTopic.totalVotes;

        if (previouslyVotedOn && newVotes[previouslyVotedOn] !== undefined) {
            newVotes[previouslyVotedOn] = Math.max(0, newVotes[previouslyVotedOn] - 1);
        } else {
            newTotalVotes += 1;
        }

        newVotes[voteOption] = (newVotes[voteOption] || 0) + 1;
        
        localStorage.setItem(`votes_for_${topic.id}_${voteOption}`, newVotes[voteOption].toString());
        if (previouslyVotedOn) {
             localStorage.setItem(`votes_for_${topic.id}_${previouslyVotedOn}`, newVotes[previouslyVotedOn].toString());
        }

        return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
    });

    localStorage.setItem(`voted_on_${topic.id}`, voteOption);
    setVotedOn(voteOption);

    const voteLabel = voteOption === 'yes' ? (lang === 'nb' ? 'Ja' : 'Yes') : (lang === 'nb' ? 'Nei' : 'No');

    toast({
        title: previouslyVotedOn ? 'Vote Changed!' : 'Vote Cast!',
        description: `Your anonymous vote for "${voteLabel}" has been recorded.`,
    });
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: `voted_on_${topic.id}`,
      newValue: voteOption,
    }));
  };

  
  const yesVotes = topic.votes?.yes || 0;
  const noVotes = topic.votes?.no || 0;
  const primaryVotes = yesVotes + noVotes;
  const yesPercentage = primaryVotes > 0 ? (yesVotes / primaryVotes) * 100 : votedOn ? (votedOn === 'yes' ? 100 : 0) : 50;
  const noPercentage = primaryVotes > 0 ? (noVotes / primaryVotes) * 100 : votedOn ? (votedOn === 'no' ? 100 : 0) : 50;
  
  const infoText = lang === 'nb' ? 'Mer' : 'Info';
  const yesText = lang === 'nb' ? 'Ja' : 'Yes';
  const noText = lang === 'nb' ? 'Nei' : 'No';

  const categoryLabel = lang === 'nb' ? category?.label_nb : category?.label;
  const subcategoryLabel = lang === 'nb' ? subcategory?.label_nb : subcategory?.label;
  const question = lang === 'nb' ? topic.question : topic.question_en;
  const tooltipText = lang === 'nb' ? 'Antall som har stemt' : 'Number of voters';
  
  const importanceLevel = importance !== null ? importance + 1 : Math.round(topic.averageImportance * 2);
  const importanceTooltipText = importance !== null ? `You rated this ${importance + 1}/10` : (lang === 'nb' ? 'Gjennomsnittlig viktighet' : 'Average Importance');


  return (
    <Card ref={cardRef} className="flex h-full flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="flex-1 flex flex-col p-4">
            <div className="flex-1">
                {category && subcategory && topic.voteType !== 'election' && (
                     <Link href={`/?cat=${topic.categoryId}&sub=${topic.subcategoryId}`} className="group/cat">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2 group-hover/cat:text-primary transition-colors">
                            {iconName && <Icon name={iconName} className="h-4 w-4" />}
                            <span>{categoryLabel} &middot; {subcategoryLabel}</span>
                        </div>
                    </Link>
                )}
                <Link href={link} className="group" onClick={handleCardClick}>
                  <CardTitle className="text-lg font-semibold leading-snug line-clamp-3 group-hover:text-primary">
                    {question}
                  </CardTitle>
                </Link>
            </div>
            
             {topic.voteType === 'yesno' && (
                <div className="space-y-6 mt-4">
                    <div className="w-full h-10 rounded-full overflow-hidden flex">
                        <div className="flex items-center justify-center bg-[hsl(var(--chart-2))]" style={{ width: `${yesPercentage}%`}}>
                           <span className="text-[10px] font-bold text-white mix-blend-plus-lighter">{yesPercentage > 5 && yesPercentage.toFixed(0) + '%'}</span>
                        </div>
                        <div className="flex items-center justify-center bg-[hsl(var(--chart-1))]" style={{ width: `${noPercentage}%`}}>
                           <span className="text-[10px] font-bold text-white mix-blend-plus-lighter">{noPercentage > 5 && noPercentage.toFixed(0) + '%'}</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-9 flex-1 group',
                    'text-primary border-primary/20 hover:bg-primary/10',
                    votedOn === 'yes' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                  )}
                  onClick={() => handleVote('yes')}
                >
                    <ThumbsUp className={cn('h-4 w-4 text-primary', votedOn === 'yes' ? 'text-primary-foreground' : 'group-hover:text-primary')} />
                    <span className="ml-2">{yesText}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-9 flex-1 group',
                    'text-destructive border-destructive/20 hover:bg-destructive/10',
                    votedOn === 'no' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''
                  )}
                  onClick={() => handleVote('no')}
                >
                     <ThumbsDown className={cn('h-4 w-4 text-destructive', votedOn === 'no' && 'text-destructive-foreground')} />
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
                                 <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Flame
                                            key={i}
                                            className={cn(
                                            'h-4 w-4',
                                            (i * 2) < importanceLevel
                                                ? 'text-destructive fill-current'
                                                : 'text-muted-foreground/30'
                                            )}
                                        />
                                    ))}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{importanceTooltipText}</p>
                            </TooltipContent>
                        </Tooltip>
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
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent/50" onClick={handleBookmarkClick}>
                        <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current text-primary")} />
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
