
'use client';

import { useState, useEffect } from 'react';
import type { Argument } from '@/lib/types';
import { getArgumentsForTopic } from '@/lib/data';
import { ArgumentCard } from './ArgumentCard';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { ArgumentComposer } from './ArgumentComposer';

interface DebateSectionProps {
  topicId: string;
}

export function DebateSection({ topicId }: DebateSectionProps) {
  const [debateArgs, setDebateArgs] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState<'for' | 'against' | null>(null);

  useEffect(() => {
    setLoading(true);
    // In a real app, this would be a Firestore query
    const fetchedArguments = getArgumentsForTopic(topicId);
    setDebateArgs(fetchedArguments);
    setLoading(false);
  }, [topicId]);

  const topLevelFor = debateArgs.filter(a => a.parentId === null && a.side === 'for');
  const topLevelAgainst = debateArgs.filter(a => a.parentId === null && a.side === 'against');

  const handleAddArgument = (side: 'for' | 'against') => {
    setShowComposer(side);
  };
  
  const handleCancel = () => {
    setShowComposer(null);
  }

  const handleSubmit = (values: { text: string }) => {
    if (!showComposer) return;

    // This is an optimistic update. In a real app, this would be replaced
    // with a call to a server action/API route that saves to Firestore.
    const newArgument: Argument = {
      id: `arg_${Date.now()}`,
      topicId: topicId,
      parentId: null,
      side: showComposer,
      author: { name: 'New User', avatarUrl: 'https://placehold.co/40x40.png?text=NU' },
      text: values.text,
      upvotes: 1,
      downvotes: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    };

    setDebateArgs(currentArgs => [newArgument, ...currentArgs]);
    setShowComposer(null);
  };


  const renderArgumentTree = (arg: Argument) => {
    const replies = debateArgs.filter(reply => reply.parentId === arg.id);
    return (
        <div key={arg.id} className="space-y-4">
            <ArgumentCard argument={arg} />
            {replies.length > 0 && (
                <div className="ml-6 pl-4 border-l-2 space-y-4">
                    {replies.map(renderArgumentTree)}
                </div>
            )}
        </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
         <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }


  return (
    <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Structured Debate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Arguments For Column */}
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b-2 border-green-500">
                    <h3 className="text-xl font-semibold text-green-700">Arguments <span className="block">For</span></h3>
                    <div className="flex">
                        <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-700 hover:bg-green-100" onClick={() => handleAddArgument('for')}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Argument
                        </Button>
                    </div>
                </div>
                 {showComposer === 'for' && <ArgumentComposer onCancel={handleCancel} onSubmit={handleSubmit} />}
                <div className="space-y-4">
                    {topLevelFor.length > 0 
                        ? topLevelFor.map(renderArgumentTree) 
                        : <p className="text-muted-foreground p-4 text-center">No arguments for this side yet.</p>
                    }
                </div>
            </div>

            {/* Arguments Against Column */}
            <div className="space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b-2 border-red-500">
                    <h3 className="text-xl font-semibold text-red-700">Arguments <span className="block">Against</span></h3>
                     <div className="flex">
                        <Button variant="ghost" size="sm" className="text-red-700 hover:text-red-700 hover:bg-red-100" onClick={() => handleAddArgument('against')}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Argument
                        </Button>
                    </div>
                </div>
                 {showComposer === 'against' && <ArgumentComposer onCancel={handleCancel} onSubmit={handleSubmit} />}
                 <div className="space-y-4">
                    {topLevelAgainst.length > 0 
                        ? topLevelAgainst.map(renderArgumentTree)
                        : <p className="text-muted-foreground p-4 text-center">No arguments against this side yet.</p>
                    }
                </div>
            </div>
        </div>
    </div>
  );
}
