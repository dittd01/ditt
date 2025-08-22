
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, AlertCircle, Fingerprint, CheckCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleBankIdCallback } from '@/app/auth/actions';
import { useToast } from '@/hooks/use-toast';
import { startRegistration } from '@/lib/passkey';

export default function VerifyLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [step, setStep] = useState<'verify_challenge' | 'reauth' | 'setup_passkey' | 'done' | 'error'>();
  const [fnr, setFnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personHash, setPersonHash] = useState<string | null>(null);

  useEffect(() => {
    const challenge = searchParams.get('challenge');
    const storedChallenge = localStorage.getItem('qr_link_challenge');

    if (challenge && challenge === storedChallenge) {
      setStep('reauth');
      localStorage.removeItem('qr_link_challenge'); // Challenge is single-use
    } else {
      setError('The link is invalid or has expired.');
      setStep('error');
    }
  }, [searchParams]);

  const handleBankIdReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await handleBankIdCallback({ fnr });

    if (result.success && result.personHash) {
      toast({
        title: "Re-authentication Successful",
        description: "Your identity has been confirmed. Please set up a passkey for this new device.",
      });
      setPersonHash(result.personHash);
      setStep('setup_passkey');
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    setLoading(false);
  };
  
   const handleSetupPasskey = async () => {
    if (!personHash) return;

    setLoading(true);
    setError(null);
    try {
      const result = await startRegistration(personHash);
      if (result.success) {
        toast({
          title: "New Device Linked!",
          description: "You can now use this device to log in with your passkey.",
        });
        setStep('done');
      } else {
        setError(result.message || 'An unknown error occurred.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'reauth':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle>Re-verify to Link Device</CardTitle>
              <CardDescription>To protect your account, please re-verify your identity with BankID.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBankIdReauth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fnr">Fødselsnummer (11 digits)</Label>
                  <Input id="fnr" type="text" placeholder="11111111111" required value={fnr} onChange={(e) => setFnr(e.target.value)} pattern="\\d{11}" title="Please enter 11 digits." />
                </div>
                <Button type="submit" className="w-full" disabled={loading || fnr.length !== 11}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify with BankID'}
                </Button>
              </form>
            </CardContent>
          </>
        );
      case 'setup_passkey':
        return (
          <>
            <CardHeader className="text-center">
                <Fingerprint className="mx-auto h-12 w-12 text-primary"/>
                <CardTitle>Set Up Passkey</CardTitle>
                <CardDescription>Almost done! Create a passkey for this device for fast and secure logins.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleSetupPasskey} className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 animate-spin"/> : 'Enable Passkey'}
                </Button>
            </CardContent>
          </>
        );
       case 'done':
        return (
          <>
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500"/>
                <CardTitle>Device Linked Successfully!</CardTitle>
                <CardDescription>You can now close this window and log in on this device using your passkey.</CardDescription>
            </CardHeader>
          </>
        );
      case 'error':
        return (
            <CardHeader className="text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-destructive"/>
                <CardTitle>Link Invalid</CardTitle>
                <CardDescription>{error}</CardDescription>
            </CardHeader>
        )
      default:
        return (
            <CardContent className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {error && step !== 'error' && (
            <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {renderContent()}
      </Card>
    </div>
  );
}
