
'use client';

import { onCLS, onLCP, onINP, onFID, onTTFB, type Metric } from 'web-vitals';
import { useFlags } from '@/lib/flags/provider';
import { useEffect } from 'react';

async function send(metric: Metric) {
  try {
    // Use `navigator.sendBeacon` if available for robustness, otherwise fall back to fetch.
    const body = JSON.stringify(metric);
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/vitals', body);
    } else {
      await fetch('/api/vitals', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    }
  } catch(e) {
    // Silently fail if the request fails. This is non-critical.
    console.warn('[Vitals] Failed to send metric', e);
  }
}

export function Vitals() {
  const { webVitals } = useFlags();

  useEffect(() => {
    if (webVitals) {
      onCLS(send);
      onLCP(send);
      onINP(send);
      onFID(send);
      onTTFB(send);
    }
  }, [webVitals]);
  
  return null;
}
