'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

/**
 * Standardized hook for reading petal balance
 * 
 * This hook provides a single source of truth for petal balance in the UI.
 * It fetches from /api/v1/petals/wallet and caches the result.
 * 
 * Usage:
 * ```tsx
 * const { balance, isLoading, refetch } = usePetalBalance();
 * ```
 */
export function usePetalBalance() {
  const { user, isLoaded } = useUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['petal-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        // Guest users - check localStorage
        const guestPetals = localStorage.getItem('otm-guest-petals');
        return {
          balance: guestPetals ? parseInt(guestPetals, 10) : 0,
          lifetimeEarned: 0,
          isGuest: true,
        };
      }

      const response = await fetch('/api/v1/petals/wallet');
      if (!response.ok) {
        throw new Error('Failed to fetch petal balance');
      }

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch petal balance');
      }

      return {
        balance: result.data.balance || 0,
        lifetimeEarned: result.data.lifetimeEarned || 0,
        currentStreak: result.data.currentStreak || 0,
        todayCollected: result.data.todayCollected || 0,
        dailyLimit: result.data.dailyLimit || 0,
        isGuest: false,
      };
    },
    enabled: isLoaded,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Sync balance function for authenticated users
  const syncBalance = async () => {
    if (!user?.id) return;
    await refetch();
  };

  return {
    balance: data?.balance ?? 0,
    lifetimeEarned: data?.lifetimeEarned ?? 0,
    currentStreak: data?.currentStreak ?? 0,
    todayCollected: data?.todayCollected ?? 0,
    dailyLimit: data?.dailyLimit ?? 0,
    isGuest: data?.isGuest ?? false,
    isLoading: isLoading || !isLoaded,
    error,
    refetch,
    syncBalance,
  };
}
