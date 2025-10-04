// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COPY } from '../../lib/copy';
import GlassButton from '../../components/ui/GlassButton';
import GlassCard from '../../components/ui/GlassCard';
import { type LeaderboardEntry } from '@/app/lib/economy/petalEconomy';

export default function LeaderboardPage() {
  const [activeGame, setActiveGame] = useState<string>('all');
  const [leaderboards, setLeaderboards] = useState<Map<string, LeaderboardEntry[]>>(new Map());
  const [userRank, setUserRank] = useState<Map<string, number>>(new Map());

  const games = [
    { id: 'all', name: 'Overall', icon: '' },
    { id: 'petal-samurai', name: 'Petal Samurai', icon: '' },
    { id: 'puzzle-reveal', name: 'Puzzle Reveal', icon: '' },
    { id: 'bubble-girl', name: 'Bubble Girl', icon: '' },
    { id: 'memory-match', name: 'Memory Match', icon: '' },
  ];

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockLeaderboards = new Map<string, LeaderboardEntry[]>();

    // Petal Samurai leaderboard
    mockLeaderboards.set('petal-samurai', [
      {
        userId: 'user1',
        userName: 'PetalMaster',
        score: 15420,
        game: 'petal-samurai',
        mode: 'storm',
        timestamp: new Date(),
        rank: 1,
      },
      {
        userId: 'user2',
        userName: 'StormChaser',
        score: 12850,
        game: 'petal-samurai',
        mode: 'endless',
        timestamp: new Date(),
        rank: 2,
      },
      {
        userId: 'user3',
        userName: 'BladeRunner',
        score: 11200,
        game: 'petal-samurai',
        mode: 'classic',
        timestamp: new Date(),
        rank: 3,
      },
      {
        userId: 'user4',
        userName: 'ComboKing',
        score: 9850,
        game: 'petal-samurai',
        mode: 'storm',
        timestamp: new Date(),
        rank: 4,
      },
      {
        userId: 'user5',
        userName: 'PetalNinja',
        score: 9200,
        game: 'petal-samurai',
        mode: 'classic',
        timestamp: new Date(),
        rank: 5,
      },
    ]);

    // Puzzle Reveal leaderboard
    mockLeaderboards.set('puzzle-reveal', [
      {
        userId: 'user6',
        userName: 'PuzzleMaster',
        score: 8500,
        game: 'puzzle-reveal',
        mode: 'blitz',
        timestamp: new Date(),
        rank: 1,
      },
      {
        userId: 'user7',
        userName: 'RevealPro',
        score: 7200,
        game: 'puzzle-reveal',
        mode: 'precision',
        timestamp: new Date(),
        rank: 2,
      },
      {
        userId: 'user8',
        userName: 'BrushWizard',
        score: 6800,
        game: 'puzzle-reveal',
        mode: 'classic',
        timestamp: new Date(),
        rank: 3,
      },
      {
        userId: 'user9',
        userName: 'FogBuster',
        score: 6100,
        game: 'puzzle-reveal',
        mode: 'blitz',
        timestamp: new Date(),
        rank: 4,
      },
      {
        userId: 'user10',
        userName: 'ImageHunter',
        score: 5800,
        game: 'puzzle-reveal',
        mode: 'precision',
        timestamp: new Date(),
        rank: 5,
      },
    ]);

    // Bubble Girl leaderboard
    mockLeaderboards.set('bubble-girl', [
      {
        userId: 'user11',
        userName: 'BubbleQueen',
        score: 95,
        game: 'bubble-girl',
        mode: 'challenge',
        timestamp: new Date(),
        rank: 1,
      },
      {
        userId: 'user12',
        userName: 'FloatMaster',
        score: 87,
        game: 'bubble-girl',
        mode: 'challenge',
        timestamp: new Date(),
        rank: 2,
      },
      {
        userId: 'user13',
        userName: 'PhysicsPro',
        score: 82,
        game: 'bubble-girl',
        mode: 'sandbox',
        timestamp: new Date(),
        rank: 3,
      },
      {
        userId: 'user14',
        userName: 'RagdollRider',
        score: 78,
        game: 'bubble-girl',
        mode: 'challenge',
        timestamp: new Date(),
        rank: 4,
      },
      {
        userId: 'user15',
        userName: 'BubbleBuddy',
        score: 75,
        game: 'bubble-girl',
        mode: 'sandbox',
        timestamp: new Date(),
        rank: 5,
      },
    ]);

    // Memory Match leaderboard
    mockLeaderboards.set('memory-match', [
      {
        userId: 'user16',
        userName: 'MemoryMaster',
        score: 2500,
        game: 'memory-match',
        mode: 'challenge',
        timestamp: new Date(),
        rank: 1,
      },
      {
        userId: 'user17',
        userName: 'RuneKeeper',
        score: 2200,
        game: 'memory-match',
        mode: 'daily',
        timestamp: new Date(),
        rank: 2,
      },
      {
        userId: 'user18',
        userName: 'CardWizard',
        score: 1950,
        game: 'memory-match',
        mode: 'classic',
        timestamp: new Date(),
        rank: 3,
      },
      {
        userId: 'user19',
        userName: 'PerfectRecall',
        score: 1800,
        game: 'memory-match',
        mode: 'challenge',
        timestamp: new Date(),
        rank: 4,
      },
      {
        userId: 'user20',
        userName: 'MatchMaker',
        score: 1650,
        game: 'memory-match',
        mode: 'daily',
        timestamp: new Date(),
        rank: 5,
      },
    ]);

    setLeaderboards(mockLeaderboards);

    // Mock user ranks
    const mockUserRanks = new Map<string, number>();
    mockUserRanks.set('petal-samurai', 15);
    mockUserRanks.set('puzzle-reveal', 8);
    mockUserRanks.set('bubble-girl', 23);
    mockUserRanks.set('memory-match', 12);
    setUserRank(mockUserRanks);
  }, []);

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
        return 'text-yellow-600 bg-yellow-100';
      case 2:
        return 'text-gray-600 bg-gray-100';
      case 3:
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCurrentLeaderboard = (): LeaderboardEntry[] => {
    if (activeGame === 'all') {
      // Combine all leaderboards and sort by score
      const allEntries: LeaderboardEntry[] = [];
      leaderboards.forEach((entries) => {
        allEntries.push(...entries);
      });
      return allEntries
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
    }

    return leaderboards.get(activeGame) || [];
  };

  const getCurrentUserRank = (): number | null => {
    if (activeGame === 'all') return null;
    return userRank.get(activeGame) || null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
      <div className="container mx-auto max-w-6xl p-4">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboards</h1>
              <p className="text-gray-600">Compete with players worldwide and climb the ranks</p>
            </div>
            <GlassButton href="/mini-games" variant="secondary">
              {COPY.games.backToHub}
            </GlassButton>
          </div>
        </header>

        {/* Game Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {games.map((game) => (
            <motion.button
              key={game.id}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeGame === game.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-white/20 text-gray-700 hover:bg-white/30'
              }`}
              onClick={() => setActiveGame(game.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-2">{game.icon}</span>
              {game.name}
            </motion.button>
          ))}
        </div>

        {/* User Rank Display */}
        {getCurrentUserRank() && (
          <GlassCard className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Your Rank</h3>
                <p className="text-sm text-gray-600">
                  {activeGame === 'all' ? 'Overall' : games.find((g) => g.id === activeGame)?.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-600">#{getCurrentUserRank()}</div>
                <div className="text-sm text-gray-500">Keep climbing!</div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Leaderboard */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {activeGame === 'all'
                ? 'Overall Rankings'
                : `${games.find((g) => g.id === activeGame)?.name} Rankings`}
            </h2>
            <div className="text-sm text-gray-500">Updated {new Date().toLocaleTimeString()}</div>
          </div>

          <div className="space-y-3">
            {getCurrentLeaderboard().map((entry, index) => (
              <motion.div
                key={`${entry.userId}-${entry.game}`}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                  index < 3
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(entry.rank)}`}
                  >
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{entry.userName}</h3>
                    {activeGame === 'all' && (
                      <p className="text-sm text-gray-500">
                        {games.find((g) => g.id === entry.game)?.name}
                        {entry.mode && ` • ${entry.mode}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {entry.score.toLocaleString()}
                  </div>
                  {activeGame === 'all' && (
                    <div className="text-sm text-gray-500">{entry.mode && entry.mode}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {getCurrentLeaderboard().length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
              <p className="text-gray-600 mb-4">Be the first to set a high score in this game!</p>
              <GlassButton href="/mini-games" variant="primary">
                Play Now
              </GlassButton>
            </div>
          )}
        </GlassCard>

        {/* Daily Modifiers */}
        <GlassCard className="p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Bonuses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl"></span>
                <div>
                  <h3 className="font-semibold text-green-900">Petal Samurai Boost</h3>
                  <p className="text-sm text-green-700">+50% petals today!</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl"></span>
                <div>
                  <h3 className="font-semibold text-blue-900">Streak Bonus</h3>
                  <p className="text-sm text-blue-700">Play daily for extra rewards</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
