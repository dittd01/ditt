
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, AlertCircle, Fingerprint } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleBankIdCallback } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { startLogin } from '@/lib/passkey';
import { currentUser } from '@/lib/user-data';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fnr, setFnr] = useState(''); // Fødselsnummer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBankIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // This simulates the OIDC flow.
    // In a real app, clicking the button would redirect to BankID.
    // Here, we directly call the "callback" function with the FNR.
    const result = await handleBankIdCallback({ fnr });

    if (result.success && result.personHash) {
        toast({
            title: "Verification Successful",
            description: result.message,
        });

        // This is a simplified login mechanism for the prototype.
        // We store the secure person_hash as the anonymous ID.
        // In a real implementation, this would be a short-lived JWT.
        localStorage.setItem('anonymousVoterId', result.personHash);
        
        // **FIX**: Special handling for the developer test user to bypass passkey flow.
        if (result.personHash === currentUser.uid) {
            localStorage.removeItem('lastSeenTimestamp'); 
            window.dispatchEvent(new Event('authChange'));
            router.push('/');
            router.refresh();
            return;
        }

        if (result.isNewUser) {
            router.push('/auth/setup-passkey');
        } else {
            // Existing user, attempt passkey login automatically
            handlePasskeyLogin(true);
        }

    } else {
        setError(result.message || 'An unknown error occurred.');
        setLoading(false);
    }
  };
  
  const handlePasskeyLogin = async (isFollowUp = false) => {
    // Development backdoor for instant test user login
    if (process.env.NODE_ENV !== 'production') {
      toast({
        title: 'Dev Login Successful',
        description: 'Logged in as testuser.',
      });
      localStorage.setItem('anonymousVoterId', currentUser.uid);
      localStorage.removeItem('lastSeenTimestamp');
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
      router.refresh();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
        const result = await startLogin();
        if(result.success && result.personHash) {
            localStorage.setItem('anonymousVoterId', result.personHash);
            localStorage.removeItem('lastSeenTimestamp'); 
            window.dispatchEvent(new Event('authChange'));
            router.push('/');
            router.refresh();
             toast({
                title: "Login Successful",
                description: "Welcome back!",
            });
        } else {
            if (!isFollowUp) {
                setError(result.message || 'Passkey login failed.');
            }
            setLoading(false);
        }
    } catch(e: any) {
        if (!isFollowUp) {
            setError(e.message || 'An unexpected error occurred during passkey login.');
        }
        setLoading(false);
    }
  }


  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-md">
          <CardHeader className="text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background">
                <div className="rounded-full bg-primary/10 p-3">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
            </div>
            <CardTitle className="text-2xl font-headline">Verify Your Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {error && (
               <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Authentication Failed</AlertTitle>
                 <AlertDescription>{error}</AlertDescription>
               </Alert>
            )}
            
            <Button onClick={() => handlePasskeyLogin(false)} variant="outline" className="w-full h-12 text-base" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2" /> }
                Sign in with Passkey
            </Button>
            
            <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
            </div>

            <form onSubmit={handleBankIdLogin} className="space-y-4">
                 <CardDescription className="text-center !mt-0">
                    Use BankID for your first login or if you don't have a passkey on this device.
                </CardDescription>
                <div className="space-y-2">
                <Label htmlFor="fnr">Fødselsnummer (11 digits)</Label>
                <Input 
                    id="fnr" 
                    type="text" 
                    placeholder="11111111111" 
                    required 
                    value={fnr} 
                    onChange={(e) => setFnr(e.target.value)} 
                    pattern="\\d{11}"
                    title="Please enter 11 digits."
                />
                <p className="text-xs text-muted-foreground">For dev, use 00000000000 to log in as testuser.</p>
                </div>
                 <Button type="submit" className="w-full" disabled={loading || fnr.length !== 11}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Verifying...' : 'Verify with BankID'}
                </Button>
            </form>
          </CardContent>
      </Card>
    </div>
  );
}
