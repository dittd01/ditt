
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, RefreshCw, ThumbsUp, ThumbsDown, ListTree, Sun, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LikertScale } from '@/components/LikertScale';
import { RankedChoice } from '@/components/RankedChoice';
import { QuadraticVote } from '@/components/QuadraticVote';
import { LiveResults } from '@/components/LiveResults';
import { trackEvent } from '@/lib/analytics';
import { ImportanceSlider } from '@/components/ImportanceSlider';
import { cn } from '@/lib/utils';
import type { Topic, Argument } from '@/lib/types';
import { castVoteAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';


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
  }
};

interface TopicInteractionProps {
  topic: Topic;
}

// This new Client Component handles all user interactions on the page.
export function TopicInteraction({ topic: initialTopic }: TopicInteractionProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for all interactive parts of the page.
  const [topic, setTopic] = useState<Topic>(initialTopic);
  const [voterId, setVoterId] = useState<string | null>(null);
  const [votedOn, setVotedOn] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'nb'>('en');
  const [isClient, setIsClient] = useState(false);


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
    setIsClient(true);
  }, [topic.id]);

  const handleVote = async (voteData: string | string[]) => {
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
    
    // --- Optimistic UI Update ---
    // Why: Update the UI immediately for a responsive user experience,
    // without waiting for the server to respond. We will revert this
    // change if the server call fails.
    setVotedOn(currentVote);
    localStorage.setItem(`voted_on_${topic.id}`, currentVote); // Keep localStorage for persistence on refresh for now

    setTopic(currentTopic => {
        const newVotes = { ...currentTopic.votes };
        if (previouslyVotedOn) {
            newVotes[previouslyVotedOn] = Math.max(0, (newVotes[previouslyVotedOn] || 1) - 1);
        }
        newVotes[currentVote] = (newVotes[currentVote] || 0) + 1;
        const newTotalVotes = Object.values(newVotes).reduce((sum, v) => sum + v, 0);
        return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
    });
    
    // --- Server Action Call ---
    try {
      trackEvent(previouslyVotedOn ? 'vote_changed' : 'vote_cast', { topicId: topic.id, from: previouslyVotedOn, to: currentVote });
      
      const result = await castVoteAction({ topicId: topic.id, voteOption: currentVote, voterId });

      if (!result.success) {
        throw new Error(result.message);
      }
      
      // On success, show a confirmation toast. The optimistic UI is already correct.
      const voteLabel = Array.isArray(voteData) 
        ? t.yourRanking
        : [...topic.options, {id: 'abstain', label: 'Abstain'}].find((o) => o.id === currentVote)?.label || currentVote;
        
      toast({
          title: previouslyVotedOn ? t.voteChangedTitle : t.voteCastTitle,
          description: t.voteRecordedDescription(voteLabel),
      });

    } catch (error: any) {
      // --- Error Handling & UI Rollback ---
      // Why: If the server call fails, we must revert the UI to its
      // previous state to maintain data integrity and inform the user.
      toast({
        variant: 'destructive',
        title: 'Vote Failed',
        description: error.message || 'Could not record your vote. Please try again.',
      });

      // Revert the state
      setVotedOn(previouslyVotedOn);
      if (previouslyVotedOn) {
        localStorage.setItem(`voted_on_${topic.id}`, previouslyVotedOn);
      } else {
        localStorage.removeItem(`voted_on_${topic.id}`);
      }

      // Revert vote counts
      setTopic(currentTopic => {
          const newVotes = { ...currentTopic.votes };
          newVotes[currentVote] = Math.max(0, (newVotes[currentVote] || 1) - 1);
          if (previouslyVotedOn) {
              newVotes[previouslyVotedOn] = (newVotes[previouslyVotedOn] || 0) + 1;
          }
          const newTotalVotes = Object.values(newVotes).reduce((sum, v) => sum + v, 0);
          return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
      });
    }
  };
  
  const handleRevote = () => {
    setVotedOn(null);
     toast({
      title: t.castNewVoteTitle,
      description: t.castNewVoteDescription,
    });
  };
  
  const renderVoteComponent = () => {
    // Before the client has mounted and checked localStorage, render a skeleton.
    if (!isClient) {
      return <TopicInteraction.Skeleton />;
    }

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
                    <CardContent className="flex flex-col items-center justify-center gap-3">
                        <div className="flex w-full items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'h-9 flex-1 group',
                                'bg-primary/5 border-primary/20 hover:bg-primary/10',
                                votedOn === 'yes' && 'bg-primary text-primary-foreground hover:bg-primary/90',
                                votedOn && votedOn !== 'yes' && 'opacity-60 pointer-events-none'
                              )}
                              onClick={() => handleVote('yes')}
                              disabled={votedOn === 'no'}
                            >
                                <ThumbsUp className={cn('h-4 w-4 text-primary group-hover:text-primary-foreground', votedOn === 'yes' && 'text-primary-foreground')} />
                                <span className="ml-2">{t.yes}</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'h-9 flex-1 group',
                                'bg-destructive/5 border-destructive/20 hover:bg-destructive/10',
                                votedOn === 'no' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                                votedOn && votedOn !== 'no' && 'opacity-60 pointer-events-none'
                              )}
                              onClick={() => handleVote('no')}
                              disabled={votedOn === 'yes'}
                            >
                                 <ThumbsDown className={cn('h-4 w-4 text-destructive group-hover:text-destructive-foreground', votedOn === 'no' && 'text-destructive-foreground')} />
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

  return (
    <div className="space-y-8">
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
    </div>
  );
}

TopicInteraction.Skeleton = function TopicInteractionSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </CardContent>
                <CardFooter className="border-t pt-6 flex-col">
                    <Skeleton className="h-10 w-40" />
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                     <Skeleton className="h-6 w-1/2" />
                     <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
