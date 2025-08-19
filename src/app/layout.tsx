import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { CategoryNav } from '@/components/CategoryNav';
import { categories } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Valg匿名 - Anonymous Voting',
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
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <CategoryNav categories={categories} />
          <div className="flex-1">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
