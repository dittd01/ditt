
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Fingerprint, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { startRegistration } from '@/lib/passkey';
import Link from 'next/link';

export default function SetupPasskeyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [personHash, setPersonHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnTo = searchParams.get('returnTo') || '/';
  
  useEffect(() => {
    const hash = localStorage.getItem('anonymousVoterId');
    if (!hash) {
      // If there's no hash, we can't set up a passkey. Redirect to login.
      toast({
        title: "Setup Error",
        description: "Could not find your verified ID. Please start the login process again.",
        variant: "destructive",
      });
      router.push('/auth/login');
    } else {
      setPersonHash(hash);
    }
  }, [router, toast]);

  const handleSetupPasskey = async () => {
    if (!personHash) return;

    setLoading(true);
    setError(null);
    try {
      const result = await startRegistration(personHash);
      if (result.success) {
        toast({
          title: "Passkey Created!",
          description: "You can now use Face ID or your fingerprint to log in.",
        });
        localStorage.removeItem('lastSeenTimestamp'); 
        window.dispatchEvent(new Event('authChange'));
        router.push(returnTo);
      } else {
        setError(result.message || 'An unknown error occurred.');
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('lastSeenTimestamp'); 
    window.dispatchEvent(new Event('authChange'));
    router.push(returnTo);
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background">
              <div className="rounded-full bg-primary/10 p-3">
                  <Fingerprint className="h-10 w-10 text-primary" />
              </div>
          </div>
          <CardTitle className="text-2xl font-headline">Enable Faster Login</CardTitle>
          <CardDescription>
            Set up a passkey to sign in securely with your fingerprint or face recognition instead of BankID every time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <div className='flex items-start gap-2'>
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold">Setup Failed</p>
                        <p className="break-words">{error}</p>
                        <p className="mt-2">You can <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleSetupPasskey}>try again</Button>, or skip for now and set it up later from your <Link href="/settings/devices" className='underline'>settings</Link>.</p>
                    </div>
                </div>
            </div>
          )}
          <div className="rounded-md border p-4 space-y-3 text-sm">
             <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0"/>
                <div>
                    <p className="font-semibold">More Secure</p>
                    <p className="text-muted-foreground">Your key is stored securely on your device, not on our servers.</p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0"/>
                <div>
                    <p className="font-semibold">Faster Logins</p>
                    <p className="text-muted-foreground">No more typing codes from your BankID app.</p>
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleSetupPasskey} className="w-full" disabled={loading || !personHash}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable Passkey
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="w-full text-muted-foreground" disabled={loading}>
            Skip for now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
