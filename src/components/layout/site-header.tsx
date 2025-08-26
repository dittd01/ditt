
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MainNav } from '@/components/layout/main-nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import { UserNav } from './user-nav';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { ShareButton } from '../share/ShareButton';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Why: `window.location.origin` is only available on the client.
    // This effect ensures we get the correct base URL for sharing
    // without causing server-client hydration mismatches.
    setSiteUrl(window.location.origin);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm transition-all',
        scrolled ? 'border-border/40 shadow-sm' : 'border-transparent'
      )}
    >
      <div className="container flex h-14 items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-end space-x-2">
            <ShareButton
              payload={{
                url: siteUrl,
                title: "Ditt Demokrati",
                text: "Explore direct democracy on a modern, anonymous voting platform.",
              }}
            />
            <LanguageToggle />
            <ThemeToggle />
            <UserNav />
        </div>
      </div>
    </header>
  );
}
