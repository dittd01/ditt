
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MainNav } from '@/components/layout/main-nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import { UserNav } from './user-nav';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    window.addEventListener('scroll', handleScroll);
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
            <LanguageToggle />
            <ThemeToggle />
            <UserNav />
        </div>
      </div>
    </header>
  );
}
