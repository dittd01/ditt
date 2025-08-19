
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { TopicCard } from '@/components/TopicCard';
import { allTopics as initialTopics } from '@/lib/data';
import type { Topic } from '@/lib/types';

function HomePageContent() {
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);

  // This effect syncs the state with localStorage on initial load and when the page becomes visible
  useEffect(() => {
    const syncTopicsWithLocalStorage = () => {
      const updatedTopics = initialTopics.map(topic => {
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
    };
    
    syncTopicsWithLocalStorage(); // Initial sync
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTopicsWithLocalStorage();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const selectedCategory = searchParams.get('cat');
  const selectedSubCategory = searchParams.get('sub');

  const filteredTopics = topics.filter((topic) => {
    if (topic.categoryId === 'election_2025') {
      return false;
    }

    const category = selectedCategory || 'all';

    if (category === 'all') {
      if (selectedSubCategory) {
        return topic.subcategoryId === selectedSubCategory;
      }
      return true;
    }

    if (topic.categoryId !== category) {
      return false;
    }

    if (selectedSubCategory) {
      return topic.subcategoryId === selectedSubCategory;
    }
    
    return true;
  }).sort((a, b) => {
     if (selectedCategory === 'all' || !selectedCategory) {
       return b.totalVotes - a.totalVotes;
     }
     return 0;
  });

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
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
    <Suspense fallback={<div>Loading...</div>}>
      {isClient ? <HomePageContent /> : null}
    </Suspense>
  );
}
