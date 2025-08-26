
'use client';

import * as React from 'react';
import { Check, Copy, Share2, Twitter, Linkedin, Mail } from 'lucide-react';
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

/**
 * @fileoverview A reusable share button component with mobile-first design.
 *
 * @description
 * This component provides a share functionality that prioritizes the native Web Share API
 * for an optimal mobile experience. If the Web Share API is not available (e.g., on desktop),
 * it gracefully degrades to a popover containing "Copy Link" and social sharing options.
 *
 * This approach ensures the best possible user experience across all devices, following
 * modern web development best practices.
 */
export function ShareButton({ shareUrl, shareTitle, shareText }: ShareButtonProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  /**
   * @function handleShare
   * @description
   * The core logic for the share action. It first checks for the presence of the
   * `navigator.share` API.
   *
   * Rationale: Prioritizing the native API is crucial for mobile usability. It opens
   * the operating system's share sheet, which users are familiar and comfortable with,
   * and which provides access to all their installed apps (e.g., WhatsApp, Signal).
   */
  const handleShare = async () => {
    // Why: Check if the Web Share API is supported by the browser.
    if (typeof navigator.share === 'function') {
      try {
        // Why: The API is promise-based. We attempt to share the provided content.
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        // Note: We don't show a toast here because the native UI provides its own feedback.
      } catch (error) {
        // Why: The user might cancel the share sheet, or an error could occur.
        // We log this for debugging but avoid showing a disruptive error to the user,
        // as cancelling is a common and valid action.
        console.error('Error using Web Share API:', error);
      }
    } else {
      // Why: This is the fallback for desktop browsers. We manually open the popover.
      setIsPopoverOpen(true);
    }
  };

  /**
   * @function handleCopyLink
   * @description
   * Copies the shareable URL to the user's clipboard.
   *
   * Rationale: This is a fundamental feature for any sharing component on desktop.
   * It uses the `navigator.clipboard` API, which is the modern and secure way to
   * interact with the system clipboard.
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'The link has been copied to your clipboard.',
      });
      // Why: Reset the "copied" state after a short delay to allow the user to copy again.
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

  // Pre-constructed social media share URLs.
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareText)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;

  // Why: The component's root is a PopoverTrigger, which is a Button. This is the visible element.
  // The Popover component itself handles the logic of showing/hiding the content.
  // We use `open` and `onOpenChange` to control it in the fallback case.
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
          <div className="flex justify-around items-center pt-2">
             <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-accent">
                <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                <span className="sr-only">Share on Twitter</span>
            </a>
             <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-accent">
                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
                <span className="sr-only">Share on Facebook</span>
            </a>
             <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-accent">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                <span className="sr-only">Share on LinkedIn</span>
            </a>
             <a href={mailUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-accent">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Share via Email</span>
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
