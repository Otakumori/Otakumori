/**
 * Petal Economy Tuning Configuration
 *
 * Central configuration for petal rewards, cosmetic prices, and discount vouchers.
 * Designed to feel rewarding without being grindy, competitive with big-brand loyalty programs.
 */

/**
 * Cosmetic price tiers (in petals)
 */
export const COSMETIC_PRICE_TIERS = {
  common: {
    min: 300,
    max: 600,
  },
  rare: {
    min: 1200,
    max: 2000,
  },
  legendary: {
    min: 3500,
    max: 5000,
  },
} as const;

/**
 * Per-run game rewards (per completed run)
 * Based on game duration and difficulty
 */
export const GAME_REWARD_RANGES = {
  short: {
    // 2-3 minute games
    // Tuned to ensure casual players (3-4 games/week) can afford at least one common cosmetic (300-600 petals)
    win: { min: 50, max: 90 },
    lose: { min: 20, max: 35 },
  },
  medium: {
    // 4-6 minute games
    win: { min: 100, max: 160 },
    lose: { min: 45, max: 75 },
  },
  long: {
    // Longer / more demanding games
    win: { min: 150, max: 240 },
    lose: { min: 75, max: 130 },
  },
} as const;

/**
 * Achievement petal rewards
 * Granted once per achievement per user
 */
export const ACHIEVEMENT_REWARD_TIERS = {
  small: 100, // "Try it once" achievements
  progress: { min: 250, max: 500 }, // Progress/skill achievements
  milestone: { min: 800, max: 1500 }, // Big milestone achievements
  ultra: { min: 2000, max: 3000 }, // Ultra/secret achievements
} as const;

/**
 * Discount voucher costs and values
 * Petals → shop discount vouchers
 */
export const DISCOUNT_VOUCHER_TIERS = {
  tier1: {
    percent: 5,
    costPetals: 1000,
    name: '5% Off Voucher',
  },
  tier2: {
    percent: 10,
    costPetals: 2200,
    name: '10% Off Voucher',
  },
  tier3: {
    percent: 15,
    costPetals: 4000,
    name: '15% Off Voucher',
    limitedTime: true, // May be limited-time only
  },
} as const;

/**
 * Game duration classification
 * Maps game IDs to their expected duration category
 */
export const GAME_DURATION_MAP: Record<string, 'short' | 'medium' | 'long'> = {
  'petal-samurai': 'short',
  'petal-storm-rhythm': 'medium',
  'memory-match': 'short',
  'bubble-girl': 'short',
  'puzzle-reveal': 'short',
  'otaku-beat-em-up': 'medium',
  'dungeon-of-desire': 'long',
  'thigh-coliseum': 'short',
  blossomware: 'short',
} as const;

/**
 * Calculate petal reward for a game completion
 *
 * @param gameId - Game identifier
 * @param didWin - Whether the player won/completed the run
 * @param score - Final score
 * @param metadata - Additional game metadata (combo, accuracy, etc.)
 * @returns Petal reward amount
 */
export function calculateGameReward(
  gameId: string,
  didWin: boolean,
  score: number,
  metadata?: {
    combo?: number;
    accuracy?: number;
    wavesCleared?: number;
    timeElapsed?: number;
    difficulty?: string;
    [key: string]: unknown;
  },
): number {
  // Determine game duration category
  const duration = GAME_DURATION_MAP[gameId] || 'short';
  const range = didWin ? GAME_REWARD_RANGES[duration].win : GAME_REWARD_RANGES[duration].lose;

  // Base reward from range
  let reward = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  // Performance bonuses (only for wins)
  if (didWin) {
    // Combo bonus (scaled)
    if (metadata?.combo && metadata.combo > 0) {
      const comboBonus = Math.min(Math.floor(metadata.combo / 10) * 2, 20); // Max +20 from combos
      reward += comboBonus;
    }

    // Accuracy bonus (for rhythm/precision games)
    if (metadata?.accuracy && metadata.accuracy > 0.8) {
      const accuracyBonus = Math.floor((metadata.accuracy - 0.8) * 100); // Up to +20 for 100% accuracy
      reward += accuracyBonus;
    }

    // Waves/stages cleared bonus
    if (metadata?.wavesCleared && metadata.wavesCleared > 0) {
      const wavesBonus = Math.min(metadata.wavesCleared * 3, 30); // Max +30 from waves
      reward += wavesBonus;
    }

    // Difficulty bonus
    if (metadata?.difficulty === 'hard') {
      reward += 15;
    } else if (metadata?.difficulty === 'medium') {
      reward += 5;
    }

    // Score-based bonus (small, to avoid score farming)
    const scoreBonus = Math.min(Math.floor(score / 1000) * 2, 10); // Max +10 from score
    reward += scoreBonus;
  }

  // Ensure reward stays within reasonable bounds
  const maxReward = range.max * 1.5; // Allow up to 50% bonus from performance
  return Math.min(Math.max(reward, range.min), maxReward);
}

/**
 * Get achievement petal reward based on achievement tier
 *
 * @param tier - Achievement tier
 * @returns Petal reward amount
 */
export function getAchievementReward(tier: keyof typeof ACHIEVEMENT_REWARD_TIERS): number {
  const config = ACHIEVEMENT_REWARD_TIERS[tier];

  if (typeof config === 'number') {
    return config;
  }

  // Range-based rewards
  return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
}

/**
 * Map achievement points to reward tier
 * Used to suggest reward amounts for achievements based on their point value
 *
 * @param points - Achievement points value
 * @returns Suggested reward tier
 */
export function getAchievementTierFromPoints(
  points: number,
): keyof typeof ACHIEVEMENT_REWARD_TIERS {
  if (points <= 25) {
    return 'small'; // "Try it once" achievements
  } else if (points <= 100) {
    return 'progress'; // Progress/skill achievements
  } else if (points <= 500) {
    return 'milestone'; // Big milestone achievements
  } else {
    return 'ultra'; // Ultra/secret achievements
  }
}

/**
 * Get achievement petal reward based on achievement points
 * Falls back to tier-based calculation if reward value is missing
 *
 * @param points - Achievement points value
 * @param existingReward - Existing reward value from database (if any)
 * @returns Petal reward amount
 */
export function getAchievementRewardFromPoints(
  points: number,
  existingReward?: number | null,
): number {
  // If existing reward is set and valid, use it (respects database values)
  if (existingReward && existingReward > 0) {
    return existingReward;
  }

  // Otherwise, calculate from points-based tier
  const tier = getAchievementTierFromPoints(points);
  return getAchievementReward(tier);
}

/**
 * Get discount configuration from environment variables
 * Returns defaults if env vars are not set
 * Safe to call on both server and client (client returns defaults)
 */
export async function getDiscountConfig() {
  // Client-side: return defaults
  if (typeof window !== 'undefined') {
    return {
      minOrderCents: 2000, // $20 default
      maxPercent: 15, // 15% default
      maxPerUserMonth: 3, // 3 per month default
    };
  }

  // Server-side: read from env
  try {
    // Use dynamic import to avoid require() in ES modules
    const envModule = await import('@/env');
    const env = envModule.env;
    return {
      minOrderCents: parseInt(env.PETAL_DISCOUNT_MIN_ORDER_CENTS || '2000', 10),
      maxPercent: parseInt(env.PETAL_DISCOUNT_MAX_PERCENT || '15', 10),
      maxPerUserMonth: parseInt(env.PETAL_DISCOUNT_MAX_PER_USER_MONTH || '3', 10),
    };
  } catch {
    // Fallback if env not available
    return {
      minOrderCents: 2000,
      maxPercent: 15,
      maxPerUserMonth: 3,
    };
  }
}
