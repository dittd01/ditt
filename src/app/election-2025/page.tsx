'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PartyCard } from '@/components/PartyCard';
import { electionTopic, parties } from '@/lib/election-data';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function ElectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [voterId, setVoterId] = useState<string | null>(null);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentVoterId = localStorage.getItem('anonymousVoterId');
    setVoterId(currentVoterId);
    if (currentVoterId) {
      const previousVote = localStorage.getItem(`voted_on_${electionTopic.id}`);
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
    localStorage.setItem(`voted_on_${electionTopic.id}`, partyId);
    setVotedFor(partyId);
    const party = parties.find(p => p.id === partyId);
    toast({
      title: 'Vote Cast!',
      description: `Your anonymous vote for "${party?.name}" has been recorded.`,
    });
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

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="mb-8">
        <CardHeader className="p-4 md:p-6">
          <div className="aspect-video relative mb-4">
            <Image
              src={electionTopic.imageUrl}
              alt={electionTopic.question}
              fill
              className="rounded-lg object-cover"
              data-ai-hint="norwegian election candidates"
            />
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
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-4">To prevent coercion, you can change your vote at any time during the voting period. This will require you to re-authenticate.</p>
              <Button className="w-full" onClick={handleRevote}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Change Your Vote (Revote)
              </Button>
            </Card>
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
