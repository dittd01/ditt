'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { TopicCard } from '@/components/TopicCard';
import { CategoryNav } from '@/components/CategoryNav';
import { allTopics, categories } from '@/lib/data';

function HomePageContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('cat');
  const selectedSubCategory = searchParams.get('sub');

  const filteredTopics = allTopics.filter((topic) => {
    if (!selectedCategory) return true;
    if (selectedCategory && topic.categoryId !== selectedCategory) return false;
    if (selectedSubCategory && topic.subcategoryId !== selectedSubCategory) return false;
    return true;
  });

  return (
    <div className="bg-background">
      <CategoryNav categories={categories} />
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
