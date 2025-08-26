
'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SharePayload } from '@/lib/share/schema';
import { useShare } from '@/hooks/useShare';

interface ShareButtonProps {
  payload: SharePayload;
}

export function ShareButton({ payload }: ShareButtonProps) {
  const { share } = useShare();

  const handleShareClick = () => {
    share(payload);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground"
      onClick={handleShareClick}
      aria-label="Share topic"
    >
      <Share2 className="h-5 w-5" />
    </Button>
  );
}
