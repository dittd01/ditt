
'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const architectureDiagram = `
graph TD
    subgraph "User Devices"
        A[Browser] -->|HTTPS| B(Next.js Server);
    end

    subgraph "Google Cloud"
        B -->|Server-Side Logic| C{Feature Flags};
        B -->|Admin SDK| D[Firestore];
        B -->|Genkit SDK| E[Vertex AI];
        
        subgraph "Auth Flow"
            A --> F[BankID/Passkey];
            F --> B;
        end
        
        C --> D;
    end
    
    subgraph "Third-Party APIs"
      F
    end

    style B fill:#89a5ff,stroke:#333,stroke-width:2px
    style D fill:#f5c531,stroke:#333,stroke-width:2px
    style E fill:#34a853,stroke:#333,stroke-width:2px
    style C fill:#e8710a,stroke:#333,stroke-width:2px
`;

const components = [
    { title: 'Next.js Frontend', description: 'The client-side application built with Next.js and React.', link: '/docs/frontend' },
    { title: 'Feature Flags', description: 'Real-time configuration managed via Firestore.', link: '/ops/flags' },
    { title: 'Genkit AI Flows', description: 'Server-side AI logic for moderation and generation.', link: '/docs/ai' },
    { title: 'Firestore Database', description: 'NoSQL database for application data and auth records.', link: '/docs/database' },
    { title: 'WebAuthn/Passkeys', description: 'Secure, passwordless authentication flow.', link: '/docs/auth' },
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
  return <div ref={ref} key={chart} className="mermaid" />;
};


export default function ArchitecturePage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="System Architecture"
                subtitle="A high-level overview of the application's components and data flows."
            />
            
            <Card>
                <CardHeader>
                    <CardTitle>Component Diagram</CardTitle>
                    <CardDescription>
                        i can not see the diagram
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <MermaidChart chart={architectureDiagram} />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {components.map((component) => (
                    <Card key={component.title} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{component.title}</CardTitle>
                            <CardDescription>{component.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow" />
                        <CardContent>
                            <Link href={component.link} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                Learn more <ArrowRight className="h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
