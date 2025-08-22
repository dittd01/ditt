

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
  initialArgs: Argument[];
  onArgsChange: (args: Argument[]) => void;
  lang: 'en' | 'nb';
}

const translations = {
    en: {
        arguments: 'Arguments',
        for: 'For',
        against: 'Against',
        addArgument: 'Add Argument',
        noArguments: 'No arguments for this side yet.',
    },
    nb: {
        arguments: 'Argumenter',
        for: 'For',
        against: 'Mot',
        addArgument: 'Legg til argument',
        noArguments: 'Ingen argumenter for denne siden enda.',
    }
}


export function DebateSection({ topicId, initialArgs, onArgsChange, lang }: DebateSectionProps) {
  const [debateArgs, setDebateArgs] = useState<Argument[]>(initialArgs);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState<'for' | 'against' | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    // initialArgs are now passed as a prop, so we sync state with it.
    setDebateArgs(initialArgs);
    setLoading(false);
  }, [initialArgs]);

  useEffect(() => {
    // When local state changes, inform the parent component.
    onArgsChange(debateArgs);
  }, [debateArgs, onArgsChange]);

  const topLevelFor = debateArgs.filter(a => a.parentId === 'root' && a.side === 'for').sort((a,b) => b.upvotes - a.upvotes);
  const topLevelAgainst = debateArgs.filter(a => a.parentId === 'root' && a.side === 'against').sort((a,b) => b.upvotes - a.upvotes);

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
    
    // Determine the side of the new argument
    let side: 'for' | 'against';
    if (isTopLevel) {
        // If it's a new top-level argument, its side is determined by the composer button clicked.
        if (!showComposer) return; // Should not happen
        side = showComposer;
    } else {
        // If it's a reply, its side is the opposite of its parent's.
        const parentArg = debateArgs.find(a => a.id === parentId);
        if (!parentArg) return; // Should not happen
        side = parentArg.side === 'for' ? 'against' : 'for';
    }


    const newArgument: Argument = {
      id: `arg_${Date.now()}`,
      topicId: topicId,
      parentId: parentId,
      side: side,
      author: { name: 'New User', avatarUrl: 'https://placehold.co/40x40.png' },
      text: values.text,
      upvotes: 1,
      downvotes: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedArgs = [...debateArgs];
    
    if (!isTopLevel && parentId) {
        const parentArgIndex = updatedArgs.findIndex(a => a.id === parentId);
        if (parentArgIndex > -1) {
            updatedArgs[parentArgIndex].replyCount += 1;
        }
    }
    
    // Add new argument to the start of the list to ensure it's visible.
    updatedArgs.unshift(newArgument);
    setDebateArgs(updatedArgs);
    
    const localStorageKey = `debate_args_${topicId}`;
    localStorage.setItem(localStorageKey, JSON.stringify(updatedArgs));

    setShowComposer(null);
    setReplyingToId(null);
  };

  const renderArgumentTree = (arg: Argument): React.ReactNode => {
    const replies = debateArgs.filter(reply => reply.parentId === arg.id).sort((a,b) => b.upvotes - a.upvotes);
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
                <div className="flex justify-between items-center pb-2 border-b-2 border-green-500">
                    <h3 className="text-xl font-semibold text-green-700">
                        {t.arguments}
                        <span className="block font-normal">{t.for}</span>
                    </h3>
                    <div className="flex">
                        <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-700 hover:bg-green-100" onClick={() => handleAddArgument('for')}>
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
                 <div className="flex justify-between items-center pb-2 border-b-2 border-red-500">
                     <h3 className="text-xl font-semibold text-red-700">
                        {t.arguments}
                        <span className="block font-normal">{t.against}</span>
                    </h3>
                     <div className="flex">
                        <Button variant="ghost" size="sm" className="text-red-700 hover:text-red-700 hover:bg-red-100" onClick={() => handleAddArgument('against')}>
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
