
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Vote } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Vote className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-headline">About Valg匿名</CardTitle>
              <CardDescription>Anonymous Voting & Public Sentiment Platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Welcome to <strong>Valg匿名</strong> (Anonymous Vote), a conceptual platform designed to explore public opinion on a wide range of topics relevant to Norwegian society. Our goal is to provide a space for anonymous participation in non-binding polls, offering a snapshot of public sentiment on key issues.
          </p>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">How It Works</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Anonymous Participation:</strong> We use a simple, temporary, and anonymous identifier stored on your device to ensure that each user can cast one vote per poll. For the national election poll, we simulate a more secure login.</li>
              <li><strong>Live Results:</strong> Vote counts and percentages are updated in real-time, providing immediate feedback on public opinion.</li>
              <li><strong>Data-Driven:</strong> While the polls are non-binding, they are backed by a simulated database and server-side logic to ensure the integrity of the results within the context of this demonstration app.</li>
              <li><strong>AI Moderation:</strong> User-submitted suggestions for new poll options are reviewed by an AI to maintain a constructive environment.</li>
            </ul>
          </div>
          <p>
            This application is built as a demonstration of modern web technologies, including Next.js, React, Tailwind CSS, and Google's Generative AI (Genkit). It is a proof-of-concept and not intended for real-world political voting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
