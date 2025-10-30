'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { COLLECTION } from '@/app/lib/petals/constants';

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

  // Submit collected petals to API
  const submitCollections = useCallback(async () => {
    if (pendingCollections.current.length === 0) return;

    const collections = [...pendingCollections.current];
    pendingCollections.current = [];

    const totalValue = collections.reduce((sum, c) => sum + c.value, 0);

    try {
      const response = await fetch('/api/petals/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: totalValue,
          x: collections[0].x,
          y: collections[0].y,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setState((prev) => ({
          ...prev,
          sessionTotal: prev.sessionTotal + totalValue,
          lifetimeTotal: data.data?.totalPetals || prev.lifetimeTotal + totalValue,
        }));
      }
    } catch (error) {
      console.error('Failed to submit petal collection:', error);
      // Re-add failed collections to try again
      pendingCollections.current.push(...collections);
    }

    lastSubmitTime.current = Date.now();
  }, []);

  // Collect a petal
  const collectPetal = useCallback(
    (petalId: number, value: number, x: number, y: number) => {
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
    [submitCollections],
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
