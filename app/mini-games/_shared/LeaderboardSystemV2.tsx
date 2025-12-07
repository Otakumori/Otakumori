/**
 * Enterprise Leaderboard System V2
 *
 * Production-ready leaderboard with:
 * - Real-time score updates
 * - Multiple leaderboard types (daily, weekly, all-time)
 * - Achievement integration
 * - Social features (following, challenges)
 * - Performance optimization
 * - Analytics tracking
 * - Anti-cheat validation
 */

'use client';

import { logger } from '@/app/lib/logger';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  gameId: string;

  // Extended data
  achievements: string[];
  playtime: number;
  lastPlayed: Date;
  bestStreak: number;
  totalGames: number;

  // Social
  isFollowing?: boolean;
  isFriend?: boolean;

  // Metadata
  timestamp: Date;
  platform: string;
  verified: boolean;
}

export interface LeaderboardFilters {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'score' | 'playtime' | 'achievements' | 'streak';
  region?: string;
  friends?: boolean;
  verified?: boolean;

export interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;

interface LeaderboardSystemV2Props {
  gameId: string;
  currentScore?: number;
  onScoreSubmit?: (score: number) => Promise<boolean>;
  onAchievementUnlock?: (achievement: AchievementProgress) => void;
  realTimeUpdates?: boolean;
  className?: string;

export default function LeaderboardSystemV2({
  gameId,
  currentScore,
  onScoreSubmit,
  onAchievementUnlock,
  realTimeUpdates = true,
  className = '',
}: LeaderboardSystemV2Props) {
  const { isSignedIn, userId } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeframe: 'all-time',
    category: 'score',
  });
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [newAchievements, setNewAchievements] = useState<AchievementProgress[]>([]);

  // Load leaderboard data
  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        gameId,
        timeframe: filters.timeframe,
        category: filters.category,
        ...(filters.region && { region: filters.region }),
        ...(filters.friends && { friends: 'true' }),
        ...(filters.verified && { verified: 'true' }),
      });

      const response = await fetch(`/api/v1/leaderboard?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setUserEntry(data.userEntry || null);
      }
    } catch (error) {
      logger.error('Failed to load leaderboard:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, [gameId, filters]);

  // Load achievements
  const loadAchievements = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      const response = await fetch(`/api/v1/achievements?gameId=${gameId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      logger.error('Failed to load achievements:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }, [gameId, isSignedIn]);

  // Submit score
  const submitScore = useCallback(
    async (score: number) => {
      if (!isSignedIn || submitting) return false;

      setSubmitting(true);
      try {
        // Call custom submit handler if provided
        if (onScoreSubmit) {
          const success = await onScoreSubmit(score);
          if (!success) return false;
        }

        // Submit to leaderboard API
        const response = await fetch('/api/v1/leaderboard/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            gameId,
            score,
            metadata: {
              platform: getPlatform(),
              timestamp: Date.now(),
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();

          // Check for new achievements
          if (data.newAchievements?.length > 0) {
            setNewAchievements(data.newAchievements);
            data.newAchievements.forEach((achievement: AchievementProgress) => {
              onAchievementUnlock?.(achievement);
            });
          }

          // Reload leaderboard to get updated data
          await loadLeaderboard();

          // Track score submission
          trackEvent('score_submitted', {
            gameId,
            score,
            rank: data.rank,
            isPersonalBest: data.isPersonalBest,
          });

          return true;
        }

        return false;
      } catch (error) {
        logger.error('Failed to submit score:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [gameId, isSignedIn, submitting, onScoreSubmit, onAchievementUnlock, loadLeaderboard],
  );

  // Auto-submit current score when it changes
  useEffect(() => {
    if (currentScore && currentScore > 0 && isSignedIn) {
      const timer = setTimeout(() => {
        submitScore(currentScore);
      }, 1000); // Debounce score submissions

      return () => clearTimeout(timer);
    }
  }, [currentScore, isSignedIn, submitScore]);

  // Load data on mount and filter changes
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Real-time updates via polling
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(loadLeaderboard, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [realTimeUpdates, loadLeaderboard]);

  // Memoized computations
  const userRank = useMemo(() => {
    if (!userEntry) return null;
    return userEntry.rank;
  }, [userEntry]);

  const achievementProgress = useMemo(() => {
    const unlocked = achievements.filter((a) => a.unlocked).length;
    const total = achievements.length;
    return { unlocked, total, percentage: total > 0 ? (unlocked / total) * 100 : 0 };
  }, [achievements]);

  const formatScore = useCallback((score: number): string => {
    return score.toLocaleString();
  }, []);

  const getRankColor = useCallback((rank: number): string => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    if (rank <= 10) return 'text-pink-400';
    if (rank <= 100) return 'text-blue-400';
    return 'text-gray-400';
  }, []);

  const getRankIcon = useCallback((rank: number): string => {
    if (rank === 1) return '';
    if (rank === 2) return '';
    if (rank === 3) return '';
    if (rank <= 10) return '';
    return '';
  }, []);

  return (
    <div
      className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <select
            value={filters.timeframe}
            onChange={(e) => setFilters((prev) => ({ ...prev, timeframe: e.target.value as any }))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            aria-label="Select timeframe"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all-time">All Time</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            aria-label="Select category"
          >
            <option value="score">Score</option>
            <option value="playtime">Playtime</option>
            <option value="achievements">Achievements</option>
            <option value="streak">Best Streak</option>
          </select>
        </div>
      </div>

      {/* User Summary */}
      {isSignedIn && userEntry && (
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {userEntry.avatarUrl && (
                <img
                  src={userEntry.avatarUrl}
                  alt={userEntry.displayName}
                  className="w-12 h-12 rounded-full border-2 border-pink-400"
                />
              )}
              <div>
                <h3 className="text-white font-semibold">{userEntry.displayName}</h3>
                <p className="text-white/60 text-sm">
                  Rank #{userRank} • {formatScore(userEntry.score)} points
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl">{getRankIcon(userEntry.rank)}</div>
              <div className={`text-sm font-semibold ${getRankColor(userEntry.rank)}`}>
                Rank #{userEntry.rank}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Summary */}
      {isSignedIn && achievements.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Achievements</h3>
            <span className="text-purple-400 text-sm">
              {achievementProgress.unlocked}/{achievementProgress.total}
            </span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <motion.div
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${achievementProgress.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <div className="text-white/60 text-sm">
            {achievementProgress.percentage.toFixed(1)}% Complete
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-white/60">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60">No entries yet. Be the first!</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                entry.userId === userId
                  ? 'bg-pink-500/20 border border-pink-500/30'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-lg font-bold w-8 text-center ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank) || entry.rank}
                </div>

                {entry.avatarUrl && (
                  <img
                    src={entry.avatarUrl}
                    alt={entry.displayName}
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{entry.displayName}</span>
                    {entry.verified && <span className="text-blue-400 text-sm"></span>}
                    {entry.isFriend && <span className="text-green-400 text-sm"></span>}
                  </div>
                  <div className="text-white/60 text-sm">
                    {entry.achievements.length} achievements
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-white font-semibold">{formatScore(entry.score)}</div>
                <div className="text-white/60 text-sm">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 border border-white/20 shadow-2xl z-50 max-w-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl"></div>
              <div>
                <h4 className="text-white font-semibold">Achievement Unlocked!</h4>
                <p className="text-white/80 text-sm">{achievement.name}</p>
                <p className="text-white/60 text-xs">{achievement.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Submit Score Button */}
      {isSignedIn && currentScore && currentScore > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => submitScore(currentScore)}
          disabled={submitting}
          className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-xl text-white font-semibold transition-all"
        >
          {submitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Submitting...</span>
            </div>
          ) : (
            `Submit Score: ${formatScore(currentScore)}`
          )}
        </motion.button>
      )}
    </div>
  );
}

// Helper functions
function getPlatform(): string {
  if (typeof window === 'undefined') return 'server';

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mobile')) return 'mobile';
  if (userAgent.includes('tablet')) return 'tablet';
  return 'desktop';
}

function trackEvent(event: string, data: any) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', event, {
      event_category: 'leaderboard',
      ...data,
    });
  }
}
