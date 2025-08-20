
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { VoteCard } from '@/components/VoteCard';
import { allTopics as initialTopics } from '@/lib/data';
import type { Topic } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

type TimeFrame = 'W' | '1M' | '1Y' | 'All';

function HomePageContent() {
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [votedTopicIds, setVotedTopicIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<TimeFrame>('All');

  useEffect(() => {
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
    // Listen for a custom event when a new topic is added
    window.addEventListener('topicAdded', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
      window.removeEventListener('topicAdded', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const selectedCategory = searchParams.get('cat');
  const selectedSubCategory = searchParams.get('sub');
  const searchQuery = searchParams.get('q');

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      if (searchQuery) {
          const query = searchQuery.toLowerCase();
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

       // Sort by timeframe if on the trending page
       if (selectedCategory === 'all' || !selectedCategory) {
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
       return b.totalVotes - a.totalVotes;
    });
  }, [topics, searchQuery, selectedCategory, selectedSubCategory, timeframe]);

  const showTimeframeFilter = !selectedCategory || selectedCategory === 'all';

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8 sm:py-12">
         {searchQuery && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Search Results for "{searchQuery}"</h1>
            <p className="text-muted-foreground">{filteredTopics.length} topics found.</p>
          </div>
        )}

        {showTimeframeFilter && !searchQuery && (
          <div className="mb-8 flex justify-end">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 9 }).map((_, i) => <VoteCard.Skeleton key={i} />)}
            </div>
        </div>
    }>
      {isClient ? <HomePageContent /> : (
         <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 9 }).map((_, i) => <VoteCard.Skeleton key={i} />)}
            </div>
        </div>
      )}
    </Suspense>
  );
}
