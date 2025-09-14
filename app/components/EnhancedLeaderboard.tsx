'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import GlassCard from '@/app/components/ui/GlassCard';
import { type LeaderboardResponse } from '@/app/lib/contracts';

interface EnhancedLeaderboardProps {
  gameCode: string;
  className?: string;
}

export default function EnhancedLeaderboard({
  gameCode,
  className = '',
}: EnhancedLeaderboardProps) {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'all'>('daily');

  useEffect(() => {
    loadLeaderboard();
  }, [gameCode, scope, period]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        scope,
        period,
        limit: '50',
      });

      const response = await fetch(`/api/v1/leaderboard/${gameCode}?${params}`);
      const result = await response.json();

      if (result.ok) {
        setLeaderboard(result.data);
      } else {
        console.error('Failed to load leaderboard:', result.error);
      }
    } catch (error) {
      console.error('Leaderboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '?';
      case 2:
        return '?';
      case 3:
        return '?';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '?';
      case 2:
        return '?';
      case 3:
        return '?';
      default:
        return 'text-pink-300';
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    } else if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  };

  return (
    <div className={className}>
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-pink-300 capitalize">
            {gameCode.replace('-', ' ')} Leaderboard
          </h2>

          <div className="flex items-center gap-2">
            {/* Scope Selector */}
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as 'global' | 'friends')}
              className="px-3 py-1 bg-pink-900/30 border border-pink-500/20 rounded-lg text-pink-100 text-sm"
              aria-label="Select"
            >
              <option value="global">Global</option>
              <option value="friends">Friends</option>
            </select>

            {/* Period Selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'all')}
              className="px-3 py-1 bg-pink-900/30 border border-pink-500/20 rounded-lg text-pink-100 text-sm"
              aria-label="Select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-pink-300/70 mt-2 text-sm">Loading leaderboard...</p>
          </div>
        ) : !leaderboard ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-pink-300/70 text-sm">No scores yet</p>
            <p className="text-pink-300/50 text-xs mt-1">Be the first to play and set a score!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* User's Rank (if available) */}
            {leaderboard.userRank && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-pink-600/20 border border-pink-500/30 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getRankIcon(leaderboard.userRank.rank!)}</span>
                    <div>
                      <p className="text-pink-200 font-semibold">Your Rank</p>
                      <p className="text-pink-300/70 text-sm">
                        #{leaderboard.userRank.rank} of {leaderboard.totalPlayers} players
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-pink-300 font-bold">
                      {formatScore(leaderboard.userRank.score!)}
                    </p>
                    <p className="text-pink-300/70 text-xs">Your Best</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Top Scores */}
            <div className="space-y-2">
              {leaderboard.scores.map((score, index) => (
                <motion.div
                  key={score.profileId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-pink-900/20 rounded-lg border border-pink-500/20 hover:bg-pink-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${getRankColor(score.rank)}`}>
                      {getRankIcon(score.rank)}
                    </div>

                    <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-pink-100 text-sm font-semibold">
                      {score.avatarUrl ? (
                        <img
                          src={score.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (score.display_name || score.username).charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <p className="text-pink-200 font-semibold">
                        {score.display_name || score.username}
                      </p>
                      <p className="text-pink-300/70 text-xs">@{score.username}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-pink-300 font-bold">{formatScore(score.score)}</p>
                    <p className="text-pink-300/50 text-xs">
                      {new Date(score.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="pt-4 border-t border-pink-500/20">
              <div className="flex items-center justify-between text-sm text-pink-300/70">
                <span>Total Players: {leaderboard.totalPlayers}</span>
                <span className="capitalize">
                  {scope} • {period}
                </span>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}



