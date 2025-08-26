
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
            if (!topic) return null;

            const initialDebateArgs = getArgumentsForTopic(topic.id);
            const lang = 'en';
            const t = {
              backToPolls: 'Back to Polls',
              topicDetails: 'Topic Details',
              sourcesContext: 'Sources',
              voteHistory: 'Vote History',
              structuredDebate: 'Structured Debate',
              argumentsFor: 'Arguments For',
              argumentsAgainst: 'Arguments Against',
              sources: 'Sources',
              background: 'Background'
            };

            const question = lang === 'nb' ? topic.question : topic.question_en;
            const description = lang === 'nb' ? topic.description : topic.description_en;

            return (
              <CarouselItem key={topic.id}>
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
                          <TopicFooter topic={topic} />
                        </CardFooter>
                      </Card>
                      
                      <Suspense fallback={<TopicInteraction.Skeleton />}>
                        <TopicInteraction topic={topic} />
                      </Suspense>

                      <VoteChart topic={topic} />

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

// This remains a Server Component. It fetches the data and passes it to the client component.
export default function TopicPageWrapper({ params }: { params: { slug: string }}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
           <TopicCarousel topics={allTopics} initialSlug={params.slug} />
        </Suspense>
    )
}
