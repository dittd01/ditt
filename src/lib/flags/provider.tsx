
'use client';
import React, { createContext, useContext, useMemo } from 'react';
import defaults from './defaults.json';
import { FlagsSchema, type Flags } from './types';

const FlagsContext = createContext<Flags>(FlagsSchema.parse(defaults));

export function FlagProvider({ children }: { children: React.ReactNode }) {
  const merged = useMemo(() => {
    // In a real app, you might fetch flags from a remote service here
    // For now, we'll just use defaults.
    const envFlags: Partial<Flags> = {
      webVitals: process.env.NEXT_PUBLIC_FLAG_WEB_VITALS === 'true'
    };
    return FlagsSchema.parse({ ...defaults, ...envFlags });
  }, []);
  return <FlagsContext.Provider value={merged}>{children}</FlagsContext.Provider>;
}
export function useFlags() { return useContext(FlagsContext); }
