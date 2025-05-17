'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const MINI_GAMES = [
  {
    id: 'petal-collection',
    title: 'Petal Collection',
    description: 'Collect falling petals to earn points and unlock rewards',
    thumbnail: '/images/games/petal-collection.jpg',
    preview: '/images/games/petal-collection-preview.gif',
    ageRestriction: false,
    difficulty: 'Easy',
    rewards: ['Petal Points', 'Seasonal Badges', 'Special Effects'],
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Match anime character cards to test your memory',
    thumbnail: '/images/games/memory-match.jpg',
    preview: '/images/games/memory-match-preview.gif',
    ageRestriction: false,
    difficulty: 'Medium',
    rewards: ['Memory Points', 'Character Cards', 'Theme Unlocks'],
  },
  {
    id: 'rhythm-dance',
    title: 'Rhythm Dance',
    description: 'Dance to the beat of your favorite anime songs',
    thumbnail: '/images/games/rhythm-dance.jpg',
    preview: '/images/games/rhythm-dance-preview.gif',
    ageRestriction: false,
    difficulty: 'Hard',
    rewards: ['Rhythm Points', 'Song Unlocks', 'Dance Moves'],
  },
  {
    id: 'abyss-quest',
    title: 'Abyss Quest',
    description: 'Navigate through the mysterious Abyss dimension',
    thumbnail: '/images/games/abyss-quest.jpg',
    preview: '/images/games/abyss-quest-preview.gif',
    ageRestriction: true,
    difficulty: 'Expert',
    rewards: ['Abyss Points', 'Rare Items', 'Special Effects'],
  },
];

export default function MiniGamesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState(null);
  const [showAbyssEffect, setShowAbyssEffect] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, router]);

  const handleGameHover = game => {
    setSelectedGame(game);
    if (game.ageRestriction && session?.user?.isAgeVerified) {
      setShowAbyssEffect(true);
    }
  };

  const handleGameLeave = () => {
    setSelectedGame(null);
    setShowAbyssEffect(false);
  };

  const handleGameClick = game => {
    if (game.ageRestriction && !session?.user?.isAgeVerified) {
      // Show age verification modal
      return;
    }
    router.push(`/abyss/games/${game.id}`);
  };

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        <h1 className="mb-8 text-4xl font-bold text-pink-500">Mini Games</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {MINI_GAMES.map(game => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => handleGameHover(game)}
              onHoverEnd={handleGameLeave}
              onClick={() => handleGameClick(game)}
              className={`relative cursor-pointer overflow-hidden rounded-lg ${game.ageRestriction ? 'border-2 border-pink-500' : 'border border-gray-700'} `}
            >
              <div className="relative aspect-video">
                <Image src={game.thumbnail} alt={game.title} fill className="object-cover" />
                {showAbyssEffect && selectedGame?.id === game.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="text-6xl"
                      >
                        🌸
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="bg-gray-900/90 p-4">
                <h2 className="mb-2 text-xl font-bold">{game.title}</h2>
                <p className="mb-4 text-gray-400">{game.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Difficulty: {game.difficulty}</span>
                  {game.ageRestriction && <span className="text-sm text-pink-500">R18</span>}
                </div>
              </div>

              {selectedGame?.id === game.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 flex flex-col bg-black/80 p-4"
                >
                  <h3 className="mb-2 text-xl font-bold">Rewards:</h3>
                  <ul className="list-inside list-disc text-gray-300">
                    {game.rewards.map((reward, index) => (
                      <li key={index}>{reward}</li>
                    ))}
                  </ul>
                  <button
                    className="mt-auto rounded-lg bg-pink-500 px-4 py-2 text-white transition-colors hover:bg-pink-600"
                    onClick={e => {
                      e.stopPropagation();
                      handleGameClick(game);
                    }}
                  >
                    Play Now
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Leaderboard</h2>
          <div className="rounded-lg bg-gray-900 p-4">
            <div className="mb-2 grid grid-cols-4 gap-4 text-gray-400">
              <div>Rank</div>
              <div>Player</div>
              <div>Game</div>
              <div>Score</div>
            </div>
            {[
              { rank: 1, player: 'Player1', game: 'Petal Collection', score: 10000 },
              { rank: 2, player: 'Player2', game: 'Memory Match', score: 9500 },
              { rank: 3, player: 'Player3', game: 'Rhythm Dance', score: 9000 },
            ].map(entry => (
              <div
                key={entry.rank}
                className="grid grid-cols-4 gap-4 border-t border-gray-800 py-2"
              >
                <div>#{entry.rank}</div>
                <div>{entry.player}</div>
                <div>{entry.game}</div>
                <div>{entry.score}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
