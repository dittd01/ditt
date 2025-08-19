
'use client';

import { useState, useEffect } from 'react';
import { PartyCard } from '@/components/PartyCard';
import { parties as partyDetails } from '@/lib/election-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ElectionChart } from '@/components/ElectionChart';
import type { Topic } from '@/lib/types';
import { getElectionData, castVote } from '@/app/election/actions';

export default function ElectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [voterId, setVoterId] = useState<string | null>(null);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [electionTopic, setElectionTopic] = useState<Topic | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const currentVoterId = localStorage.getItem('anonymousVoterId');
    setVoterId(currentVoterId);
    
    async function loadElectionData() {
      if (!currentVoterId) {
          const initialState = await getElectionData(null);
          setElectionTopic(initialState.topic);
          setVotedFor(null);
      } else {
         const initialState = await getElectionData(currentVoterId);
         setElectionTopic(initialState.topic);
         setVotedFor(initialState.votedFor);
      }
    }
    loadElectionData();
  }, []);

 const handleVote = async (partyId: string) => {
    if (!voterId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to vote.',
      });
      router.push('/login');
      return;
    }

    if (isVoting || !electionTopic) return;

    const previouslyVotedFor = votedFor;
    if (previouslyVotedFor === partyId) return;

    setIsVoting(true);

    // Optimistic UI Update
    setElectionTopic(currentTopic => {
        if (!currentTopic) return null;
        const newVotes = { ...currentTopic.votes };
        let newTotalVotes = currentTopic.totalVotes;

        newVotes[partyId] = (newVotes[partyId] || 0) + 1;
        if (previouslyVotedFor) {
            newVotes[previouslyVotedFor] = Math.max(0, (newVotes[previouslyVotedFor] || 1) - 1);
        } else {
            newTotalVotes += 1;
        }
        return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
    });
    setVotedFor(partyId);

    try {
        const result = await castVote({ userId: voterId, partyId });
        if (result.status === 'error') {
            throw new Error(result.message);
        }
        // Sync with authoritative state from server
        setElectionTopic(currentTopic => {
            if (!currentTopic) return null;
            const serverCounts = result.currentCounts || {};
            let total = 0;
            for(const pId in serverCounts) {
                total += serverCounts[pId];
            }
            return {
                ...currentTopic,
                votes: serverCounts,
                totalVotes: total,
            }
        });
        if (result.newPartyId) {
            setVotedFor(result.newPartyId);
        }
        toast({
            title: result.unchanged ? 'Vote Confirmed' : 'Vote Changed!',
            description: `Your anonymous vote for "${partyDetails.find(p => p.id === result.newPartyId)?.name}" has been recorded.`,
        });
    } catch (error) {
        // Revert optimistic update on error
        setElectionTopic(currentTopic => {
             if (!currentTopic) return null;
             const newVotes = { ...currentTopic.votes };
             let newTotalVotes = currentTopic.totalVotes;
     
             newVotes[partyId] = Math.max(0, (newVotes[partyId] || 1) - 1);
             if (previouslyVotedFor) {
                 newVotes[previouslyVotedFor] = (newVotes[previouslyVotedFor] || 0) + 1;
             } else {
                 newTotalVotes -= 1;
             }
             return { ...currentTopic, votes: newVotes, totalVotes: newTotalVotes };
        });
        setVotedFor(previouslyVotedFor);

        toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: 'Could not cast your vote. Please try again.',
        });
    } finally {
        setIsVoting(false);
    }
  };
  
  const handleRevote = () => {
    // This simply allows the user to re-enter the voting state.
    // The actual vote change logic is handled by handleVote.
    setVotedFor(null);
    toast({
      title: 'Cast a new vote',
      description: 'You may now select a different party.',
    });
  };

  if (!electionTopic) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const showVotingGrid = !votedFor || isVoting;

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
      
      {!showVotingGrid ? (
         <Card className="bg-primary/5 border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-primary" />
                You have voted
              </CardTitle>
              <CardDescription>
                You voted for: <strong>{partyDetails.find((p) => p.id === votedFor)?.name}</strong>
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
            {partyDetails.map(party => (
                <PartyCard 
                    key={party.id} 
                    party={party}
                    onVote={() => handleVote(party.id)}
                    disabled={isVoting}
                    isVotedFor={votedFor === party.id}
                />
            ))}
        </div>
      )}
    </div>
  );
}
