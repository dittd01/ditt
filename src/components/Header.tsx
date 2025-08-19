'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Vote } from 'lucide-react';

export function Header() {
  const [voterId, setVoterId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setVoterId(localStorage.getItem('anonymousVoterId'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('anonymousVoterId');
    setVoterId(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Vote className="h-6 w-6 text-primary" />
            <span className="font-bold">Valg匿名</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {voterId ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                ID: {voterId.substring(0, 15)}...
              </span>
              <Button variant="outline" onClick={handleLogout}>
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
