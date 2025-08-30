
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Youtube, Linkedin, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Why: Using inline SVGs is the most efficient way to add a few custom brand icons
// without adding a heavy new dependency like a full icon library.
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 1200 1227" {...props}><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1070.38 1150.3H907.776L569.165 687.828Z"></path></svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 2859 3333" {...props}><path d="M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1735 742-21-55-40-123-40-203V874c-213 10-415 119-560 225-19 13-39 29-61 47-22 19-42 38-62 59-25 25-50 49-75 73-25 24-51 48-79 73v-517c34-22 71-46 110-73 39-26 77-52 116-79 40-27 79-54 117-81 39-27 77-54 116-81 55-38 111-77 167-115v959c258 148 409-122 409-499V874c-225-121-499-225-499-225v-532c140-54 266-130 379-225 39-33 76-68 111-105C1482 10 1651 0 2081 0z"/></svg>
);


const socialLinks = [
  { href: 'https://youtube.com', icon: Youtube },
  { href: 'https://x.com', icon: XIcon },
  { href: 'https://facebook.com', icon: Facebook },
  { href: 'https://linkedin.com', icon: Linkedin },
  { href: 'https://tiktok.com', icon: TikTokIcon },
];

export function SiteFooter() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const selectedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLang(selectedLang);
  }, []);

  const followUsText = lang === 'nb' ? 'Følg oss' : 'Follow us';
  const aboutText = lang === 'nb' ? 'Om oss' : 'About';
  const privacyText = lang === 'nb' ? 'Personvern' : 'Privacy';

  return (
    <footer className="border-t">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-muted-foreground">{followUsText}</span>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ href, icon: Icon }) => (
              <Button key={href} asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <Icon className="h-5 w-5" />
                </a>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Ditt Demokrati</p>
            <Link href="/about" className="hover:text-foreground">{aboutText}</Link>
            <Link href="/privacy" className="hover:text-foreground">{privacyText}</Link>
        </div>
      </div>
    </footer>
  );
}
