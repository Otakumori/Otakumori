/**
 * Centralized Feature Flags Configuration
 * Resolves from environment variables with safe defaults
 * Integrates with avatar-engine flags for single source of truth
 */

import { isAvatarsEnabled as isAvatarEngineEnabled, isNsfwAvatarsEnabled as isNsfwEngineEnabled } from '@om/avatar-engine/config/flags';

export interface FeatureFlags {
  AVATARS_ENABLED: boolean;
  REQUIRE_AUTH_FOR_MINI_GAMES: boolean;
  NSFW_AVATARS_ENABLED: boolean;
}

let cachedFlags: FeatureFlags | null = null;

/**
 * Resolve feature flags from environment variables
 * Always resolves from env first, then falls back to defaults
 * Does not crash builds if env vars are absent
 */
function resolveFeatureFlags(): FeatureFlags {
  if (cachedFlags) {
    return cachedFlags;
  }

  // Resolve AVATARS_ENABLED from env or avatar-engine
  const envAvatarsEnabled =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_AVATARS_ENABLED !== 'false'
      : true; // Default: true for dev

  // Use avatar-engine resolution if available (handles client-side flags)
  const avatarsEnabled = typeof window !== 'undefined' ? isAvatarEngineEnabled() : envAvatarsEnabled;

  // Resolve REQUIRE_AUTH_FOR_MINI_GAMES
  const requireAuth =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_REQUIRE_AUTH_FOR_MINI_GAMES === 'true'
      : false; // Default: false (guests can play)

  // Resolve NSFW_AVATARS_ENABLED from env or avatar-engine
  const envNsfwEnabled =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_NSFW_AVATARS_ENABLED === 'true'
      : false; // Default: false

  // Use avatar-engine resolution if available
  const nsfwEnabled = typeof window !== 'undefined' ? isNsfwEngineEnabled() : envNsfwEnabled;

  cachedFlags = {
    AVATARS_ENABLED: avatarsEnabled,
    REQUIRE_AUTH_FOR_MINI_GAMES: requireAuth,
    NSFW_AVATARS_ENABLED: nsfwEnabled,
  };

  return cachedFlags;
}

/**
 * Get all feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  return resolveFeatureFlags();
}

/**
 * Get AVATARS_ENABLED flag
 */
export function isAvatarsEnabled(): boolean {
  return resolveFeatureFlags().AVATARS_ENABLED;
}

/**
 * Get REQUIRE_AUTH_FOR_MINI_GAMES flag
 */
export function requireAuthForMiniGames(): boolean {
  return resolveFeatureFlags().REQUIRE_AUTH_FOR_MINI_GAMES;
}

/**
 * Get NSFW_AVATARS_ENABLED flag
 */
export function isNsfwAvatarsEnabled(): boolean {
  return resolveFeatureFlags().NSFW_AVATARS_ENABLED;
}

/**
 * Clear cached flags (useful for testing)
 */
export function clearFlagsCache(): void {
  cachedFlags = null;
}

/**
 * Feature flags object (for direct access)
 * Use getFeatureFlags() or individual getters instead
 */
export const featureFlags: FeatureFlags = {
  get AVATARS_ENABLED() {
    return isAvatarsEnabled();
  },
  get REQUIRE_AUTH_FOR_MINI_GAMES() {
    return requireAuthForMiniGames();
  },
  get NSFW_AVATARS_ENABLED() {
    return isNsfwAvatarsEnabled();
  },
};

