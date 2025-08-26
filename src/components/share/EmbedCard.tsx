
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmbedCardProps {
  url: string;
}

/**
 * @fileoverview A component for generating and copying an HTML embed snippet.
 *
 * @description
 * This component provides a simple UI for users to embed content on their own websites.
 * It generates a standard `<iframe>` snippet and includes a one-click "Copy" button
 * for convenience.
 */
export function EmbedCard({ url }: EmbedCardProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);
  
  // Why: Appending `?embed=true` is a standard pattern to signal to the target page
  // that it should render in a minimal, embed-friendly layout (e.g., without global navigation).
  const embedUrl = `${url}?embed=true`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" style="border:1px solid #ccc; border-radius: 8px;" allowfullscreen></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setHasCopied(true);
      toast({ title: 'Embed code copied!' });
      // Why: Reset the copied state after a short delay so the user can copy again if needed.
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Could not copy the code.' });
    }
  };

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Embed on your site</CardTitle>
        <CardDescription className="text-xs">
          Copy this code to embed the poll on your website.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={iframeCode}
            readOnly
            className="h-9 flex-1 font-mono text-xs bg-background"
            aria-label="Embed code"
          />
          <Button
            type="button"
            size="sm"
            className="px-3 h-9"
            onClick={handleCopy}
            aria-label="Copy embed code"
          >
            {hasCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
