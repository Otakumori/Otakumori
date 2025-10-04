'use client';

import { useState } from 'react';
import GlassPanel from '../GlassPanel';

type LeaderboardEntry = {
  rank: number;
  username: string;
  score: number;
  avatar?: string;
  isCurrentUser?: boolean;
};

type LeaderboardData = {
  weekly: LeaderboardEntry[];
  seasonal: LeaderboardEntry[];
  userRank: {
    weekly: number;
    seasonal: number;
    weeklyScore: number;
    seasonalScore: number;
  } | null;
};

type LeaderboardInterfaceProps = {
  leaderboardData: LeaderboardData;
};

export default function LeaderboardInterface({ leaderboardData }: LeaderboardInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'seasonal'>('weekly');
  const [timeRange, setTimeRange] = useState<'weekly' | 'seasonal'>('weekly');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '';
      case 2:
        return '';
      case 3:
        return '';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-zinc-400';
    }
  };

  const currentData = timeRange === 'weekly' ? leaderboardData.weekly : leaderboardData.seasonal;

  return (
    <div className="space-y-6">
      {/* Time Range Tabs */}
      <GlassPanel className="p-4">
        <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
          {[
            { id: 'weekly', label: 'Weekly' },
            { id: 'seasonal', label: 'Seasonal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id as 'weekly' | 'seasonal')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === tab.id
                  ? 'bg-fuchsia-500/90 text-white'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* User Rank Summary */}
      {leaderboardData.userRank && (
        <GlassPanel className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Your Rank</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-fuchsia-300">
                #{leaderboardData.userRank.weekly}
              </div>
              <div className="text-sm text-zinc-400">Weekly Rank</div>
              <div className="text-xs text-zinc-500">
                {leaderboardData.userRank.weeklyScore} petals
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-fuchsia-300">
                #{leaderboardData.userRank.seasonal}
              </div>
              <div className="text-sm text-zinc-400">Seasonal Rank</div>
              <div className="text-xs text-zinc-500">
                {leaderboardData.userRank.seasonalScore} petals
              </div>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* Leaderboard */}
      <GlassPanel className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {timeRange === 'weekly' ? 'Weekly' : 'Seasonal'} Leaderboard
        </h2>

        {currentData.length > 0 ? (
          <div className="space-y-2">
            {currentData.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-fuchsia-500/20 border border-fuchsia-400/50'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-bold ${getRankColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                    <span className="text-sm text-fuchsia-300">{entry.avatar || ''}</span>
                  </div>

                  <div>
                    <div className="font-medium text-white">
                      {entry.username}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs text-fuchsia-300">(You)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-fuchsia-300">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-400">petals</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-400">No leaderboard data available</p>
          </div>
        )}
      </GlassPanel>

      {/* How to Earn Points */}
      <GlassPanel className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How to Earn Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-fuchsia-300">Petal Collection</h4>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• Collect petals from the cherry tree</li>
              <li>• Complete daily petal challenges</li>
              <li>• Participate in seasonal events</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-fuchsia-300">Community Engagement</h4>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• Post soapstone messages</li>
              <li>• Reply to other travelers</li>
              <li>• Unlock achievements</li>
            </ul>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
