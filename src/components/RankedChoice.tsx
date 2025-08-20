
'use client';

import { useState } from 'react';
import type { Topic, VoteOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RankedChoiceProps {
  topic: Topic;
  onVote: (ranking: string[]) => void;
}

function SortableItem({ item }: { item: VoteOption }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: item.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-4 p-4 border rounded-md bg-background touch-none">
        <GripVertical className="text-muted-foreground" />
        <span className="font-medium">{item.label}</span>
    </div>
  );
}

export function RankedChoice({ topic, onVote }: RankedChoiceProps) {
  const [rankedItems, setRankedItems] = useState(topic.options);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (active.id !== over?.id) {
      setRankedItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleSubmit = () => {
    onVote(rankedItems.map(item => item.id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rank Your Choices</CardTitle>
        <CardDescription>Drag and drop the options to rank them in your order of preference, with #1 at the top.</CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={rankedItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
                {rankedItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <span className="font-bold text-lg text-muted-foreground w-6">{index + 1}.</span>
                        <SortableItem item={item} />
                    </div>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button onClick={handleSubmit} className="w-full h-12 text-lg">
          Submit Ranking
        </Button>
         <Button variant="outline" onClick={() => onVote(['abstain'])}>Abstain</Button>
      </CardFooter>
    </Card>
  );
}
