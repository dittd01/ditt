

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User, Settings, Info, Lock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { currentUser } from '@/lib/user-data';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function UserNav() {
  const [voterId, setVoterId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const user = currentUser;

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('anonymousVoterId');
      localStorage.removeItem('lastSeenTimestamp');
      setVoterId(null);
      window.dispatchEvent(new Event('authChange'));
      toast({ title: 'Session Expired', description: 'You have been logged out due to inactivity.' });
      router.push('/');
      router.refresh();
    };

    const checkSession = () => {
        const lastSeenTimestamp = localStorage.getItem('lastSeenTimestamp');
        if (lastSeenTimestamp) {
            const timeSinceLastSeen = Date.now() - parseInt(lastSeenTimestamp, 10);
            if (timeSinceLastSeen > SESSION_TIMEOUT) {
                handleLogout();
            }
        }
    }
    
    checkSession();
    const intervalId = setInterval(checkSession, 60 * 1000); // Check every minute
    
    const handleStorageChange = () => {
      setVoterId(localStorage.getItem('anonymousVoterId'));
    };
    
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, [router, toast]);

  const handleLogoutClick = () => {
      localStorage.removeItem('anonymousVoterId');
      localStorage.removeItem('lastSeenTimestamp');
      setVoterId(null);
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
      router.refresh();
  }

  if (voterId) {
    return (
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
                Anonymous Voter ID
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
             <DropdownMenuItem asChild>
                <Link href="/about">
                    <Info className="mr-2 h-4 w-4" />
                    <span>About</span>
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
                <Link href="/privacy">
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Privacy</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutClick}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    )
  }

  return (
    <Button asChild size="sm">
      <Link href="/login">Logg inn</Link>
    </Button>
  )
}
