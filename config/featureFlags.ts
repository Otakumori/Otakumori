/**
 * Centralized Feature Flags Configuration
 * Resolves from environment variables with safe defaults
 * Integrates with avatar-engine flags for single source of truth
 * On server-side, uses DB overrides via getEffectiveFeatureFlags()
 */

import { z } from 'zod';
import { env } from '@/env.mjs';
import {
  isAvatarsEnabled as isAvatarEngineEnabled,
  isNsfwAvatarsEnabled as isNsfwEngineEnabled,
} from '@om/avatar-engine/config/flags';

export interface FeatureFlags {
  AVATARS_ENABLED: boolean;
  REQUIRE_AUTH_FOR_MINI_GAMES: boolean;
  NSFW_AVATARS_ENABLED: boolean;
  HOMEPAGE_EXPERIMENTAL_ENABLED: boolean;
}

/**
 * Helper to convert env string to boolean with safe defaults
 */
function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

let cachedFlags: FeatureFlags | null = null;
let serverFlagsPromise: Promise<FeatureFlags> | null = null;

/**
 * Resolve feature flags from environment variables
 * Always resolves from env first, then falls back to defaults
 * Does not crash builds if env vars are absent
 * On server-side, uses DB overrides when available
 */
function resolveFeatureFlags(): FeatureFlags {
  // Server-side: try to use DB-backed effective flags
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    // Use effective flags from server helper (includes DB overrides)
    if (!serverFlagsPromise) {
      serverFlagsPromise = (async () => {
        try {
          const { getEffectiveFeatureFlags } = await import('@/app/lib/config/featureFlags.server');
          return await getEffectiveFeatureFlags();
        } catch (error) {
          // Fallback to env-based if server helper fails (e.g., during build)
          console.warn('Failed to load effective feature flags, using env defaults:', error);
          return resolveFromEnv();
        }
      })();
    }
    // For sync calls, return cached or fallback to env
    // Note: This means server-side sync calls will use env, async calls will use DB
    if (cachedFlags) {
      return cachedFlags;
    }
    // Return env-based for now (caller should use async getEffectiveFeatureFlags() for DB overrides)
    return resolveFromEnv();
  }

  // Client-side: use env/avatar-engine resolution
  if (cachedFlags) {
    return cachedFlags;
  }

  cachedFlags = resolveFromEnv();
  return cachedFlags;
}

/**
 * Resolve flags from environment variables (fallback/default behavior)
 * Uses Zod-validated env from env.mjs for type safety
 */
function resolveFromEnv(): FeatureFlags {
  // Resolve AVATARS_ENABLED from env or avatar-engine
  const envAvatarsEnabled =
    typeof process !== 'undefined' && process.env
      ? toBool(process.env.NEXT_PUBLIC_FEATURE_AVATARS_ENABLED, true)
      : true; // Default: true for dev

  // Use avatar-engine resolution if available (handles client-side flags)
  const avatarsEnabled =
    typeof window !== 'undefined' ? isAvatarEngineEnabled() : envAvatarsEnabled;

  // Resolve REQUIRE_AUTH_FOR_MINI_GAMES from validated env
  const requireAuth = toBool(
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_FEATURE_REQUIRE_AUTH_FOR_MINI_GAMES
      : undefined,
    false, // Default: false (guests can play)
  );

  // Resolve NSFW_AVATARS_ENABLED from env or avatar-engine
  const envNsfwEnabled = toBool(
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_FEATURE_NSFW_AVATARS_ENABLED
      : undefined,
    false, // Default: false
  );

  // Use avatar-engine resolution if available
  const nsfwEnabled = typeof window !== 'undefined' ? isNsfwEngineEnabled() : envNsfwEnabled;

  // Resolve HOMEPAGE_EXPERIMENTAL_ENABLED from validated env
  // Defaults to false in production, true in development for safety
  const homepageExperimental = toBool(
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_FEATURE_HOMEPAGE_EXPERIMENTAL_ENABLED
      : undefined,
    process.env.NODE_ENV === 'development', // Safe default: off in production
  );

  return {
    AVATARS_ENABLED: avatarsEnabled,
    REQUIRE_AUTH_FOR_MINI_GAMES: requireAuth,
    NSFW_AVATARS_ENABLED: nsfwEnabled,
    HOMEPAGE_EXPERIMENTAL_ENABLED: homepageExperimental,
  };
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
 * Get HOMEPAGE_EXPERIMENTAL_ENABLED flag
 */
export function isHomepageExperimentalEnabled(): boolean {
  return resolveFeatureFlags().HOMEPAGE_EXPERIMENTAL_ENABLED;
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
  get HOMEPAGE_EXPERIMENTAL_ENABLED() {
    return isHomepageExperimentalEnabled();
  },
};
