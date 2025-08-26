
'use client';

import * as React from 'react';
import { Check, Copy, Share2, Mail, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';

interface ShareButtonProps {
  shareUrl: string;
  shareTitle: string;
  shareText: string;
}

// --- SVG Icons for Social Brands ---
// Why: Using inline SVGs is the most efficient way to add a few custom brand icons
// without adding a heavy new dependency like a full icon library.
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="#1877F2" viewBox="0 0 24 24" {...props}><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 1200 1227" {...props}><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1070.38 1150.3H907.776L569.165 687.828Z"></path></svg>
);
const RedditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="#FF4500" viewBox="0 0 24 24" {...props}><path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,1.53,5.29,1,1,0,0,0,.8.42,1,1,0,0,0,.81-.42,7.74,7.74,0,0,1,12.92,0,1,1,0,0,0,1.61,0,10,10,0,0,0,2-5.71A10,10,0,0,0,12,2Zm1.62,11.59a1.1,1.1,0,1,1-2.2,0,1.1,1.1,0,0,1,2.2,0Zm-5.34,0a1.1,1.1,0,1,1-2.2,0,1.1,1.1,0,0,1,2.2,0Zm.22-3.41a2,2,0,0,1,3,0,1,1,0,1,1-1.39,1.44,1.8,1.8,0,0,0-2.36,0,1,1,0,0,1-1.42,0,1,1,0,0,1,0-1.42,2,2,0,0,1,2.17-.05Z"></path></svg>
);
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="#25D366" viewBox="0 0 24 24" {...props}><path d="M19.05 4.94A9.96 9.96 0 0 0 12 2C6.48 2 2 6.48 2 12c0 1.74.45 3.38 1.26 4.84L2 22l5.16-1.36A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10a9.96 9.96 0 0 0-2.95-7.06zM12 20.25c-1.61 0-3.14-.38-4.5-.98l-.32-.19-3.34.88.89-3.25-.21-.33A8.24 8.24 0 0 1 3.75 12C3.75 7.44 7.44 3.75 12 3.75s8.25 3.69 8.25 8.25-3.7 8.25-8.25 8.25zM16.47 14.4c-.13-.07-1.4-1.12-1.61-1.25-.22-.12-.38-.19-.54.19-.16.38-.61 1.25-.75 1.5-.14.25-.27.28-.5.12-.22-.16-1.4-1.05-2.28-1.65-.68-.48-1.14-.98-1.28-1.15-.14-.16 0-.25.13-.38.11-.11.25-.28.38-.42.12-.14.16-.25.25-.42.09-.16.04-.31-.02-.42-.07-.12-.54-1.3-.74-1.78-.19-.48-.39-.41-.54-.41h-.47c-.16 0-.42.07-.64.31-.22.25-.85.83-.85 2.03 0 1.2.88 2.35 1 2.51.13.16 1.7 2.59 4.12 3.63 2.42 1.03 2.42.69 2.85.62.43-.06 1.4-.95 1.6-1.84.21-.89.21-1.65.15-1.84-.06-.18-.21-.28-.34-.35z"></path></svg>
);


/**
 * @fileoverview A reusable share button component with mobile-first design.
 *
 * @description
 * This component provides a share functionality that prioritizes the native Web Share API
 * for an optimal mobile experience. If the Web Share API is not available (e.g., on desktop),
 * it gracefully degrades to a popover containing "Copy Link" and social sharing options.
 */
export function ShareButton({ shareUrl, shareTitle, shareText }: ShareButtonProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const handleShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error using Web Share API:', error);
      }
    } else {
      setIsPopoverOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'The link has been copied to your clipboard.',
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy the link. Please try again.',
      });
    }
  };
  
  // Why: Abstracting platforms into a data structure makes the component cleaner
  // and easier to maintain. Adding a new platform is as simple as adding an object
  // to this array.
  const socialPlatforms = [
    { name: 'Facebook', Icon: FacebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'Twitter', Icon: XIcon, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}` },
    { name: 'Email', Icon: Mail, url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}` },
    { name: 'WhatsApp', Icon: WhatsAppIcon, url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}` },
    { name: 'LinkedIn', Icon: Linkedin, url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareText)}` },
    { name: 'Reddit', Icon: RedditIcon, url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}` },
  ];

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={handleShare}
          aria-label="Share topic"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">Share this topic</p>
            <p className="text-xs text-muted-foreground">
              Anyone with the link can view this poll.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="h-9 flex-1"
              aria-label="Shareable link"
            />
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={handleCopyLink}
            >
              <span className="sr-only">Copy</span>
              {hasCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-y-4 pt-2">
            {socialPlatforms.map(({ name, Icon, url }) => (
                <a 
                    key={name}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center gap-1.5 rounded-md p-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-6 w-6" />
                    </div>
                    <span>{name}</span>
                </a>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
