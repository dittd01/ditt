

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Argument, SimArgument, Topic } from '@/lib/types';
import { ArgumentCard } from './ArgumentCard';
import { Button } from '../ui/button';
import { PlusCircle, Lightbulb, Loader2, Donut, Network } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { ArgumentComposer } from './ArgumentComposer';
import { currentUser } from '@/lib/user-data';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateRebuttalAction } from '@/app/actions';
import { DebateTree } from './DebateTree';
import { DebateHierarchy } from './DebateHierarchy';
import { cn } from '@/lib/utils';


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
        visualization: 'Visualization',
        for: 'Arguments for',
        against: 'Arguments against',
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
        visualization: 'Visualisering',
        for: 'Argumenter for',
        against: 'Argumenter mot',
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
type ActiveTab = 'arguments' | 'visualization';
type VizType = 'radial' | 'tree';

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('arguments');
  const [vizType, setVizType] = useState<VizType>('radial');
  const argumentRefs = useRef<Map<string, HTMLElement | null>>(new Map());
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

  const argumentsByParentId = useMemo(() => {
    const grouped = new Map<string, Argument[]>();
    debateArgs.forEach(arg => {
        const parentId = arg.parentId || 'root';
        if (!grouped.has(parentId)) {
            grouped.set(parentId, []);
        }
        grouped.get(parentId)!.push(arg);
    });
    return grouped;
  }, [debateArgs]);
  
  const handleArgumentNodeClick = (argument: Argument) => {
    setActiveTab('arguments');
    // Allow React to re-render and switch tabs before we scroll
    setTimeout(() => {
        const element = argumentRefs.current.get(argument.id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the card briefly
            element.classList.add('ring-2', 'ring-primary', 'transition-all', 'duration-1000');
            setTimeout(() => {
                 element.classList.remove('ring-2', 'ring-primary', 'transition-all', 'duration-1000');
            }, 2000);
        }
    }, 100);
  };


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
    const opposingArguments = (argumentsByParentId.get('root') || []).filter(a => a.side === opposingSide);

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
    const replies = (argumentsByParentId.get(arg.id) || []).sort(sortArguments);
    const showReplyComposer = replyingToId === arg.id;

    return (
        <div key={arg.id} className="space-y-4" ref={node => argumentRefs.current.set(arg.id, node)}>
            <ArgumentCard argument={arg} onCounter={() => handleCounter(arg)} />
            {showReplyComposer && (
                 <div className="ml-6 pl-4 border-l-2">
                    <ArgumentComposer
                        side={arg.side === 'for' ? 'against' : 'for'}
                        topicId={topicId}
                        existingArguments={debateArgs.filter(a => a.parentId === 'root')}
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
  
  const topLevelFor = useMemo(() =>
    (argumentsByParentId.get('root') || []).filter(a => a.side === 'for').sort(sortArguments),
    [argumentsByParentId, sortBy]
  );
  
  const topLevelAgainst = useMemo(() =>
    (argumentsByParentId.get('root') || []).filter(a => a.side === 'against').sort(sortArguments),
    [argumentsByParentId, sortBy]
  );


  if (loading) {
    return <DebateSection.Skeleton />;
  }

  return (
    <Tabs defaultValue="arguments" value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)} className="w-full">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <TabsList>
                <TabsTrigger value="arguments">{t.arguments}</TabsTrigger>
                <TabsTrigger value="visualization">{t.visualization}</TabsTrigger>
            </TabsList>
            <TabsList>
                <TabsTrigger value="votes" onClick={() => setSortBy('votes')} className="data-[state=active]:bg-primary/10">{t.mostVoted}</TabsTrigger>
                <TabsTrigger value="newest" onClick={() => setSortBy('newest')} className="data-[state=active]:bg-primary/10">{t.newest}</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="arguments">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Arguments For Column */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-[hsl(var(--chart-2))]">
                            {t.for}
                        </h3>
                        <Button variant="ghost" size="icon" onClick={() => handleAddArgument('for')} className="text-[hsl(var(--chart-2))] hover:text-[hsl(var(--chart-2))] hover:bg-green-500/10">
                            <PlusCircle className="h-5 w-5" />
                        </Button>
                    </div>
                    {showComposer === 'for' && (
                        <ArgumentComposer
                            side="for"
                            topicId={topicId}
                            existingArguments={topLevelFor}
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
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-destructive">
                            {t.against}
                        </h3>
                        <Button variant="ghost" size="icon" onClick={() => handleAddArgument('against')} className="text-destructive hover:text-destructive hover:bg-red-500/10">
                            <PlusCircle className="h-5 w-5" />
                        </Button>
                    </div>
                    {showComposer === 'against' && (
                        <ArgumentComposer
                            side="against"
                            topicId={topicId}
                            existingArguments={topLevelAgainst}
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
        </TabsContent>
        <TabsContent value="visualization" className="space-y-4">
             <div className="flex justify-center border bg-card rounded-md p-1">
                <Button
                    variant={vizType === 'radial' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setVizType('radial')}
                    aria-label="Radial View"
                >
                    <Donut />
                </Button>
                <Button
                    variant={vizType === 'tree' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setVizType('tree')}
                    aria-label="Tree View"
                >
                    <Network />
                </Button>
             </div>
             <div className={cn(vizType === 'radial' ? 'block' : 'hidden')}>
                <DebateTree 
                    args={debateArgs} 
                    topicQuestion={topicQuestion} 
                    lang={lang}
                    onNodeClick={handleArgumentNodeClick}
                />
            </div>
             <div className={cn(vizType === 'tree' ? 'block' : 'hidden')}>
                <DebateHierarchy
                    args={debateArgs}
                    topicQuestion={topicQuestion}
                    lang={lang}
                    onNodeClick={handleArgumentNodeClick}
                />
            </div>
        </TabsContent>
    </Tabs>
  );
}
