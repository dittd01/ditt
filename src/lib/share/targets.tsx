
'use client';

import * as React from 'react';
import {
  Copy,
  Mail,
  MessageSquare,
  Printer,
  QrCode,
  Save,
  Twitter,
  Linkedin,
  Send,
  MoreHorizontal,
  Link,
  Code,
  Calendar as CalendarIcon,
} from 'lucide-react';
import type { ShareTarget } from './schema';
import { buildUrl } from './url';
import { SHARE_ENABLE_POCKET } from '@/config/share';

// --- Platform-Specific Icons ---
// Why: Using inline SVGs is the most efficient way to add a few custom brand icons
// without adding a heavy new dependency. This keeps the component self-contained and lean.
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="#25D366" viewBox="0 0 24 24" {...props}><path d="M19.05 4.94A9.96 9.96 0 0 0 12 2C6.48 2 2 6.48 2 12c0 1.74.45 3.38 1.26 4.84L2 22l5.16-1.36A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10a9.96 9.96 0 0 0-2.95-7.06zM12 20.25c-1.61 0-3.14-.38-4.5-.98l-.32-.19-3.34.88.89-3.25-.21-.33A8.24 8.24 0 0 1 3.75 12C3.75 7.44 7.44 3.75 12 3.75s8.25 3.69 8.25 8.25-3.7 8.25-8.25 8.25zM16.47 14.4c-.13-.07-1.4-1.12-1.61-1.25-.22-.12-.38-.19-.54.19-.16.38-.61 1.25-.75 1.5-.14.25-.27.28-.5.12-.22-.16-1.4-1.05-2.28-1.65-.68-.48-1.14-.98-1.28-1.15-.14-.16 0-.25.13-.38.11-.11.25-.28.38-.42.12-.14.16-.25.25-.42.09-.16.04-.31-.02-.42-.07-.12-.54-1.3-.74-1.78-.19-.48-.39-.41-.54-.41h-.47c-.16 0-.42.07-.64.31-.22.25-.85.83-.85 2.03 0 1.2.88 2.35 1 2.51.13.16 1.7 2.59 4.12 3.63 2.42 1.03 2.42.69 2.85.62.43-.06 1.4-.95 1.6-1.84.21-.89.21-1.65.15-1.84-.06-.18-.21-.28-.34-.35z"></path></svg>
);
const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="#229ED9" viewBox="0 0 24 24" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.74-2.88 13.06c-.14.65-.54.81-1.08.5l-4.25-3.13-2.06 1.98c-.22.22-.4.33-.8.33l.3-4.34 7.8-7.1c.34-.31-.06-.48-.52-.17l-9.56 5.97-4.14-1.28c-.66-.2-0.66-0.63.14-0.94l17.4-6.73c.55-.22 1.02.13.85.8z"/></svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="#1877F2" viewBox="0 0 24 24" {...props}><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 1200 1227" {...props}><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1070.38 1150.3H907.776L569.165 687.828Z"></path></svg>
);
const RedditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="#FF4500" viewBox="0 0 24 24" {...props}><path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,1.53,5.29,1,1,0,0,0,.8.42,1,1,0,0,0,.81-.42,7.74,7.74,0,0,1,12.92,0,1,1,0,0,0,1.61,0,10,10,0,0,0,2-5.71A10,10,0,0,0,12,2Zm1.62,11.59a1.1,1.1,0,1,1-2.2,0,1.1,1.1,0,0,1,2.2,0Zm-5.34,0a1.1,1.1,0,1,1-2.2,0,1.1,1.1,0,0,1,2.2,0Zm.22-3.41a2,2,0,0,1,3,0,1,1,0,1,1-1.39,1.44,1.8,1.8,0,0,0-2.36,0,1,1,0,0,1-1.42,0,1,1,0,0,1,0-1.42,2,2,0,0,1,2.17-.05Z"></path></svg>
);
const TumblrIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="#36465D" viewBox="0 0 24 24" {...props}><path d="M12.984 21.984c-3.141 0-5.063-2.109-5.063-5.25v-6.375h-2.25v-3.328c1.547-0.234 2.578-1.5 2.859-3.047h2.484v4.641h3.609v3h-3.609v5.813c0 1.125 0.375 1.875 1.5 1.875h0.234c0.516 0 0.891 0.047 1.125 0.094v3.187c-0.656 0.094-1.547 0.187-2.719 0.187z"/></svg>
);
const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="#E60023" viewBox="0 0 24 24" {...props}><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.08-.34.14-.94.22-1.34.08-.42.5-1.99.5-1.99s-.13-.25-.13-.62c0-.58.34-.99.76-1.34.42-.35 1.13-.17 1.13.52 0 .61-.39 1.51-.59 2.35-.16.68.34 1.23.99 1.23 1.19 0 2.11-1.26 2.11-3.1 0-1.63-1.16-2.77-2.6-2.77-1.78 0-2.81 1.34-2.81 2.91 0 .34.12.72.27.94.13.19.14.22.1.43-.02.1-.07.24-.1.34-.03.11-.08.14-.2.05-1.02-.38-1.67-1.55-1.67-2.85 0-2.28 1.65-4.25 4.79-4.25 2.51 0 4.42 1.86 4.42 4.15 0 2.51-1.58 4.49-3.76 4.49-1.24 0-2.16-.99-1.86-2.18.25-.99.74-2.05.74-2.05.2-.42.6-.85.6-1.48 0-.74-.42-1.34-.99-1.34-.78 0-1.38.79-1.38 1.74 0 .64.24 1.12.24 1.12s-1 4.25-1.18 5.01c-.53 2.25-2.01 4.02-3.8 4.02C6.12 20.35 4 17.9 4 14.88 4 11.07 6.81 8.5 10.12 8.5c3.22 0 5.42 2.28 5.42 5.12 0 1.9-.99 3.6-2.38 3.6-1.11 0-1.62-.92-1.62-2.02 0-1.5.94-2.84.94-2.84s.22-1 .25-1.13c.12-.47-.03-1.04-.47-1.04-.54 0-1.1.48-1.1 1.48 0 .84.28 1.58.28 1.58s-1.18 4.96-1.38 5.86c-.34 1.49-1.24 3.12-2.58 3.12-1.48 0-2.92-1.84-2.92-4.63 0-3.21 2.3-6.18 6.18-6.18 3.45 0 6.25 2.51 6.25 5.98 0 3.45-2.15 6.18-5.18 6.18-1.42 0-2.76-.74-3.23-1.63z"/></svg>
);


/**
 * A registry of all available share targets.
 * Each target has a unique ID, a display name, an icon, a type, a function to check
 * if it's available on the current platform, and a function to build its share URL.
 * This centralized registry makes it easy to add, remove, or modify share targets.
 */
export const SHARE_TARGETS: Record<string, ShareTarget> = {
  native: {
    id: 'native',
    name: 'Native Share',
    type: 'native',
    icon: null,
    // Why: `navigator.share` is the native Web Share API. This check ensures we only
    // try to use it if the browser supports it. The `typeof navigator` check is
    // crucial to prevent server-side rendering (SSR) errors, as `navigator` only
    // exists in the browser.
    available: () => typeof window !== 'undefined' && typeof window.navigator.share === 'function',
    buildUrl: (payload) => buildUrl(payload, 'native'),
  },
  copy: {
    id: 'copy',
    name: 'Copy Link',
    type: 'copy',
    icon: Link,
    available: () => true,
    buildUrl: (payload) => buildUrl(payload, 'copy'),
  },
  email: {
    id: 'email',
    name: 'Email',
    type: 'mailto',
    icon: Mail,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'email');
      return `mailto:?subject=${encodeURIComponent(payload.title || '')}&body=${encodeURIComponent((payload.text || '') + '\n\n' + url)}`;
    },
  },
  sms: {
    id: 'sms',
    name: 'Messages',
    type: 'sms',
    icon: MessageSquare,
    available: () => {
      // Why: SMS links are primarily for mobile. We use a regex to make a reasonable guess
      // if the user is on a mobile device. This is a heuristic, not a guarantee.
      if (typeof window === 'undefined') return false;
      return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
    },
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'sms');
      const body = encodeURIComponent((payload.title || '') + '\n\n' + url);
      // Why: iOS and Android have slightly different formats for the SMS scheme.
      // We check the platform to provide the best possible link.
      const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(window.navigator.userAgent);
      return isIOS ? `sms:&body=${body}` : `sms:?body=${body}`;
    },
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    type: 'web',
    icon: WhatsAppIcon,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'whatsapp');
      const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
      const base = isMobile ? 'https://wa.me/?text=' : 'https://web.whatsapp.com/send?text=';
      return `${base}${encodeURIComponent((payload.title || '') + '\n' + url)}`;
    },
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    type: 'web',
    icon: TelegramIcon,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'telegram');
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(payload.title || '')}`;
    },
  },
  x: {
    id: 'x',
    name: 'X',
    type: 'web',
    icon: XIcon,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'x');
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(payload.title || '')}`;
    },
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    type: 'web',
    icon: FacebookIcon,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'facebook');
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    },
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    type: 'web',
    icon: Linkedin,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'linkedin');
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    },
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    type: 'web',
    icon: RedditIcon,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'reddit');
      return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(payload.title || '')}`;
    },
  },
  tumblr: {
    id: 'tumblr',
    name: 'Tumblr',
    type: 'web',
    icon: TumblrIcon,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'tumblr');
      return `http://www.tumblr.com/share/link?url=${encodeURIComponent(url)}&name=${encodeURIComponent(payload.title || '')}&description=${encodeURIComponent(payload.text || '')}`;
    },
  },
   pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    type: 'web',
    icon: PinterestIcon,
    available: () => true,
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'pinterest');
      return `http://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(payload.title || '')}`;
    },
  },
  pocket: {
    id: 'pocket',
    name: 'Pocket',
    type: 'web',
    icon: Save,
    available: () => SHARE_ENABLE_POCKET, // Gated by feature flag
    buildUrl: (payload) => {
      const url = buildUrl(payload, 'pocket');
      return `https://getpocket.com/save?url=${encodeURIComponent(url)}&title=${encodeURIComponent(payload.title || '')}`;
    },
  },
};
