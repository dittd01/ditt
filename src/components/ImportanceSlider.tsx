
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImportanceSliderProps {
  topicId: string;
}

const importanceLevels = [
  { label: 'Not important at all', color: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600', selectedColor: 'bg-slate-500 text-white' },
  { label: 'Slightly important', color: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-800/60 text-yellow-800 dark:text-yellow-300', selectedColor: 'bg-yellow-500 text-white' },
  { label: 'Moderately important', color: 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/50 dark:hover:bg-orange-800/60 text-orange-800 dark:text-orange-300', selectedColor: 'bg-orange-500 text-white' },
  { label: 'Very important', color: 'bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-800/60 text-red-800 dark:text-red-300', selectedColor: 'bg-red-500 text-white' },
  { label: 'Critically important', color: 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800/60 text-purple-800 dark:text-purple-300', selectedColor: 'bg-purple-600 text-white' },
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
          {importanceLevels.map((level, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleSelect(index)}
              className={cn(
                "flex-grow transition-all duration-150 border-0",
                importance === index
                  ? level.selectedColor
                  : level.color
              )}
            >
              {level.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
