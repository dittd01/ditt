
'use client';

import * as React from 'react';
import type { SharePayload } from '@/lib/share/schema';
import { ShareSheet } from './ShareSheet';

// Why: Defines the shape of the context. This includes the state for the
// sheet's visibility, the data payload, and the function to open the sheet.
// Exporting the type allows other components to use it for type safety.
export interface ShareContextType {
  isSheetOpen: boolean;
  payload: SharePayload | null;
  openSheet: (payload: SharePayload) => void;
  closeSheet: () => void;
}

// Why: Creating the context with a null default value. The actual value will be
// supplied by the Provider component. This is a standard pattern for creating context.
const ShareContext = React.createContext<ShareContextType | null>(null);

/**
 * Custom hook to provide easy access to the ShareContext.
 * @returns The share context.
 * @throws Will throw an error if used outside of a ShareProvider.
 */
export function useShareContext(): ShareContextType {
  const context = React.useContext(ShareContext);
  // Why: This check ensures that the hook is only used within components that are
  // descendants of ShareProvider. This prevents runtime errors from trying to
  // access a context that doesn't exist.
  if (!context) {
    throw new Error('useShareContext must be used within a ShareProvider');
  }
  return context;
}

/**
 * The provider component that wraps the application and holds the global state
 * for the share sheet functionality.
 */
export function ShareProvider({ children }: { children: React.ReactNode }) {
  // Why: State for controlling the visibility of the share sheet.
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  // Why: State to hold the data (URL, title, etc.) for the content being shared.
  // This allows any ShareButton to pass its specific data to the single, global ShareSheet.
  const [payload, setPayload] = React.useState<SharePayload | null>(null);

  // Why: A memoized callback function to open the sheet. Using useCallback prevents
  // this function from being recreated on every render, which is a performance optimization.
  const openSheet = React.useCallback((newPayload: SharePayload) => {
    setPayload(newPayload);
    setSheetOpen(true);
  }, []);

  const closeSheet = React.useCallback(() => {
    setSheetOpen(false);
    // Why: We clear the payload on close to ensure stale data isn't briefly shown
    // the next time the sheet opens.
    setPayload(null);
  }, []);

  // Why: The value provided to the context is memoized. This ensures that consumer
  // components only re-render when the context value *actually* changes.
  const value = React.useMemo(
    () => ({ isSheetOpen, payload, openSheet, closeSheet }),
    [isSheetOpen, payload, openSheet, closeSheet]
  );

  return (
    <ShareContext.Provider value={value}>
      {children}
      {/* Why: The ShareSheet is rendered here, inside the provider. This creates
          a single, global instance of the sheet that can be controlled from anywhere
          in the app via the `openSheet` function from the context. */}
      <ShareSheet
        open={isSheetOpen}
        onOpenChange={setSheetOpen}
        payload={payload}
      />
    </ShareContext.Provider>
  );
}
