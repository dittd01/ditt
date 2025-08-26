
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from '@/components/layout/site-header';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { ShareProvider } from '@/components/share/ShareProvider';
import { FlagProvider } from '@/lib/flags/provider';
import { Vitals } from '@/lib/vitals/client';

export const metadata: Metadata = {
  title: 'Ditt Demokrati - Anonymous Voting',
  description: 'A secure and anonymous voting platform built with Next.js and Firebase.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setInitialLanguage() {
                  const storedLang = localStorage.getItem('selectedLanguage');
                  if (storedLang) {
                    document.documentElement.lang = storedLang;
                    return;
                  }

                  const browserLang = navigator.language.split('-')[0];
                  let initialLang = 'en';
                  if (browserLang === 'nb' || browserLang === 'no') {
                    initialLang = 'nb';
                  }
                  
                  localStorage.setItem('selectedLanguage', initialLang);
                  document.documentElement.lang = initialLang;
                }

                setInitialLanguage();

                window.addEventListener('beforeunload', () => {
                  if (localStorage.getItem('anonymousVoterId')) {
                    localStorage.setItem('lastSeenTimestamp', Date.now().toString());
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <FlagProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <ShareProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <div className="flex-1">{children}</div>
              </div>
              <Toaster />
            </ShareProvider>
          </ThemeProvider>
          <Vitals />
        </FlagProvider>
      </body>
    </html>
  );
}
