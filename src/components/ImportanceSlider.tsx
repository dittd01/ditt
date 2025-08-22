
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImportanceSliderProps {
  topicId: string;
}

const importanceLevels = [
  { label: 'Not important at all', color: 'bg-muted/50 hover:bg-muted', selectedColor: 'bg-muted-foreground text-background' },
  { label: 'Slightly important', color: 'bg-primary/10 hover:bg-primary/20 text-primary', selectedColor: 'bg-primary/40 text-primary-foreground' },
  { label: 'Moderately important', color: 'bg-primary/30 hover:bg-primary/40 text-primary', selectedColor: 'bg-primary/70 text-primary-foreground' },
  { label: 'Very important', color: 'bg-primary/50 hover:bg-primary/60 text-primary-foreground', selectedColor: 'bg-primary text-primary-foreground' },
  { label: 'Critically important', color: 'bg-destructive/70 hover:bg-destructive/80 text-destructive-foreground', selectedColor: 'bg-destructive text-destructive-foreground' },
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
