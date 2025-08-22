

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { allTopics as initialTopics, getArgumentsForTopic } from '@/lib/data';
import type { Topic, Argument } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, Info, RefreshCw, Loader2, BarChart, FileText, History, MessageSquare, ListTree, Sun, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SuggestionForm } from '@/components/SuggestionForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LikertScale } from '@/components/LikertScale';
import { RankedChoice } from '@/components/RankedChoice';
import { QuadraticVote } from '@/components/QuadraticVote';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LiveResults } from '@/components/LiveResults';
import { RelatedTopics } from '@/components/RelatedTopics';
import { trackEvent } from '@/lib/analytics';
import { DebateSection } from '@/components/debate/DebateSection';
import { ArgumentChart } from '@/components/debate/ArgumentChart';

const VoteChart = dynamic(() => import('@/components/VoteChart').then(mod => mod.VoteChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

const translations = {
  en: {
    backToPolls: 'Back to Polls',
    topicDetails: 'Topic Details',
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
    topicNotFound: 'Topic not found.',
    structuredDebate: 'Structured Debate',
    debateViewList: 'List',
    debateViewChart: 'Chart',
    sourcesContext: 'Sources & Context',
    sourcesDescription: 'Sources and external links will be available here.',
    voteHistory: 'Vote History',
    loginToParticipateTitle: 'Log in to participate further',
    loginToParticipateDescription: 'To propose a new topic, you need to be logged in with your anonymous ID.',
    yes: 'Yes',
    no: 'No',
  },
  nb: {
    backToPolls: 'Tilbake til avstemninger',
    topicDetails: 'Emnedetaljer',
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
    topicNotFound: 'Emnet ble ikke funnet.',
    structuredDebate: 'Strukturert debatt',
    debateViewList: 'Liste',
    debateViewChart: 'Diagram',
    sourcesContext: 'Kilder og kontekst',
    sourcesDescription: 'Kilder og eksterne lenker vil være tilgjengelige her.',
    voteHistory: 'Stemmehistorikk',
    loginToParticipateTitle: 'Logg inn for å delta videre',
    loginToParticipateDescription: 'For å foreslå et nytt emne, må du være logget inn med din anonyme ID.',
    yes: 'Ja',
    no: 'Nei',
  }
};


export default function TopicPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const slug = params.slug as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voterId, setVoterId] = useState<string | null>(null);
  const [votedOn, setVotedOn] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [debateArgs, setDebateArgs] = useState<Argument[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [lang, setLang] = useState<'en' | 'nb'>('en');

  const t = translations[lang];

  useEffect(() => {
    setIsClient(true);
    setLoading(true);
    
    const selectedLang = (localStorage.getItem('selectedLanguage') || 'en') as 'en' | 'nb';
    setLang(selectedLang);
    
    // First, try to find the topic in the initial static list
    let foundTopic = initialTopics.find((t) => t.slug === slug);
    
    // If not found, check localStorage for custom topics
    if (!foundTopic) {
        const customTopics: Topic[] = JSON.parse(localStorage.getItem('custom_topics') || '[]');
        foundTopic = customTopics.find(t => t.slug === slug);
    }
    
    if (foundTopic) {
        const newVotes: Record<string, number> = {};
        
        // Load all possible vote counts from local storage, including abstain
        const allPossibleOptions = [...foundTopic.options.map(o => o.id), 'abstain'];
        allPossibleOptions.forEach(optionId => {
            const storedVotes = localStorage.getItem(`votes_for_${foundTopic!.id}_${optionId}`);
            newVotes[optionId] = storedVotes ? parseInt(storedVotes, 10) : (foundTopic!.votes[optionId] || 0);
        });

        // Recalculate total votes based on primary options (excluding abstain)
        const newTotalVotes = foundTopic.options
            .filter(o => o.id !== 'abstain')
            .reduce((sum, option) => sum + (newVotes[option.id] || 0), 0);

        const initialTopicState = { ...foundTopic, votes: newVotes, totalVotes: newTotalVotes };
        setTopic(initialTopicState);
        
        const baseArgs = getArgumentsForTopic(foundTopic.id);
        setDebateArgs(baseArgs);


        const currentVoterId = localStorage.getItem('anonymousVoterId');
        setVoterId(currentVoterId);

        if (currentVoterId) {
            const previousVote = localStorage.getItem(`voted_on_${foundTopic.id}`);
            setVotedOn(previousVote);
            if (foundTopic.voteType === 'yesno') {
                setSelectedOption(previousVote);
            }
        }
    } else {
        setTopic(null);
    }
    
    setLoading(false);
  }, [slug]);

  const handleVote = (voteData: string | string[]) => {
    if (!voterId) {
      toast({
        variant: 'destructive',
        title: t.authRequiredTitle,
        description: t.authRequiredDescription,
      });
      router.push('/login');
      return;
    }
    if (!topic) return;

    const currentVote = Array.isArray(voteData) ? voteData[0] : voteData;
    if (!currentVote) return;
    
    // Get the previous vote directly from localStorage to ensure it's the most recent value.
    const previouslyVotedOn = localStorage.getItem(`voted_on_${topic.id}`);

    if (previouslyVotedOn === currentVote) return;

    if (previouslyVotedOn) {
        trackEvent('vote_changed', { topicId: topic.id, from: previouslyVotedOn, to: currentVote });
    } else {
        trackEvent('vote_cast', { topicId: topic.id, choice: currentVote });
    }

    setTopic(currentTopic => {
        if (!currentTopic) return null;

        const newVotes = { ...currentTopic.votes };

        // 1. Decrement the old vote if there was one
        if (previouslyVotedOn && newVotes[previouslyVotedOn] !== undefined) {
            newVotes[previouslyVotedOn] = Math.max(0, newVotes[previouslyVotedOn] - 1);
            localStorage.setItem(`votes_for_${currentTopic.id}_${previouslyVotedOn}`, newVotes[previouslyVotedOn].toString());
        }

        // 2. Increment the new vote
        newVotes[currentVote] = (newVotes[currentVote] || 0) + 1;
        localStorage.setItem(`votes_for_${currentTopic.id}_${currentVote}`, newVotes[currentVote].toString());
        
        // 3. Recalculate the total votes from scratch (excluding 'abstain')
        const newTotalVotes = currentTopic.options
            .filter(o => o.id !== 'abstain')
            .reduce((sum, option) => sum + (newVotes[option.id] || 0), 0);

        // 4. Return the new state
        return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
    });
      
    // 5. Persist the user's new vote choice
    localStorage.setItem(`voted_on_${topic.id}`, currentVote);
    setVotedOn(currentVote);
    if(topic.voteType === 'yesno') {
        setSelectedOption(currentVote);
    }

    const voteLabel = Array.isArray(voteData) 
      ? t.yourRanking
      : [...topic.options, {id: 'abstain', label: 'Abstain'}].find((o) => o.id === currentVote)?.label || currentVote;

    toast({
        title: previouslyVotedOn ? t.voteChangedTitle : t.voteCastTitle,
        description: t.voteRecordedDescription(voteLabel),
    });
  };
  
  const handleRevote = () => {
    setVotedOn(null);
    setSelectedOption(null);
     toast({
      title: t.castNewVoteTitle,
      description: t.castNewVoteDescription,
    });
  };
  
  const renderVoteComponent = () => {
    if (!topic) return null;

    if (votedOn) {
      const votedForLabel = topic.voteType === 'ranked' 
        ? t.yourRanking
        : [...topic.options, {id: 'abstain', label: t.abstain}].find((o) => o.id === votedOn)?.label || votedOn

      return (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-primary" />
              {t.youHaveVoted}
            </CardTitle>
            <CardDescription>
              {t.youVotedFor} <strong>{votedForLabel}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t.changeVoteDescription}</p>
            <Button className="w-full" onClick={handleRevote}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t.changeVoteButton}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    switch (topic.voteType) {
        case 'likert':
            return <LikertScale topic={topic} onVote={handleVote} />;
        case 'ranked':
            return <RankedChoice topic={topic} onVote={handleVote} />;
        case 'quadratic':
             return <QuadraticVote topic={topic} />;
        case 'yesno':
        default:
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>{t.castVote}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-4">
                        <div className="flex w-full items-center justify-center gap-4">
                           <Button variant="outline" size="lg" className="h-12 flex-1 text-lg hover:bg-primary hover:text-primary-foreground group" onClick={() => handleVote('yes')}>
                               <ThumbsUp className="h-5 w-5 text-[hsl(var(--chart-2))] group-hover:text-primary-foreground" />
                               <span className="ml-2">{t.yes}</span>
                           </Button>
                           <Button variant="outline" size="lg" className="h-12 flex-1 text-lg hover:bg-destructive hover:text-destructive-foreground group" onClick={() => handleVote('no')}>
                               <ThumbsDown className="h-5 w-5 text-[hsl(var(--chart-1))] group-hover:text-destructive-foreground" />
                                <span className="ml-2">{t.no}</span>
                           </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4 border-t pt-6">
                        <Button variant="outline" onClick={() => handleVote('abstain')} className="hover:bg-accent">{t.abstain}</Button>
                    </CardFooter>
                </Card>
            );
    }
  };

  if (!isClient || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!topic) {
    return <div className="container mx-auto px-4 py-8 text-center">{t.topicNotFound}</div>;
  }

  const question = lang === 'nb' ? topic.question : topic.question_en;
  const description = lang === 'nb' ? topic.description : topic.description_en;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.backToPolls}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
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
           
           {renderVoteComponent()}
           
           {votedOn && <LiveResults topic={topic} />}

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-headline">{t.structuredDebate}</h2>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                   <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 gap-2">
                       <ListTree /> {t.debateViewList}
                   </Button>
                    <Button variant={viewMode === 'chart' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('chart')} className="h-8 gap-2">
                       <Sun /> {t.debateViewChart}
                   </Button>
                </div>
              </div>
              
              {viewMode === 'list' ? (
                <DebateSection topicId={topic.id} initialArgs={debateArgs} onArgsChange={setDebateArgs} lang={lang} />
              ) : (
                <ArgumentChart args={debateArgs} topicQuestion={topic.question} lang={lang} />
              )}
           </div>
           
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

            <RelatedTopics topicId={topic.id} subcategoryId={topic.subcategoryId} />

        </div>

        <div className="space-y-8 lg:sticky lg:top-24 self-start">
          {voterId ? (
            <SuggestionForm />
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t.loginToParticipateTitle}</AlertTitle>
              <AlertDescription>
                {t.loginToParticipateDescription}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
