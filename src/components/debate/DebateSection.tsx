
'use client';

import { useState, useEffect } from 'react';
import type { Argument } from '@/lib/types';
import { ArgumentCard } from './ArgumentCard';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { ArgumentComposer } from './ArgumentComposer';
import { currentUser } from '@/lib/user-data';
import { useToast } from '@/hooks/use-toast';

interface DebateSectionProps {
  topicId: string;
  initialArgs: Argument[];
  lang: 'en' | 'nb';
}

const translations = {
    en: {
        arguments: 'Arguments',
        for: 'For',
        against: 'Against',
        addArgument: 'Add Argument',
        noArguments: 'No arguments for this side yet.',
        argumentAdded: 'Argument Posted',
        argumentAddedDesc: 'Your argument has been added to the debate.',
    },
    nb: {
        arguments: 'Argumenter',
        for: 'For',
        against: 'Mot',
        addArgument: 'Legg til argument',
        noArguments: 'Ingen argumenter for denne siden enda.',
        argumentAdded: 'Argument publisert',
        argumentAddedDesc: 'Ditt argument har blitt lagt til i debatten.',
    }
}


export function DebateSection({ topicId, initialArgs, lang }: DebateSectionProps) {
  const [debateArgs, setDebateArgs] = useState<Argument[]>(initialArgs);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState<'for' | 'against' | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const { toast } = useToast();

  const t = translations[lang];

  useEffect(() => {
    // This effect runs once on the client-side to hydrate the component's state
    // from localStorage, which contains user-added arguments. This is the "read" operation.
    const storedArgs = localStorage.getItem(`debate_args_${topicId}`);
    if (storedArgs) {
      // If we find arguments in storage, we parse them and set them as the current state.
      setDebateArgs(JSON.parse(storedArgs));
    } else {
      // Otherwise, we initialize the state with the static props passed from the server.
      setDebateArgs(initialArgs);
    }
    setLoading(false);
  }, [topicId, initialArgs]);


  useEffect(() => {
    // This effect is the "write" operation. It triggers whenever the `debateArgs` state changes.
    // We avoid running this on the initial load to prevent overwriting localStorage with stale props data.
    if (!loading) { 
        localStorage.setItem(`debate_args_${topicId}`, JSON.stringify(debateArgs));
    }
  }, [debateArgs, topicId, loading]);

  const topLevelFor = debateArgs.filter(a => a.parentId === 'root' && a.side === 'for').sort((a,b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  const topLevelAgainst = debateArgs.filter(a => a.parentId === 'root' && a.side === 'against').sort((a,b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

  const handleAddArgument = (side: 'for' | 'against') => {
    setReplyingToId(null);
    setShowComposer(side);
  };
  
  const handleCounter = (argumentId: string) => {
    setShowComposer(null);
    setReplyingToId(currentId => currentId === argumentId ? null : argumentId);
  }

  const handleCancel = () => {
    setShowComposer(null);
    setReplyingToId(null);
  }

  const handleSubmit = (values: { text: string }) => {
    const isTopLevel = !replyingToId;
    const parentId = isTopLevel ? 'root' : replyingToId;
    
    // Determine the side of the new argument.
    let side: 'for' | 'against';
    if (isTopLevel) {
        // If it's a new top-level argument, its side is determined by the composer button clicked.
        if (!showComposer) return; // Should not happen, but a good guard clause.
        side = showComposer;
    } else {
        // If it's a reply, its side is the opposite of its parent's to create a counter-argument.
        const parentArg = debateArgs.find(a => a.id === parentId);
        if (!parentArg) return; // Parent must exist to reply to it.
        side = parentArg.side === 'for' ? 'against' : 'for';
    }


    const newArgument: Argument = {
      id: `arg_${Date.now()}`,
      topicId: topicId,
      parentId: parentId,
      side: side,
      author: { name: currentUser.displayName, avatarUrl: currentUser.photoUrl },
      text: values.text,
      upvotes: 1,
      downvotes: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Atomically update the state with the new argument and, if it's a reply,
    // the parent's updated reply count.
    setDebateArgs(currentArgs => {
      const updatedArgs = [...currentArgs];
      
      // If this is a reply, we must find the parent and increment its reply count.
      if (!isTopLevel && parentId) {
          const parentArgIndex = updatedArgs.findIndex(a => a.id === parentId);
          if (parentArgIndex > -1) {
              updatedArgs[parentArgIndex] = {
                ...updatedArgs[parentArgIndex],
                replyCount: updatedArgs[parentArgIndex].replyCount + 1,
              };
          }
      }
      
      // Add the new argument to the list.
      updatedArgs.unshift(newArgument);
      return updatedArgs;
    });
    
    toast({
        title: t.argumentAdded,
        description: t.argumentAddedDesc,
    });

    // Reset the composer UI state.
    setShowComposer(null);
    setReplyingToId(null);
  };

  const renderArgumentTree = (arg: Argument): React.ReactNode => {
    // Recursively find and render replies for a given argument.
    const replies = debateArgs.filter(reply => reply.parentId === arg.id).sort((a,b) => (b.upvotes-b.downvotes) - (a.upvotes-a.downvotes));
    return (
        <div key={arg.id} className="space-y-4">
            <ArgumentCard argument={arg} onCounter={handleCounter} />
            {replyingToId === arg.id && (
                 <div className="ml-6 pl-4 border-l-2">
                    <ArgumentComposer onCancel={handleCancel} onSubmit={handleSubmit} />
                </div>
            )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Arguments For Column */}
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b-2 border-[hsl(var(--chart-2))]">
                    <h3 className="text-xl font-semibold text-[hsl(var(--chart-2))]">
                        {t.arguments}
                        <span className="block font-normal">{t.for}</span>
                    </h3>
                    <div className="flex">
                        <Button variant="ghost" size="sm" className="text-[hsl(var(--chart-2))] hover:text-[hsl(var(--chart-2))] hover:bg-green-500/10" onClick={() => handleAddArgument('for')}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {t.addArgument}
                        </Button>
                    </div>
                </div>
                 {showComposer === 'for' && <ArgumentComposer onCancel={handleCancel} onSubmit={handleSubmit} />}
                <div className="space-y-4">
                    {topLevelFor.length > 0 
                        ? topLevelFor.map(renderArgumentTree) 
                        : <p className="text-muted-foreground p-4 text-center">{t.noArguments}</p>
                    }
                </div>
            </div>

            {/* Arguments Against Column */}
            <div className="space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b-2 border-[hsl(var(--chart-1))]">
                     <h3 className="text-xl font-semibold text-[hsl(var(--chart-1))]">
                        {t.arguments}
                        <span className="block font-normal">{t.against}</span>
                    </h3>
                     <div className="flex">
                        <Button variant="ghost" size="sm" className="text-[hsl(var(--chart-1))] hover:text-[hsl(var(--chart-1))] hover:bg-red-500/10" onClick={() => handleAddArgument('against')}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {t.addArgument}
                        </Button>
                    </div>
                </div>
                 {showComposer === 'against' && <ArgumentComposer onCancel={handleCancel} onSubmit={handleSubmit} />}
                 <div className="space-y-4">
                    {topLevelAgainst.length > 0 
                        ? topLevelAgainst.map(renderArgumentTree)
                        : <p className="text-muted-foreground p-4 text-center">{t.noArguments}</p>
                    }
                </div>
            </div>
        </div>
    </div>
  );
}
