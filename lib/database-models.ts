/**
 * Database Model Interfaces
 *
 * These interfaces extend the base Prisma models with additional fields
 * that our APIs expect but may not be in the current schema.
 */

export interface ExtendedUser {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  display_name: string | null;
  displayName?: string; // Computed field
  avatarUrl: string | null;
  petalBalance: number;
  achievementPoints?: number; // May not exist in schema yet
  visibility: 'public' | 'private' | 'friends';
  createdAt: Date;
  updatedAt: Date;
  // Additional fields as needed
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt: Date | null;
  metadata: any;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GameSave {
  id: string;
  userId: string;
  gameId: string;
  slot: number;
  saveData: any; // JSON payload
  payload?: any; // Alternative field name
  metadata: any;
  version: number;
  saveVersion?: number; // Alternative field name
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  gameId: string;
  category: string;
  score: number;
  metadata: any;
  replay?: string;
  verified: boolean;
  submittedAt: Date;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    country?: string;
  };
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}

// Type guards and helpers
export function ensureExtendedUser(user: any): ExtendedUser {
  return {
    ...user,
    displayName: user.displayName || user.display_name || user.username,
    achievementPoints: user.achievementPoints || 0,
    visibility: user.visibility || 'public',
  };
}

export function ensureUserAchievement(achievement: any): UserAchievement {
  return {
    id: achievement.id || '',
    userId: achievement.userId || '',
    achievementId: achievement.achievementId || '',
    progress: achievement.progress || 0,
    unlocked: achievement.unlocked || false,
    unlockedAt: achievement.unlockedAt || null,
    metadata: achievement.metadata || {},
    createdAt: achievement.createdAt || new Date(),
    updatedAt: achievement.updatedAt || new Date(),
  };
}

export function ensureGameSave(save: any): GameSave {
  return {
    id: save.id || '',
    userId: save.userId || '',
    gameId: save.gameId || '',
    slot: save.slot || 0,
    saveData: save.saveData || save.payload || {},
    payload: save.payload || save.saveData || {},
    metadata: save.metadata || {},
    version: save.version || save.saveVersion || 1,
    saveVersion: save.saveVersion || save.version || 1,
    createdAt: save.createdAt || new Date(),
    updatedAt: save.updatedAt || new Date(),
  };
}

export function ensureLeaderboardEntry(entry: any): LeaderboardEntry {
  return {
    id: entry.id || '',
    userId: entry.userId || '',
    gameId: entry.gameId || '',
    category: entry.category || 'score',
    score: entry.score || 0,
    metadata: entry.metadata || {},
    replay: entry.replay || undefined,
    verified: entry.verified !== false,
    submittedAt: entry.submittedAt || new Date(),
    user: entry.user
      ? {
          id: entry.user.id || '',
          username: entry.user.username || '',
          displayName:
            entry.user.displayName || entry.user.display_name || entry.user.username || '',
          avatarUrl: entry.user.avatarUrl || null,
          country: entry.user.country || undefined,
        }
      : undefined,
  };
}
