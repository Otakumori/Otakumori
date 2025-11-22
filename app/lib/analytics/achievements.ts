/**
 * Achievement Analytics
 * 
 * Tracks achievement unlock events with PostHog and Sentry
 * Works in both client and server contexts
 */

import { trackEvent, trackUserAction } from '@/app/lib/monitoring';

// Safe PostHog import (client-side only)
function safePh(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    // Dynamic import for client-side only
    import('@/app/analytics/capture.safe').then(({ ph }) => {
      ph(event as any, props);
    }).catch(() => {
      // PostHog not available - skip silently
    });
  } catch {
    // PostHog not available - skip
  }
}

export interface AchievementUnlockEvent {
  achievementId: string;
  achievementCode: string;
  achievementName: string;
  points?: number;
  rarity?: string;
  rewardType?: string;
  rewardAmount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Track achievement unlock event
 */
export function trackAchievementUnlock(event: AchievementUnlockEvent) {
  const {
    achievementId,
    achievementCode,
    achievementName,
    points,
    rarity,
    rewardType,
    rewardAmount,
    metadata,
  } = event;

  // Track with PostHog (client-side only)
  safePh('achievement_unlocked', {
    achievement_id: achievementId,
    achievement_code: achievementCode,
    achievement_name: achievementName,
    points,
    rarity,
    reward_type: rewardType,
    reward_amount: rewardAmount,
    ...metadata,
  });

  // Track with Sentry/monitoring
  trackUserAction('achievement_unlocked', 'achievements', {
    achievementId,
    achievementCode,
    achievementName,
    points,
    rarity,
    rewardType,
    rewardAmount,
    timestamp: new Date().toISOString(),
    ...metadata,
  });

  // Track as custom event
  trackEvent('achievement_unlock', 'achievements', {
    achievementId,
    achievementCode,
    achievementName,
    points,
    rarity,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * Track achievement progress update
 */
export function trackAchievementProgress(
  achievementId: string,
  progress: number,
  total: number,
  metadata?: Record<string, unknown>,
) {
  const progressPercent = Math.round((progress / total) * 100);

  safePh('achievement_progress', {
    achievement_id: achievementId,
    progress,
    total,
    progress_percent: progressPercent,
    ...metadata,
  });

  trackEvent('achievement_progress', 'achievements', {
    achievementId,
    progress,
    total,
    progressPercent,
    ...metadata,
  });
}

