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
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to BankID
    setTimeout(() => {
      // On success, generate anonymous ID
      if (typeof window !== 'undefined') {
        const anonymousId = `voter_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('anonymousVoterId', anonymousId);
      }
      router.push('/');
      router.refresh();
    }, 1500);
  };

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">BankID Authentication</CardTitle>
            <CardDescription>Log in securely with BankID to cast your anonymous vote.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fødselsnummer">Fødselsnummer (11 digits)</Label>
              <Input id="fødselsnummer" type="tel" placeholder="12345678901" required pattern="\d{11}" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">BankID Password</Label>
              <Input id="password" type="password" required placeholder="••••••••" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Authenticating...' : 'Log In with BankID'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
