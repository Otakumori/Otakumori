/**
 * Petal Economy System
 *
 * Pure functions for Petal (currency) calculations, earning mechanics,
 * spending validation, cooldowns, and economy balance.
 */

export interface PetalTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: PetalReason;
  gameId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export type PetalReason =
  // Earning reasons
  | 'game_completion'
  | 'game_reward'
  | 'daily_bonus'
  | 'achievement_unlock'
  | 'streak_bonus'
  | 'perfect_score'
  | 'first_play'
  | 'challenge_win'
  | 'leaderboard_rank'
  // Spending reasons
  | 'cosmetic_unlock'
  | 'power_up'
  | 'extra_life'
  | 'hint_purchase'
  | 'speed_boost'
  | 'unlock_level'
  | 'game_feature';

export interface PetalBalance {
  total: number;
  earned: number;
  spent: number;
  pending: number;
  lastUpdated: Date;
}

export interface EarningConfig {
  baseAmount: number;
  multipliers: {
    difficulty: Record<string, number>;
    streak: number[];
    perfect: number;
    firstPlay: number;
    dailyBonus: number;
  };
  caps: {
    perSession: number;
    perDay: number;
    perGame: number;
  };
  cooldowns: {
    sameGame: number; // milliseconds
    dailyBonus: number;
  };
}

export interface SpendingConfig {
  items: Record<
    string,
    {
      cost: number;
      category: 'cosmetic' | 'gameplay' | 'unlock';
      description: string;
      cooldown?: number;
    }
  >;
  discounts: {
    bulk: Record<number, number>; // quantity -> discount %
    loyalty: Record<number, number>; // days active -> discount %
  };
}

// Default economy configuration
export const DEFAULT_EARNING_CONFIG: EarningConfig = {
  baseAmount: 10,
  multipliers: {
    difficulty: {
      easy: 0.8,
      normal: 1.0,
      hard: 1.3,
      expert: 1.6,
    },
    streak: [1.0, 1.1, 1.2, 1.3, 1.5, 2.0], // streak length -> multiplier
    perfect: 1.5,
    firstPlay: 2.0,
    dailyBonus: 3.0,
  },
  caps: {
    perSession: 200,
    perDay: 1000,
    perGame: 500,
  },
  cooldowns: {
    sameGame: 5 * 60 * 1000, // 5 minutes
    dailyBonus: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export const DEFAULT_SPENDING_CONFIG: SpendingConfig = {
  items: {
    // Cosmetics
    custom_cursor: { cost: 50, category: 'cosmetic', description: 'Custom cursor design' },
    card_back: { cost: 100, category: 'cosmetic', description: 'Custom card back' },
    game_theme: { cost: 150, category: 'cosmetic', description: 'Alternate game theme' },

    // Gameplay
    extra_life: { cost: 25, category: 'gameplay', description: 'Extra life in current game' },
    hint: { cost: 15, category: 'gameplay', description: 'Reveal a hint', cooldown: 30000 },
    speed_boost: { cost: 30, category: 'gameplay', description: '10 second speed boost' },

    // Unlocks
    bonus_level: { cost: 200, category: 'unlock', description: 'Unlock bonus level' },
    difficulty_mode: { cost: 300, category: 'unlock', description: 'Unlock hard mode' },
  },
  discounts: {
    bulk: { 5: 0.1, 10: 0.15, 20: 0.25 }, // 10%, 15%, 25% off
    loyalty: { 7: 0.05, 30: 0.1, 90: 0.15 }, // 5%, 10%, 15% off
  },
};

/**
 * Calculate petals earned for a game completion
 */
export function calculateEarning(
  baseScore: number,
  options: {
    difficulty?: string;
    streakLength?: number;
    isPerfect?: boolean;
    isFirstPlay?: boolean;
    isDailyBonus?: boolean;
    gameId?: string;
  } = {},
  config: EarningConfig = DEFAULT_EARNING_CONFIG,
): { amount: number; breakdown: Record<string, number> } {
  const {
    difficulty = 'normal',
    streakLength = 0,
    isPerfect = false,
    isFirstPlay = false,
    isDailyBonus = false,
  } = options;

  let amount = config.baseAmount;
  const breakdown: Record<string, number> = { base: amount };

  // Apply difficulty multiplier
  const diffMultiplier = config.multipliers.difficulty[difficulty] || 1.0;
  if (diffMultiplier !== 1.0) {
    const bonus = amount * (diffMultiplier - 1);
    amount += bonus;
    breakdown.difficulty = bonus;
  }

  // Apply streak bonus
  if (streakLength > 0) {
    const streakIndex = Math.min(streakLength - 1, config.multipliers.streak.length - 1);
    const streakMultiplier = config.multipliers.streak[streakIndex] || 1.0;
    if (streakMultiplier > 1.0) {
      const bonus = amount * (streakMultiplier - 1);
      amount += bonus;
      breakdown.streak = bonus;
    }
  }

  // Apply perfect score bonus
  if (isPerfect) {
    const bonus = amount * (config.multipliers.perfect - 1);
    amount += bonus;
    breakdown.perfect = bonus;
  }

  // Apply first play bonus
  if (isFirstPlay) {
    const bonus = amount * (config.multipliers.firstPlay - 1);
    amount += bonus;
    breakdown.firstPlay = bonus;
  }

  // Apply daily bonus
  if (isDailyBonus) {
    const bonus = amount * (config.multipliers.dailyBonus - 1);
    amount += bonus;
    breakdown.dailyBonus = bonus;
  }

  return { amount: Math.floor(amount), breakdown };
}

/**
 * Validate if a spending transaction is allowed
 */
export function validateSpending(
  itemId: string,
  quantity: number,
  currentBalance: number,
  userLoyaltyDays: number = 0,
  config: SpendingConfig = DEFAULT_SPENDING_CONFIG,
): { valid: boolean; cost: number; savings?: number; error?: string } {
  const item = config.items[itemId];
  if (!item) {
    return { valid: false, cost: 0, error: 'Item not found' };
  }

  // Calculate base cost
  let totalCost = item.cost * quantity;

  // Apply bulk discount
  let savings = 0;
  for (const [minQty, discount] of Object.entries(config.discounts.bulk)) {
    if (quantity >= parseInt(minQty)) {
      savings = Math.max(savings, totalCost * discount);
    }
  }

  // Apply loyalty discount
  for (const [minDays, discount] of Object.entries(config.discounts.loyalty)) {
    if (userLoyaltyDays >= parseInt(minDays)) {
      const loyaltySavings = totalCost * discount;
      savings = Math.max(savings, loyaltySavings);
    }
  }

  const finalCost = Math.ceil(totalCost - savings);

  if (currentBalance < finalCost) {
    return {
      valid: false,
      cost: finalCost,
      savings,
      error: `Insufficient petals. Need ${finalCost}, have ${currentBalance}`,
    };
  }

  return { valid: true, cost: finalCost, savings };
}

/**
 * Check if a cooldown has expired
 */
export function isCooldownExpired(lastTransactionTime: Date, cooldownMs: number): boolean {
  const now = new Date();
  const timeSince = now.getTime() - lastTransactionTime.getTime();
  return timeSince >= cooldownMs;
}

/**
 * Get remaining cooldown time in milliseconds
 */
export function getRemainingCooldown(lastTransactionTime: Date, cooldownMs: number): number {
  const now = new Date();
  const elapsed = now.getTime() - lastTransactionTime.getTime();
  return Math.max(0, cooldownMs - elapsed);
}

/**
 * Apply daily earning cap
 */
export function applyDailyCap(
  earnedToday: number,
  newEarning: number,
  dailyCap: number = DEFAULT_EARNING_CONFIG.caps.perDay,
): { amount: number; capped: boolean } {
  const total = earnedToday + newEarning;
  if (total > dailyCap) {
    const cappedAmount = Math.max(0, dailyCap - earnedToday);
    return { amount: cappedAmount, capped: true };
  }
  return { amount: newEarning, capped: false };
}

/**
 * Calculate streak bonus eligibility
 */
export function calculateStreakBonus(
  consecutivePlays: number,
  config: EarningConfig = DEFAULT_EARNING_CONFIG,
): number {
  if (consecutivePlays <= 0) return 1.0;

  const index = Math.min(consecutivePlays - 1, config.multipliers.streak.length - 1);
  return config.multipliers.streak[index] || 1.0;
}

/**
 * Format petal amount for display
 */
export function formatPetals(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

/**
 * Generate a transaction ID
 */
export function generateTransactionId(): string {
  return `petal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate transaction data
 */
export function validateTransaction(transaction: Partial<PetalTransaction>): string[] {
  const errors: string[] = [];

  if (!transaction.userId) errors.push('User ID is required');
  if (!transaction.type || !['earn', 'spend'].includes(transaction.type)) {
    errors.push('Valid transaction type is required');
  }
  if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  if (!transaction.reason) errors.push('Reason is required');

  return errors;
}

/**
 * Validate earning request parameters
 */
export function validateEarning(config: {
  baseAmount: number;
  source: string;
  sourceId?: string;
  metadata?: any;
  dailyCap: number;
  cooldownMs: number;
  maxMultiplier: number;
}): { valid: boolean; reason?: string } {
  const { baseAmount, source, dailyCap, maxMultiplier } = config;

  // Check amount bounds
  if (baseAmount <= 0) {
    return { valid: false, reason: 'Amount must be positive' };
  }

  // Check against max multiplier cap
  if (baseAmount > maxMultiplier * 100) {
    return { valid: false, reason: `Amount exceeds max multiplier cap (${maxMultiplier}x base)` };
  }

  if (baseAmount > dailyCap) {
    return { valid: false, reason: 'Amount exceeds daily cap' };
  }

  // Check source validity
  const validSources = [
    'game_completion',
    'achievement_unlock',
    'daily_login',
    'streak_bonus',
    'perfect_score',
    'community_activity',
    'special_event',
    'admin_grant',
  ];

  if (!validSources.includes(source)) {
    return { valid: false, reason: 'Invalid earning source' };
  }

  return { valid: true };
}

/**
 * Calculate economy health metrics
 */
export function calculateEconomyMetrics(transactions: PetalTransaction[]): {
  totalEarned: number;
  totalSpent: number;
  circulation: number;
  topEarners: string[];
  topSpenders: string[];
  inflationRate: number;
} {
  const earned = transactions
    .filter((t) => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);
  const spent = transactions
    .filter((t) => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);

  const userEarnings = new Map<string, number>();
  const userSpendings = new Map<string, number>();

  transactions.forEach((t) => {
    if (t.type === 'earn') {
      userEarnings.set(t.userId, (userEarnings.get(t.userId) || 0) + t.amount);
    } else {
      userSpendings.set(t.userId, (userSpendings.get(t.userId) || 0) + t.amount);
    }
  });

  const topEarners = Array.from(userEarnings.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userId]) => userId);

  const topSpenders = Array.from(userSpendings.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userId]) => userId);

  return {
    totalEarned: earned,
    totalSpent: spent,
    circulation: earned - spent,
    topEarners,
    topSpenders,
    inflationRate: earned > 0 ? (earned - spent) / earned : 0,
  };
}

/**
 * Credit petals to a user
 * Alias for backwards compatibility
 */
export async function creditPetals(
  userId: string,
  amount: number,
  reason: PetalReason,
  metadata?: Record<string, any>,
): Promise<{ success: boolean; newBalance: number }> {
  // This should use the petal-wallet service
  // For now, providing a stub that other code can import
  throw new Error('creditPetals should use petal-wallet service. Use lib/petal-wallet.ts instead.');
}