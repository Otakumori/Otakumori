/**
 * Petal Economy Integration
 * 
 * Connects petal collection to shop discounts, unlockables, and exclusive content
 */

export interface PetalReward {
  threshold: number;
  type: 'discount' | 'unlock' | 'exclusive' | 'badge';
  value: number | string;
  description: string;
  rewardId?: string; // For tracking which reward was claimed
}

/**
 * Petal reward thresholds
 * Users unlock rewards when they reach these petal milestones
 */
export const PETAL_REWARDS: PetalReward[] = [
  {
    threshold: 100,
    type: 'discount',
    value: 5,
    description: '5% off your next purchase',
  },
  {
    threshold: 500,
    type: 'unlock',
    value: 'exclusive-avatar',
    description: 'Unlock exclusive avatar',
  },
  {
    threshold: 1000,
    type: 'exclusive',
    value: 'early-access',
    description: 'Early access to new games',
  },
  {
    threshold: 2500,
    type: 'badge',
    value: 'petal-master',
    description: 'Petal Master badge',
  },
];

/**
 * Get the next reward a user can unlock based on their current petal count
 */
export function getNextReward(currentPetals: number): PetalReward | null {
  const sortedRewards = [...PETAL_REWARDS].sort((a, b) => a.threshold - b.threshold);
  return sortedRewards.find((reward) => currentPetals < reward.threshold) || null;
}

/**
 * Get all rewards a user has unlocked based on their current petal count
 */
export function getUnlockedRewards(currentPetals: number): PetalReward[] {
  return PETAL_REWARDS.filter((reward) => currentPetals >= reward.threshold);
}

/**
 * Get all rewards a user has not yet unlocked
 */
export function getLockedRewards(currentPetals: number): PetalReward[] {
  return PETAL_REWARDS.filter((reward) => currentPetals < reward.threshold);
}

/**
 * Check if a user has reached a specific reward threshold
 */
export function hasReachedThreshold(currentPetals: number, threshold: number): boolean {
  return currentPetals >= threshold;
}

/**
 * Get progress toward next reward (0-1)
 */
export function getRewardProgress(currentPetals: number): {
  progress: number;
  nextReward: PetalReward | null;
  petalsNeeded: number;
} {
  const nextReward = getNextReward(currentPetals);
  
  if (!nextReward) {
    // User has unlocked all rewards
    return {
      progress: 1,
      nextReward: null,
      petalsNeeded: 0,
    };
  }

  // Find the previous reward threshold (or 0 if this is the first reward)
  const sortedRewards = [...PETAL_REWARDS].sort((a, b) => a.threshold - b.threshold);
  const previousRewardIndex = sortedRewards.findIndex((r) => r.threshold === nextReward.threshold) - 1;
  const previousThreshold = previousRewardIndex >= 0 ? sortedRewards[previousRewardIndex].threshold : 0;

  const range = nextReward.threshold - previousThreshold;
  const progress = (currentPetals - previousThreshold) / range;
  const petalsNeeded = nextReward.threshold - currentPetals;

  return {
    progress: Math.min(1, Math.max(0, progress)),
    nextReward,
    petalsNeeded,
  };
}

