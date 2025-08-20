
'use client';
import { useState, useEffect } from 'react';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { calculateQVCost, getMaxVotes } from '@/lib/qv';
import { castQuadraticVoteAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface QuadraticVoteProps {
  topic: Topic;
}

// In a real app, this would come from a user context/hook
const INITIAL_CREDITS = 100;

export function QuadraticVote({ topic }: QuadraticVoteProps) {
  const { toast } = useToast();
  const [voterId, setVoterId] = useState<string | null>(null);
  const [voiceCredits, setVoiceCredits] = useState(INITIAL_CREDITS);
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentVoterId = localStorage.getItem('anonymousVoterId');
    setVoterId(currentVoterId);
    const storedCredits = localStorage.getItem('voiceCredits');
    if (storedCredits) {
      setVoiceCredits(parseInt(storedCredits, 10));
    } else {
        localStorage.setItem('voiceCredits', INITIAL_CREDITS.toString());
    }
  }, []);

  const yesCost = calculateQVCost(yesVotes);
  const noCost = calculateQVCost(noVotes);
  const totalCost = yesCost + noCost;

  const maxYes = getMaxVotes(voiceCredits - noCost);
  const maxNo = getMaxVotes(voiceCredits - yesCost);

  const handleYesChange = (value: number[]) => {
    const newYesVotes = value[0];
    const newYesCost = calculateQVCost(newYesVotes);
    if (newYesCost + noCost <= voiceCredits) {
      setYesVotes(newYesVotes);
    }
  };

  const handleNoChange = (value: number[]) => {
    const newNoVotes = value[0];
    const newNoCost = calculateQVCost(newNoVotes);
    if (newNoCost + yesCost <= voiceCredits) {
      setNoVotes(newNoVotes);
    }
  };
  
  const handleSubmit = async () => {
    if (!voterId) {
        toast({ title: "Login Required", description: "You must be logged in to vote.", variant: "destructive" });
        return;
    }
    if (totalCost === 0) {
        toast({ title: "No votes allocated", description: "Please allocate at least one vote.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    const result = await castQuadraticVoteAction({
        userId: voterId,
        topicId: topic.id,
        votes: { yes: yesVotes, no: noVotes },
        currentCredits: voiceCredits,
    });
    
    if(result.success) {
        setVoiceCredits(result.newCreditBalance);
        localStorage.setItem('voiceCredits', result.newCreditBalance.toString());
        toast({ title: "Vote Cast!", description: result.message });
        setYesVotes(0);
        setNoVotes(0);
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quadratic Voting</CardTitle>
        <CardDescription>
          Allocate your {voiceCredits} voice credits. Each additional vote costs quadratically more.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Yes Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="font-medium text-lg">Yes</label>
            <div className="text-right">
                <p className="font-bold text-xl">{yesVotes} <span className="text-sm font-normal text-muted-foreground">votes</span></p>
                <p className="text-sm text-muted-foreground">Cost: {yesCost} credits</p>
            </div>
          </div>
          <Slider
            value={[yesVotes]}
            onValueChange={handleYesChange}
            max={maxYes}
            step={1}
            disabled={isSubmitting}
          />
        </div>

        {/* No Slider */}
         <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="font-medium text-lg">No</label>
             <div className="text-right">
                <p className="font-bold text-xl">{noVotes} <span className="text-sm font-normal text-muted-foreground">votes</span></p>
                <p className="text-sm text-muted-foreground">Cost: {noCost} credits</p>
            </div>
          </div>
          <Slider
            value={[noVotes]}
            onValueChange={handleNoChange}
            max={maxNo}
            step={1}
            disabled={isSubmitting}
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 border-t pt-6">
        <div className="w-full flex justify-between text-lg font-bold">
            <span>Total Cost:</span>
            <span>{totalCost} credits</span>
        </div>
        <div className="w-full flex justify-between text-sm text-muted-foreground">
            <span>Remaining Credits:</span>
            <span>{voiceCredits - totalCost}</span>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting || totalCost === 0} className="w-full h-12 text-lg mt-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : `Submit Vote (${totalCost} credits)`}
        </Button>
      </CardFooter>
    </Card>
  );
}
