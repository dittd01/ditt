
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Argument, SimArgument } from '@/lib/types';
import { ArgumentCard } from './ArgumentCard';
import { Button } from '../ui/button';
import { PlusCircle, Lightbulb, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { ArgumentComposer } from './ArgumentComposer';
import { currentUser } from '@/lib/user-data';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateRebuttalAction } from '@/app/actions';
import { ArgumentChart } from './ArgumentChart';


interface DebateSectionProps {
  topicId: string;
  topicQuestion: string;
  initialArgs: Argument[];
  lang: 'en' | 'nb';
  // Why: Optional prop to inject synthetic data. This is a clean way to
  // switch the component's data source without adding complex logic inside.
  // It makes the component testable and adheres to dependency injection principles.
  syntheticArgs?: SimArgument[] | null;
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
        argumentUpvoted: 'Argument Upvoted',
        argumentUpvotedDesc: 'Thanks for keeping the debate focused!',
        mostVoted: 'Most Voted',
        newest: 'Newest',
        rebuttalHintTitle: 'AI Rebuttal Suggestion',
    },
    nb: {
        arguments: 'Argumenter',
        for: 'For',
        against: 'Mot',
        addArgument: 'Legg til argument',
        noArguments: 'Ingen argumenter for denne siden enda.',
        argumentAdded: 'Argument publisert',
        argumentAddedDesc: 'Ditt argument har blitt lagt til i debatten.',
        argumentUpvoted: 'Argument stemt opp',
        argumentUpvotedDesc: 'Takk for at du holder debatten fokusert!',
        mostVoted: 'Mest Stemt',
        newest: 'Nyeste',
        rebuttalHintTitle: 'KI Motargument-forslag',
    }
}

type SortByType = 'votes' | 'newest';

// Skeleton component for loading state
DebateSection.Skeleton = function DebateSectionSkeleton() {
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


export function DebateSection({ topicId, topicQuestion, initialArgs, lang, syntheticArgs }: DebateSectionProps) {
  const [debateArgs, setDebateArgs] = useState<Argument[]>(initialArgs);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState<'for' | 'against' | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortByType>('votes');
  const [rebuttalHint, setRebuttalHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const { toast } = useToast();

  const t = translations[lang];

  useEffect(() => {
    // Why: If synthetic arguments are passed in, we use them directly.
    // This allows the `DebateSimulator` component to control the data source.
    if (syntheticArgs) {
      setDebateArgs(syntheticArgs.map(arg => ({ ...arg, side: arg.stance, parentId: 'root', replyCount: 0 })));
      setLoading(false);
      return;
    }

    // Always start with the server-provided initial arguments.
    // This ensures that any mock data or database updates are reflected.
    setDebateArgs(initialArgs);
    
    // Then, try to layer on any user-added arguments from this session stored in localStorage.
    const storedArgsRaw = localStorage.getItem(`debate_args_${topicId}`);
    if (storedArgsRaw) {
        try {
            const storedArgs: Argument[] = JSON.parse(storedArgsRaw);
            // We can merge them, ensuring no duplicates if initialArgs already contains them.
            // For simplicity here, we'll just log if there's a discrepancy. A more robust
            // solution might merge based on argument IDs.
            const initialArgIds = new Set(initialArgs.map(a => a.id));
            const newSessionArgs = storedArgs.filter(sa => !initialArgIds.has(sa.id));
            if (newSessionArgs.length > 0) {
                 setDebateArgs(prevArgs => [...prevArgs, ...newSessionArgs]);
            }
        } catch(e) {
            console.error("Failed to parse debate arguments from localStorage", e);
        }
    }
    
    setLoading(false);
  }, [topicId, initialArgs, syntheticArgs]);


  useEffect(() => {
    // Why: The "write" operation. It triggers whenever the `debateArgs` state changes.
    // It's disabled if we're in synthetic mode to prevent writing simulated data
    // to the user's real localStorage.
    if (!loading && !syntheticArgs) { 
        // Only store arguments that are NOT in the initial static set to avoid redundancy.
        const initialArgIds = new Set(initialArgs.map(a => a.id));
        const sessionOnlyArgs = debateArgs.filter(a => !initialArgIds.has(a.id));
        if (sessionOnlyArgs.length > 0) {
            localStorage.setItem(`debate_args_${topicId}`, JSON.stringify(sessionOnlyArgs));
        } else {
            // Clean up localStorage if there are no more session-specific arguments
            localStorage.removeItem(`debate_args_${topicId}`);
        }
    }
  }, [debateArgs, topicId, loading, syntheticArgs, initialArgs]);
  
  const sortArguments = (a: Argument, b: Argument) => {
    if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Default to sorting by votes
    return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
  }

  const topLevelFor = useMemo(() => 
    debateArgs.filter(a => a.parentId === 'root' && a.side === 'for').sort(sortArguments),
    [debateArgs, sortBy]
  );
  
  const topLevelAgainst = useMemo(() =>
    debateArgs.filter(a => a.parentId === 'root' && a.side === 'against').sort(sortArguments),
    [debateArgs, sortBy]
  );


  const handleAddArgument = (side: 'for' | 'against') => {
    setRebuttalHint(null);
    setReplyingToId(null);
    setShowComposer(side);
  };
  
  const handleCounter = async (argumentToCounter: Argument) => {
    // If we're already showing the composer for this argument, close it.
    if (replyingToId === argumentToCounter.id) {
        setReplyingToId(null);
        setRebuttalHint(null);
        return;
    }
    
    // Set loading state and open composer immediately.
    setIsHintLoading(true);
    setReplyingToId(argumentToCounter.id);
    setRebuttalHint(null); // Clear old hint
    setShowComposer(null); // Ensure top-level composers are closed.

    const opposingSide = argumentToCounter.side === 'for' ? 'against' : 'for';
    const opposingArguments = opposingSide === 'for' ? topLevelFor : topLevelAgainst;

    const result = await generateRebuttalAction({
        topicQuestion: topicQuestion,
        argumentText: argumentToCounter.text,
        opposingArguments,
    });
    
    if (result.success && result.data) {
        setRebuttalHint(result.data.rebuttal);
    }
    setIsHintLoading(false);
  }

  const handleCancelComposer = () => {
    setShowComposer(null);
    setReplyingToId(null);
    setRebuttalHint(null);
  }

  const handleSubmit = (values: { text: string }, side: 'for' | 'against') => {
    const isTopLevel = !replyingToId;
    const parentId = isTopLevel ? 'root' : replyingToId;
    
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

    setDebateArgs(currentArgs => {
      let updatedArgs = [...currentArgs, newArgument];
      if (!isTopLevel && parentId) {
          const parentArgIndex = updatedArgs.findIndex(a => a.id === parentId);
          if (parentArgIndex > -1) {
              const parentArg = { ...updatedArgs[parentArgIndex] };
              parentArg.replyCount = parentArg.replyCount + 1;
              updatedArgs[parentArgIndex] = parentArg;
          }
      }
      return updatedArgs;
    });
    
    toast({ title: t.argumentAdded, description: t.argumentAddedDesc });
    handleCancelComposer();
  };
  
  const handleMerge = (similarArgumentId: string) => {
    setDebateArgs(currentArgs =>
        currentArgs.map(arg =>
            arg.id === similarArgumentId ? { ...arg, upvotes: arg.upvotes + 1 } : arg
        )
    );
    toast({ title: t.argumentUpvoted, description: t.argumentUpvotedDesc });
    handleCancelComposer();
  }

  const renderArgumentTree = (arg: Argument): React.ReactNode => {
    const replies = debateArgs.filter(reply => reply.parentId === arg.id).sort((a,b) => (b.upvotes-b.downvotes) - (a.upvotes-a.downvotes));
    const showReplyComposer = replyingToId === arg.id;

    return (
        <div key={arg.id} className="space-y-4">
            <ArgumentCard argument={arg} onCounter={() => handleCounter(arg)} />
            {showReplyComposer && (
                 <div className="ml-6 pl-4 border-l-2">
                    <ArgumentComposer
                        side={arg.side === 'for' ? 'against' : 'for'}
                        topicId={topicId}
                        existingArguments={debateArgs}
                        onCancel={handleCancelComposer}
                        onSubmit={handleSubmit}
                        onMerge={handleMerge}
                        rebuttalHint={rebuttalHint}
                        isHintLoading={isHintLoading}
                    />
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
    return <DebateSection.Skeleton />;
  }

  return (
    <div>
        <div className="mb-8">
            <ArgumentChart args={debateArgs} topicQuestion={topicQuestion} lang={lang} />
        </div>

        <div className="flex justify-end mb-6">
            <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortByType)} className="w-full sm:w-auto">
                <TabsList>
                    <TabsTrigger value="votes">{t.mostVoted}</TabsTrigger>
                    <TabsTrigger value="newest">{t.newest}</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

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
                 {showComposer === 'for' && (
                    <ArgumentComposer
                        side="for"
                        topicId={topicId}
                        existingArguments={debateArgs}
                        onCancel={handleCancelComposer}
                        onSubmit={handleSubmit}
                        onMerge={handleMerge}
                    />
                 )}
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
                 {showComposer === 'against' && (
                    <ArgumentComposer
                        side="against"
                        topicId={topicId}
                        existingArguments={debateArgs}
                        onCancel={handleCancelComposer}
                        onSubmit={handleSubmit}
                        onMerge={handleMerge}
                    />
                 )}
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
