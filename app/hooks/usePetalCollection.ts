'use client';

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { useState, useCallback, useRef, useEffect } from 'react';
import { COLLECTION } from '@/app/lib/petals/constants';
import { trackPetalCollection, trackPetalMilestone } from '@/app/lib/analytics/petals';

export interface CollectedPetal {
  id: number;
  value: number;
  x: number;
  y: number;
  timestamp: number;
  }

export interface PetalCollectionState {
  sessionTotal: number;
  lifetimeTotal: number;
  hasCollectedAny: boolean;
  showAchievement: boolean;
}

export function usePetalCollection() {
  const [state, setState] = useState<PetalCollectionState>({
    sessionTotal: 0,
    lifetimeTotal: 0,
    hasCollectedAny: false,
    showAchievement: false,
  });

  const pendingCollections = useRef<CollectedPetal[]>([]);
  const lastSubmitTime = useRef(0);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial state from localStorage
  useEffect(() => {
    const hasCollected = localStorage.getItem('otm-has-collected-petal') === 'true';
    setState((prev) => ({ ...prev, hasCollectedAny: hasCollected }));
  }, []);

  // Submit collected petals to API using centralized grant endpoint
  const submitCollections = useCallback(async () => {
    if (pendingCollections.current.length === 0) return;

    const collections = [...pendingCollections.current];
    pendingCollections.current = [];

    const totalValue = collections.reduce((sum, c) => sum + c.value, 0);

    try {
      // Use the centralized petal grant API
      const response = await fetch('/api/v1/petals/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalValue,
          source: 'background_petal_click',
          metadata: {
            clickCount: collections.length,
            positions: collections.map((c) => ({ x: c.x, y: c.y })),
          },
          description: `Collected ${collections.length} sakura petals`,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.ok && data.data) {
          const { granted = totalValue, lifetimeEarned } = data.data;
          const newLifetimeTotal = lifetimeEarned || state.lifetimeTotal + granted;

          // Track petal milestone if reached
          if (newLifetimeTotal && typeof newLifetimeTotal === 'number') {
            const milestones = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
            const reachedMilestone = milestones.find(
              (m) => newLifetimeTotal >= m && state.lifetimeTotal < m,
            );
            if (reachedMilestone) {
              trackPetalMilestone(reachedMilestone, newLifetimeTotal, 'background_petal_click');
            }
          }

          setState((prev) => ({
            ...prev,
            sessionTotal: prev.sessionTotal + granted,
            lifetimeTotal: newLifetimeTotal,
          }));
        }
      } else {
        // If rate limited or daily limit reached, still update UI but don't retry
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === 'RATE_LIMITED' || errorData.error === 'DAILY_LIMIT_REACHED') {
          // Don't re-add to pending - limits are intentional
          logger.warn('Petal collection limited:', undefined, { value: errorData.error });
        } else {
          // Re-add failed collections to try again for other errors
          pendingCollections.current.push(...collections);
        }
      }
    } catch (error) {
      logger.error('Failed to submit petal collection:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      // Re-add failed collections to try again
      pendingCollections.current.push(...collections);
    }

    lastSubmitTime.current = Date.now();
  }, []);

  // Collect a petal
  const collectPetal = useCallback(
    (petalId: number, value: number, x: number, y: number) => {
      // Track petal collection for analytics
      trackPetalCollection({
        petalId,
        amount: value,
        source: 'background_petal_click',
        location: { x, y },
        metadata: {
          sessionTotal: state.sessionTotal + value,
        },
      });

      // Add to pending collections
      pendingCollections.current.push({
        id: petalId,
        value,
        x,
        y,
        timestamp: Date.now(),
      });

      // Update UI immediately
      setState((prev) => {
        const isFirstCollection = !prev.hasCollectedAny;

        if (isFirstCollection) {
          localStorage.setItem('otm-has-collected-petal', 'true');
        }

        return {
          ...prev,
          sessionTotal: prev.sessionTotal + value,
          hasCollectedAny: true,
          showAchievement: isFirstCollection,
        };
      });

      // Schedule batch submit
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }

      submitTimeoutRef.current = setTimeout(() => {
        submitCollections();
      }, COLLECTION.DEBOUNCE_MS);
    },
    [submitCollections, state.sessionTotal],
  );

  // Dismiss achievement notification
  const dismissAchievement = useCallback(() => {
    setState((prev) => ({ ...prev, showAchievement: false }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    collectPetal,
    dismissAchievement,
  };
}
