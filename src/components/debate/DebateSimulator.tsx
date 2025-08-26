
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, TestTube2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { simulateDebateAction } from '@/app/t/[slug]/actions';
import type { Topic, SimArgument, SimUser } from '@/lib/types';

interface DebateSimulatorProps {
  topic: Topic;
}

interface SimulatedData {
  users: SimUser[];
  args: SimArgument[];
  generatedAt: number; // Timestamp
}

/**
 * @fileoverview A client-side component to manage synthetic debate data.
 * @description This component is a developer-only tool. It's responsible for:
 * 1. Checking if the simulation mode is active via URL params.
 * 2. Displaying a banner and a "Regenerate" button.
 * 3. Calling a server action to trigger the AI data generation pipeline.
 * 4. Storing the synthetic data in localStorage to persist across refreshes.
 * 5. Passing the synthetic data down to the DebateSection component.
 */
export function DebateSimulator({ topic }: DebateSimulatorProps) {
  const [simData, setSimData] = useState<SimulatedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const isSimMode = process.env.NODE_ENV !== 'production' && searchParams.get('sim') === '1';

  // Why: A dedicated effect for loading and regeneration. This separates the
  // data fetching logic from the component's render logic.
  const loadOrRegenerateData = async (forceRegenerate = false) => {
    setIsLoading(true);
    const storageKey = `sim_debate_data_${topic.id}`;
    
    // Why: Idempotency check. If we are not forcing a regeneration,
    // first try to load fresh data from localStorage.
    if (!forceRegenerate) {
        const storedDataRaw = localStorage.getItem(storageKey);
        if (storedDataRaw) {
            const storedData = JSON.parse(storedDataRaw) as SimulatedData;
            // TTL check: data is considered fresh for 3 hours.
            const isFresh = (Date.now() - storedData.generatedAt) < 3 * 60 * 60 * 1000;
            if (isFresh) {
                setSimData(storedData);
                setIsLoading(false);
                return;
            }
        }
    }
    
    // Why: If no fresh data is found or regeneration is forced, we call the server action.
    try {
      const result = await simulateDebateAction({
        pollId: topic.id,
        pollTitle: topic.question,
        language: 'en', // This could be dynamic based on topic lang
        numUsers: Number(searchParams.get('users')) || 60,
        numArguments: Number(searchParams.get('args')) || 30,
        ratioFor: Number(searchParams.get('ratio')) || 0.5,
      });

      if (result.success && result.data) {
        const newSimData: SimulatedData = {
          users: result.data.users,
          args: result.data.arguments,
          generatedAt: Date.now(),
        };
        setSimData(newSimData);
        localStorage.setItem(storageKey, JSON.stringify(newSimData));
        toast({ title: 'Synthetic data generated successfully!' });
      } else {
        throw new Error(result.message || 'Failed to generate data.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Simulation Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Why: This effect runs once on mount if sim mode is active.
  // It ensures the initial data load happens automatically.
  useEffect(() => {
    if (isSimMode) {
      loadOrRegenerateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id, isSimMode]);

  // Why: We render nothing if not in simulation mode. This is the primary gate
  // that prevents this developer tool from ever appearing in production.
  if (!isSimMode) {
    return null;
  }

  return (
    <div className="mb-8">
      <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300">
        <TestTube2 className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
        <AlertTitle className="font-bold">Synthetic Data Mode</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          The arguments below are AI-generated for demonstration.
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => loadOrRegenerateData(true)} 
            disabled={isLoading}
            className="bg-background/50"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Regenerate
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
