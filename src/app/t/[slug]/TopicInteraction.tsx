
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, RefreshCw, ThumbsUp, ThumbsDown, ListTree, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LikertScale } from '@/components/LikertScale';
import { RankedChoice } from '@/components/RankedChoice';
import { QuadraticVote } from '@/components/QuadraticVote';
import { LiveResults } from '@/components/LiveResults';
import { trackEvent } from '@/lib/analytics';
import { DebateSection } from '@/components/debate/DebateSection';
import { ArgumentChart } from '@/components/debate/ArgumentChart';
import { ImportanceSlider } from '@/components/ImportanceSlider';
import { cn } from '@/lib/utils';
import type { Topic, Argument } from '@/lib/types';
import { Info } from 'lucide-react';

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
    structuredDebate: 'Structured Debate',
    debateViewList: 'List',
    debateViewChart: 'Chart',
    loginToParticipateTitle: 'Log in to participate further',
    loginToParticipateDescription: 'To propose a new topic, you need to be logged in with your anonymous ID.',
    yes: 'Yes',
    no: 'No',
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
    structuredDebate: 'Strukturert debatt',
    debateViewList: 'Liste',
    debateViewChart: 'Diagram',
    loginToParticipateTitle: 'Logg inn for å delta videre',
    loginToParticipateDescription: 'For å foreslå et nytt emne, må du være logget inn med din anonyme ID.',
    yes: 'Ja',
    no: 'Nei',
  }
};

interface TopicInteractionProps {
  topic: Topic;
  initialDebateArgs: Argument[];
}

// This new Client Component handles all user interactions on the page.
export function TopicInteraction({ topic: initialTopic, initialDebateArgs }: TopicInteractionProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for all interactive parts of the page.
  const [topic, setTopic] = useState<Topic>(initialTopic);
  const [voterId, setVoterId] = useState<string | null>(null);
  const [votedOn, setVotedOn] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [lang, setLang] = useState<'en' | 'nb'>('en');

  const t = translations[lang];

  // This effect runs once on the client to initialize state from localStorage.
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
    
    const currentVote = Array.isArray(voteData) ? voteData[0] : voteData;
    if (!currentVote) return;

    const previouslyVotedOn = localStorage.getItem(`voted_on_${topic.id}`);
    if (previouslyVotedOn === currentVote) return;

    trackEvent(previouslyVotedOn ? 'vote_changed' : 'vote_cast', { topicId: topic.id, from: previouslyVotedOn, to: currentVote });

    setTopic(currentTopic => {
        const newVotes = { ...currentTopic.votes };
        if (previouslyVotedOn) {
            newVotes[previouslyVotedOn] = Math.max(0, (newVotes[previouslyVotedOn] || 1) - 1);
            localStorage.setItem(`votes_for_${topic.id}_${previouslyVotedOn}`, newVotes[previouslyVotedOn].toString());
        }
        newVotes[currentVote] = (newVotes[currentVote] || 0) + 1;
        localStorage.setItem(`votes_for_${topic.id}_${currentVote}`, newVotes[currentVote].toString());

        const newTotalVotes = currentTopic.options
            .filter(o => o.id !== 'abstain')
            .reduce((sum, option) => sum + (newVotes[option.id] || 0), 0);

        return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
    });
      
    localStorage.setItem(`voted_on_${topic.id}`, currentVote);
    setVotedOn(currentVote);

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
     toast({
      title: t.castNewVoteTitle,
      description: t.castNewVoteDescription,
    });
  };
  
  const renderVoteComponent = () => {
    if (votedOn) {
      const votedForLabel = (topic.voteType === 'ranked' || topic.voteType === 'likert')
        ? [...topic.options, {id: 'abstain', label: t.abstain}].find((o) => o.id === votedOn)?.label || votedOn
        : [...topic.options, {id: 'abstain', label: t.abstain}].find((o) => o.id === votedOn)?.label || votedOn;

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
        case 'likert': return <LikertScale topic={topic} onVote={handleVote} />;
        case 'ranked': return <RankedChoice topic={topic} onVote={handleVote} />;
        case 'quadratic': return <QuadraticVote topic={topic} />;
        case 'yesno':
        default:
            return (
                 <Card>
                    <CardHeader><CardTitle>{t.castVote}</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-4">
                        <div className="flex w-full items-center justify-center gap-4">
                           <Button size="lg" className="h-14 flex-1 text-lg bg-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2))]/90 text-white" onClick={() => handleVote('yes')}>
                               <ThumbsUp className="h-6 w-6 mr-2" />{t.yes}
                           </Button>
                           <Button size="lg" className="h-14 flex-1 text-lg bg-[hsl(var(--chart-1))] hover:bg-[hsl(var(--chart-1))]/90 text-white" onClick={() => handleVote('no')}>
                               <ThumbsDown className="h-6 w-6 mr-2" />{t.no}
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

  return (
    <>
      {renderVoteComponent()}
      
      {votedOn && <LiveResults topic={topic} />}
      
      {voterId ? (
        <ImportanceSlider topicId={topic.id} />
      ) : (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Log in to participate</AlertTitle>
            <AlertDescription>Rate this topic's importance and join the debate by logging in.</AlertDescription>
        </Alert>
      )}

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
          <DebateSection topicId={topic.id} initialArgs={initialDebateArgs} lang={lang} />
        ) : (
          <ArgumentChart args={initialDebateArgs} topicQuestion={topic.question} lang={lang} />
        )}
      </div>
    </>
  );
}
