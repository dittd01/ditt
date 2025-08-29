
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNav } from '@/components/layout/main-nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import { UserNav } from './user-nav';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { ShareButton } from '../share/ShareButton';
import { CheckSquare } from 'lucide-react';

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
        <div className="flex flex-1 items-center justify-between md:justify-end">
          <Link href="/" className="flex items-center space-x-2 md:hidden">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="font-bold">Ditt Demokrati</span>
          </Link>
          <div className="flex items-center space-x-2">
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
      </div>
    </header>
  );
}
