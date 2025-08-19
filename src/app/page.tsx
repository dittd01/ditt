import { TopicCard } from '@/components/TopicCard';
import { mockTopics } from '@/lib/data';

export default function Home() {
  return (
    <div className="bg-background">
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl font-headline">
            Current Public Polls
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your anonymous voice matters. Participate in polls shaping our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>
    </div>
  );
}
