
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTopicBySlug, getArgumentsForTopic, getRelatedTopics } from '@/lib/data';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VoteChart } from '@/components/VoteChart';
import { Info, FileText, History, Loader2 } from 'lucide-react';
import { RelatedTopics } from '@/components/RelatedTopics';
import { SuggestionForm } from '@/components/SuggestionForm';
import { Separator } from '@/components/ui/separator';
import { TopicInteraction } from './TopicInteraction';
import { Skeleton } from '@/components/ui/skeleton';
import { DebateSection } from '@/components/debate/DebateSection';

interface TopicPageProps {
  params: {
    slug: string;
  };
}

// This is now a Server Component. It fetches data on the server and renders the initial HTML.
export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = params;

  // 1. Data Fetching on the Server
  // This function now encapsulates the logic of finding the topic.
  // In a real app, this would be a database query.
  const topic = getTopicBySlug(slug);

  // 2. Not Found Handling on the Server
  // If no topic is found for the given slug, we immediately render the not-found page.
  // This is better for SEO and performance than handling it on the client.
  if (!topic) {
    notFound();
  }

  // Fetch related data on the server as well.
  const initialDebateArgs = getArgumentsForTopic(topic.id);

  // For this prototype, we'll assume a static language 'en' on the server.
  // A real app would use request headers or user preferences.
  const lang = 'en';
  const t = {
    backToPolls: 'Back to Polls',
    topicDetails: 'Topic Details',
    sourcesContext: 'Sources & Context',
    sourcesDescription: 'Sources and external links will be available here.',
    voteHistory: 'Vote History',
    structuredDebate: 'Structured Debate',
  };

  const question = lang === 'nb' ? topic.question : topic.question_en;
  const description = lang === 'nb' ? topic.description : topic.description_en;

  // 3. Render Layout with Client Components for Interactivity
  // The Server Component's job is to structure the page and pass initial data
  // down to the Client Components that will handle user interaction.
  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Main Page Header */}
      <Card className="mb-8">
        <CardHeader className="p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">{question}</h1>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Accordion type="single" collapsible className="w-full" defaultValue="description">
            <AccordionItem value="description">
              <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 border-b-0 -mx-4 -mt-4">
                <Info className="h-5 w-5" /> {t.topicDetails}
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 -mx-4 -mb-4">
                <p className="text-base text-muted-foreground">{description}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        
        {/* Left Column: Main Content (Debate) */}
        <div className="lg:col-span-2 space-y-8">
           <section>
              <h2 className="text-2xl font-bold font-headline mb-6">{t.structuredDebate}</h2>
               <Suspense fallback={<DebateSection.Skeleton />}>
                <DebateSection topicId={topic.id} initialArgs={initialDebateArgs} lang={lang} />
               </Suspense>
           </section>

            <RelatedTopics topicId={topic.id} subcategoryId={topic.subcategoryId} />

            <Separator className="my-12" />

            <div className="max-w-3xl mx-auto w-full">
                <SuggestionForm />
            </div>
        </div>

        {/* Right Column: Sticky Sidebar (Voting & Data) */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-20 h-fit">
           <Suspense fallback={<TopicInteraction.Skeleton />}>
              <TopicInteraction topic={topic} />
          </Suspense>

           <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="history">
            <AccordionItem value="sources">
              <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                <FileText className="h-5 w-5" /> {t.sourcesContext}
              </AccordionTrigger>
              <AccordionContent className="p-6 border border-t-0 rounded-b-lg">
                <p className="text-base text-muted-foreground">{t.sourcesDescription}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="history">
              <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                <History className="h-5 w-5" /> {t.voteHistory}
              </AccordionTrigger>
              <AccordionContent className="pt-0">
                <VoteChart topic={topic} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
