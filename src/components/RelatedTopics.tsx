
'use client';

import Link from 'next/link';
import { getRelatedTopics } from '@/lib/data';
import type { Topic } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface RelatedTopicsProps {
  topicId: string;
  subcategoryId: string;
}

export function RelatedTopics({ topicId, subcategoryId }: RelatedTopicsProps) {
  const relatedTopics = getRelatedTopics(topicId, subcategoryId);

  if (relatedTopics.length === 0) {
    return null;
  }

  const handleRelatedClick = (destinationTopicId: string) => {
    trackEvent('related_click', {
      sourceTopicId: topicId,
      destinationTopicId,
    });
  };

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Related Topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedTopics.map((topic) => (
                <Card key={topic.id} className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-base font-medium line-clamp-3">
                           <Link href={`/t/${topic.slug}`} onClick={() => handleRelatedClick(topic.id)}>{topic.question}</Link>
                        </CardTitle>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild variant="secondary" size="sm" className="w-full">
                           <Link href={`/t/${topic.slug}`} onClick={() => handleRelatedClick(topic.id)}>View Topic</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
