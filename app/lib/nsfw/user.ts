/**
 * NSFW User Helpers
 * 
 * Server-side helpers for managing user NSFW preferences and status.
 */

import { db } from '@/app/lib/db';
import type { ContentRating, NSFWVisibility } from './types';

export interface UserNSFWStatus {
  enabled: boolean;
  visibility: NSFWVisibility;
  verifiedAt: Date | null;
}

/**
 * Get user's NSFW status
 */
export async function getUserNSFWStatus(userId: string): Promise<UserNSFWStatus> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      nsfwEnabled: true,
      nsfwAffirmedAt: true,
    },
  });

  if (!user) {
    // Default to disabled if user not found
    return {
      enabled: false,
      visibility: 'off',
      verifiedAt: null,
    };
  }

  // Map nsfwEnabled to visibility
  // For now, visibility is inferred from nsfwEnabled
  // Future: add explicit nsfwVisibility field to schema
  const visibility: NSFWVisibility = user.nsfwEnabled ? 'on' : 'off';

  return {
    enabled: user.nsfwEnabled,
    visibility,
    verifiedAt: user.nsfwAffirmedAt || null,
  };
}

/**
 * Set user's NSFW enabled status
 */
export async function setUserNSFWEnabled(
  userId: string,
  enabled: boolean,
  verifiedAt?: Date,
): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      nsfwEnabled: enabled,
      nsfwAffirmedAt: verifiedAt || (enabled ? new Date() : null),
      nsfwAffirmationVer: enabled ? 1 : 0,
    },
  });
}

/**
 * Check if user can access NSFW content of a given rating
 */
export async function canAccessNSFWContent(
  userId: string | null,
  rating: ContentRating,
): Promise<boolean> {
  // SFW content is always accessible
  if (rating === 'sfw') {
    return true;
  }

  // No user = no NSFW access
  if (!userId) {
    return false;
  }

  // Get user's NSFW status
  const status = await getUserNSFWStatus(userId);

  // User must have NSFW enabled
  if (!status.enabled) {
    return false;
  }

  // Check global NSFW setting
  const globalSetting = await db.siteSetting.findUnique({
    where: { key: 'nsfw_global_enabled' },
    select: { boolValue: true },
  });

  const globalEnabled = globalSetting?.boolValue ?? true;
  if (!globalEnabled) {
    return false;
  }

  // For now, if NSFW is enabled, allow all NSFW ratings
  // Future: could add rating-level restrictions
  return true;
}

