
'use client';

import { useState } from 'react';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LikertScaleProps {
  topic: Topic;
  onVote: (optionId: string) => void;
}

export function LikertScale({ topic, onVote }: LikertScaleProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };
  
  const handleSubmit = () => {
    if(selectedOption) {
      onVote(selectedOption);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Anonymous Vote</CardTitle>
        <CardDescription>Select the option that best represents your view.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center space-x-2">
        {topic.options.map((option) => (
          <div key={option.id} className="text-center">
            <Button
              variant={selectedOption === option.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSelect(option.id)}
              className={cn(
                "w-full transition-all",
                selectedOption === option.id && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {option.label}
            </Button>
          </div>
        ))}
      </CardContent>
       <CardFooter className="flex flex-col gap-4">
         <Button onClick={handleSubmit} disabled={!selectedOption} className="w-full h-12 text-lg">
            Submit Vote
          </Button>
         <Button variant="outline" onClick={() => onVote('abstain')}>Abstain / No Opinion</Button>
      </CardFooter>
    </Card>
  );
}
