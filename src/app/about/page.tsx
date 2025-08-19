
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
              <CardTitle className="text-3xl font-headline">About Ditt Demokrati</CardTitle>
              <CardDescription>Anonymous Voting & Public Sentiment Platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Welcome to <strong>Ditt Demokrati</strong> (“Your Democracy”), a conceptual platform created to rethink how democracy works. Our mission is to expose the limits of the party system and explore how direct, anonymous participation can better capture the real voice of the people.
          </p>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">The Flaws of Party Democracy</h3>
            <p>
              Modern representative democracy forces citizens into false choices. At the ballot box, you don’t get to vote on the issues you care about — you vote for a package deal. That package, wrapped up in a party program, often contains positions you strongly oppose.
            </p>
            <p>This creates three deep flaws in the system:</p>
            <div className="space-y-3 pl-4">
              <div>
                <h4 className="font-semibold text-foreground">One-Size-Fits-All Politics</h4>
                <p>No party fully reflects the diversity of individual opinions. Supporting a party’s tax policy might mean also endorsing their immigration stance — even if you strongly disagree with it.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Compromised Representation</h4>
                <p>Election results suggest broad support for entire party platforms, but in reality voters are picking the “least bad option.” This distorts what citizens actually want.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Coalition Bargaining</h4>
                <p>After elections, parties negotiate and dilute their promises. The result is often a government program that nobody truly voted for, but everyone is expected to accept.</p>
              </div>
            </div>
            <p>
              The outcome? Millions of voters feel unheard, misrepresented, and locked into compromises that don’t reflect their real preferences.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Why Direct Democracy Is Different</h3>
            <p>
              Direct democracy cuts through the party filter. Instead of voting for bundles of policies, citizens vote directly on each issue. This approach:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Restores Accuracy</strong> — showing where the public really stands on individual topics.</li>
              <li><strong>Ends False Mandates</strong> — preventing parties from claiming support for policies voters never wanted.</li>
              <li><strong>Empowers Citizens</strong> — letting people express their views without compromise or political trade-offs.</li>
              <li><strong>Strengthens Democracy</strong> — by making decision-making more transparent and accountable.</li>
            </ul>
            <p>
              Switzerland’s experience with referendums proves this isn’t utopian theory — it works. And with digital platforms, it can work faster, more transparently, and on a larger scale than ever before.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">How It Works</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Anonymous Participation:</strong> A temporary identifier ensures each user can vote once per poll. For national election simulations, a more secure login process is demonstrated.</li>
              <li><strong>Live Results:</strong> Votes are updated instantly, providing an unfiltered snapshot of public opinion.</li>
              <li><strong>Data Integrity:</strong> While polls are non-binding, they run on a simulated database and server-side logic to ensure fairness within this demonstration.</li>
              <li><strong>AI Moderation:</strong> Suggestions for new poll topics are screened by AI to maintain a constructive environment.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
