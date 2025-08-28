
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Vote } from 'lucide-react';
import Link from 'next/link';
import { AIAvatar } from '@/components/AIAvatar';

export default function AboutPage() {
  const router = useRouter();

  const aboutText = `Welcome to Ditt Demokrati (“Your Democracy”), a conceptual platform created to rethink how democracy works. Our mission is to expose the limits of the party system and explore how direct, anonymous participation can better capture the real voice of the people.

The Flaws of Party Democracy. Modern representative democracy forces citizens into false choices. At the ballot box, you don’t get to vote on the issues you care about — you vote for a package deal. That package, wrapped up in a party program, often contains positions you strongly oppose. This creates three deep flaws in the system: One-Size-Fits-All Politics: No party fully reflects the diversity of individual opinions. Supporting a party’s tax policy might mean also endorsing their immigration stance — even if you strongly disagree with it. Compromised Representation: Election results suggest broad support for entire party platforms, but in reality voters are picking the “least bad option.” This distorts what citizens actually want. Coalition Bargaining: After elections, parties negotiate and dilute their promises. The result is often a government program that nobody truly voted for, but everyone is expected to accept. The outcome? Millions of voters feel unheard, misrepresented, and locked into compromises that don’t reflect their real preferences.

Why Direct Democracy Is Different. Direct democracy cuts through the party filter. Instead of voting for bundles of policies, citizens vote directly on each issue. This approach: Restores Accuracy — showing where the public really stands on individual topics. Ends False Mandates — preventing parties from claiming support for policies voters never wanted. Empowers Citizens — letting people express their views without compromise or political trade-offs. Strengthens Democracy — by making decision-making more transparent and accountable. Switzerland’s experience with referendums proves this isn’t utopian theory — it works. And with digital platforms, it can work faster, more transparently, and on a larger scale than ever before.

How It Works on Ditt Demokrati. We believe democracy should reflect both what people think and how strongly they think it. That’s why we use a hybrid voting system designed for nuance, legitimacy, and engagement: Likert Scale: Most questions are statements answered on a 5- or 7-point scale. Ranked-Choice: When there are multiple alternatives, you can rank them in order of preference. Yes/No: Used only for strictly constitutional or all-or-nothing issues. Quadratic Voting: Each citizen receives a recurring budget of “voice credits.” Casting extra votes on an issue costs quadratically. This balances majority rule with minority passion. Abstention: You can always choose to abstain.

Safeguards and Trust. BankID Verification: Every participant is verified through BankID, ensuring one person = one account, while keeping ballots fully anonymous. Security Against Manipulation: Bot detection, CAPTCHA, rate limiting, and anomaly detection protect against abuse. Transparency in Results: We display both raw totals and QV-weighted outcomes. Full Likert distributions make minority voices visible. AI Moderation: Suggested poll topics are screened by AI to prevent duplicates and ensure constructive debate.

Data & Retention Policy. Anonymous by Design: Your BankID is used only for a one-time verification to generate a persistent, anonymous Voter ID. This ID is not linked to your personal identity on our servers. Local Storage: Your anonymous Voter ID and your individual votes are stored only in your browser's local storage. Clearing your browser data will remove them. Aggregate Tallies: When you vote, the public tally for that poll is incremented. This is a one-way operation; your individual vote is not stored on our servers and cannot be traced back to you. Data Deletion: You can permanently delete your anonymous Voter ID and all associated vote records from your browser at any time by visiting our Privacy page. This action cannot be undone. Session Timeout: For your security, you are automatically logged out after 30 minutes of inactivity.

Our Vision. Ditt Demokrati is not just a prototype — it’s a proof of concept for a more legitimate, more engaging, and more democratic future. By combining secure digital identity, nuanced voting methods, and transparent technology, we can build a system where every citizen’s voice is heard in full, not lost in party compromises.
`;

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
          <div className="space-y-4">
             <AIAvatar textToSpeak={aboutText} />
             <p>Welcome to Ditt Demokrati (“Your Democracy”), a conceptual platform created to rethink how democracy works. Our mission is to expose the limits of the party system and explore how direct, anonymous participation can better capture the real voice of the people.</p>
          </div>

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
            <h3 className="text-xl font-semibold text-foreground">How It Works on Ditt Demokrati</h3>
            <p>We believe democracy should reflect <strong>both what people think and how strongly they think it</strong>. That’s why we use a <strong>hybrid voting system</strong> designed for nuance, legitimacy, and engagement:</p>
             <ul className="list-disc list-inside space-y-2">
                <li><strong>Likert Scale (Default):</strong> Most questions are statements answered on a 5- or 7-point scale (<em>Strongly Agree → Strongly Disagree</em>). This captures shades of opinion, not just black-and-white answers.</li>
                <li><strong>Ranked-Choice (For Multi-Option Decisions):</strong> When there are multiple alternatives, you can rank them in order of preference. This ensures the winning outcome has broad support and avoids “spoiler” effects.</li>
                <li><strong>Yes/No (For Binary Questions):</strong> Used only for strictly constitutional or all-or-nothing issues.</li>
                <li><strong>Quadratic Voting (QV):</strong> Each citizen receives a recurring budget of “voice credits.” Casting extra votes on an issue costs quadratically (1=1, 2=4, 3=9). This balances majority rule with minority passion, letting people express intensity without domination.</li>
                <li><strong>Abstention:</strong> You can always choose to abstain. Abstentions are recorded and displayed, showing the full picture of public engagement.</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Safeguards and Trust</h3>
             <ul className="list-disc list-inside space-y-2">
                <li><strong>BankID Verification:</strong> Every participant is verified through BankID, ensuring one person = one account, while keeping ballots fully anonymous.</li>
                <li><strong>Security Against Manipulation:</strong> Bot detection, CAPTCHA, rate limiting, and anomaly detection protect against abuse.</li>
                <li><strong>Transparency in Results:</strong> We display both raw totals (breadth of opinion) and QV-weighted outcomes (intensity of preferences). Full Likert distributions make minority voices visible.</li>
                <li><strong>AI Moderation:</strong> Suggested poll topics are screened by AI to prevent duplicates and ensure constructive debate.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Data &amp; Retention Policy</h3>
             <ul className="list-disc list-inside space-y-2">
                <li><strong>Anonymous by Design:</strong> Your BankID is used only for a one-time verification to generate a persistent, anonymous Voter ID. This ID is not linked to your personal identity on our servers.</li>
                <li><strong>Local Storage:</strong> Your anonymous Voter ID and your individual votes are stored only in your browser's local storage. Clearing your browser data will remove them.</li>
                <li><strong>Aggregate Tallies:</strong> When you vote, the public tally for that poll is incremented. This is a one-way operation; your individual vote is not stored on our servers and cannot be traced back to you.</li>
                <li><strong>Data Deletion:</strong> You can permanently delete your anonymous Voter ID and all associated vote records from your browser at any time by visiting our <Link href="/privacy" className="underline">Privacy</Link> page. This action cannot be undone.</li>
                <li><strong>Session Timeout:</strong> For your security, you are automatically logged out after 30 minutes of inactivity.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Our Vision</h3>
            <p>Ditt Demokrati is not just a prototype — it’s a proof of concept for a <strong>more legitimate, more engaging, and more democratic future</strong>. By combining secure digital identity, nuanced voting methods, and transparent technology, we can build a system where every citizen’s voice is heard in full, not lost in party compromises.</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
