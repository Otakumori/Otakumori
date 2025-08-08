'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { create } from 'zustand';
import React, { createContext, useContext, useRef, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { useLocalStorage } from './app/hooks/hooks/useLocalStorage';
import { useUserStore } from './lib/store/userStore';
import mitt from 'mitt';

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

interface PetalReward {
  count: number;
  reward: string;
  claimed: boolean;
}

const PETAL_REWARDS: PetalReward[] = [
  { count: 10, reward: 'WELCOME10', claimed: false },
  { count: 50, reward: 'BLOOM25', claimed: false },
  { count: 100, reward: 'SAKURA50', claimed: false },
  { count: 500, reward: 'LEGENDARY100', claimed: false },
];

// Event Bus for global events
export const eventBus = mitt();

// Unified Zustand store for petals with persistence
const usePetalStore = create<PetalState & {
  rewards: PetalReward[];
  showReward: string | null;
  addPetals: (amount: number) => void;
  claimReward: (code: string) => void;
  syncPetals: (userId: string) => Promise<void>;
  setPetals: (amount: number) => void;
  checkRewards: (count: number) => void;
}>((set, get) => ({
  petals: 0,
  dailyLimit: 50,
  rewards: PETAL_REWARDS,
  showReward: null,
  addPetals: (amount) => {
    const newPetals = get().petals + amount;
    set({ petals: newPetals });
    get().checkRewards(newPetals);
    eventBus.emit('petalEarned', amount);
    // Persistence handled in useEffect below
  },
  setPetals: (amount) => set({ petals: amount }),
  checkRewards: (count: number) => {
    const newRewards = get().rewards.map(reward => {
      if (count >= reward.count && !reward.claimed) {
        set({ showReward: reward.reward });
        return { ...reward, claimed: true };
      }
      return reward;
    });
    set({ rewards: newRewards });
  },
  claimReward: async (code: string) => {
    try {
      // Validate reward code
      const reward = get().rewards.find(r => r.count === parseInt(code));
      if (!reward || reward.claimed) {
        throw new Error('Invalid or already claimed reward code');
      }

      // Mark reward as claimed
      const updatedRewards = get().rewards.map(r => 
        r.count === parseInt(code) ? { ...r, claimed: true } : r
      );
      set({ rewards: updatedRewards, showReward: null });

      // Add petals to user account
      const petalReward = parseInt(code) * 10; // 10 petals per reward level
      get().addPetals(petalReward);

      // TODO: Send to analytics/achievement system
      console.log(`Reward claimed: ${code} for ${petalReward} petals`);
      
      return { success: true, petals: petalReward };
    } catch (error) {
      console.error('Error claiming reward:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },
  resetDailyLimit: () => set({ petals: 0 }),
  syncPetals: async (userId: string) => {
    // Fetch petals from Supabase for logged-in user
    const { data, error } = await supabase
      .from('user_profiles')
      .select('petals')
      .eq('id', userId)
      .single();
    if (!error && data) {
      set({ petals: data.petals });
    }
  },
}));

// Create a store for the AI Overlord
const useOverlordStore = create<OverlordState>(set => ({
  isActive: false,
  lastInteraction: null,
  quests: [],
  activate: () => set({ isActive: true }),
  deactivate: () => set({ isActive: false }),
  addQuest: quest => set(state => ({ quests: [...state.quests, quest] })),
}));

const queryClient = new QueryClient();

// Context providers for the stores
const PetalContext = createContext<typeof usePetalStore | null>(null);
const OverlordContext = createContext<typeof useOverlordStore | null>(null);

// PetalProvider with persistence logic
export function PetalProvider({ children }: { children: React.ReactNode }) {
  const store = useRef(usePetalStore);
  const user = useUserStore(state => state.user);
  const [localPetals, setLocalPetals] = useLocalStorage('totalPetals', 0);
  const [localRewards, setLocalRewards] = useLocalStorage('petalRewards', PETAL_REWARDS);

  // Sync petals on login/logout
  useEffect(() => {
    if (user?.id) {
      // Logged in: sync with Supabase
      store.current.getState().syncPetals(user.id);
    } else {
      // Not logged in: use localStorage
      store.current.getState().setPetals(localPetals);
    }
  }, [user?.id]);

  // Persist petals to Supabase/localStorage on change
  useEffect(() => {
    const unsub = store.current.subscribe(state => {
      if (user?.id) {
        // Save to Supabase
        supabase.from('user_profiles').update({ petals: state.petals }).eq('id', user.id);
      } else {
        // Save to localStorage
        setLocalPetals(state.petals);
        setLocalRewards(state.rewards);
      }
    });
    return () => unsub();
  }, [user?.id]);

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <PetalProvider>
            <OverlordProvider>{children}</OverlordProvider>
          </PetalProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ClerkProvider>
  );
}

export default Providers;
