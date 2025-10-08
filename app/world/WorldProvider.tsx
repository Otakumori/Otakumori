'use client';

import React, { createContext, useContext, useCallback, type ReactNode } from 'react';

// World Event Types
export type WorldEvent =
  | { type: 'cart:add' }
  | { type: 'purchase:success'; orderId?: string }
  | { type: 'error'; code?: string }
  | { type: 'idle' }
  | { type: 'shake:start' }
  | { type: 'shake:impulse'; strength?: number }
  | { type: 'shake:reward'; drops: Drop[] }
  | { type: 'shake:end' };

export type Drop = {
  type: 'petals' | 'cosmetic' | 'lore';
  amount?: number;
  id?: string;
};

// World State Types
export type WorldState = {
  settings: {
    reducedMotion: boolean;
    fxDither: number; // 0..0.1
    parallax: number; // 0..1
    overStimulated: boolean;
    allowSmoking: boolean;
    allowBeverage: boolean;
    avatarMode: 'tree' | 'hud' | 'peek';
  };
  dispatch: (e: WorldEvent) => void;
  debug?: boolean;
};

// Initial State
const initialState: WorldState = {
  settings: {
    reducedMotion:
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    fxDither: 0.08,
    parallax: 0.3,
    overStimulated: false,
    allowSmoking: false,
    allowBeverage: false,
    avatarMode: 'tree',
  },
  dispatch: () => {},
  debug: false,
};

// Context
const WorldContext = createContext<WorldState>(initialState);

// Provider Component
interface WorldProviderProps {
  children: ReactNode;
  debug?: boolean;
}

export function WorldProvider({ children, debug = false }: WorldProviderProps) {
  const [state, setState] = React.useState<WorldState>({
    ...initialState,
    debug,
  });

  const dispatch = useCallback((_event: WorldEvent) => {
    // Handle world events here
    // World Event

    // Update settings based on events
    setState((prev) => ({
      ...prev,
      // Add any state updates based on events
    }));
  }, []);

  const value: WorldState = {
    ...state,
    dispatch,
  };

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

// Hook to use world context
export function useWorld(): WorldState {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error('useWorld must be used within a WorldProvider');
  }
  return context;
}

// Hook to dispatch world events
export function useWorldEvent() {
  const { dispatch } = useWorld();
  return dispatch;
}
