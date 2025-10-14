/**
 * Achievement Event Bus
 * Centralized event system for unlocking and tracking achievements
 */

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface AchievementEvent {
  id: string;
  title: string;
  description?: string;
  rarity: AchievementRarity;
  gameId?: string;
  metadata?: Record<string, unknown>;
}

type AchievementListener = (event: AchievementEvent) => void;

class AchievementEventBus {
  private listeners: Set<AchievementListener> = new Set();
  private history: AchievementEvent[] = [];

  /**
   * Subscribe to achievement unlock events
   */
  on(listener: AchievementListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit an achievement unlock event
   */
  emit(achievement: AchievementEvent): void {
    // Add to history
    this.history.push({
      ...achievement,
      metadata: {
        ...achievement.metadata,
        timestamp: Date.now(),
      },
    });

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(achievement);
      } catch (error) {
        console.error('Achievement listener error:', error);
      }
    });

    // Log to console in development
    // eslint-disable-next-line no-restricted-syntax -- Universal runtime check for NODE_ENV
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`🏆 Achievement Unlocked: ${achievement.title} [${achievement.rarity}]`);
    }

    // Track with analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'achievement_unlocked', {
        achievement_id: achievement.id,
        achievement_title: achievement.title,
        achievement_rarity: achievement.rarity,
        game_id: achievement.gameId,
      });
    }
  }

  /**
   * Get achievement history
   */
  getHistory(): AchievementEvent[] {
    return [...this.history];
  }

  /**
   * Clear all listeners (for cleanup)
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get listener count
   */
  get listenerCount(): number {
    return this.listeners.size;
  }
}

// Singleton instance
export const achievementBus = new AchievementEventBus();

// Convenience function for quick unlocks
export function unlockAchievement(
  id: string,
  title: string,
  options?: {
    description?: string;
    rarity?: AchievementRarity;
    gameId?: string;
    metadata?: Record<string, unknown>;
  },
): void {
  achievementBus.emit({
    id,
    title,
    description: options?.description,
    rarity: options?.rarity || 'common',
    gameId: options?.gameId,
    metadata: options?.metadata,
  });
}
