/**
 * Hook to fetch and sync petal balance (including lifetime)
 * Used by Quake HUD and other components that need real-time petal data
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

export interface PetalBalanceData {
  balance: number;
  lifetimePetalsEarned: number;
  isGuest: boolean;
}

export function usePetalBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [lifetimePetalsEarned, setLifetimePetalsEarned] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [loading, setLoading] = useState(true);

  const syncBalance = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try v1 API first (for authenticated users)
      const response = await fetch('/api/v1/petals/balance');
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data) {
          setBalance(data.data.balance ?? 0);
          setLifetimePetalsEarned(data.data.lifetimePetalsEarned ?? 0);
          setIsGuest(false);
          return;
        }
      }
      
      // Fallback: check guest localStorage
      const guestData = localStorage.getItem('om_guest_petals_v1');
      if (guestData) {
        try {
          const parsed = JSON.parse(guestData);
          const updatedAt = parsed.updatedAt ? new Date(parsed.updatedAt) : null;
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          
          if (updatedAt && updatedAt > sevenDaysAgo) {
            setBalance(parsed.balance ?? 0);
            setLifetimePetalsEarned(parsed.lifetimePetalsEarned ?? 0);
            setIsGuest(true);
            return;
          }
        } catch {
          // Invalid guest data, reset
        }
      }
      
      // Default: no balance
      setBalance(0);
      setLifetimePetalsEarned(0);
      setIsGuest(true);
    } catch (error) {
      console.error('Failed to sync petal balance:', error);
      setBalance(0);
      setLifetimePetalsEarned(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncBalance();

    // Listen for petal events
    const onEarn = (event: CustomEvent) => {
      if (event.detail?.balance !== null && event.detail?.balance !== undefined) {
        setBalance(event.detail.balance);
      }
      if (event.detail?.lifetimePetalsEarned !== null && event.detail?.lifetimePetalsEarned !== undefined) {
        setLifetimePetalsEarned(event.detail.lifetimePetalsEarned);
      }
      setIsGuest(event.detail?.isGuest ?? false);
    };

    const onSpend = (event: CustomEvent) => {
      if (event.detail?.balance !== null && event.detail?.balance !== undefined) {
        setBalance(event.detail.balance);
      }
      // Lifetime doesn't change on spend
    };

    window.addEventListener('petal:earn', onEarn as any);
    window.addEventListener('petal:spend', onSpend as any);
    
    return () => {
      window.removeEventListener('petal:earn', onEarn as any);
      window.removeEventListener('petal:spend', onSpend as any);
    };
  }, [syncBalance]);

  return {
    balance: balance ?? 0,
    lifetimePetalsEarned: lifetimePetalsEarned ?? 0,
    isGuest,
    loading,
    syncBalance,
  };
}

