
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function PrivacyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [voterId, setVoterId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setVoterId(localStorage.getItem('anonymousVoterId'));
  }, []);

  const handleDeleteData = () => {
    if (typeof window === 'undefined') return;

    // This is a comprehensive deletion of all user-related data stored in localStorage.
    // It's designed to be thorough.
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('voted_on_') || key.startsWith('voiceCredits') || key.startsWith('anonymousVoterId') || key.startsWith('lastSeenTimestamp'))) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key));
    
    // Note: We do NOT decrement the `votes_for_*` keys.
    // This preserves the aggregate vote counts as per the spec.
    
    setVoterId(null);
    window.dispatchEvent(new Event('authChange'));
    
    toast({
        title: "Your Data Has Been Deleted",
        description: "All your local voting records and anonymous ID have been removed.",
    });

    router.push('/');
  };

  if (!isClient) {
      return (
        <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Privacy & Data Control</CardTitle>
          <CardDescription className="text-center pt-2">
            Manage your data stored in this browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {voterId ? (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Delete Your Anonymous Data</AlertTitle>
                    <AlertDescription>
                        <p>You have an anonymous Voter ID ({voterId.substring(0,15)}...) stored in this browser.</p>
                        <p className="mt-2">
                           Clicking the button below will permanently delete this ID and all associated vote history from your device. This action cannot be undone. Public vote tallies will not be affected.
                        </p>
                    </AlertDescription>
                </Alert>
            ) : (
                 <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>No Data Found</AlertTitle>
                    <AlertDescription>
                        There is no anonymous Voter ID stored in this browser. You can vote on polls after logging in.
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
        <CardFooter>
            {voterId ? (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete My Data and Log Out
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your anonymous ID and all voting history from this device. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteData}>
                            Yes, delete my data
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : (
                <Button onClick={() => router.push('/login')} className="w-full">
                    Log In to Vote
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
