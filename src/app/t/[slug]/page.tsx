

'use client';

import { Suspense, useEffect, useState, use } from 'react';
import { notFound, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getTopicBySlug, getArgumentsForTopic, allTopics } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VoteChart } from '@/components/VoteChart';
import { Info, FileText, History, ThumbsUp, ThumbsDown, Link as LinkIcon, Building, Flame, Users, Bookmark } from 'lucide-react';
import { RelatedTopics } from '@/components/RelatedTopics';
import { SuggestionForm } from '@/components/SuggestionForm';
import { Separator } from '@/components/ui/separator';
import { TopicInteraction } from './TopicInteraction';
import { Skeleton } from '@/components/ui/skeleton';
import { DebateSection } from '@/components/debate/DebateSection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TopicFooter } from './TopicFooter';
import type { Topic } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import React from 'react';
import { DebateSimulator } from '@/components/debate/DebateSimulator';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { LiveResults } from '@/components/LiveResults';
import { castVoteAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

// Translations object for multilingual support.
const translations = {
  en: {
    castVote: 'Cast Your Anonymous Vote',
    submitVote: 'Submit Vote',
    abstain: 'Abstain / No Opinion',
    youHaveVoted: 'You have voted',
    youVotedFor: 'You voted for:',
    yourRanking: 'your ranking',
    changeVoteDescription: 'You can change your vote at any time during the voting period.',
    changeVoteButton: 'Change Your Vote',
    castNewVoteTitle: 'Cast a new vote',
    castNewVoteDescription: 'You may now select a different option.',
    authRequiredTitle: 'Authentication Required',
    authRequiredDescription: 'You must be logged in to vote.',
    voteChangedTitle: 'Vote Changed!',
    voteCastTitle: 'Vote Cast!',
    voteRecordedDescription: (voteLabel: string) => `Your anonymous vote for "${voteLabel}" has been recorded.`,
    loginToParticipateTitle: 'Log in to participate further',
    loginToParticipateDescription: 'To propose a new topic, you need to be logged in with your anonymous ID.',
    yes: 'Yes',
    no: 'No',
    youAbstained: 'You have abstained from this vote.',
    structuredDebate: 'Structured Debate',
    sources: 'Sources',
    topicDetails: 'Topic Details',
  },
  nb: {
    castVote: 'Avgi din anonyme stemme',
    submitVote: 'Send inn stemme',
    abstain: 'Avstå / Ingen mening',
    youHaveVoted: 'Du har stemt',
    youVotedFor: 'Du stemte på:',
    yourRanking: 'din rangering',
    changeVoteDescription: 'Du kan endre stemmen din når som helst i stemmeperioden.',
    changeVoteButton: 'Endre din stemme',
    castNewVoteTitle: 'Avgi en ny stemme',
    castNewVoteDescription: 'Du kan nå velge et annet alternativ.',
    authRequiredTitle: 'Autentisering kreves',
    authRequiredDescription: 'Du må være logget inn for å stemme.',
    voteChangedTitle: 'Stemme endret!',
    voteCastTitle: 'Stemme avgitt!',
    voteRecordedDescription: (voteLabel: string) => `Din anonyme stemme for "${voteLabel}" er registrert.`,
    loginToParticipateTitle: 'Logg inn for å delta videre',
    loginToParticipateDescription: 'For å foreslå et nytt emne, må du være logget inn med din anonyme ID.',
    yes: 'Ja',
    no: 'Nei',
    youAbstained: 'Du har avstått fra denne avstemningen.',
    structuredDebate: 'Strukturert Debatt',
    sources: 'Kilder',
    topicDetails: 'Detaljer om Temaet',
  }
};


/**
 * @fileoverview This component orchestrates the topic carousel functionality.
 *
 * @description
 * The `TopicCarousel` is a client component responsible for displaying topics in a swipeable/clickable
 * carousel. It manages the two-way synchronization between the carousel's visible slide and the
 * browser's URL.
 *
 * Key Responsibilities:
 * 1.  **State Management**: It uses `useState` to manage the carousel's API instance (`api`).
 * 2.  **URL-to-Carousel Sync**: A `useEffect` hook watches for changes in the `pathname` (from the browser's
 *     back/forward buttons). When a change is detected, it finds the corresponding topic index and
 *     programmatically scrolls the carousel to that slide.
 * 3.  **Carousel-to-URL Sync**: It registers a `onSelect` event handler with the carousel instance.
 *     This event fires *after* a slide transition (from swipe or button click) completes. The handler
 *     then updates the browser's URL using `router.replace()` to match the new topic's slug. This
 *     method is used to avoid polluting the browser's history with every swipe.
 * 4.  **Performance Optimization**: To make navigation feel instant, it uses another `useEffect` to
 *     proactively pre-fetch the next and previous topics in the carousel using `router.prefetch()`.
 */
function TopicCarousel({ topics, initialSlug }: { topics: Topic[], initialSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [api, setApi] = useState<CarouselApi>();

  const initialIndex = React.useMemo(() => topics.findIndex(t => t.slug === initialSlug), [topics, initialSlug]);
  
  const isSimMode = process.env.NODE_ENV !== 'production' && searchParams.get('sim') === '1';

  // Effect to synchronize URL to carousel state (e.g., on back/forward)
  useEffect(() => {
    if (!api) return;
    const currentTopicIndex = topics.findIndex(t => pathname.includes(t.slug));
    if (currentTopicIndex !== -1 && currentTopicIndex !== api.selectedScrollSnap()) {
        api.scrollTo(currentTopicIndex);
    }
  }, [pathname, api, topics]);
  
  // Effect to synchronize carousel state to URL and handle pre-fetching
  useEffect(() => {
    if (!api) return;

    // Handler to update URL when slide changes
    const handleSelect = () => {
      const newIndex = api.selectedScrollSnap();
      const newTopic = topics[newIndex];
      if (newTopic) {
        const currentParams = new URLSearchParams(window.location.search);
        const newUrl = `/t/${newTopic.slug}?${currentParams.toString()}`;
        router.replace(newUrl);
        // Why: Explicitly scroll to the top. `router.replace` without `scroll: false`
        // should handle this, but this is a more robust way to guarantee it,
        // preventing inconsistent browser behavior.
        window.scrollTo(0, 0);
      }
    };
    
    // Handler to prefetch adjacent slides for performance
    const handlePrefetch = () => {
        if (!api) return;
        const currentIndex = api.selectedScrollSnap();
        
        // Prefetch next 10 topics
        for (let i = 1; i <= 10; i++) {
            const nextIndex = currentIndex + i;
            if (nextIndex < topics.length) {
                const nextTopic = topics[nextIndex];
                if (nextTopic) {
                    router.prefetch(`/t/${nextTopic.slug}`);
                }
            } else {
                break; // Stop if we've reached the end of the array
            }
        }

        // Prefetch previous 2 topics for good measure
        for (let i = 1; i <= 2; i++) {
            const prevIndex = currentIndex - i;
            if (prevIndex >= 0) {
                const prevTopic = topics[prevIndex];
                if (prevTopic) {
                    router.prefetch(`/t/${prevTopic.slug}`);
                }
            } else {
                break; // Stop if we've reached the beginning
            }
        }
    }

    api.on("select", handleSelect);
    api.on("select", handlePrefetch); // Also prefetch on select
    
    // Initial prefetch for the first loaded topic
    handlePrefetch();

    return () => {
      api.off("select", handleSelect);
      api.off("select", handlePrefetch);
    };
  }, [api, topics, router]);


  return (
    <Carousel setApi={setApi} className="w-full" opts={{
        startIndex: initialIndex,
        duration: 20, // Faster transition animation
    }}>
      <CarouselContent>
        {topics.map((topic) => {
            return (
              <CarouselItem key={topic.id}>
                <TopicPageContent topic={topic} isSimMode={isSimMode} />
              </CarouselItem>
            );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <ScrollToTopButton />
    </Carousel>
  );
}

function TopicPageContent({ topic, isSimMode }: { topic: Topic, isSimMode: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentTopic, setCurrentTopic] = useState<Topic>(topic);
  const [votedOn, setVotedOn] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'nb'>('en');
  const [voterId, setVoterId] = useState<string | null>(null);
  
  useEffect(() => {
    const selectedLang = (localStorage.getItem('selectedLanguage') || 'en') as 'en' | 'nb';
    setLang(selectedLang);
    
    const currentVoterId = localStorage.getItem('anonymousVoterId');
    setVoterId(currentVoterId);

    if (currentVoterId) {
      const previousVote = localStorage.getItem(`voted_on_${topic.id}`);
      setVotedOn(previousVote);
    }
  }, [topic.id]);

  const handleVote = async (voteData: string | string[]) => {
    const t = translations[lang];
    if (!voterId) {
      toast({
        variant: 'destructive',
        title: t.authRequiredTitle,
        description: t.authRequiredDescription,
      });
      router.push('/login');
      return;
    }
    
    const currentVote = Array.isArray(voteData) ? voteData[0] : voteData;
    if (!currentVote || votedOn === currentVote) return;

    const previouslyVotedOn = votedOn;
    
    setVotedOn(currentVote);
    localStorage.setItem(`voted_on_${topic.id}`, currentVote);

    setCurrentTopic(ct => {
        const newVotes = { ...ct.votes };
        if (previouslyVotedOn) {
            newVotes[previouslyVotedOn] = Math.max(0, (newVotes[previouslyVotedOn] || 1) - 1);
        }
        newVotes[currentVote] = (newVotes[currentVote] || 0) + 1;
        const newTotalVotes = Object.values(newVotes).reduce((sum, v) => sum + v, 0);
        return { ...ct, votes: newVotes, totalVotes: newTotalVotes };
    });
    
    try {
      trackEvent(previouslyVotedOn ? 'vote_changed' : 'vote_cast', { topicId: topic.id, from: previouslyVotedOn, to: currentVote });
      
      const result = await castVoteAction({ topicId: topic.id, voteOption: currentVote, voterId });

      if (!result.success) {
        throw new Error(result.message);
      }
      
      const voteLabel = Array.isArray(voteData) 
        ? t.yourRanking
        : [...topic.options, {id: 'abstain', label: 'Abstain'}].find((o) => o.id === currentVote)?.label || currentVote;
        
      toast({
          title: previouslyVotedOn ? t.voteChangedTitle : t.voteCastTitle,
          description: t.voteRecordedDescription(voteLabel),
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Vote Failed',
        description: error.message || 'Could not record your vote. Please try again.',
      });

      setVotedOn(previouslyVotedOn);
      if (previouslyVotedOn) {
        localStorage.setItem(`voted_on_${topic.id}`, previouslyVotedOn);
      } else {
        localStorage.removeItem(`voted_on_${topic.id}`);
      }

      setCurrentTopic(ct => {
          const newVotes = { ...ct.votes };
          newVotes[currentVote] = Math.max(0, (newVotes[currentVote] || 1) - 1);
          if (previouslyVotedOn) {
              newVotes[previouslyVotedOn] = (newVotes[previouslyVotedOn] || 0) + 1;
          }
          const newTotalVotes = Object.values(newVotes).reduce((sum, v) => sum + v, 0);
          return { ...ct, votes: newVotes, totalVotes: newTotalVotes };
      });
    }
  };

  const handleRevote = () => {
    const t = translations[lang];
    setVotedOn(null);
     toast({
      title: t.castNewVoteTitle,
      description: t.castNewVoteDescription,
    });
  };

  if (!topic) return null;

  const initialDebateArgs = getArgumentsForTopic(topic.id);
  const t = translations[lang];
  const question = lang === 'nb' ? topic.question : topic.question_en;
  const description = lang === 'nb' ? topic.description : topic.description_en;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4 md:py-8">
      {isSimMode && <DebateSimulator topic={topic} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-blue-950 text-primary-foreground">
            <CardHeader className="p-4 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{question}</h1>
              {topic.background_md && (
                <CardDescription className="pt-2 text-base text-primary-foreground/80">
                    {topic.background_md}
                </CardDescription>
              )}
            </CardHeader>
            <CardFooter className="p-4 md:p-6 border-t border-primary-foreground/20">
              <TopicFooter topic={currentTopic} />
            </CardFooter>
          </Card>
          
          <Suspense fallback={<TopicInteraction.Skeleton />}>
            <TopicInteraction 
              topic={currentTopic} 
              votedOn={votedOn} 
              onVote={handleVote} 
              onRevote={handleRevote}
            />
          </Suspense>
          
          {votedOn && <LiveResults topic={currentTopic} />}

          <VoteChart topic={currentTopic} />

          <Separator className="my-12" />
          
          <section>
            <h2 className="text-2xl font-bold font-headline mb-6">{t.structuredDebate}</h2>
            <Suspense fallback={<DebateSection.Skeleton />}>
              <DebateSection 
                topicId={topic.id} 
                topicQuestion={question} 
                initialArgs={initialDebateArgs} 
                lang={lang} 
              />
            </Suspense>
          </section>

          {(topic.sources && topic.sources.length > 0) && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="sources" className="border rounded-lg bg-card text-card-foreground shadow-sm">
                <AccordionTrigger className="flex justify-start items-center gap-2 p-4 text-base font-semibold hover:no-underline">
                  <FileText className="h-5 w-5" />
                  {t.sources}
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0 space-y-6">
                  <ul className="space-y-2 pt-4 border-t">
                    {topic.sources.map((source, index) => (
                      <li key={index}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <LinkIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{source.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          <Card>
            <CardHeader>
                <CardTitle>{t.topicDetails}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
                    <p className="text-base text-muted-foreground">{description}</p>
                </CardContent>
          </Card>

          <Separator className="my-12" />
          <section>
            <SuggestionForm />
          </section>
        </div>
        <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-20 self-start">
          <RelatedTopics topicId={topic.id} subcategoryId={topic.subcategoryId} />
        </aside>
      </div>
    </div>
  );
}

// This remains a Server Component. It fetches the data and passes it to the client component.
export default function TopicPageWrapper({ params }: { params: { slug: string }}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
           <TopicCarousel topics={allTopics} initialSlug={params.slug} />
        </Suspense>
    )
}
