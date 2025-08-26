
'use client';

import { trackEvent } from '@/lib/analytics';

type ShareContext = {
  targetId: string;
  url: string;
  status: 'impression' | 'success' | 'error' | 'cancelled';
  context?: string; // e.g., 'topic_page_header', 'topic_footer'
};

/**
 * A dedicated analytics function for tracking share events.
 * This acts as a wrapper around the generic `trackEvent` function to ensure
 * consistency in how share interactions are logged.
 * 
 * @param {ShareContext} context - An object containing details about the share event.
 */
export function trackShare(context: ShareContext): void {
  const eventName = `share_${context.targetId}_${context.status}`;
  
  trackEvent(eventName as any, {
    share_target: context.targetId,
    share_url: context.url,
    share_context: context.context || 'unknown',
  });
}
