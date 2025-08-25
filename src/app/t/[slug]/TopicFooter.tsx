
'use client';

import { useState, useEffect } from 'react';
import { Flame, Users, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Topic } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TopicFooterProps {
  topic: Topic;
}

export function TopicFooter({ topic }: TopicFooterProps) {
  const { toast } = useToast();
  const [lang, setLang] = useState('en');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [importance, setImportance] = useState<number | null>(null);

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);

    const checkBookmarkStatus = () => {
      const bookmarkedTopics = JSON.parse(localStorage.getItem('bookmarked_topics') || '[]');
      setIsBookmarked(bookmarkedTopics.includes(topic.id));
    };
    
    const checkImportance = () => {
      const savedImportance = localStorage.getItem(`importance_for_${topic.id}`);
      if (savedImportance) {
          setImportance(parseInt(savedImportance, 10));
      } else {
          setImportance(null);
      }
    };


    checkBookmarkStatus();
    checkImportance();

    window.addEventListener('storage', checkImportance);
    window.addEventListener('bookmarkChange', checkBookmarkStatus);

    return () => {
      window.removeEventListener('storage', checkImportance);
      window.removeEventListener('bookmarkChange', checkBookmarkStatus);
    };
  }, [topic.id]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    let bookmarkedTopics: string[] = JSON.parse(localStorage.getItem('bookmarked_topics') || '[]');

    if (isBookmarked) {
      bookmarkedTopics = bookmarkedTopics.filter(id => id !== topic.id);
      toast({ title: 'Bookmark Removed' });
    } else {
      bookmarkedTopics.push(topic.id);
      toast({ title: 'Bookmark Added' });
    }

    localStorage.setItem('bookmarked_topics', JSON.stringify(bookmarkedTopics));
    setIsBookmarked(!isBookmarked);
    window.dispatchEvent(new Event('bookmarkChange'));
  };

  const importanceLevel = importance !== null ? importance + 1 : Math.round(topic.averageImportance);
  const importanceTooltipText = importance !== null ? `You rated this ${importance + 1}/10` : (lang === 'nb' ? 'Gjennomsnittlig viktighet' : 'Average Importance');
  const votersTooltipText = lang === 'nb' ? 'Antall som har stemt' : 'Number of voters';
  const bookmarkTooltipText = lang === 'nb' ? 'Bokmerk' : 'Bookmark';

  return (
    <div className="flex w-full items-center justify-between text-muted-foreground">
      <TooltipProvider>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Flame
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      // To represent a 10-point scale on 5 flames, each flame represents 2 points.
                      (i * 2) < importanceLevel ? 'text-destructive fill-current' : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{importanceTooltipText}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">{topic.totalVotes.toLocaleString()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{votersTooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBookmarkClick}>
              <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-current text-primary')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{bookmarkTooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
