

'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { VoteCard } from '@/components/VoteCard';
import { allTopics as initialTopics } from '@/lib/data';
import type { Topic } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimeFrame = 'W' | '1M' | '1Y' | 'All';
type SortByType = 'votes' | 'importance';

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [votedTopicIds, setVotedTopicIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<TimeFrame>('W');
  const [sortBy, setSortBy] = useState<SortByType>('votes');
  const [lang, setLang] = useState('en');
  
  const initialSearch = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);
    
    const syncTopicsWithLocalStorage = () => {
      // Get custom topics from local storage
      const customTopics: Topic[] = JSON.parse(localStorage.getItem('custom_topics') || '[]');

      // Combine initial topics with custom topics, ensuring no duplicates
      const combinedTopics = [...initialTopics];
      const existingIds = new Set(initialTopics.map(t => t.id));
      customTopics.forEach(customTopic => {
        if (!existingIds.has(customTopic.id)) {
          combinedTopics.push(customTopic);
        }
      });

      const updatedTopics = combinedTopics.map(topic => {
        if (topic.voteType === 'election') {
          return topic;
        }
        const newVotes: Record<string, number> = {};
        let newTotalVotes = 0;
        
        topic.options.forEach(option => {
          const storedVotes = localStorage.getItem(`votes_for_${topic.id}_${option.id}`);
          const currentVotes = storedVotes ? parseInt(storedVotes, 10) : topic.votes[option.id] || 0;
          newVotes[option.id] = currentVotes;
          newTotalVotes += currentVotes;
        });
        
        return { ...topic, votes: newVotes, totalVotes: newTotalVotes };
      });
      setTopics(updatedTopics);

      const votedIds = new Set<string>();
      updatedTopics.forEach(topic => {
        if (localStorage.getItem(`voted_on_${topic.id}`)) {
          votedIds.add(topic.id);
        }
      });
      setVotedTopicIds(votedIds);
      setIsLoading(false);
    };
    
    syncTopicsWithLocalStorage();
    
    const handleStorageChange = () => {
        syncTopicsWithLocalStorage();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTopicsWithLocalStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);
    window.addEventListener('topicAdded', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
      window.removeEventListener('topicAdded', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchQuery) {
        params.set('q', debouncedSearchQuery);
    } else {
        params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchQuery, pathname, router, searchParams]);


  const selectedCategory = searchParams.get('cat');
  const selectedSubCategory = searchParams.get('sub');

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          const matches = topic.question.toLowerCase().includes(query) || topic.description.toLowerCase().includes(query);
          if(!matches) return false;
      }
      
      const category = selectedCategory || 'all';

      if (category === 'all') return true;

      if (topic.categoryId === 'election_2025') {
        return category === 'election_2025';
      }
      
      if (topic.categoryId !== category) {
        return false;
      }

      if (selectedSubCategory) {
        return topic.subcategoryId === selectedSubCategory;
      }
      
      return true;
    }).sort((a, b) => {
       if (a.voteType === 'election') return -1;
       if (b.voteType === 'election') return 1;

       if (selectedCategory === 'all' || !selectedCategory) {
         if (sortBy === 'importance') {
            return b.averageImportance - a.averageImportance;
         }
         
         switch (timeframe) {
            case 'W':
              return (b.votesLastWeek ?? 0) - (a.votesLastWeek ?? 0);
            case '1M':
              return (b.votesLastMonth ?? 0) - (a.votesLastMonth ?? 0);
            case '1Y':
              return (b.votesLastYear ?? 0) - (a.votesLastYear ?? 0);
            case 'All':
            default:
              return b.totalVotes - a.totalVotes;
         }
       }
       return (b.votesLastMonth ?? 0) - (a.votesLastMonth ?? 0);
    });
  }, [topics, debouncedSearchQuery, selectedCategory, selectedSubCategory, timeframe, sortBy]);

  const showTimeframeFilter = !selectedCategory || selectedCategory === 'all';

  const trendingTitle = lang === 'nb' ? 'Populære temaer' : 'Trending Topics';
  const trendingSubtitle = lang === 'nb' ? 'De mest diskuterte og stemte sakene akkurat nå.' : 'The most discussed and voted on issues right now.';
  const searchPlaceholder = lang === 'nb' ? 'Søk etter hvilket som helst tema...' : 'Search for any topic...';
  const searchResultsTitle = lang === 'nb' ? `Søkeresultater for "${debouncedSearchQuery}"` : `Search Results for "${debouncedSearchQuery}"`;
  const searchResultsCount = lang === 'nb' ? `${filteredTopics.length} temaer funnet.` : `${filteredTopics.length} topics found.`;
  const noTopicsFound = lang === 'nb' ? 'Ingen temaer funnet som samsvarer med søket ditt.' : 'No topics found matching your search.';
  const sortByVotesText = lang === 'nb' ? 'Flest Stemmer' : 'Most Votes';
  const sortByImportanceText = lang === 'nb' ? 'Viktigst' : 'Most Important';


  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8 sm:py-12">
         {!selectedCategory && (
            <div className="mb-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold font-headline tracking-tight">{trendingTitle}</h1>
                <p className="text-lg text-muted-foreground mt-2">{trendingSubtitle}</p>
              </div>
              <div className="relative max-w-lg mx-auto mt-8">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder={searchPlaceholder}
                      className="w-full pl-10 h-12 text-base"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
            </div>
         )}
        
         {debouncedSearchQuery && (
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold">{searchResultsTitle}</h2>
              <p className="text-muted-foreground">{searchResultsCount}</p>
            </div>
         )}

        {showTimeframeFilter && !debouncedSearchQuery && (
          <div className="mb-8 flex flex-wrap justify-end gap-4">
             <div className="flex gap-1 bg-muted p-1 rounded-md w-full sm:w-auto">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSortBy('votes')}
                    className={cn(
                        "px-3 h-8 flex-1 sm:flex-initial",
                        sortBy === 'votes' && "bg-[#03354c] text-white hover:bg-[#03354c]/90"
                    )}
                >
                    {sortByVotesText}
                </Button>
                 <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSortBy('importance')}
                    className={cn(
                        "px-3 h-8 flex-1 sm:flex-initial",
                        sortBy === 'importance' && "bg-[#03354c] text-white hover:bg-[#03354c]/90"
                    )}
                >
                    {sortByImportanceText}
                </Button>
             </div>
            <div className="flex gap-1 bg-muted p-1 rounded-md w-full sm:w-auto">
              {(['W', '1M', '1Y', 'All'] as TimeFrame[]).map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={timeframe === tf ? 'default' : 'ghost'}
                  onClick={() => setTimeframe(tf)}
                  className="px-3 h-8 flex-1 sm:flex-initial"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => <VoteCard.Skeleton key={i} />)
          ) : (
            filteredTopics.map((topic) => (
              <VoteCard key={topic.id} topic={topic} hasVoted={votedTopicIds.has(topic.id)} />
            ))
          )}
           {!isLoading && filteredTopics.length === 0 && (
             <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                 <p className="text-muted-foreground">{noTopicsFound}</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Suspense fallback={
        <div className="container mx-auto px-4 py-8 sm:py-12">
             <div className="mb-12">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
                <Skeleton className="h-12 w-full max-w-lg mx-auto mt-8" />
             </div>
            <div className="mb-8 flex justify-end">
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 9 }).map((_, i) => <VoteCard.Skeleton key={i} />)}
            </div>
        </div>
    }>
      {isClient ? <HomePageContent /> : (
         <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="mb-12">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
                <Skeleton className="h-12 w-full max-w-lg mx-auto mt-8" />
            </div>
            <div className="mb-8 flex justify-end">
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 9 }).map((_, i) => <VoteCard.Skeleton key={i} />)}
            </div>
        </div>
      )}
    </Suspense>
  );
}
