/**
 * Season Detection & Admin Override System
 * Determines petal color based on current season or admin override
 */

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface PetalColorConfig {
  season: Season;
  color: string;
  name: string;
}

const SEASON_COLORS: Record<Season, PetalColorConfig> = {
  spring: { season: 'spring', color: '#FFC0CB', name: 'Pink' },
  summer: { season: 'summer', color: '#90EE90', name: 'Light Green' },
  fall: { season: 'fall', color: '#FFA500', name: 'Orange' },
  winter: { season: 'winter', color: '#E0E0E0', name: 'White' },
};

/**
 * Determines current season based on month
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter'; // December, January, February
}

/**
 * Gets petal color admin override from environment
 * Safe for client-side use with NEXT_PUBLIC_ prefix
 */
function getColorOverride(): string | undefined {
  // Next.js inlines NEXT_PUBLIC_ variables at build time
  // This is client-side only, so we access it safely
  if (typeof window === 'undefined') return undefined;
  
  // For NEXT_PUBLIC_ variables, direct access is required for proper tree-shaking
  // eslint-disable-next-line n/no-process-env, no-restricted-syntax
  return process.env.NEXT_PUBLIC_PETAL_COLOR_OVERRIDE;
}

/**
 * Gets petal color with admin override support
 * Priority: Admin Override > Current Season
 */
export function getPetalColor(): string {
  // Check for admin override
  const override = getColorOverride();

  if (override && /^#[0-9A-Fa-f]{6}$/.test(override)) {
    return override;
  }

  // Fall back to seasonal detection
  const season = getCurrentSeason();
  return SEASON_COLORS[season].color;
}

/**
 * Gets full petal color configuration
 */
export function getPetalColorConfig(): PetalColorConfig {
  const override = getColorOverride();

  if (override && /^#[0-9A-Fa-f]{6}$/.test(override)) {
    return {
      season: getCurrentSeason(),
      color: override,
      name: 'Custom',
    };
  }

  const season = getCurrentSeason();
  return SEASON_COLORS[season];
}
