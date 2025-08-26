
'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';

interface QrCardProps {
  url: string;
}

/**
 * @fileoverview A component to display a QR code for a given URL.
 *
 * @description
 * This component is responsible for generating and rendering a QR code. It uses the `qrcode`
 * library to create a data URL from the provided `url` prop, which is then used as the `src`
 * for an `<img>` tag. It's theme-aware and will generate a QR code with colors that match
 * the current light or dark theme.
 */
export function QrCard({ url }: QrCardProps) {
  const { resolvedTheme } = useTheme();
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Why: We must ensure this effect runs only when the theme is resolved, as the QR
    // code's colors depend on it. This prevents generating a light-themed QR code
    // that is then displayed on a dark background.
    if (resolvedTheme) {
      setIsLoading(true);
      QRCode.toDataURL(
        url,
        {
          errorCorrectionLevel: 'M', // 'M' provides a good balance of density and error correction.
          width: 256,
          margin: 2,
          color: {
            // Why: Dynamically set colors based on the theme for better aesthetics and readability.
            dark: resolvedTheme === 'dark' ? '#FFFFFF' : '#000000', // QR code dots
            light: resolvedTheme === 'dark' ? '#0A0E1C' : '#FFFFFF', // QR code background
          },
        },
        (err, generatedUrl) => {
          if (err) {
            console.error('QR Code generation failed:', err);
          } else {
            setQrCodeUrl(generatedUrl);
          }
          setIsLoading(false);
        }
      );
    }
  }, [url, resolvedTheme]);

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Scan QR Code</CardTitle>
        <CardDescription className="text-xs">
          Open this page on another device by scanning this code.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-4">
        {isLoading || !qrCodeUrl ? (
          <Skeleton className="h-40 w-40" />
        ) : (
          <img src={qrCodeUrl} alt="QR Code" width={160} height={160} className="rounded-lg" />
        )}
      </CardContent>
    </Card>
  );
}
