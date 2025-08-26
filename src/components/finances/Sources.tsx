
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { DataSource } from '@/lib/types';
import { Link } from 'lucide-react';

interface SourcesProps {
  sources: DataSource[];
}

export function Sources({ sources }: SourcesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sources & Methodology</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sources.map(source => (
            <li key={source.id} className="text-sm">
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <Link className="h-4 w-4" />
                <span>{source.title} ({source.publisher}) - Checked {new Date(source.lastCheckedAt).toLocaleDateString()}</span>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
