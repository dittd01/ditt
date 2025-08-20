
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { allTopics } from '@/lib/data';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, Info, RefreshCw, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { VoteChart } from '@/components/VoteChart';
import { SuggestionForm } from '@/components/SuggestionForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LikertScale } from '@/components/LikertScale';
import { RankedChoice } from '@/components/RankedChoice';
import { QuadraticVote } from '@/components/QuadraticVote';

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

  useEffect(() => {
    setIsClient(true);
    setLoading(true);
    
    const foundTopic = allTopics.find((t) => t.slug === slug);
    
    if (foundTopic) {
        const newVotes: Record<string, number> = {};
        let newTotalVotes = 0;
        
        foundTopic.options.forEach(option => {
            const storedVotes = localStorage.getItem(`votes_for_${foundTopic.id}_${option.id}`);
            const currentVotes = storedVotes ? parseInt(storedVotes, 10) : foundTopic.votes[option.id] || 0;
            newVotes[option.id] = currentVotes;
            newTotalVotes += currentVotes;
        });

        const initialTopicState = { ...foundTopic, votes: newVotes, totalVotes: newTotalVotes };
        setTopic(initialTopicState);

        const currentVoterId = localStorage.getItem('anonymousVoterId');
        setVoterId(currentVoterId);

        if (currentVoterId) {
            const previousVote = localStorage.getItem(`voted_on_${foundTopic.id}`);
            setVotedOn(previousVote);
            // For yes/no, pre-select the radio button
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
    
    const currentVote = Array.isArray(voteData) ? voteData[0] : voteData;
    if (!currentVote || !topic || votedOn === currentVote) {
      return;
    }

    const previouslyVotedOn = votedOn;

    setTopic(currentTopic => {
        if (!currentTopic) return null;

        const newVotes = { ...currentTopic.votes };
        let newTotalVotes = currentTopic.totalVotes;

        newVotes[currentVote] = (newVotes[currentVote] || 0) + 1;

        if (previouslyVotedOn) {
            newVotes[previouslyVotedOn] = (newVotes[previouslyVotedOn] || 1) - 1;
        } else {
            newTotalVotes += 1;
        }

        Object.keys(newVotes).forEach(oid => {
          localStorage.setItem(`votes_for_${currentTopic.id}_${oid}`, newVotes[oid].toString());
        });

        return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
    });
      
    localStorage.setItem(`voted_on_${topic.id}`, currentVote);
    setVotedOn(currentVote);
    toast({
        title: 'Vote Cast!',
        description: `Your anonymous vote for "${
          topic.options.find((o) => o.id === currentVote)?.label
        }" has been recorded.`,
    });
  };
  
  const handleRevote = () => {
    setVotedOn(null);
    setSelectedOption(null); // Clear radio selection
     toast({
      title: 'Cast a new vote',
      description: 'You may now select a different option.',
    });
  };

  const getPercentage = (optionId: string) => {
    if (!topic || topic.totalVotes === 0) return 0;
    const voteCount = topic.votes[optionId] || 0;
    return (voteCount / topic.totalVotes) * 100;
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
              You voted for: <strong>{topic.options.find((o) => o.id === votedOn)?.label || votedOn}</strong>
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
                        {topic.options.map((option) => (
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
                    <CardFooter>
                        <Button onClick={() => handleVote(selectedOption!)} disabled={!selectedOption} className="w-full h-12 text-lg">
                        Submit Vote
                        </Button>
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
                  alt={topic.question}
                  fill
                  className="rounded-lg object-cover"
                   data-ai-hint={topic.aiHint}
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{topic.question}</h1>
              <p className="text-muted-foreground pt-2">{topic.description}</p>
            </CardHeader>
          </Card>
          
          <div className="lg:hidden">
            {renderVoteComponent()}
          </div>

          <Card>
             <CardHeader>
                <CardTitle>Live Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {topic.options.map((option) => (
                  <div key={option.id}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-muted-foreground">{option.label}</span>
                      <span className="font-medium">{getPercentage(option.id).toFixed(1)}%</span>
                    </div>
                    <Progress value={getPercentage(option.id)} className="h-2" />
                  </div>
                ))}
                <p className="text-sm text-center text-muted-foreground pt-2">{topic.totalVotes.toLocaleString()} total votes</p>
              </CardContent>
          </Card>

          <VoteChart topic={topic} />
        </div>

        <div className="space-y-8 hidden lg:block">
          
          {renderVoteComponent()}

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
