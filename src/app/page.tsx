'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { TopicCard } from '@/components/TopicCard';
import { allTopics } from '@/lib/data';

function HomePageContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('cat');
  const selectedSubCategory = searchParams.get('sub');

  const filteredTopics = allTopics.filter((topic) => {
    const category = selectedCategory || 'all';

    if (category === 'all') {
      // If a subcategory is selected (from any category), filter by it
      if (selectedSubCategory) {
        return topic.subcategoryId === selectedSubCategory;
      }
      // Otherwise, show all topics
      return true;
    }

    // Filter by main category
    if (topic.categoryId !== category) {
      return false;
    }

    // If a subcategory is also selected, filter by it as well
    if (selectedSubCategory) {
      return topic.subcategoryId === selectedSubCategory;
    }
    
    // Otherwise, show all topics for the selected main category
    return true;
  }).sort((a, b) => {
     if (selectedCategory === 'all' || !selectedCategory) {
       return b.totalVotes - a.totalVotes;
     }
     return 0; // Or other sorting for categories
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
