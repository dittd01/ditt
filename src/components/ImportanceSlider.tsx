
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImportanceSliderProps {
  topicId: string;
}

const importanceLabels = [
  'Not important at all',
  'Slightly important',
  'Moderately important',
  'Very important',
  'Critically important',
];

export function ImportanceSlider({ topicId }: ImportanceSliderProps) {
  const [importance, setImportance] = useState<number | null>(null);

  useEffect(() => {
    // Load saved importance rating from localStorage on mount
    const savedImportance = localStorage.getItem(`importance_for_${topicId}`);
    if (savedImportance) {
      setImportance(parseInt(savedImportance, 10));
    }
  }, [topicId]);

  const handleSelect = (index: number) => {
    const newImportance = index;
    setImportance(newImportance);
    // Save the new rating to localStorage
    localStorage.setItem(`importance_for_${topicId}`, newImportance.toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How important is this issue to you?</CardTitle>
        <CardDescription>
          Your rating helps us understand what matters most to voters. This is saved privately and is not a public vote.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-wrap gap-2">
          {importanceLabels.map((label, index) => (
            <Button
              key={index}
              variant={importance === index ? 'default' : 'outline'}
              onClick={() => handleSelect(index)}
              className="flex-grow"
            >
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
