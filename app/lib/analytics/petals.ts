/**
 * Petal Collection Analytics
 *
 * Tracks petal collection events with PostHog and Sentry
 * Works in both client and server contexts
 */

import { Events } from '@/app/analytics/events.safe';
import { trackEvent, trackUserAction } from '@/app/lib/monitoring';

// Safe PostHog import (client-side only)
function safePh(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    // Dynamic import for client-side only
    import('@/app/analytics/capture.safe')
      .then(({ ph }) => {
        ph(event as any, props);
      })
      .catch(() => {
        // PostHog not available - skip silently
      });
  } catch {
    // PostHog not available - skip
  }
}

export interface PetalCollectionEvent {
  petalId: number | string;
  amount: number;
  source: string;
  location?: {
    x: number;
    y: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Track petal collection event
 */
export function trackPetalCollection(event: PetalCollectionEvent) {
  const { petalId, amount, source, location, metadata } = event;

  // Track with PostHog (client-side only)
  safePh(Events.PetalsCollected, {
    petal_id: petalId,
    amount,
    source,
    location_x: location?.x,
    location_y: location?.y,
    ...metadata,
  });

  // Track with Sentry/monitoring
  trackUserAction('petal_collected', 'petals', {
    petalId,
    amount,
    source,
    location,
    ...metadata,
  });

  // Track as custom event
  trackEvent('petal_collection', 'petals', {
    petalId,
    amount,
    source,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * Track petal milestone (e.g., 100 petals collected)
 */
export function trackPetalMilestone(milestone: number, totalPetals: number, source?: string) {
  safePh('petal_milestone_reached', {
    milestone,
    total_petals: totalPetals,
    source,
  });

  trackUserAction('petal_milestone', 'petals', {
    milestone,
    totalPetals,
    source,
  });
}

/**
 * Track petal spending
 */
export function trackPetalSpending(
  amount: number,
  item: string,
  metadata?: Record<string, unknown>,
) {
  safePh('petals_spent', {
    amount,
    item,
    ...metadata,
  });

  trackUserAction('petal_spent', 'petals', {
    amount,
    item,
    ...metadata,
  });
}
