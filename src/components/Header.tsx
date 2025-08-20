
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Vote, LogOut, Shield } from 'lucide-react';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function Header() {
  const [voterId, setVoterId] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('anonymousVoterId');
    localStorage.removeItem('lastSeenTimestamp');
    // Also remove any vote records for this user
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('voted_on_')) {
            localStorage.removeItem(key);
        }
    });
    setVoterId(null);
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    const lastSeenTimestamp = localStorage.getItem('lastSeenTimestamp');
    if (lastSeenTimestamp) {
      const timeSinceLastSeen = Date.now() - parseInt(lastSeenTimestamp, 10);
      if (timeSinceLastSeen > SESSION_TIMEOUT) {
        handleLogout();
        return;
      }
    }
    // If the user is active, clear the last seen timestamp
    localStorage.removeItem('lastSeenTimestamp');

    const handleStorageChange = () => {
      setVoterId(localStorage.getItem('anonymousVoterId'));
    };
    
    // Check on initial load
    handleStorageChange();

    // Listen for changes to localStorage from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Listen for a custom event that we can dispatch after login/logout
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Vote className="h-6 w-6 text-primary" />
            <span className="font-bold">Ditt Demokrati</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button variant="ghost" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          </Button>

          <div className="w-px h-6 bg-border mx-2"></div>

          {voterId ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                ID: {voterId.substring(0, 15)}...
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">BankID Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
