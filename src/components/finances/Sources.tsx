

'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { DataSource } from '@/lib/types';
import { Link } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface SourcesProps {
  sources: DataSource[];
}

export function Sources({ sources }: SourcesProps) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);
  }, []);

  const title = lang === 'nb' ? 'Datakilder og metodikk' : 'Data Sources & Methodology';
  const checkedText = lang === 'nb' ? 'Sjekket' : 'Checked';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sources.map(source => (
            <li key={source.id} className="text-sm">
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <Link className="h-4 w-4" />
                <span>{source.title} ({source.publisher}) - {checkedText} {new Date(source.lastCheckedAt).toLocaleDateString()}</span>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
