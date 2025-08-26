
'use client';

import { useShareContext } from '@/components/share/ShareProvider';
import type { SharePayload } from '@/lib/share/schema';
import { trackShare } from '@/lib/share/analytics';
import { SHARE_TARGETS } from '@/lib/share/targets.tsx';

/**
 * @fileoverview A client-side hook for handling share functionality.
 *
 * @description
 * This hook encapsulates the core logic for the share feature. It decides whether
 * to use the native Web Share API (on mobile) or to trigger the fallback share sheet
 * (on desktop or if native share fails).
 *
 * It is designed to be used by any component that needs to trigger a share action,
 * such as the `ShareButton`.
 */
export function useShare() {
  // Why: We use the custom context hook to get access to the global `openSheet`
  // function. This decouples the `useShare` hook from the `ShareSheet` component itself,
  // allowing any component to trigger the sheet without needing to manage its state.
  const { openSheet } = useShareContext();

  const share = async (payload: SharePayload) => {
    const nativeTarget = SHARE_TARGETS.native;

    // Why: Prioritize the native Web Share API for the best mobile experience.
    // The `available()` check ensures we only attempt to use it if the browser supports it.
    if (nativeTarget.available()) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        });
        trackShare({ targetId: 'native', url: payload.url, status: 'success' });
        return;
      } catch (error) {
        // Why: The user might cancel the native share sheet. We don't treat this as an
        // error, but we do log it for analytics. We then proceed to the fallback sheet
        // as a convenience for the user.
        if (error instanceof DOMException && error.name === 'AbortError') {
          trackShare({ targetId: 'native', url: payload.url, status: 'cancelled' });
        } else {
          trackShare({ targetId: 'native', url: payload.url, status: 'error' });
        }
      }
    }

    // Why: If native share is unavailable or fails, we open the custom fallback sheet.
    // The `openSheet` function is provided by our global context, ensuring the single,
    // app-wide share sheet is displayed with the correct data.
    openSheet(payload);
  };

  return { share };
}
