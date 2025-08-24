
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ImportanceSliderProps {
  topicId: string;
}

const importanceLevels = [
    { label: 'Not important at all', color: 'bg-muted/50 hover:bg-muted', selectedColor: 'bg-muted-foreground text-background' },
    { label: 'Slightly important', color: 'bg-destructive/10 hover:bg-destructive/20', selectedColor: 'bg-primary/40 text-primary-foreground' },
    { label: 'Moderately important', color: 'bg-primary/10 hover:bg-primary/20', selectedColor: 'bg-primary/70 text-primary-foreground' },
    { label: 'Very important', color: 'bg-primary/30 hover:bg-primary/40', selectedColor: 'bg-primary text-primary-foreground' },
    { label: 'Critically important', color: 'bg-primary/60 hover:bg-primary/70', selectedColor: 'bg-primary text-primary-foreground ring-2 ring-ring' },
];

// Dummy data for distribution. In a real app, this would come from an API.
const dummyDistribution = [10, 15, 40, 25, 10];


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
  
  const handleReset = () => {
    setImportance(null);
    localStorage.removeItem(`importance_for_${topicId}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How important is this issue to you?</CardTitle>
        <CardDescription>
            {importance === null 
                ? "Your rating helps us understand what matters most to voters. This is saved privately and is not a public vote."
                : "This is how your rating compares to others. You can change it at any time."
            }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {importance === null ? (
            <div className="space-y-2">
                <div className="flex gap-2">
                     <Button
                        key={0}
                        variant="outline"
                        onClick={() => handleSelect(0)}
                        className={cn(
                            "flex-grow transition-all duration-150 border-0 text-foreground",
                            importanceLevels[0].color
                        )}
                        >
                        {importanceLevels[0].label}
                    </Button>
                     <Button
                        key={1}
                        variant="outline"
                        onClick={() => handleSelect(1)}
                        className={cn(
                            "flex-grow transition-all duration-150 border-0 text-foreground",
                            importanceLevels[1].color
                        )}
                        >
                        {importanceLevels[1].label}
                    </Button>
                </div>
                 <div className="flex gap-2">
                     <Button
                        key={2}
                        variant="outline"
                        onClick={() => handleSelect(2)}
                        className={cn(
                            "flex-grow transition-all duration-150 border-0 text-foreground",
                            importanceLevels[2].color
                        )}
                        >
                        {importanceLevels[2].label}
                    </Button>
                </div>
                 <div className="flex gap-2">
                     <Button
                        key={3}
                        variant="outline"
                        onClick={() => handleSelect(3)}
                        className={cn(
                            "flex-grow transition-all duration-150 border-0 text-foreground",
                            importanceLevels[3].color
                        )}
                        >
                        {importanceLevels[3].label}
                    </Button>
                     <Button
                        key={4}
                        variant="outline"
                        onClick={() => handleSelect(4)}
                        className={cn(
                            "flex-grow transition-all duration-150 border-0 text-foreground",
                            importanceLevels[4].color
                        )}
                        >
                        {importanceLevels[4].label}
                    </Button>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                {importanceLevels.map((level, index) => (
                    <div key={index} className={cn("p-2 rounded-md transition-colors", importance === index && "bg-primary/10")}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium">{level.label}</span>
                            <span className="text-muted-foreground">{dummyDistribution[index]}%</span>
                        </div>
                        <Progress value={dummyDistribution[index]} />
                    </div>
                ))}

                 <Button onClick={handleReset} variant="outline" className="w-full mt-4">Change rating</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
