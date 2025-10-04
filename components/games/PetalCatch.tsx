 

'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetalEffect } from '@/components/PetalEffect';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { useToast } from '@/components/Toast';
import { useAchievements } from '@/lib/hooks/useAchievements';
import { usePetals } from '@/lib/hooks/usePetals';

interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
  highScore: number;
}

export const PetalCatch = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    highScore: 0,
  });

  const { playSound } = useSound();
  const { vibrate } = useHaptic();
  const { showToast } = useToast();
  const { unlockAchievement } = useAchievements();
  const { addPetal } = usePetals();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (gameState.timeLeft === 0) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.timeLeft]);

  const handleStart = () => {
    setGameState({
      score: 0,
      timeLeft: 60,
      isPlaying: true,
      highScore: gameState.highScore,
    });
    playSound('gameStart');
    vibrate('medium');
  };

  const handleGameOver = () => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      highScore: Math.max(prev.score, prev.highScore),
    }));
    playSound('gameComplete');
    vibrate('success');

    if (gameState.score > gameState.highScore) {
      showToast('New High Score! ', 'achievement', '');
      unlockAchievement('high-score');
    }
  };

  const handlePetalCollect = () => {
    if (!gameState.isPlaying) return;

    setGameState((prev) => ({
      ...prev,
      score: prev.score + 1,
    }));

    addPetal();
    playSound('petal');
    vibrate('light');

    // Unlock achievements based on score
    if (gameState.score === 9) {
      unlockAchievement('petal-novice');
    } else if (gameState.score === 49) {
      unlockAchievement('petal-master');
    }
  };

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <AnimatePresence>
        {gameState.isPlaying ? (
          <>
            <div className="absolute left-4 top-4 z-10 text-white">
              <div className="text-2xl font-bold">Score: {gameState.score}</div>
              <div className="text-xl">Time: {gameState.timeLeft}s</div>
            </div>
            <PetalEffect count={5} interactive onCollect={handlePetalCollect} />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-white"
          >
            <h2 className="mb-4 text-4xl font-bold">Petal Catch</h2>
            <p className="mb-8 text-xl">Catch as many petals as you can!</p>
            <div className="mb-8 text-2xl">High Score: {gameState.highScore}</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="rounded-lg bg-pink-500 px-8 py-4 text-xl font-bold"
            >
              Start Game
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
