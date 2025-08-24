
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTopicBySlug, getArgumentsForTopic, getRelatedTopics } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VoteChart } from '@/components/VoteChart';
import { Info, FileText, History, ThumbsUp, ThumbsDown, Link as LinkIcon, Building } from 'lucide-react';
import { RelatedTopics } from '@/components/RelatedTopics';
import { SuggestionForm } from '@/components/SuggestionForm';
import { Separator } from '@/components/ui/separator';
import { TopicInteraction } from './TopicInteraction';
import { Skeleton } from '@/components/ui/skeleton';
import { DebateSection } from '@/components/debate/DebateSection';
import Link from 'next/link';

interface TopicPageProps {
  params: {
    slug: string;
  };
}

// This is now a Server Component. It fetches data on the server and renders the initial HTML.
export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = params;

  // 1. Data Fetching on the Server
  const topic = getTopicBySlug(slug);

  // 2. Not Found Handling on the Server
  if (!topic) {
    notFound();
  }

  const initialDebateArgs = getArgumentsForTopic(topic.id);

  // For this prototype, we'll assume a static language 'en' on the server.
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

  // 3. Render Layout with Client Components for Interactivity
  return (
    <div className="container mx-auto max-w-4xl px-4 py-4 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{question}</h1>
               {topic.background_md && (
                <CardDescription className="pt-2 text-base">
                    {topic.background_md}
                </CardDescription>
               )}
            </CardHeader>
          </Card>
          
           <section>
              <h2 className="text-2xl font-bold font-headline mb-4">{t.argumentsFor}</h2>
              <div className="space-y-4">
                  {topic.pros && topic.pros.length > 0 ? (
                      topic.pros.map((pro, index) => (
                          <Card key={index} className="bg-primary/10 border-primary/20">
                              <CardContent className="p-4 flex items-start gap-4">
                                  <ThumbsUp className="h-5 w-5 text-primary mt-1 shrink-0" />
                                  <p className="text-primary/90">{pro}</p>
                              </CardContent>
                          </Card>
                      ))
                  ) : (
                      <p className="text-muted-foreground">No arguments for this side have been provided yet.</p>
                  )}
              </div>
          </section>
           <section>
              <h2 className="text-2xl font-bold font-headline mb-4">{t.argumentsAgainst}</h2>
              <div className="space-y-4">
                  {topic.cons && topic.cons.length > 0 ? (
                      topic.cons.map((con, index) => (
                           <Card key={index} className="bg-destructive/10 border-destructive/20">
                              <CardContent className="p-4 flex items-start gap-4">
                                  <ThumbsDown className="h-5 w-5 text-destructive mt-1 shrink-0" />
                                  <p className="text-destructive/90">{con}</p>
                              </CardContent>
                          </Card>
                      ))
                  ) : (
                       <p className="text-muted-foreground">No arguments against this side have been provided yet.</p>
                  )}
              </div>
          </section>

          <Suspense fallback={<TopicInteraction.Skeleton />}>
            <TopicInteraction topic={topic} />
          </Suspense>

          <Accordion type="single" collapsible className="w-full" defaultValue="history">
            <AccordionItem value="history" className="border-none">
                <AccordionTrigger className="text-xl font-semibold p-4 border rounded-lg bg-card text-card-foreground shadow-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t.voteHistory}
                      </div>
                </AccordionTrigger>
                <AccordionContent className="pt-6">
                    <VoteChart topic={topic} />
                </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="my-12" />
          
         <section>
            <h2 className="text-2xl font-bold font-headline mb-6">{t.structuredDebate}</h2>
             <Suspense fallback={<DebateSection.Skeleton />}>
              <DebateSection topicId={topic.id} initialArgs={initialDebateArgs} lang={lang} />
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

          <div className="max-w-3xl mx-auto w-full">
              <SuggestionForm />
          </div>
        </div>
        <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-20 self-start">
          <RelatedTopics topicId={topic.id} subcategoryId={topic.subcategoryId} />
        </aside>
      </div>
    </div>
  );
}
