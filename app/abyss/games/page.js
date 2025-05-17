'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GameCubeBoot from '../../components/GameCubeBoot';

const GAME_FACES = [
  {
    id: 'origin',
    title: 'Directory',
    icon: '📂',
    description: 'Home hub for all games and features',
    position: 'center',
  },
  {
    id: 'mini-games',
    title: 'Mini Games',
    icon: '🎮',
    description: 'Action-packed diversions',
    position: 'up',
  },
  {
    id: 'memory-card',
    title: 'Memory Card',
    icon: '💾',
    description: 'Save files and secrets',
    position: 'down',
  },
  {
    id: 'achievements',
    title: 'Achievements',
    icon: '🏆',
    description: 'Trophies and rewards',
    position: 'left',
  },
  {
    id: 'trade',
    title: 'Trade Center',
    icon: '🔄',
    description: 'Community marketplace',
    position: 'right',
  },
];

export default function GamesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showBoot, setShowBoot] = useState(true);
  const [selectedFace, setSelectedFace] = useState(null);
  const [showAbyssEffect, setShowAbyssEffect] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, router]);

  const handleBootComplete = () => {
    setShowBoot(false);
  };

  const handleFaceHover = face => {
    setSelectedFace(face);
    if (session?.user?.isVerified) {
      setShowAbyssEffect(true);
      setTimeout(() => setShowAbyssEffect(false), 1000);
    }
  };

  const handleFaceClick = face => {
    switch (face.id) {
      case 'mini-games':
        router.push('/abyss/games/mini-games');
        break;
      case 'memory-card':
        router.push('/abyss/games/memory-card');
        break;
      case 'achievements':
        router.push('/abyss/games/achievements');
        break;
      case 'trade':
        router.push('/abyss/games/trade');
        break;
      default:
        break;
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <AnimatePresence>
        {showBoot && <GameCubeBoot onBootComplete={handleBootComplete} />}
      </AnimatePresence>

      {!showBoot && (
        <div className="container mx-auto px-4 py-20">
          <div className="relative mx-auto max-w-4xl">
            {/* GameCube Faces Grid */}
            <div className="grid grid-cols-3 gap-8">
              {GAME_FACES.map(face => (
                <motion.div
                  key={face.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: GAME_FACES.indexOf(face) * 0.2 }}
                  className={`relative ${face.position === 'center' ? 'col-start-2' : ''} ${face.position === 'left' ? 'col-start-1' : ''} ${face.position === 'right' ? 'col-start-3' : ''} `}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => handleFaceHover(face)}
                    onClick={() => handleFaceClick(face)}
                    className={`cursor-pointer rounded-lg border-2 border-transparent bg-gray-800/50 p-6 backdrop-blur-lg transition-colors hover:border-pink-500/50 ${selectedFace?.id === face.id ? 'border-pink-500' : ''} `}
                  >
                    <div className="mb-4 text-4xl">{face.icon}</div>
                    <h3 className="mb-2 text-xl font-bold text-pink-400">{face.title}</h3>
                    <p className="text-gray-400">{face.description}</p>

                    {/* Abyss Petal Burst Effect */}
                    {showAbyssEffect && selectedFace?.id === face.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="pointer-events-none absolute inset-0"
                      >
                        <div className="absolute inset-0 rounded-lg bg-black/20 backdrop-blur-sm" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, rotate: i * 45 }}
                              animate={{ scale: 1, rotate: i * 45 + 360 }}
                              transition={{ duration: 0.5 }}
                              className="absolute h-2 w-2 bg-pink-500/50"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Leaderboard Preview */}
            <div className="mt-12 rounded-lg bg-gray-800/50 p-6 backdrop-blur-lg">
              <h3 className="mb-4 text-xl font-bold text-pink-400">Top Players</h3>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-gray-700/30 p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-pink-400">#{i + 1}</span>
                      <div className="h-8 w-8 rounded-full bg-gray-600" />
                      <span className="text-gray-300">Player {i + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-pink-400">🌸</span>
                      <span className="text-gray-300">{(1000 - i * 100).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
