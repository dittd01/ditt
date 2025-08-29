

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    youAbstained: 'You have abstained from this vote.',
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
  }
};

interface TopicInteractionProps {
  topic: Topic;
  votedOn: string | null;
  onVote: (voteData: string | string[]) => void;
  onRevote: () => void;
}

// This new Client Component handles all user interactions on the page.
export function TopicInteraction({ topic, votedOn, onVote, onRevote }: TopicInteractionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  // State for all interactive parts of the page.
  const [voterId, setVoterId] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'nb'>('en');
  const [isClient, setIsClient] = useState(false);


  const t = translations[lang];

  // This effect runs once on the client to initialize state from localStorage.
  useEffect(() => {
    const selectedLang = (localStorage.getItem('selectedLanguage') || 'en') as 'en' | 'nb';
    setLang(selectedLang);
    
    const currentVoterId = localStorage.getItem('anonymousVoterId');
    setVoterId(currentVoterId);

    setIsClient(true);
  }, []);

  
  const renderVoteComponent = () => {
    // Before the client has mounted and checked localStorage, render a skeleton.
    if (!isClient) {
      return <TopicInteraction.Skeleton />;
    }

    if (votedOn && topic.voteType !== 'yesno') {
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
            <Button className="w-full" onClick={onRevote}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t.changeVoteButton}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    switch (topic.voteType) {
        case 'likert': return <LikertScale topic={topic} onVote={onVote} />;
        case 'ranked': return <RankedChoice topic={topic} onVote={onVote} />;
        case 'quadratic': return <QuadraticVote topic={topic} />;
        case 'yesno':
        default:
            return (
                 <Card>
                    <CardHeader><CardTitle>{t.castVote}</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-3">
                        <div className="flex w-full items-center justify-center gap-2">
                            <Button
                              variant={votedOn === 'yes' ? 'default' : 'outline'}
                              size="lg"
                              className={cn(
                                'h-14 text-xl flex-1 group',
                                votedOn !== 'yes' && 'text-green-600 border-green-600/20 bg-green-500/10 hover:bg-green-500/20 dark:text-green-400 dark:border-green-400/20 dark:bg-green-500/10 dark:hover:bg-green-500/20',
                                votedOn === 'yes' && 'bg-green-600 hover:bg-green-600/90 dark:bg-green-500 dark:hover:bg-green-500/90 text-white dark:text-white'
                              )}
                              onClick={() => onVote('yes')}
                            >
                                <ThumbsUp className={cn('h-6 w-6', votedOn === 'yes' ? 'text-white' : 'text-green-600 dark:text-green-400')} />
                                <span className="ml-2">{t.yes}</span>
                            </Button>
                            <Button
                              variant={votedOn === 'no' ? 'destructive' : 'outline'}
                              size="lg"
                              className={cn(
                                'h-14 text-xl flex-1 group',
                                 votedOn !== 'no' && 'text-destructive border-destructive/20 bg-red-500/10 hover:bg-red-500/20 dark:border-destructive/30 dark:bg-destructive/10 dark:hover:bg-destructive/20'
                              )}
                              onClick={() => onVote('no')}
                            >
                                 <ThumbsDown className={cn('h-6 w-6', votedOn !== 'no' && 'text-destructive')} />
                                 <span className="ml-2">{t.no}</span>
                            </Button>
                        </div>
                        {votedOn && votedOn !== 'abstain' && (
                            <p className="text-sm text-muted-foreground pt-2">
                                {t.youVotedFor} <strong>{votedOn === 'yes' ? t.yes : t.no}</strong>
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-2 border-t pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => onVote('abstain')}
                          className={cn(
                            'text-muted-foreground hover:bg-muted/80',
                            votedOn === 'abstain' && 'bg-muted text-foreground'
                          )}
                        >
                          {t.abstain}
                        </Button>
                        {votedOn === 'abstain' && (
                             <p className="text-sm text-muted-foreground">{t.youAbstained}</p>
                        )}
                    </CardFooter>
                </Card>
            );
    }
  };

  return (
    <div className="space-y-8">
      {renderVoteComponent()}
      
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
