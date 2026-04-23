'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import FooterDark from '../components/FooterDark';
import GlassPanel from '../components/GlassPanel';

export default function GameCubePage() {
  const [bootComplete, setBootComplete] = useState(false);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [gameProgress, setGameProgress] = useState<Record<string, any>>({});
  const bootSequenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastBootDate = localStorage.getItem('gamecube-boot-date');
    const today = new Date().toDateString();

    if (lastBootDate === today) {
      setBootComplete(true);
      setShowBootSequence(false);
    }
  }, []);

  useEffect(() => {
    const savedProgress = localStorage.getItem('gamecube-progress');
    if (savedProgress) {
      setGameProgress(JSON.parse(savedProgress));
    }
  }, []);

  const _saveGameProgress = (gameId: string, progress: any) => {
    const newProgress = { ...gameProgress, [gameId]: progress };
    setGameProgress(newProgress);
    localStorage.setItem('gamecube-progress', JSON.stringify(newProgress));
  };

  const completeBoot = () => {
    setBootComplete(true);
    setShowBootSequence(false);
    localStorage.setItem('gamecube-boot-date', new Date().toDateString());
  };

  const skipBoot = () => {
    setBootComplete(true);
    setShowBootSequence(false);
  };

  const games = [
    {
      id: 'samurai-petal-slice',
      title: 'Samurai Petal Slice',
      tooltip: "Draw the Tetsusaiga's arc…",
      description: 'Slice through falling petals with precision',
      icon: '',
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
      icon: '',
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
      icon: '',
      difficulty: 'easy',
      rewards: { petals: 40, achievements: ['Treasure Hunter'] },
      progress: gameProgress['bubble-pop-gacha'] || {
        completed: false,
        highScore: 0,
        unlocked: true,
      },
    },
    {
      id: 'otaku-beat-em-up',
      title: 'Rhythm Beat-Em-Up',
      tooltip: "Sync to the Moon Prism's pulse.",
      description: 'Fight to the rhythm of the music',
      icon: '',
      difficulty: 'hard',
      rewards: { petals: 60, achievements: ['Rhythm Master'] },
      progress: gameProgress['otaku-beat-em-up'] || {
        completed: false,
        highScore: 0,
        unlocked: true,
      },
    },
  ];

  const BootSequence = () => (
    <motion.div
      ref={bootSequenceRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="mx-auto max-w-2xl px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="mb-4 text-4xl font-display text-pink-400 md:text-6xl">GAMECUBE</h1>
          <p className="text-xl text-zinc-300">Initializing memory core...</p>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 1, duration: 2 }}
          className="mb-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
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
        className="group relative"
        onMouseEnter={() => setHoveredGame(game.id)}
        onMouseLeave={() => setHoveredGame(null)}
      >
        <Link href={`/mini-games/${game.id}`} className="block">
          <GlassPanel
            className={`flex h-64 flex-col justify-between p-6 transition-all duration-300 ${
              isHovered ? 'shadow-[0_0_30px_rgba(255,79,163,0.4)]' : ''
            }`}
          >
            <div className="mb-4 text-center">
              <div className="mb-2 text-4xl">{game.icon}</div>
              <h3 className="text-lg font-display text-white transition-colors group-hover:text-pink-300">
                {game.title}
              </h3>
            </div>

            <div className="space-y-2">
              {isCompleted && (
                <div className="flex items-center justify-center text-sm text-green-400">
                  <span className="mr-1"></span>
                  Completed
                </div>
              )}
              {hasHighScore && (
                <div className="text-center text-sm text-pink-300">
                  High Score: {game.progress.highScore}
                </div>
              )}
              <div className="text-center text-xs text-zinc-400">
                {game.difficulty.toUpperCase()} • {game.rewards.petals} petals
              </div>
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-black/90 px-3 py-2 text-sm text-white"
                >
                  {game.tooltip}
                  <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
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
        <AnimatePresence mode="wait">
          {showBootSequence ? <BootSequence key="boot-sequence" /> : null}
        </AnimatePresence>

        {bootComplete ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen"
          >
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
              <div className="mb-12 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mb-4 text-4xl font-display text-pink-400 md:text-6xl"
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
              >
                {games.map((game, index) => (
                  <MemoryCube key={game.id} game={game} index={index} />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-12"
              >
                <GlassPanel className="p-6">
                  <h3 className="mb-4 text-xl font-display text-white">Your Progress</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
        ) : null}
      </main>
      <FooterDark />
    </>
  );
}
