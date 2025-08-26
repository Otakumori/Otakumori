/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect } from 'react';
import { useLeaderboardStore } from '@/lib/store/leaderboardStore';
import { motion } from 'framer-motion';
import { AsciiArt } from './AsciiArt';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  achievements: number;
  level: number;
  isCurrentUser?: boolean;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: LeaderboardEntry[] = [
        {
          id: '1',
          username: 'AnimeMaster',
          score: 15420,
          rank: 1,
          achievements: 45,
          level: 25,
          isCurrentUser: false,
        },
        {
          id: '2',
          username: 'OtakuKing',
          score: 12850,
          rank: 2,
          achievements: 38,
          level: 22,
          isCurrentUser: false,
        },
        {
          id: '3',
          username: 'WeebLord',
          score: 11230,
          rank: 3,
          achievements: 35,
          level: 20,
          isCurrentUser: false,
        },
        {
          id: '4',
          username: 'MangaFan',
          score: 9870,
          rank: 4,
          achievements: 32,
          level: 18,
          isCurrentUser: false,
        },
        {
          id: '5',
          username: 'CosplayQueen',
          score: 8650,
          rank: 5,
          achievements: 28,
          level: 16,
          isCurrentUser: false,
        },
        {
          id: '6',
          username: 'You',
          score: 7200,
          rank: 6,
          achievements: 25,
          level: 14,
          isCurrentUser: true,
        },
        {
          id: '7',
          username: 'AnimeLover',
          score: 6540,
          rank: 7,
          achievements: 22,
          level: 12,
          isCurrentUser: false,
        },
        {
          id: '8',
          username: 'KawaiiDesu',
          score: 5980,
          rank: 8,
          achievements: 20,
          level: 11,
          isCurrentUser: false,
        },
        {
          id: '9',
          username: 'Senpai',
          score: 5430,
          rank: 9,
          achievements: 18,
          level: 10,
          isCurrentUser: false,
        },
        {
          id: '10',
          username: 'Tsundere',
          score: 4890,
          rank: 10,
          achievements: 15,
          level: 9,
          isCurrentUser: false,
        },
      ];

      setTimeout(() => {
        setLeaderboard(mockData);
        setLoading(false);
      }, 1000);
    };

    loadLeaderboard();
  }, [timeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/3 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`rounded px-3 py-1 text-sm ${
              timeframe === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`rounded px-3 py-1 text-sm ${
              timeframe === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('allTime')}
            className={`rounded px-3 py-1 text-sm ${
              timeframe === 'allTime'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {leaderboard.map(entry => (
          <div
            key={entry.id}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              entry.isCurrentUser ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
            } transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center space-x-4">
              <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 font-bold text-white">
                  {entry.username[0].toUpperCase()}
                </div>
                <div>
                  <p
                    className={`font-semibold ${entry.isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}
                  >
                    {entry.username}
                    {entry.isCurrentUser && (
                      <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    Level {entry.level} • {entry.achievements} achievements
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-800">{entry.score.toLocaleString()}</p>
              <p className="text-sm text-gray-600">points</p>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <p className="py-8 text-center text-gray-500">No leaderboard data available</p>
      )}
    </div>
  );
};
