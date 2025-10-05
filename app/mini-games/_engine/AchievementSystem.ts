'use client';

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'score' | 'combo' | 'time' | 'collection' | 'special' | 'social';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  hidden: boolean;
  gameId?: string; // Specific to a game, or undefined for global
}

export interface AchievementRequirement {
  type:
    | 'score'
    | 'combo'
    | 'time'
    | 'kills'
    | 'collect'
    | 'complete'
    | 'streak'
    | 'perfect'
    | 'custom';
  value: number;
  operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
  gameId?: string;
  metadata?: Record<string, any>;
}

export interface AchievementReward {
  type: 'petals' | 'runes' | 'avatar' | 'title' | 'badge' | 'unlock' | 'custom';
  value: number | string;
  metadata?: Record<string, any>;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  max: number;
  percentage: number;
  unlocked: boolean;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  locked: number;
  byCategory: Record<string, number>;
  byRarity: Record<string, number>;
  totalPoints: number;
  unlockedPoints: number;
}

// Achievement System Class
export class AchievementSystem {
  private achievements: Map<string, Achievement> = new Map();
  private progress: Map<string, number> = new Map();
  private unlocked: Set<string> = new Set();
  private stats: Map<string, number> = new Map();

  private onUnlock?: (achievement: Achievement) => void;
  private onProgress?: (achievementId: string, progress: number, max: number) => void;

  constructor() {
    this.initializeDefaultAchievements();
  }

  // Initialize default achievements
  private initializeDefaultAchievements(): void {
    const defaultAchievements: Achievement[] = [
      // Score Achievements
      {
        id: 'first_score',
        name: 'First Steps',
        description: 'Score your first point',
        icon: '🌟',
        category: 'score',
        rarity: 'common',
        points: 10,
        requirements: [{ type: 'score', value: 1, operator: 'gte' }],
        rewards: [{ type: 'petals', value: 10 }],
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        hidden: false,
      },
      {
        id: 'score_master',
        name: 'Score Master',
        description: 'Reach 10,000 points in a single game',
        icon: '💯',
        category: 'score',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'score', value: 10000, operator: 'gte' }],
        rewards: [
          { type: 'petals', value: 100 },
          { type: 'title', value: 'Score Master' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 10000,
        hidden: false,
      },
      {
        id: 'score_legend',
        name: 'Score Legend',
        description: 'Reach 100,000 points in a single game',
        icon: '👑',
        category: 'score',
        rarity: 'legendary',
        points: 500,
        requirements: [{ type: 'score', value: 100000, operator: 'gte' }],
        rewards: [
          { type: 'petals', value: 500 },
          { type: 'title', value: 'Score Legend' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 100000,
        hidden: false,
      },

      // Combo Achievements
      {
        id: 'combo_starter',
        name: 'Combo Starter',
        description: 'Achieve a 5x combo',
        icon: '🔥',
        category: 'combo',
        rarity: 'common',
        points: 25,
        requirements: [{ type: 'combo', value: 5, operator: 'gte' }],
        rewards: [{ type: 'petals', value: 25 }],
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        hidden: false,
      },
      {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Achieve a 50x combo',
        icon: '⚡',
        category: 'combo',
        rarity: 'epic',
        points: 200,
        requirements: [{ type: 'combo', value: 50, operator: 'gte' }],
        rewards: [
          { type: 'petals', value: 200 },
          { type: 'title', value: 'Combo Master' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        hidden: false,
      },

      // Time Achievements
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a level in under 30 seconds',
        icon: '⚡',
        category: 'time',
        rarity: 'uncommon',
        points: 50,
        requirements: [{ type: 'time', value: 30, operator: 'lte' }],
        rewards: [{ type: 'petals', value: 50 }],
        unlocked: false,
        progress: 0,
        maxProgress: 30,
        hidden: false,
      },
      {
        id: 'marathon_runner',
        name: 'Marathon Runner',
        description: 'Play for 2 hours straight',
        icon: '🏃',
        category: 'time',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'time', value: 7200, operator: 'gte' }],
        rewards: [
          { type: 'petals', value: 150 },
          { type: 'title', value: 'Marathon Runner' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 7200,
        hidden: false,
      },

      // Collection Achievements
      {
        id: 'collector',
        name: 'Collector',
        description: 'Collect 100 items',
        icon: '📦',
        category: 'collection',
        rarity: 'uncommon',
        points: 75,
        requirements: [{ type: 'collect', value: 100, operator: 'gte' }],
        rewards: [{ type: 'petals', value: 75 }],
        unlocked: false,
        progress: 0,
        maxProgress: 100,
        hidden: false,
      },
      {
        id: 'hoarder',
        name: 'Hoarder',
        description: 'Collect 1,000 items',
        icon: '🏰',
        category: 'collection',
        rarity: 'epic',
        points: 300,
        requirements: [{ type: 'collect', value: 1000, operator: 'gte' }],
        rewards: [
          { type: 'petals', value: 300 },
          { type: 'title', value: 'Hoarder' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 1000,
        hidden: false,
      },

      // Special Achievements
      {
        id: 'perfect_game',
        name: 'Perfect Game',
        description: 'Complete a game without any mistakes',
        icon: '✨',
        category: 'special',
        rarity: 'legendary',
        points: 1000,
        requirements: [{ type: 'perfect', value: 1, operator: 'gte' }],
        rewards: [
          { type: 'petals', value: 1000 },
          { type: 'title', value: 'Perfect' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        hidden: false,
      },
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Make your first kill',
        icon: '🗡️',
        category: 'special',
        rarity: 'common',
        points: 20,
        requirements: [{ type: 'kills', value: 1, operator: 'gte' }],
        rewards: [{ type: 'petals', value: 20 }],
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        hidden: false,
      },

      // Social Achievements
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Play with 10 different friends',
        icon: '🦋',
        category: 'social',
        rarity: 'rare',
        points: 200,
        requirements: [
          { type: 'custom', value: 10, operator: 'gte', metadata: { type: 'friends_played' } },
        ],
        rewards: [
          { type: 'petals', value: 200 },
          { type: 'title', value: 'Social Butterfly' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        hidden: false,
      },

      // Game-specific Achievements
      {
        id: 'petal_samurai_master',
        name: 'Petal Samurai Master',
        description: 'Master the art of petal slicing',
        icon: '🌸',
        category: 'special',
        rarity: 'epic',
        points: 250,
        requirements: [{ type: 'score', value: 50000, operator: 'gte', gameId: 'petal-samurai' }],
        rewards: [
          { type: 'petals', value: 250 },
          { type: 'title', value: 'Petal Master' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 50000,
        hidden: false,
        gameId: 'petal-samurai',
      },
      {
        id: 'memory_champion',
        name: 'Memory Champion',
        description: 'Complete memory match in record time',
        icon: '🧠',
        category: 'time',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'time', value: 60, operator: 'lte', gameId: 'memory-match' }],
        rewards: [
          { type: 'petals', value: 150 },
          { type: 'title', value: 'Memory Champion' },
        ],
        unlocked: false,
        progress: 0,
        maxProgress: 60,
        hidden: false,
        gameId: 'memory-match',
      },
    ];

    defaultAchievements.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement);
      this.progress.set(achievement.id, 0);
    });
  }

  // Update achievement progress
  updateProgress(achievementId: string, value: number): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    const currentProgress = this.progress.get(achievementId) || 0;
    const newProgress = Math.min(currentProgress + value, achievement.maxProgress);

    this.progress.set(achievementId, newProgress);
    achievement.progress = newProgress;

    this.onProgress?.(achievementId, newProgress, achievement.maxProgress);

    // Check if achievement is unlocked
    if (newProgress >= achievement.maxProgress && !achievement.unlocked) {
      this.unlockAchievement(achievementId);
    }
  }

  // Set achievement progress
  setProgress(achievementId: string, value: number): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    const newProgress = Math.min(value, achievement.maxProgress);
    this.progress.set(achievementId, newProgress);
    achievement.progress = newProgress;

    this.onProgress?.(achievementId, newProgress, achievement.maxProgress);

    // Check if achievement is unlocked
    if (newProgress >= achievement.maxProgress && !achievement.unlocked) {
      this.unlockAchievement(achievementId);
    }
  }

  // Unlock achievement
  unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    this.unlocked.add(achievementId);

    this.onUnlock?.(achievement);
  }

  // Check if achievement is unlocked
  isUnlocked(achievementId: string): boolean {
    return this.unlocked.has(achievementId);
  }

  // Get achievement progress
  getProgress(achievementId: string): AchievementProgress | null {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return null;

    const current = this.progress.get(achievementId) || 0;
    return {
      achievementId,
      current,
      max: achievement.maxProgress,
      percentage: (current / achievement.maxProgress) * 100,
      unlocked: achievement.unlocked,
    };
  }

  // Get all achievements
  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  // Get achievements by category
  getAchievementsByCategory(category: string): Achievement[] {
    return this.getAchievements().filter((a) => a.category === category);
  }

  // Get achievements by rarity
  getAchievementsByRarity(rarity: string): Achievement[] {
    return this.getAchievements().filter((a) => a.rarity === rarity);
  }

  // Get unlocked achievements
  getUnlockedAchievements(): Achievement[] {
    return this.getAchievements().filter((a) => a.unlocked);
  }

  // Get locked achievements
  getLockedAchievements(): Achievement[] {
    return this.getAchievements().filter((a) => !a.unlocked);
  }

  // Get achievements for specific game
  getGameAchievements(gameId: string): Achievement[] {
    return this.getAchievements().filter((a) => !a.gameId || a.gameId === gameId);
  }

  // Get achievement statistics
  getStats(): AchievementStats {
    const achievements = this.getAchievements();
    const unlocked = this.getUnlockedAchievements();

    const byCategory: Record<string, number> = {};
    const byRarity: Record<string, number> = {};

    achievements.forEach((achievement) => {
      byCategory[achievement.category] = (byCategory[achievement.category] || 0) + 1;
      byRarity[achievement.rarity] = (byRarity[achievement.rarity] || 0) + 1;
    });

    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const unlockedPoints = unlocked.reduce((sum, a) => sum + a.points, 0);

    return {
      total: achievements.length,
      unlocked: unlocked.length,
      locked: achievements.length - unlocked.length,
      byCategory,
      byRarity,
      totalPoints,
      unlockedPoints,
    };
  }

  // Add custom achievement
  addAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
    this.progress.set(achievement.id, 0);
  }

  // Remove achievement
  removeAchievement(achievementId: string): void {
    this.achievements.delete(achievementId);
    this.progress.delete(achievementId);
    this.unlocked.delete(achievementId);
  }

  // Reset all achievements
  reset(): void {
    this.achievements.clear();
    this.progress.clear();
    this.unlocked.clear();
    this.initializeDefaultAchievements();
  }

  // Export achievements data
  exportData(): string {
    const data = {
      achievements: Array.from(this.achievements.values()),
      progress: Object.fromEntries(this.progress),
      unlocked: Array.from(this.unlocked),
      stats: this.stats,
    };
    return JSON.stringify(data, null, 2);
  }

  // Import achievements data
  importData(data: string): void {
    try {
      const parsed = JSON.parse(data);

      if (parsed.achievements) {
        this.achievements.clear();
        parsed.achievements.forEach((achievement: Achievement) => {
          this.achievements.set(achievement.id, achievement);
        });
      }

      if (parsed.progress) {
        this.progress.clear();
        Object.entries(parsed.progress).forEach(([id, value]) => {
          this.progress.set(id, value as number);
        });
      }

      if (parsed.unlocked) {
        this.unlocked.clear();
        parsed.unlocked.forEach((id: string) => {
          this.unlocked.add(id);
        });
      }

      if (parsed.stats) {
        this.stats.clear();
        Object.entries(parsed.stats).forEach(([key, value]) => {
          this.stats.set(key, value as number);
        });
      }
    } catch (error) {
      console.error('Failed to import achievements data:', error);
    }
  }

  // Set event callbacks
  setOnUnlock(callback: (achievement: Achievement) => void): void {
    this.onUnlock = callback;
  }

  setOnProgress(callback: (achievementId: string, progress: number, max: number) => void): void {
    this.onProgress = callback;
  }
}

// Export utility functions
export const createAchievementSystem = () => new AchievementSystem();
export const getAchievementRarityColor = (rarity: string): string => {
  const colors = {
    common: '#6b7280',
    uncommon: '#10b981',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
  };
  return colors[rarity as keyof typeof colors] || colors.common;
};
