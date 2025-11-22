/**
 * Effective Feature Flags Server Helper
 * 
 * Combines static defaults from config/featureFlags.ts with DB overrides.
 * This is the single source of truth for feature flags on the server.
 */

import { getFeatureFlags as getStaticFeatureFlags, type FeatureFlags } from '@/config/featureFlags';
import { getSiteSettingsMap } from './siteSettings.server';

export type EffectiveFeatureFlags = FeatureFlags;

/**
 * Get effective feature flags (static defaults + DB overrides)
 * 
 * This merges:
 * 1. Static defaults from config/featureFlags.ts
 * 2. DB overrides from SiteSetting table
 * 
 * DB overrides take precedence over static defaults.
 */
export async function getEffectiveFeatureFlags(): Promise<EffectiveFeatureFlags> {
  // Get static defaults
  const staticFlags = getStaticFeatureFlags();
  
  // Get DB overrides
  const settingsMap = await getSiteSettingsMap();
  
  // Merge: DB overrides take precedence
  return {
    AVATARS_ENABLED: settingsMap.AVATARS_ENABLED?.boolValue ?? staticFlags.AVATARS_ENABLED,
    REQUIRE_AUTH_FOR_MINI_GAMES:
      settingsMap.REQUIRE_AUTH_FOR_MINI_GAMES?.boolValue ?? staticFlags.REQUIRE_AUTH_FOR_MINI_GAMES,
    NSFW_AVATARS_ENABLED:
      settingsMap.NSFW_AVATARS_ENABLED?.boolValue ?? staticFlags.NSFW_AVATARS_ENABLED,
    HOMEPAGE_EXPERIMENTAL_ENABLED:
      settingsMap.HOMEPAGE_EXPERIMENTAL_ENABLED?.boolValue ?? staticFlags.HOMEPAGE_EXPERIMENTAL_ENABLED,
  };
}

/**
 * Get a single effective feature flag
 */
export async function getEffectiveFeatureFlag<K extends keyof EffectiveFeatureFlags>(
  key: K,
): Promise<EffectiveFeatureFlags[K]> {
  const flags = await getEffectiveFeatureFlags();
  return flags[key];
}

