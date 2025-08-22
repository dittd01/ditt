
'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleBankIdCallback } from '../actions';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fnr, setFnr] = useState(''); // Fødselsnummer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
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
        // In the full implementation, this would be a short-lived JWT
        // that is exchanged for a full session after biometric registration.
        localStorage.setItem('anonymousVoterId', result.personHash);
        localStorage.removeItem('lastSeenTimestamp'); 
        window.dispatchEvent(new Event('authChange'));

        // TODO: In the next step, redirect to biometric setup if isNewUser is true.
        router.push('/');
        router.refresh();

    } else {
        setError(result.message || 'An unknown error occurred.');
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Verify Your Identity</CardTitle>
            <CardDescription>
              Use the sandbox BankID to log in. This ensures one person, one vote.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
               <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Verification Failed</AlertTitle>
                 <AlertDescription>{error}</AlertDescription>
               </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="fnr">Fødselsnummer (11 digits)</Label>
              <Input 
                id="fnr" 
                type="text" 
                placeholder="11111111111" 
                required 
                value={fnr} 
                onChange={(e) => setFnr(e.target.value)} 
                pattern="\d{11}"
                title="Please enter 11 digits."
              />
               <p className="text-xs text-muted-foreground">Use any 11 digits for this sandbox.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || fnr.length !== 11}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Verifying...' : 'Verify with BankID'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
