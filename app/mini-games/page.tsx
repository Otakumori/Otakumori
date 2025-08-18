'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Gamepad2, Trophy, Coins, Star, Clock, Target } from 'lucide-react';
import SectionShell from "@/app/(sections)/_shared/SectionShell";
import GameCubeBoot from './_shared/GameCubeBoot';

interface Game {
  slug: string;
  title: string;
  componentKey: string;
  shortPrompt: string;
  enabled: boolean;
  difficulty?: string;
  petalReward?: number;
}

interface UserStats {
  totalRuns: number;
  totalPetalsEarned: number;
  favoriteGame?: string;
  lastPlayed?: string;
}

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

const AVAILABLE_GAMES: Game[] = [
  {
    slug: 'samurai-petal-slice',
    title: 'Samurai Petal Slice',
    componentKey: 'samurai_petal_slice',
    shortPrompt: 'Draw the Tetsusaiga\'s arc…',
    enabled: true,
    difficulty: 'Medium',
    petalReward: 25
  },
  {
    slug: 'memory-match',
    title: 'Anime Memory Match',
    componentKey: 'anime_memory_match',
    shortPrompt: 'Recall the faces bound by fate.',
    enabled: true,
    difficulty: 'Easy',
    petalReward: 15
  },
  {
    slug: 'bubble-pop-gacha',
    title: 'Bubble-Pop Gacha',
    componentKey: 'bubble_pop_gacha',
    shortPrompt: 'Pop for spy-craft secrets…',
    enabled: true,
    difficulty: 'Easy',
    petalReward: 10
  },
  {
    slug: 'rhythm-beat-em-up',
    title: 'Rhythm Beat-Em-Up',
    componentKey: 'rhythm_beat_em_up',
    shortPrompt: 'Sync to the Moon Prism\'s pulse.',
    enabled: true,
    difficulty: 'Hard',
    petalReward: 50
  },
  {
    slug: 'quick-math',
    title: 'Quick Math Challenge',
    componentKey: 'quick_math',
    shortPrompt: 'Solve equations under pressure.',
    enabled: true,
    difficulty: 'Medium',
    petalReward: 20
  },
  {
    slug: 'petal-catch',
    title: 'Petal Catch',
    componentKey: 'petal_catch',
    shortPrompt: 'Catch falling petals before they touch the ground.',
    enabled: true,
    difficulty: 'Easy',
    petalReward: 15
  }
];

export default function MiniGamesPage() {
  const { user } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [petalBalance, setPetalBalance] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleBootComplete = () => {
    setBootComplete(true);
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const statsResponse = await fetch('/api/v1/games/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.ok && statsData.data) {
          setUserStats(statsData.data.totalStats);
        }
      }

      // Fetch achievements
      const achievementsResponse = await fetch('/api/v1/games/achievements');
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        if (achievementsData.ok && achievementsData.data) {
          setAchievements(achievementsData.data.achievements);
        }
      }

      // Fetch petal balance
      const balanceResponse = await fetch('/api/v1/petals/balance');
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        if (balanceData.ok && balanceData.data) {
          setPetalBalance(balanceData.data.petalBalance);
        }
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-400/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-neutral-400 bg-neutral-400/20';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '🌸';
      case 'Medium':
        return '⚡';
      case 'Hard':
        return '🔥';
      default:
        return '🎮';
    }
  };

  // Show boot screen until complete
  if (!bootComplete) {
    return <GameCubeBoot onBootComplete={handleBootComplete} />;
  }

  if (loading) {
    return (
      <SectionShell title="Mini-Games" subtitle="Loading…">
        <div className="h-full w-full grid place-items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-neutral-300">Loading mini-games…</p>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Mini-Games" subtitle="Challenge yourself and earn petals">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Mini-Games</h1>
          </div>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Challenge yourself with these anime-themed mini-games and earn petals for your achievements.
          </p>
        </div>

        {/* User Stats & Petal Balance */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🌸</div>
              <div className="text-2xl font-bold text-pink-400">{petalBalance}</div>
              <div className="text-sm text-neutral-400">Petals Available</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🎮</div>
              <div className="text-2xl font-bold text-blue-400">{userStats?.totalRuns || 0}</div>
              <div className="text-sm text-neutral-400">Games Played</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-yellow-400">
                {achievements.filter(a => a.isUnlocked).length}
              </div>
              <div className="text-sm text-neutral-400">Achievements Unlocked</div>
            </div>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {AVAILABLE_GAMES.map((game) => (
            <div
              key={game.slug}
              className="group bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-pink-500/50 transition-all duration-200 hover:scale-105"
            >
              {/* Game Header */}
              <div className="p-6 border-b border-neutral-800">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white group-hover:text-pink-400 transition-colors">
                    {game.title}
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty || 'Medium')}`}>
                    {getDifficultyIcon(game.difficulty || 'Medium')} {game.difficulty || 'Medium'}
                  </div>
                </div>
                
                <p className="text-sm text-neutral-400 mb-4 italic">
                  "{game.shortPrompt}"
                </p>

                {/* Petal Reward */}
                <div className="flex items-center gap-2 text-pink-400">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">{game.petalReward} petals reward</span>
                </div>
              </div>

              {/* Game Actions */}
              <div className="p-6">
                <Link
                  href={`/mini-games/${game.slug}`}
                  className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Play Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Achievements */}
        {user && achievements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Recent Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements
                .filter(a => a.isUnlocked)
                .slice(0, 6)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <h4 className="font-semibold text-white">{achievement.name}</h4>
                        <p className="text-sm text-neutral-300">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-yellow-400">{achievement.points} points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* How to Earn More Petals */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Want More Petals?</h2>
          <p className="text-neutral-300 mb-6">
            Complete daily challenges, unlock achievements, and improve your high scores to earn more petals!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-white mb-2">Daily Challenges</h3>
              <p className="text-sm text-neutral-400">Complete daily tasks for bonus petals</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-semibold text-white mb-2">High Scores</h3>
              <p className="text-sm text-neutral-400">Beat your best scores for rewards</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-semibold text-white mb-2">Achievements</h3>
              <p className="text-sm text-neutral-400">Unlock milestones for big rewards</p>
            </div>
          </div>
        </div>

        {/* Petal Store Link */}
        <div className="text-center mt-12">
          <Link
            href="/account/petals"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Coins className="h-5 w-5" />
            Spend Your Petals in the Store
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}
