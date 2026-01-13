'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { usePetalCollection, type PetalCollectionState } from '@/app/hooks/usePetalCollection';

interface PetalCollectionContextValue extends PetalCollectionState {
  collectPetal: (petalId: number, value: number, x: number, y: number) => void;
  dismissAchievement: () => void;
}

const PetalCollectionContext = createContext<PetalCollectionContextValue | null>(null);

export function PetalCollectionProvider({ children }: { children: React.ReactNode }) {
  // Singleton instance - only one hook instance across entire app
  const collection = usePetalCollection();
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...collection,
    }),
    [collection],
  );

  return (
    <PetalCollectionContext.Provider value={contextValue}>
      {children}
    </PetalCollectionContext.Provider>
  );
}

export function usePetalCollectionContext(): PetalCollectionContextValue {
  const context = useContext(PetalCollectionContext);
  if (!context) {
    throw new Error(
      'usePetalCollectionContext must be used within PetalCollectionProvider. Make sure PetalCollectionProvider is added to your app Providers.',
    );
  }
  return context;
}

