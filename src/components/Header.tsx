
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Vote, LogOut, Shield, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function Header() {
  const [voterId, setVoterId] = useState<string | null>(null);
  const router = useRouter();

  // In a real app, this would come from an auth context/hook
  const user = {
    username: 'testuser',
    photoUrl: 'https://placehold.co/256x256.png',
    initials: 'TU',
  };

  useEffect(() => {
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

    const checkSession = () => {
        const lastSeenTimestamp = localStorage.getItem('lastSeenTimestamp');
        if (lastSeenTimestamp) {
            const timeSinceLastSeen = Date.now() - parseInt(lastSeenTimestamp, 10);
            if (timeSinceLastSeen > SESSION_TIMEOUT) {
                handleLogout();
                return;
            }
        }
    }
    checkSession();
    
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
  }, [router]);

  const handleLogoutClick = () => {
      localStorage.removeItem('anonymousVoterId');
      localStorage.removeItem('lastSeenTimestamp');
      setVoterId(null);
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
      router.refresh();
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex-1 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Vote className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">Ditt Demokrati</span>
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
           <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/about">About</Link>
          </Button>
           <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/privacy">Privacy</Link>
          </Button>

          <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>

          {voterId ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoUrl} alt={`@${user.username}`} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">@{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Voter ID: {voterId.substring(0,15)}...
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href={`/u/${user.username}`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link href="/settings/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogoutClick}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">BankID Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
