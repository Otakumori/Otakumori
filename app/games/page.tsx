'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/layout/Navbar';
import FooterDark from '../components/FooterDark';
import GlassPanel from '../components/GlassPanel';
import { t } from '@/lib/microcopy';

export default function GameCubePage() {
  const [bootComplete, setBootComplete] = useState(false);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [gameProgress, setGameProgress] = useState<Record<string, any>>({});
  const bootSequenceRef = useRef<HTMLDivElement>(null);

  // Check if boot sequence has been completed today
  useEffect(() => {
    const lastBootDate = localStorage.getItem('gamecube-boot-date');
    const today = new Date().toDateString();

    if (lastBootDate === today) {
      setBootComplete(true);
      setShowBootSequence(false);
    }
  }, []);

  // Load game progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('gamecube-progress');
    if (savedProgress) {
      setGameProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Save game progress to localStorage
  const saveGameProgress = (gameId: string, progress: any) => {
    const newProgress = { ...gameProgress, [gameId]: progress };
    setGameProgress(newProgress);
    localStorage.setItem('gamecube-progress', JSON.stringify(newProgress));
  };

  // Complete boot sequence
  const completeBoot = () => {
    setBootComplete(true);
    setShowBootSequence(false);
    localStorage.setItem('gamecube-boot-date', new Date().toDateString());
  };

  // Skip boot sequence
  const skipBoot = () => {
    setBootComplete(true);
    setShowBootSequence(false);
  };

  // Game definitions with tooltips and save data
  const games = [
    {
      id: 'samurai-petal-slice',
      title: 'Samurai Petal Slice',
      tooltip: "Draw the Tetsusaiga's arc…",
      description: 'Slice through falling petals with precision',
      icon: '⚔️',
      difficulty: 'medium',
      rewards: { petals: 50, achievements: ['Blade Master'] },
      progress: gameProgress['samurai-petal-slice'] || {
        completed: false,
        highScore: 0,
        unlocked: true,
      },
    },
    {
      id: 'anime-memory-match',
      title: 'Anime Memory Match',
      tooltip: 'Recall the faces bound by fate.',
      description: 'Match anime character pairs from memory',
      icon: '🧠',
      difficulty: 'easy',
      rewards: { petals: 30, achievements: ['Memory Keeper'] },
      progress: gameProgress['anime-memory-match'] || {
        completed: false,
        highScore: 0,
        unlocked: true,
      },
    },
    {
      id: 'bubble-pop-gacha',
      title: 'Bubble-Pop Gacha',
      tooltip: 'Pop for spy-craft secrets…',
      description: 'Pop bubbles to reveal hidden treasures',
      icon: '🎯',
      difficulty: 'easy',
      rewards: { petals: 40, achievements: ['Treasure Hunter'] },
      progress: gameProgress['bubble-pop-gacha'] || {
        completed: false,
        highScore: 0,
        unlocked: true,
      },
    },
    {
      id: 'rhythm-beat-em-up',
      title: 'Rhythm Beat-Em-Up',
      tooltip: "Sync to the Moon Prism's pulse.",
      description: 'Fight to the rhythm of the music',
      icon: '🎵',
      difficulty: 'hard',
      rewards: { petals: 60, achievements: ['Rhythm Master'] },
      progress: gameProgress['rhythm-beat-em-up'] || {
        completed: false,
        highScore: 0,
        unlocked: true,
      },
    },
  ];

  // Boot sequence component
  const BootSequence = () => (
    <motion.div
      ref={bootSequenceRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-display text-pink-400 mb-4">GAMECUBE</h1>
          <p className="text-xl text-zinc-300">Initializing memory core...</p>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 1, duration: 2 }}
          className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-8"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="space-y-4"
        >
          <p className="text-zinc-400">Loading game modules...</p>
          <p className="text-zinc-400">Establishing save protocols...</p>
          <p className="text-zinc-400">Memory core ready.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 0.5 }}
          className="mt-8"
        >
          <button onClick={completeBoot} className="btn-primary mr-4">
            Enter GameCube
          </button>
          <button onClick={skipBoot} className="btn-secondary">
            Skip Boot
          </button>
        </motion.div>
      </div>
    </motion.div>
  );

  // Memory cube component
  const MemoryCube = ({ game, index }: { game: any; index: number }) => {
    const isHovered = hoveredGame === game.id;
    const isCompleted = game.progress.completed;
    const hasHighScore = game.progress.highScore > 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: -15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        whileHover={{
          y: -8,
          rotateX: 5,
          transition: { duration: 0.2 },
        }}
        className="relative group"
        onMouseEnter={() => setHoveredGame(game.id)}
        onMouseLeave={() => setHoveredGame(null)}
      >
        <Link href={`/mini-games/${game.id}`} className="block">
          <GlassPanel
            className={`p-6 h-64 flex flex-col justify-between transition-all duration-300 ${
              isHovered ? 'shadow-[0_0_30px_rgba(255,79,163,0.4)]' : ''
            }`}
          >
            {/* Game Icon */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{game.icon}</div>
              <h3 className="text-lg font-display text-white group-hover:text-pink-300 transition-colors">
                {game.title}
              </h3>
            </div>

            {/* Progress Indicators */}
            <div className="space-y-2">
              {isCompleted && (
                <div className="flex items-center justify-center text-green-400 text-sm">
                  <span className="mr-1">✓</span>
                  Completed
                </div>
              )}
              {hasHighScore && (
                <div className="text-center text-pink-300 text-sm">
                  High Score: {game.progress.highScore}
                </div>
              )}
              <div className="text-center text-zinc-400 text-xs">
                {game.difficulty.toUpperCase()} • {game.rewards.petals} petals
              </div>
            </div>

            {/* Hover Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10"
                >
                  {game.tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
                </motion.div>
              )}
            </AnimatePresence>
          </GlassPanel>
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen bg-otaku-space">
        {/* Boot Sequence */}
        <AnimatePresence>{showBootSequence && <BootSequence />}</AnimatePresence>

        {/* Main Content */}
        {bootComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen"
          >
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
              {/* Header */}
              <div className="mb-12 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl md:text-6xl font-display text-pink-400 mb-4"
                >
                  The Arena of Trials
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl text-zinc-300"
                >
                  Test your mettle and earn your keep
                </motion.p>
              </div>

              {/* Memory Cubes Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {games.map((game, index) => (
                  <MemoryCube key={game.id} game={game} index={index} />
                ))}
              </motion.div>

              {/* Stats Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-12"
              >
                <GlassPanel className="p-6">
                  <h3 className="text-xl font-display text-white mb-4">Your Progress</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-400">
                        {Object.values(gameProgress).filter((p: any) => p.completed).length}
                      </div>
                      <div className="text-sm text-zinc-400">Games Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {Object.values(gameProgress).reduce(
                          (sum: number, p: any) => sum + (p.highScore || 0),
                          0,
                        )}
                      </div>
                      <div className="text-sm text-zinc-400">Total Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {Object.values(gameProgress).reduce(
                          (sum: number, p: any) => sum + (p.highScore > 0 ? 1 : 0),
                          0,
                        )}
                      </div>
                      <div className="text-sm text-zinc-400">Games Played</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {Object.values(gameProgress).reduce(
                          (sum: number, p: any) => sum + (p.completed ? 50 : 0),
                          0,
                        )}
                      </div>
                      <div className="text-sm text-zinc-400">Petals Earned</div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
      <FooterDark />
    </>
  );
}
