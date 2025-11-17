/**
 * Petal Streak Tracking
 * 
 * Tracks daily collection streaks and provides multiplier bonuses
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCollectionDate: Date | null;
  streakMultiplier: number;
}

/**
 * Calculate streak multiplier based on streak length
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 1.10; // 10% bonus for 30+ days
  if (streakDays >= 7) return 1.05; // 5% bonus for 7+ days
  return 1.0; // No bonus for < 7 days
}

/**
 * Calculate streak from last collection date
 */
export function calculateStreak(lastCollectionDate: Date | null, currentStreak: number): {
  newStreak: number;
  multiplier: number;
  isNewDay: boolean;
} {
  if (!lastCollectionDate) {
    return {
      newStreak: 1,
      multiplier: 1.0,
      isNewDay: true,
    };
  }

  const now = new Date();
  const lastDate = new Date(lastCollectionDate);
  
  // Reset to midnight for comparison
  now.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Same day - streak continues
    return {
      newStreak: currentStreak,
      multiplier: getStreakMultiplier(currentStreak),
      isNewDay: false,
    };
  } else if (daysDiff === 1) {
    // Consecutive day - increment streak
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      multiplier: getStreakMultiplier(newStreak),
      isNewDay: true,
    };
  } else {
    // Streak broken - reset to 1
    return {
      newStreak: 1,
      multiplier: 1.0,
      isNewDay: true,
    };
  }
}

/**
 * Calculate recovery cost to restore a broken streak
 */
export function getStreakRecoveryCost(brokenStreak: number): number {
  // Cost increases with streak length
  // 1-7 days: 50 petals per day
  // 8-30 days: 100 petals per day
  // 31+ days: 200 petals per day
  if (brokenStreak <= 7) {
    return brokenStreak * 50;
  } else if (brokenStreak <= 30) {
    return 7 * 50 + (brokenStreak - 7) * 100;
  } else {
    return 7 * 50 + 23 * 100 + (brokenStreak - 30) * 200;
  }
}

