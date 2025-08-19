
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

export default function TopicPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { slug } = params;

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
        // Initialize votes from localStorage or fallback to initial data
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
        }
    } else {
        setTopic(null);
    }
    
    setLoading(false);
  }, [slug]);

  const handleVote = () => {
    if (!voterId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to vote.',
      });
      router.push('/login');
      return;
    }
    if (selectedOption && topic) {
      const previousVote = localStorage.getItem(`voted_on_${topic.id}`);

      setTopic(currentTopic => {
        if (!currentTopic) return null;

        const newVotes = { ...currentTopic.votes };
        let newTotalVotes = currentTopic.totalVotes;

        // If user is casting a new vote (no previous vote)
        if (!previousVote) {
            newVotes[selectedOption] = (newVotes[selectedOption] || 0) + 1;
            newTotalVotes += 1;
        } 
        // If user is changing their vote
        else if (previousVote !== selectedOption) {
            newVotes[selectedOption] = (newVotes[selectedOption] || 0) + 1;
            if (newVotes[previousVote] > 0) {
                newVotes[previousVote] -= 1;
            }
        }
        // If user clicks the same option again, do nothing.

        // Update localStorage for each option's votes
        Object.keys(newVotes).forEach(oid => {
          localStorage.setItem(`votes_for_${topic.id}_${oid}`, newVotes[oid].toString());
        });

        return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
      });
      
      localStorage.setItem(`voted_on_${topic.id}`, selectedOption);
      setVotedOn(selectedOption);
      toast({
        title: 'Vote Cast!',
        description: `Your anonymous vote for "${
          topic.options.find((o) => o.id === selectedOption)?.label
        }" has been recorded.`,
      });
    }
  };
  
  const handleRevote = () => {
    toast({
      title: 'Re-authentication required',
      description: 'For security, you must log in again to change your vote.',
    });
    localStorage.removeItem('anonymousVoterId');
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('voted_on_')) {
            localStorage.removeItem(key);
        }
    });
    router.push('/login');
  };

  const getPercentage = (optionId: string) => {
    if (!topic || topic.totalVotes === 0) return 0;
    const voteCount = topic.votes[optionId] || 0;
    return (voteCount / topic.totalVotes) * 100;
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
                   data-ai-hint="technology policy"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{topic.question}</h1>
              <p className="text-muted-foreground pt-2">{topic.description}</p>
            </CardHeader>
          </Card>

          <VoteChart topic={topic} />
        </div>

        <div className="space-y-8">
          {votedOn ? (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-primary" />
                  You have voted
                </CardTitle>
                <CardDescription>
                  You voted for: <strong>{topic.options.find((o) => o.id === votedOn)?.label}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">To prevent coercion, you can change your vote at any time during the voting period. This will require you to re-authenticate.</p>
                <Button className="w-full" onClick={handleRevote}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Change Your Vote (Revote)
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                <Button onClick={handleVote} disabled={!selectedOption} className="w-full h-12 text-lg">
                  Submit Vote
                </Button>
              </CardFooter>
            </Card>
          )}

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

          {voterId ? (
            <SuggestionForm />
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Log in to participate further</AlertTitle>
              <AlertDescription>
                To propose a new option, you need to be logged in with your anonymous ID.
              </AlertDescription>
            </Alert>
          )}

        </div>
      </div>
    </div>
  );
}
