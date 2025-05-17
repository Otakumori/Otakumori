'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { createStore } from 'zustand';
import { createContext, useContext, useRef } from 'react';

interface PetalState {
  petals: number;
  dailyLimit: number;
  addPetals: (amount: number) => void;
  resetDailyLimit: () => void;
}

interface OverlordState {
  isActive: boolean;
  lastInteraction: Date | null;
  quests: Array<{
    id: string;
    title: string;
    description: string;
    reward: number;
  }>;
  activate: () => void;
  deactivate: () => void;
  addQuest: (quest: OverlordState['quests'][0]) => void;
}

// Create a store for the petal system
const usePetalStore = createStore<PetalState>(set => ({
  petals: 0,
  dailyLimit: 50,
  addPetals: amount => set(state => ({ petals: state.petals + amount })),
  resetDailyLimit: () => set({ petals: 0 }),
}));

// Create a store for the AI Overlord
const useOverlordStore = createStore<OverlordState>(set => ({
  isActive: false,
  lastInteraction: null,
  quests: [],
  activate: () => set({ isActive: true }),
  deactivate: () => set({ isActive: false }),
  addQuest: quest => set(state => ({ quests: [...state.quests, quest] })),
}));

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <PetalProvider>
          <OverlordProvider>{children}</OverlordProvider>
        </PetalProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

// Context providers for the stores
const PetalContext = createContext<typeof usePetalStore | null>(null);
const OverlordContext = createContext<typeof useOverlordStore | null>(null);
export function PetalProvider({ children }: { children: React.ReactNode }) {
  const store = useRef(usePetalStore);
  return <PetalContext.Provider value={store.current}>{children}</PetalContext.Provider>;
}

export function OverlordProvider({ children }: { children: React.ReactNode }) {
  const store = useRef(useOverlordStore);
  return <OverlordContext.Provider value={store.current}>{children}</OverlordContext.Provider>;
}

export const usePetalContext = () => {
  const context = useContext(PetalContext);
  if (!context) {
    throw new Error('usePetalContext must be used within a PetalProvider');
  }
  return context;
};

export const useOverlordContext = () => {
  const context = useContext(OverlordContext);
  if (!context) {
    throw new Error('useOverlordContext must be used within an OverlordProvider');
  }
  return context;
};
