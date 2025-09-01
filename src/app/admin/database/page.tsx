
'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, ShieldCheck, Fingerprint, Link2, Users, FileText, Vote, Lightbulb } from 'lucide-react';

const dataModelDiagram = `
graph TD
    subgraph "User Identity (Anonymous)"
        A[BankID/Fnr] -->|Peppered Hash| B(person_hash);
        B -.-> C{eligibility/person_hash_123};
        C --> D1[Device A];
        C --> D2[Device B];
    end

    subgraph "Voting Data (Public & Aggregated)"
        T1[topics/topic_abc]
        V1[votes/topic_abc_person_hash_123] -->|Increment| T1;
    end
    
    subgraph "Device Management"
        D1 -- Stores --> P1(Passkey 1);
        D2 -- Stores --> P2(Passkey 2);
    end

    B -.-> V1;
    
    style A fill:#f87171,stroke:#b91c1c,stroke-width:2px;
    style B fill:#60a5fa,stroke:#2563eb,stroke-width:2px;
    style C fill:#fde047,stroke:#ca8a04,stroke-width:2px;
    style T1 fill:#4ade80,stroke:#16a34a,stroke-width:2px;
    style V1 fill:#a78bfa,stroke:#7c3aed,stroke-width:2px;
`;

const dataPoints = [
    {
        icon: Fingerprint,
        title: "eligibility/{person_hash}",
        description: "Stores the anonymous, unique ID for a person. It confirms they are old enough to vote but contains no personal information like name or Fnr. It also lists all devices linked to this person.",
        explanation: "Think of this as a library card. It proves you're a member and can check out books (vote), but the card itself doesn't say who you are. The 'person_hash' is a special, one-way encrypted code generated from a user's Fnr; you can't reverse it to find the original Fnr."
    },
    {
        icon: Users,
        title: "devices/{deviceId}",
        description: "Contains technical information about a user's registered device (like a phone or laptop) needed for passkey logins. It's linked back to a person_hash.",
        explanation: "This is like the key to your house. It's unique to you and lets you in, but it doesn't have your name written on it. This is how we allow passwordless logins without storing passwords."
    },
    {
        icon: FileText,
        title: "topics/{topicId}",
        description: "Holds all public information about a voting topic, like the question, description, and the total vote counts for each option (e.g., Yes: 500, No: 300).",
        explanation: "This is the public bulletin board where the poll question and the live results are displayed for everyone to see. It has no information about *who* voted, only *how many*."
    },
    {
        icon: Vote,
        title: "votes/{composite_id}",
        description: "A record that a specific person has voted on a specific topic. This is used to prevent a user from voting more than once on the same poll.",
        explanation: "When you vote, we create a simple ticket that says 'person_hash_123 voted on topic_abc'. This lets us check if you've already voted. This record is private and not directly linked to the public vote counts, which are updated separately and anonymously."
    },
    {
        icon: Link2,
        title: "links/{link_id}",
        description: "A temporary record created when a user wants to link a new device via a QR code. It expires after a few minutes.",
        explanation: "This is a single-use, short-lived ticket for securely connecting a new device to your anonymous identity, making sure it's really you."
    }
];

const MermaidChart = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      try {
        mermaid.parse(chart);
        ref.current.innerHTML = chart;
        mermaid.run({
          nodes: [ref.current],
        });
      } catch (e) {
        console.error('Mermaid parsing error:', e);
        ref.current.innerHTML = 'Error rendering diagram.';
      }
    }
  }, [chart]);
  return <div ref={ref} key={chart} className="mermaid flex justify-center" />;
};


export default function DatabasePage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Database Architecture"
                subtitle="How we store data securely with a focus on user privacy."
            />
            
             <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Privacy by Design</AlertTitle>
                <AlertDescription>
                    Our database is structured to separate a user's real-world identity from their voting activity. We never store personally identifiable information (PII) like names or national ID numbers (Fnr).
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Data Model Diagram</CardTitle>
                    <CardDescription>
                        This diagram shows the main data collections and their relationships.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-4 md:p-8">
                    <MermaidChart chart={dataModelDiagram} />
                </CardContent>
            </Card>

            <div className="space-y-6">
                {dataPoints.map((component) => (
                    <Card key={component.title}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <component.icon className="h-5 w-5 text-primary" />
                                <span className="font-mono">{component.title}</span>
                            </CardTitle>
                            <CardDescription>{component.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 border-t">
                             <Alert variant="default" className="bg-muted/50">
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>In simple terms...</AlertTitle>
                                <AlertDescription>
                                    {component.explanation}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

