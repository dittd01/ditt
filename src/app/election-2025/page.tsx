
'use client';

import { useState, useEffect } from 'react';
import { PartyCard } from '@/components/PartyCard';
import { electionTopic as initialElectionTopic, parties } from '@/lib/election-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ElectionChart } from '@/components/ElectionChart';
import type { Topic } from '@/lib/types';

export default function ElectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [voterId, setVoterId] = useState<string | null>(null);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [electionTopic, setElectionTopic] = useState<Topic | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Initialize state from localStorage
    const newVotes: Record<string, number> = {};
    let newTotalVotes = 0;
    
    initialElectionTopic.options.forEach(option => {
        const storedVotes = localStorage.getItem(`votes_for_${initialElectionTopic.id}_${option.id}`);
        // Use stored votes if they exist, otherwise fall back to initial data
        const currentVotes = storedVotes ? parseInt(storedVotes, 10) : initialElectionTopic.votes[option.id] || 0;
        newVotes[option.id] = currentVotes;
        newTotalVotes += currentVotes;
    });

    const initialTopicState = { ...initialElectionTopic, votes: newVotes, totalVotes: newTotalVotes };
    setElectionTopic(initialTopicState);

    const currentVoterId = localStorage.getItem('anonymousVoterId');
    setVoterId(currentVoterId);
    if (currentVoterId) {
      const previousVote = localStorage.getItem(`voted_on_${initialElectionTopic.id}`);
      setVotedFor(previousVote);
    }
  }, []);

  const handleVote = (partyId: string) => {
    if (!voterId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to vote.',
      });
      router.push('/login');
      return;
    }

    if (!electionTopic || votedFor === partyId) {
        return; // Do nothing if there's no topic or voting for the same party again
    }
    
    const previouslyVotedFor = votedFor;

    setElectionTopic(currentTopic => {
        if (!currentTopic) return null;

        const newVotes = { ...currentTopic.votes };
        let newTotalVotes = currentTopic.totalVotes;

        // If user is changing their vote from a previous one
        if (previouslyVotedFor) {
            newVotes[previouslyVotedFor] = (newVotes[previouslyVotedFor] || 1) - 1; // Decrement old
            newVotes[partyId] = (newVotes[partyId] || 0) + 1;  // Increment new
            // Total votes remain the same
        } else {
          // If user is casting a new vote
          newVotes[partyId] = (newVotes[partyId] || 0) + 1;
          newTotalVotes += 1; // Total votes increases only on a new vote
        }

        // Update localStorage for each party's votes
        Object.keys(newVotes).forEach(pid => {
          localStorage.setItem(`votes_for_${electionTopic.id}_${pid}`, newVotes[pid].toString());
        });

        return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
    });

    localStorage.setItem(`voted_on_${electionTopic.id}`, partyId);
    setVotedFor(partyId);
    const party = parties.find(p => p.id === partyId);
    toast({
      title: 'Vote Cast!',
      description: `Your anonymous vote for "${party?.name}" has been recorded.`,
    });
  };
  
  const handleRevote = () => {
    setVotedFor(null);
    toast({
      title: 'Cast a new vote',
      description: 'You may now select a different party.',
    });
  };

  if (!isClient || !electionTopic) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="mb-8">
        <CardHeader className="p-4 md:p-6">
          <div className="aspect-video relative mb-4 bg-muted/20 rounded-lg flex items-center justify-center">
            <ElectionChart topic={electionTopic} />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold font-headline">{electionTopic.question}</CardTitle>
          <CardDescription className="pt-2">{electionTopic.description}</CardDescription>
        </CardHeader>
      </Card>
      
      {votedFor ? (
         <Card className="bg-primary/5 border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-primary" />
                You have voted
              </CardTitle>
              <CardDescription>
                You voted for: <strong>{parties.find((p) => p.id === votedFor)?.name}</strong>
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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {parties.map(party => (
                <PartyCard 
                    key={party.id} 
                    party={party}
                    onVote={() => handleVote(party.id)}
                    disabled={!!votedFor}
                />
            ))}
        </div>
      )}
    </div>
  );
}
