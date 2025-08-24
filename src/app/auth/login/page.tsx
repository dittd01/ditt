
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

    // --- MOCK LOGIN FOR OFFLINE DEVELOPMENT ---
    // Why: This section bypasses the real server-side authentication flow
    // to allow for seamless development without an internet connection.
    // It simulates a successful login by directly setting the user's
    // anonymous ID and redirecting them.
    //
    // TO RESTORE ONLINE FUNCTIONALITY:
    // 1. Remove the code block below.
    // 2. Uncomment the original `handleBankIdCallback` call.

    console.log("Simulating OFFLINE BankID Login...");
    localStorage.setItem('anonymousVoterId', currentUser.uid);
    localStorage.removeItem('lastSeenTimestamp'); 
    window.dispatchEvent(new Event('authChange'));
    toast({
        title: "Offline Login Successful",
        description: "Logged in as the default mock user.",
    });
    router.push('/');
    router.refresh();
    return; // End of mock block

    /*
    // --- ORIGINAL ONLINE AUTHENTICATION LOGIC ---
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
        
        if (result.isNewUser) {
            router.push('/auth/setup-passkey');
        } else {
            localStorage.removeItem('lastSeenTimestamp'); 
            window.dispatchEvent(new Event('authChange'));
            router.push('/');
            router.refresh();
        }

    } else {
        setError(result.message || 'An unknown error occurred.');
        setLoading(false);
    }
    */
  };
  
  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);
    
    // --- MOCK LOGIN FOR OFFLINE DEVELOPMENT ---
    // Why: This section bypasses the real server-side passkey flow
    // to allow for seamless development without an internet connection.
    //
    // TO RESTORE ONLINE FUNCTIONALITY:
    // 1. Remove the code block below.
    // 2. Uncomment the original `startLogin` call.
    
    console.log("Simulating OFFLINE Passkey Login...");
    localStorage.setItem('anonymousVoterId', currentUser.uid);
    localStorage.removeItem('lastSeenTimestamp'); 
    window.dispatchEvent(new Event('authChange'));
    toast({
        title: "Offline Login Successful",
        description: "Logged in as the default mock user.",
    });
    router.push('/');
    router.refresh();
    return; // End of mock block
    
    /*
    // --- ORIGINAL ONLINE AUTHENTICATION LOGIC ---
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
            setError(result.message || 'Passkey login failed.');
            setLoading(false);
        }
    } catch(e: any) {
        setError(e.message || 'An unexpected error occurred during passkey login.');
        setLoading(false);
    }
    */
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
            
            <Button onClick={handlePasskeyLogin} variant="outline" className="w-full h-12 text-base" disabled={loading}>
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
                <p className="text-xs text-muted-foreground">Use any 11 digits for this sandbox.</p>
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
