/**
 * Petal Challenges System
 *
 * Daily challenges that reward users with petals and achievements
 */

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: {
    petals: number;
    achievement?: string;
  };
  progress: number;
  expiresAt: Date;
  type: 'collect' | 'visit' | 'message' | 'game' | 'streak';
}

/**
 * Challenge definitions
 */
export const CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'progress' | 'expiresAt'>[] = [
  {
    id: 'collect_20_petals',
    title: 'Petal Collector',
    description: 'Collect 20 petals today',
    target: 20,
    reward: { petals: 50 },
    type: 'collect',
  },
  {
    id: 'visit_3_sections',
    title: 'Explorer',
    description: 'Visit 3 different sections',
    target: 3,
    reward: { petals: 30, achievement: 'explorer' },
    type: 'visit',
  },
  {
    id: 'leave_soapstone',
    title: 'Message Traveler',
    description: 'Leave a soapstone message',
    target: 1,
    reward: { petals: 25, achievement: 'soapstone_writer' },
    type: 'message',
  },
  {
    id: 'complete_game',
    title: 'Game Master',
    description: 'Complete a mini-game',
    target: 1,
    reward: { petals: 100 },
    type: 'game',
  },
];

/**
 * Generate daily challenges for a user
 */
export function generateDailyChallenges(): DailyChallenge[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Select 3 random challenges
  const selected = CHALLENGE_TEMPLATES.sort(() => Math.random() - 0.5).slice(0, 3);

  return selected.map((template) => ({
    ...template,
    progress: 0,
    expiresAt: tomorrow,
  }));
}

/**
 * Check if a challenge is completed
 */
export function isChallengeCompleted(challenge: DailyChallenge): boolean {
  return challenge.progress >= challenge.target;
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(
  challenge: DailyChallenge,
  increment: number,
): DailyChallenge {
  return {
    ...challenge,
    progress: Math.min(challenge.progress + increment, challenge.target),
  };
}
