
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, ChevronDown } from 'lucide-react';
import type { SharePayload, ShareTarget } from '@/lib/share/schema';
import { SHARE_TARGETS } from '@/lib/share/targets';
import { PRIMARY_TARGETS_NB_NO, PRIMARY_TARGETS_EN } from '@/config/share';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackShare } from '@/lib/share/analytics';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { QrCard } from './QrCard';
import { EmbedCard } from './EmbedCard';


interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: SharePayload | null;
}

const getPrimaryTargets = (locale: string): ShareTarget[] => {
  const targetIds = locale.startsWith('nb') ? PRIMARY_TARGETS_NB_NO : PRIMARY_TARGETS_EN;
  return targetIds.map(id => SHARE_TARGETS[id]).filter(t => t && t.available());
};

const getSecondaryTargets = (locale: string): ShareTarget[] => {
  const primaryIds = new Set(locale.startsWith('nb') ? PRIMARY_TARGETS_NB_NO : PRIMARY_TARGETS_EN);
  return Object.values(SHARE_TARGETS)
    .filter(t => t.id !== 'native' && !primaryIds.has(t.id) && t.available())
    .sort((a, b) => a.name.localeCompare(b.name));
};

export function ShareSheet({ open, onOpenChange, payload }: ShareSheetProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [hasCopied, setHasCopied] = React.useState(false);
  const [locale, setLocale] = React.useState('en');
  const [showQr, setShowQr] = React.useState(false);
  const [showEmbed, setShowEmbed] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);


  React.useEffect(() => {
    if (open) {
      // Why: Reset transient state every time the sheet opens.
      // This ensures a clean slate for each interaction.
      setLocale(navigator.language);
      setShowQr(false);
      setShowEmbed(false);
      trackShare({ targetId: 'sheet_open', url: payload?.url || '', status: 'impression' });
    }
  }, [open, payload]);

  const handleCopyLink = async () => {
    if (!payload?.url) return;

    try {
      const urlToCopy = SHARE_TARGETS.copy.buildUrl(payload);
      await navigator.clipboard.writeText(urlToCopy);
      setHasCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'The link has been copied to your clipboard.',
      });
      trackShare({ targetId: 'copy', url: urlToCopy, status: 'success' });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy the link. Please try again.',
      });
       trackShare({ targetId: 'copy', url: payload.url, status: 'error' });
    }
  };
  
  const handleShareClick = (target: ShareTarget) => {
    if (!payload) return;
    
    // Why: "Special" type targets handle their own UI toggling
    // instead of opening a new window.
    if (target.type === 'special') {
        if (target.id === 'qr') setShowQr(s => !s);
        if (target.id === 'embed') setShowEmbed(s => !s);
        setShowQr(target.id === 'qr' ? !showQr : false);
        setShowEmbed(target.id === 'embed' ? !showEmbed : false);
        return;
    }
    
    const url = target.buildUrl(payload);
    window.open(url, '_blank', 'noopener,noreferrer');
    trackShare({ targetId: target.id, url, status: 'success' });
  };
  
  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const primaryTargets = getPrimaryTargets(locale);
  const secondaryTargets = getSecondaryTargets(locale);

  const sheetContent = (
    <div className="space-y-4 p-1">
      <div className="flex items-center space-x-2">
        <Input
          ref={inputRef}
          value={payload?.url || ''}
          readOnly
          className="h-10 flex-1"
          aria-label="Shareable link"
          onFocus={handleInputFocus}
        />
        <Button
          type="button"
          size="sm"
          className="px-3 h-10"
          onClick={handleCopyLink}
        >
          <span className="sr-only">Copy</span>
          {hasCopied ? (
            <Check className="h-5 w-5" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {showQr && payload && <QrCard url={payload.url} />}
      {showEmbed && payload && <EmbedCard url={payload.url} />}

      <div className="grid grid-cols-4 gap-y-4 pt-2">
        {primaryTargets.map((target) => (
            <button
                key={target.id}
                onClick={() => handleShareClick(target)}
                className="flex flex-col items-center gap-2 rounded-lg p-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-muted">
                    {target.icon && <target.icon className="h-6 w-6" />}
                </div>
                <span className="text-center truncate w-full">{target.name}</span>
            </button>
        ))}
      </div>
      
      {secondaryTargets.length > 0 && (
         <Collapsible>
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-center gap-2 text-muted-foreground">
                    <span>More options</span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="grid grid-cols-4 gap-y-4 pt-4">
                     {secondaryTargets.map((target) => (
                        <button
                            key={target.id}
                            onClick={() => handleShareClick(target)}
                            className="flex flex-col items-center gap-2 rounded-lg p-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-muted">
                                {target.icon && <target.icon className="h-6 w-6" />}
                            </div>
                            <span className="text-center truncate w-full">{target.name}</span>
                        </button>
                    ))}
                </div>
            </CollapsibleContent>
         </Collapsible>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Share this topic</DrawerTitle>
            <DrawerDescription>
              Anyone with the link can view this poll.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{sheetContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this topic</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this poll.
          </DialogDescription>
        </DialogHeader>
        {sheetContent}
      </DialogContent>
    </Dialog>
  );
}
