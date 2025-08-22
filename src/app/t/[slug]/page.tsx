

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
import { ArrowLeft, CheckCircle, Info, RefreshCw, Loader2, BarChart, FileText, History, MessageSquare, ListTree, Sun } from 'lucide-react';
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
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setIsClient(true);
    setLoading(true);
    
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
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
        title: 'Authentication Required',
        description: 'You must be logged in to vote.',
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
      ? 'your ranking' 
      : [...topic.options, {id: 'abstain', label: 'Abstain'}].find((o) => o.id === currentVote)?.label || currentVote;

    toast({
        title: previouslyVotedOn ? 'Vote Changed!' : 'Vote Cast!',
        description: `Your anonymous vote for "${voteLabel}" has been recorded.`,
    });
  };
  
  const handleRevote = () => {
    setVotedOn(null);
    setSelectedOption(null);
     toast({
      title: 'Cast a new vote',
      description: 'You may now select a different option.',
    });
  };
  
  const renderVoteComponent = () => {
    if (!topic) return null;

    if (votedOn) {
      return (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-primary" />
              You have voted
            </CardTitle>
            <CardDescription>
              You voted for: <strong>{topic.voteType === 'ranked' ? 'your ranking' : [...topic.options, {id: 'abstain', label: 'Abstain'}].find((o) => o.id === votedOn)?.label || votedOn}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You can change your vote at any time during the voting period.</p>
            <Button className="w-full" onClick={handleRevote}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Change Your Vote
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
                        <CardTitle>Cast Your Anonymous Vote</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''} className="gap-4">
                        {topic.options.filter(o => o.id !== 'abstain').map((option) => (
                            <Label
                            key={option.id}
                            htmlFor={option.id}
                            className="flex items-center space-x-4 border p-4 rounded-md cursor-pointer hover:bg-accent/50 has-[input:checked]:bg-accent/80 has-[input:checked]:border-primary text-base"
                            >
                            <RadioGroupItem value={option.id} id={option.id} />
                            <span className="font-medium">{option.label}</span>
                            </Label>
                        ))}
                        </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex-col gap-4 border-t pt-6">
                        <Button onClick={() => handleVote(selectedOption!)} disabled={!selectedOption} className="w-full h-12 text-lg">
                        Submit Vote
                        </Button>
                        <Button variant="outline" onClick={() => handleVote('abstain')}>Abstain / No Opinion</Button>
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
    return <div className="container mx-auto px-4 py-8 text-center">Topic not found.</div>;
  }

  const question = lang === 'nb' ? topic.question : topic.question_en;
  const description = lang === 'nb' ? topic.description : topic.description_en;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Polls
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="aspect-video relative mb-4">
                <Image
                  src={topic.imageUrl}
                  alt={question}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 67vw, 650px"
                  className="rounded-lg object-cover"
                  data-ai-hint={topic.aiHint}
                  priority
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{question}</h1>
            </CardHeader>
             <CardContent>
                 <Accordion type="single" collapsible className="w-full" defaultValue="description">
                     <AccordionItem value="description">
                        <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 border-b-0">
                            <Info className="h-5 w-5" /> Topic Details
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                            <p className="text-base text-muted-foreground">{description}</p>
                        </AccordionContent>
                    </AccordionItem>
                 </Accordion>
             </CardContent>
          </Card>
          
           <div className="lg:hidden">
             {renderVoteComponent()}
           </div>
           
           {votedOn && <LiveResults topic={topic} />}

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-headline">Structured Debate</h2>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                   <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 gap-2">
                       <ListTree /> List
                   </Button>
                    <Button variant={viewMode === 'chart' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('chart')} className="h-8 gap-2">
                       <Sun /> Chart
                   </Button>
                </div>
              </div>
              
              {viewMode === 'list' ? (
                <DebateSection topicId={topic.id} initialArgs={debateArgs} onArgsChange={setDebateArgs} />
              ) : (
                <ArgumentChart args={debateArgs} topicQuestion={topic.question} />
              )}
           </div>
           
           <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="sources">
                    <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <FileText className="h-5 w-5" /> Sources & Context
                    </AccordionTrigger>
                    <AccordionContent className="p-6 border border-t-0 rounded-b-lg">
                        <p className="text-base text-muted-foreground">Sources and external links will be available here.</p>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="history">
                    <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <History className="h-5 w-5" /> Vote History
                    </AccordionTrigger>
                    <AccordionContent className="pt-0">
                         <VoteChart topic={topic} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <RelatedTopics topicId={topic.id} subcategoryId={topic.subcategoryId} />

        </div>

        <div className="space-y-8 lg:sticky lg:top-24 self-start">
           <div className="hidden lg:block">
             {renderVoteComponent()}
           </div>

          {voterId ? (
            <SuggestionForm />
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Log in to participate further</AlertTitle>
              <AlertDescription>
                To propose a new topic, you need to be logged in with your anonymous ID.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
