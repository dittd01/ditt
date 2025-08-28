
'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, Volume2 } from 'lucide-react';
import { generateSpeechAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { currentUser } from '@/lib/user-data';
import { cn } from '@/lib/utils';

interface AIAvatarProps {
  textToSpeak: string;
}

export function AIAvatar({ textToSpeak }: AIAvatarProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio element on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    // If audio is already playing, pause it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If audio is paused, resume it
    if (!isPlaying && audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    
    // If no audio is loaded, generate it
    setIsLoading(true);
    try {
      const result = await generateSpeechAction(textToSpeak);
      if (result.success && result.data.audioUrl) {
        setAudioUrl(result.data.audioUrl);
        const newAudio = new Audio(result.data.audioUrl);
        audioRef.current = newAudio;
        
        newAudio.play();
        setIsPlaying(true);
        
        newAudio.onended = () => {
          setIsPlaying(false);
        };

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
