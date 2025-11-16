/**
 * Petal Earning Hook for Mini-Games
 * 
 * Centralized petal earning logic for all games
 * Handles API calls, event dispatching, and guest persistence
 */

'use client';

import { useCallback } from 'react';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';

export interface PetalEarnRequest {
  gameId: string;
  score: number;
  didWin?: boolean; // Whether player won/completed the run
  metadata?: {
    combo?: number;
    accuracy?: number;
    wavesCleared?: number;
    timeElapsed?: number;
    difficulty?: string;
    [key: string]: unknown;
  };
}

export interface PetalEarnResult {
  success: boolean;
  earned: number;
  balance: number;
  lifetimePetalsEarned: number;
  isGuest: boolean;
  dailyCapReached?: boolean;
  error?: string;
}

/**
 * Hook for earning petals from game completion
 * Returns a function that handles the full petal earning flow
 */
export function usePetalEarn() {
  const { isGuest, syncBalance } = usePetalBalance();

  const earnPetals = useCallback(
    async (request: PetalEarnRequest): Promise<PetalEarnResult> => {
      try {
        // Call the petal earn API
        const response = await fetch('/api/v1/petals/earn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: request.gameId,
            score: request.score,
            didWin: request.didWin ?? true, // Default to win for backward compatibility
            metadata: request.metadata,
          }),
        });

        const data = await response.json();

        if (!data.ok) {
          return {
            success: false,
            earned: 0,
            balance: 0,
            lifetimePetalsEarned: 0,
            isGuest: data.data?.isGuest ?? isGuest,
            error: data.error || 'Failed to earn petals',
            dailyCapReached: data.data?.dailyCapReached ?? false,
          };
        }

        const result: PetalEarnResult = {
          success: true,
          earned: data.data?.earned ?? 0,
          balance: data.data?.balance ?? 0,
          lifetimePetalsEarned: data.data?.lifetimePetalsEarned ?? 0,
          isGuest: data.data?.isGuest ?? false,
          dailyCapReached: data.data?.dailyCapReached ?? false,
        };

        // Handle guest persistence
        if (result.isGuest) {
          const GUEST_STORAGE_KEY = 'om_guest_petals_v1';
          const GUEST_DAILY_LIMIT = 500;
          
          try {
            const stored = localStorage.getItem(GUEST_STORAGE_KEY);
            const guestData = stored ? JSON.parse(stored) : { balance: 0, lifetimePetalsEarned: 0 };
            
            // Check daily limit for guests
            const today = new Date().toISOString().split('T')[0];
            const lastUpdate = guestData.lastUpdate ? new Date(guestData.lastUpdate).toISOString().split('T')[0] : null;
            
            if (lastUpdate === today) {
              const todayEarned = guestData.todayEarned || 0;
              if (todayEarned + result.earned > GUEST_DAILY_LIMIT) {
                const allowed = Math.max(0, GUEST_DAILY_LIMIT - todayEarned);
                result.earned = allowed;
                result.dailyCapReached = allowed === 0;
              }
            }
            
            // Update guest data
            const updatedBalance = (guestData.balance || 0) + result.earned;
            const updatedLifetime = (guestData.lifetimePetalsEarned || 0) + result.earned;
            
            localStorage.setItem(
              GUEST_STORAGE_KEY,
              JSON.stringify({
                balance: updatedBalance,
                lifetimePetalsEarned: updatedLifetime,
                lastUpdate: new Date().toISOString(),
                todayEarned: (lastUpdate === today ? (guestData.todayEarned || 0) : 0) + result.earned,
              }),
            );
            
            result.balance = updatedBalance;
            result.lifetimePetalsEarned = updatedLifetime;
          } catch (err) {
            console.warn('Failed to persist guest petal data:', err);
          }
        }

        // Dispatch petal:earn event for PetalHUD
        window.dispatchEvent(
          new CustomEvent('petal:earn', {
            detail: {
              earned: result.earned,
              balance: result.balance,
              lifetimePetalsEarned: result.lifetimePetalsEarned,
              isGuest: result.isGuest,
              dailyCapReached: result.dailyCapReached,
              gameId: request.gameId,
              guestData: result.isGuest
                ? {
                    balance: result.balance,
                    lifetimePetalsEarned: result.lifetimePetalsEarned,
                  }
                : null,
            },
          }),
        );

        // Sync balance for authenticated users
        if (!result.isGuest) {
          await syncBalance();
        }

        return result;
      } catch (error) {
        console.error('Error earning petals:', error);
        return {
          success: false,
          earned: 0,
          balance: 0,
          lifetimePetalsEarned: 0,
          isGuest,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [isGuest, syncBalance],
  );

  return { earnPetals };
}

