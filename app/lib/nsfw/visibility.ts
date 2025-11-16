/**
 * NSFW Visibility Rules
 * 
 * Centralized logic for determining when NSFW content should be shown
 * to viewers based on their NSFW preferences and the content rating.
 */

import type { ContentRating } from './types';
import { getUserNSFWStatus } from './user';
import { db } from '@/app/lib/db';
import { shouldFilterNSFW } from './config';

export interface VisibilityContext {
  viewerUserId: string | null;
  contentRating: ContentRating;
  ownerNSFWEnabled?: boolean;
  ownerNSFWVisibility?: 'off' | 'on' | 'private';
}

/**
 * Determine if NSFW content should be shown to a viewer
 * 
 * Rules:
 * - Guest or NSFW off → return false (show SFW fallback)
 * - User with NSFW enabled → return true if rating matches their level
 * - Owner NSFW visibility 'private' → only show to NSFW-enabled viewers
 * - Global NSFW toggle disabled → return false for all NSFW content
 */
export async function shouldShowNSFWContent(
  context: VisibilityContext,
): Promise<boolean> {
  const { viewerUserId, contentRating, ownerNSFWEnabled, ownerNSFWVisibility } = context;

  // SFW content is always shown
  if (contentRating === 'sfw') {
    return true;
  }

  // If NSFW filtering is disabled globally, show all content
  if (!shouldFilterNSFW()) {
    return true;
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

  // Guest or no user → no NSFW access
  if (!viewerUserId) {
    return false;
  }

  // Get viewer's NSFW status
  const viewerStatus = await getUserNSFWStatus(viewerUserId);

  // Viewer must have NSFW enabled
  if (!viewerStatus.enabled) {
    return false;
  }

  // If owner has NSFW visibility set to 'private', only show to NSFW-enabled viewers
  // (which we've already checked above)
  if (ownerNSFWVisibility === 'private' && !viewerStatus.enabled) {
    return false;
  }

  // If owner has NSFW disabled, don't show their NSFW content
  if (ownerNSFWEnabled === false) {
    return false;
  }

  // Viewer has NSFW enabled and all checks passed
  return true;
}

/**
 * Client-side helper for checking NSFW visibility
 * Note: This is a best-effort check. Server-side validation is required for security.
 */
export function canViewNSFWClientSide(
  viewerNSFWEnabled: boolean,
  contentRating: ContentRating,
): boolean {
  if (contentRating === 'sfw') {
    return true;
  }

  return viewerNSFWEnabled;
}

