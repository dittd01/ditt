
'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, Volume2 } from 'lucide-react';
import { generateSpeechAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { currentUser } from '@/lib/user-data';
import { cn } from '@/lib/utils';
import { createHash } from 'crypto';

interface AIAvatarProps {
  textToSpeak: string;
}

// Why: A stable key is needed for localStorage. We create a short hash of the
// text content to use as a key. This is more reliable than using the raw text.
function createCacheKey(text: string): string {
    const hash = createHash('sha256');
    hash.update(text);
    return `audio_cache_${hash.digest('hex').substring(0, 16)}`;
}

export function AIAvatar({ textToSpeak }: AIAvatarProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Why: Using a state for the cache key makes the component's logic cleaner
  // and ensures it's available throughout the component's lifecycle.
  const [cacheKey, setCacheKey] = useState('');

  useEffect(() => {
    // Why: We set the cache key on the client-side only to avoid SSR issues with crypto.
    setCacheKey(createCacheKey(textToSpeak));
  }, [textToSpeak]);
  
  useEffect(() => {
    // Why: Centralized cleanup logic. This ensures that no matter how the component
    // is unmounted, the audio is properly stopped and resources are released.
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!isPlaying && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    
    // --- Caching Logic ---
    // Why: We check localStorage before making an API call. This is the core of the
    // caching strategy. If a cached version exists, we use it and exit early.
    const cachedAudio = cacheKey ? localStorage.getItem(cacheKey) : null;
    if (cachedAudio) {
      playAudioFromUrl(cachedAudio);
      return;
    }
    // --- End Caching Logic ---

    setIsLoading(true);
    try {
      const result = await generateSpeechAction(textToSpeak);
      if (result.success && result.data.audioUrl) {
        // Why: After successful generation, we immediately store the result in
        // localStorage. This ensures the next time the user clicks, it will be cached.
        if (cacheKey) {
            localStorage.setItem(cacheKey, result.data.audioUrl);
        }
        playAudioFromUrl(result.data.audioUrl);
      } else {
        throw new Error(result.message || 'Failed to generate speech.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Speech Generation Failed',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioFromUrl = (url: string) => {
      const newAudio = new Audio(url);
      audioRef.current = newAudio;
      
      newAudio.play();
      setIsPlaying(true);
      
      newAudio.onended = () => {
        setIsPlaying(false);
      };
       newAudio.onpause = () => {
        setIsPlaying(false);
      };
  }

  return (
    <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
      <Avatar className="h-16 w-16 border-2 border-primary">
        <AvatarImage src={currentUser.photoUrl} alt="AI Avatar" />
        <AvatarFallback>{currentUser.initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold text-foreground">AI Guide</p>
        <p className="text-sm text-muted-foreground">Listen to a summary of this page.</p>
      </div>
      <Button onClick={handlePlayAudio} size="icon" className={cn("h-12 w-12", isPlaying && 'bg-destructive hover:bg-destructive/90')}>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Volume2 className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
