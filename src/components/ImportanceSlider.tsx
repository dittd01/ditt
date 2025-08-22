
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

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
  const [importance, setImportance] = useState(2); // Default to "Moderately important"

  useEffect(() => {
    // Load saved importance rating from localStorage on mount
    const savedImportance = localStorage.getItem(`importance_for_${topicId}`);
    if (savedImportance) {
      setImportance(parseInt(savedImportance, 10));
    }
  }, [topicId]);

  const handleValueChange = (value: number[]) => {
    const newImportance = value[0];
    setImportance(newImportance);
    // Save the new rating to localStorage
    localStorage.setItem(`importance_for_${topicId}`, newImportance.toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How important is this issue to you?</CardTitle>
        <CardDescription>
          Rate the importance of this topic to help us understand what matters most to voters.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          <Slider
            value={[importance]}
            onValueChange={handleValueChange}
            min={0}
            max={importanceLabels.length - 1}
            step={1}
          />
          <div className="text-center">
            <Label className="text-muted-foreground font-medium">
              {importanceLabels[importance]}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
