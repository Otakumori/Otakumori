'use client';

import { logger } from '@/app/lib/logger';
// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  gameId: string;
  gameName: string;
  level: number;
  time: number; // in seconds
  date: Date;
  metadata?: Record<string, any>;
  isCurrentUser?: boolean;

export interface Leaderboard {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  type: 'global' | 'friends' | 'local' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  totalEntries: number;
  lastUpdated: Date;
  refreshInterval: number; // in milliseconds

export interface LeaderboardFilter {
  gameId?: string;
  type?: string;
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  limit?: number;
  offset?: number;

export interface LeaderboardStats {
  totalPlayers: number;
  totalGames: number;
  averageScore: number;
  topScore: number;
  yourRank?: number;
  yourScore?: number;
  percentile?: number;
}

// Leaderboard System Class
export class LeaderboardSystem {
  private leaderboards: Map<string, Leaderboard> = new Map();
  private entries: Map<string, LeaderboardEntry> = new Map();
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();
  private currentUserId?: string;

  private onEntryAdded?: (entry: LeaderboardEntry) => void;
  private onEntryUpdated?: (entry: LeaderboardEntry) => void;
  private onRankChanged?: (entry: LeaderboardEntry, oldRank: number, newRank: number) => void;

  constructor() {
    this.initializeDefaultLeaderboards();
  }

  // Initialize default leaderboards
  private initializeDefaultLeaderboards(): void {
    const defaultLeaderboards: Leaderboard[] = [
      {
        id: 'global_all_time',
        name: 'Global All-Time',
        gameId: 'all',
        gameName: 'All Games',
        type: 'all_time',
        entries: [],
        totalEntries: 0,
        lastUpdated: new Date(),
        refreshInterval: 300000, // 5 minutes
      },
      {
        id: 'global_weekly',
        name: 'Global Weekly',
        gameId: 'all',
        gameName: 'All Games',
        type: 'weekly',
        entries: [],
        totalEntries: 0,
        lastUpdated: new Date(),
        refreshInterval: 60000, // 1 minute
      },
      {
        id: 'friends_all_time',
        name: 'Friends All-Time',
        gameId: 'all',
        gameName: 'All Games',
        type: 'friends',
        entries: [],
        totalEntries: 0,
        lastUpdated: new Date(),
        refreshInterval: 300000, // 5 minutes
      },
    ];

    defaultLeaderboards.forEach((leaderboard) => {
      this.leaderboards.set(leaderboard.id, leaderboard);
    });
  }

  // Set current user ID
  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  // Add score entry
  async addEntry(
    gameId: string,
    gameName: string,
    score: number,
    level: number = 1,
    time: number = 0,
    metadata?: Record<string, any>,
  ): Promise<LeaderboardEntry> {
    if (!this.currentUserId) {
      throw new Error('Current user ID not set');
    }

    const entry: LeaderboardEntry = {
      id: this.generateEntryId(),
      userId: this.currentUserId,
      username: 'Player', // This would come from user data
      avatar: undefined, // This would come from user data
      score,
      rank: 0,
      gameId,
      gameName,
      level,
      time,
      date: new Date(),
      metadata,
      isCurrentUser: true,
    };

    // Add to entries map
    this.entries.set(entry.id, entry);

    // Add to relevant leaderboards
    await this.addToLeaderboards(entry);

    this.onEntryAdded?.(entry);
    return entry;
  }

  // Add entry to relevant leaderboards
  private async addToLeaderboards(entry: LeaderboardEntry): Promise<void> {
    const leaderboardsToUpdate = Array.from(this.leaderboards.values()).filter(
      (lb) => lb.gameId === 'all' || lb.gameId === entry.gameId,
    );

    for (const leaderboard of leaderboardsToUpdate) {
      await this.addToLeaderboard(leaderboard, entry);
    }
  }

  // Add entry to specific leaderboard
  private async addToLeaderboard(leaderboard: Leaderboard, entry: LeaderboardEntry): Promise<void> {
    // Add entry to leaderboard
    leaderboard.entries.push(entry);

    // Sort by score (descending)
    leaderboard.entries.sort((a, b) => b.score - a.score);

    // Update ranks
    leaderboard.entries.forEach((e, index) => {
      const oldRank = e.rank;
      e.rank = index + 1;

      if (oldRank !== 0 && oldRank !== e.rank) {
        this.onRankChanged?.(e, oldRank, e.rank);
      }
    });

    // Limit entries (keep top 1000)
    if (leaderboard.entries.length > 1000) {
      leaderboard.entries = leaderboard.entries.slice(0, 1000);
    }

    leaderboard.totalEntries = leaderboard.entries.length;
    leaderboard.lastUpdated = new Date();
  }

  // Get leaderboard
  getLeaderboard(leaderboardId: string): Leaderboard | null {
    return this.leaderboards.get(leaderboardId) || null;
  }

  // Get leaderboards by filter
  getLeaderboards(filter: LeaderboardFilter = {}): Leaderboard[] {
    let leaderboards = Array.from(this.leaderboards.values());

    if (filter.gameId) {
      leaderboards = leaderboards.filter(
        (lb) => lb.gameId === filter.gameId || lb.gameId === 'all',
      );
    }

    if (filter.type) {
      leaderboards = leaderboards.filter((lb) => lb.type === filter.type);
    }

    if (filter.limit) {
      leaderboards = leaderboards.slice(0, filter.limit);
    }

    if (filter.offset) {
      leaderboards = leaderboards.slice(filter.offset);
    }

    return leaderboards;
  }

  // Get leaderboard entries
  getLeaderboardEntries(
    leaderboardId: string,
    limit: number = 50,
    offset: number = 0,
  ): LeaderboardEntry[] {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return [];

    return leaderboard.entries.slice(offset, offset + limit);
  }

  // Get user's rank in leaderboard
  getUserRank(leaderboardId: string, userId: string): number | null {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return null;

    const entry = leaderboard.entries.find((e) => e.userId === userId);
    return entry ? entry.rank : null;
  }

  // Get user's entry in leaderboard
  getUserEntry(leaderboardId: string, userId: string): LeaderboardEntry | null {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return null;

    return leaderboard.entries.find((e) => e.userId === userId) || null;
  }

  // Get leaderboard statistics
  getLeaderboardStats(leaderboardId: string): LeaderboardStats | null {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return null;

    const entries = leaderboard.entries;
    const totalPlayers = leaderboard.totalEntries;
    const totalGames = entries.reduce((sum, e) => sum + e.level, 0);
    const averageScore =
      entries.length > 0 ? entries.reduce((sum, e) => sum + e.score, 0) / entries.length : 0;
    const topScore = entries.length > 0 ? entries[0].score : 0;

    let yourRank: number | undefined;
    let yourScore: number | undefined;
    let percentile: number | undefined;

    if (this.currentUserId) {
      const userEntry = entries.find((e) => e.userId === this.currentUserId);
      if (userEntry) {
        yourRank = userEntry.rank;
        yourScore = userEntry.score;
        percentile = ((totalPlayers - yourRank + 1) / totalPlayers) * 100;
      }
    }

    return {
      totalPlayers,
      totalGames,
      averageScore,
      topScore,
      yourRank,
      yourScore,
      percentile,
    };
  }

  // Get top players
  getTopPlayers(leaderboardId: string, count: number = 10): LeaderboardEntry[] {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return [];

    return leaderboard.entries.slice(0, count);
  }

  // Get players around user
  getPlayersAroundUser(
    leaderboardId: string,
    userId: string,
    range: number = 5,
  ): LeaderboardEntry[] {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return [];

    const userIndex = leaderboard.entries.findIndex((e) => e.userId === userId);
    if (userIndex === -1) return [];

    const start = Math.max(0, userIndex - range);
    const end = Math.min(leaderboard.entries.length, userIndex + range + 1);

    return leaderboard.entries.slice(start, end);
  }

  // Search players
  searchPlayers(query: string, leaderboardId?: string): LeaderboardEntry[] {
    let entries = Array.from(this.entries.values());

    if (leaderboardId) {
      const leaderboard = this.leaderboards.get(leaderboardId);
      if (leaderboard) {
        entries = leaderboard.entries;
      }
    }

    const searchQuery = query.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.username.toLowerCase().includes(searchQuery) ||
        entry.gameName.toLowerCase().includes(searchQuery),
    );
  }

  // Update entry
  async updateEntry(entryId: string, updates: Partial<LeaderboardEntry>): Promise<void> {
    const entry = this.entries.get(entryId);
    if (!entry) return;

    Object.assign(entry, updates);

    // Update in leaderboards
    const leaderboards = Array.from(this.leaderboards.values()).filter((lb) =>
      lb.entries.some((e) => e.id === entryId),
    );

    for (const leaderboard of leaderboards) {
      const index = leaderboard.entries.findIndex((e) => e.id === entryId);
      if (index !== -1) {
        leaderboard.entries[index] = entry;

        // Re-sort and update ranks
        leaderboard.entries.sort((a, b) => b.score - a.score);
        leaderboard.entries.forEach((e, i) => {
          const oldRank = e.rank;
          e.rank = i + 1;

          if (oldRank !== e.rank) {
            this.onRankChanged?.(e, oldRank, e.rank);
          }
        });

        leaderboard.lastUpdated = new Date();
      }
    }

    this.onEntryUpdated?.(entry);
  }

  // Remove entry
  removeEntry(entryId: string): void {
    const entry = this.entries.get(entryId);
    if (!entry) return;

    // Remove from leaderboards
    const leaderboards = Array.from(this.leaderboards.values()).filter((lb) =>
      lb.entries.some((e) => e.id === entryId),
    );

    for (const leaderboard of leaderboards) {
      const index = leaderboard.entries.findIndex((e) => e.id === entryId);
      if (index !== -1) {
        leaderboard.entries.splice(index, 1);

        // Update ranks
        leaderboard.entries.forEach((e, i) => {
          e.rank = i + 1;
        });

        leaderboard.totalEntries = leaderboard.entries.length;
        leaderboard.lastUpdated = new Date();
      }
    }

    this.entries.delete(entryId);
  }

  // Start auto-refresh for leaderboard
  startAutoRefresh(leaderboardId: string): void {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return;

    // Clear existing interval
    const existingInterval = this.refreshIntervals.get(leaderboardId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Start new interval
    const interval = setInterval(() => {
      this.refreshLeaderboard(leaderboardId);
    }, leaderboard.refreshInterval);

    this.refreshIntervals.set(leaderboardId, interval);
  }

  // Stop auto-refresh for leaderboard
  stopAutoRefresh(leaderboardId: string): void {
    const interval = this.refreshIntervals.get(leaderboardId);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(leaderboardId);
    }
  }

  // Refresh leaderboard data
  async refreshLeaderboard(leaderboardId: string): Promise<void> {
    // This would typically fetch fresh data from the server
    // For now, we'll just update the lastUpdated timestamp
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (leaderboard) {
      leaderboard.lastUpdated = new Date();
    }
  }

  // Export leaderboard data
  exportLeaderboard(leaderboardId: string): string {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return '';

    const data = {
      leaderboard,
      entries: leaderboard.entries,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  // Import leaderboard data
  importLeaderboard(data: string): void {
    try {
      const parsed = JSON.parse(data);

      if (parsed.leaderboard) {
        this.leaderboards.set(parsed.leaderboard.id, parsed.leaderboard);
      }

      if (parsed.entries) {
        parsed.entries.forEach((entry: LeaderboardEntry) => {
          this.entries.set(entry.id, entry);
        });
      }
    } catch (error) {
      logger.error('Failed to import leaderboard data:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Generate unique entry ID
  private generateEntryId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set event callbacks
  setOnEntryAdded(callback: (entry: LeaderboardEntry) => void): void {
    this.onEntryAdded = callback;
  }

  setOnEntryUpdated(callback: (entry: LeaderboardEntry) => void): void {
    this.onEntryUpdated = callback;
  }

  setOnRankChanged(
    callback: (entry: LeaderboardEntry, oldRank: number, newRank: number) => void,
  ): void {
    this.onRankChanged = callback;
  }

  // Cleanup
  dispose(): void {
    // Clear all intervals
    this.refreshIntervals.forEach((interval) => clearInterval(interval));
    this.refreshIntervals.clear();

    // Clear data
    this.leaderboards.clear();
    this.entries.clear();
  }
}

// Export utility functions
export const createLeaderboardSystem = () => new LeaderboardSystem();
export const formatScore = (score: number): string => {
  if (score >= 1000000) {
    return (score / 1000000).toFixed(1) + 'M';
  } else if (score >= 1000) {
    return (score / 1000).toFixed(1) + 'K';
  }
  return score.toString();
};
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
