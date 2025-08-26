
'use client';

import type { SharePayload } from './schema';
import { DEFAULT_UTM, SHARE_ADD_UTM_DEFAULTS } from '@/config/share';

/**
 * Builds a canonical, shareable URL from a payload, optionally appending UTM parameters.
 * This function ensures all shared links are consistent and trackable.
 *
 * @param {SharePayload} payload - The core information to be shared.
 * @param {string} targetId - The ID of the share target (e.g., 'x', 'facebook').
 * @returns {string} The final, fully-constructed URL ready for sharing.
 */
export function buildUrl(payload: SharePayload, targetId: string): string {
  // Why: We must start with a valid, absolute URL. This ensures that relative paths
  // from the payload are correctly resolved against the site's base URL.
  const baseUrl = new URL(payload.url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  
  // Why: Conditionally adding UTM parameters based on a feature flag allows for easy
  // A/B testing or configuration of analytics tracking without changing component code.
  if (SHARE_ADD_UTM_DEFAULTS) {
    const utmParams = new URLSearchParams({
      // Why: Use default UTM medium from config, but allow payload to override.
      utm_medium: payload.utm?.medium || DEFAULT_UTM.medium,
      // Why: Source is dynamically set to the share target ID for granular tracking.
      utm_source: targetId,
      // Why: Campaign and content are optional and can be provided contextually.
      ...(payload.utm?.campaign && { utm_campaign: payload.utm.campaign }),
      ...(payload.utm?.content && { utm_content: payload.utm.content }),
    });

    // Why: Append the UTM parameters to the existing search parameters of the base URL
    // in a clean, robust way.
    utmParams.forEach((value, key) => {
      baseUrl.searchParams.append(key, value);
    });
  }

  return baseUrl.toString();
}
