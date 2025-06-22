'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PetalCatch = void 0;
const react_1 = require('react');
const framer_motion_1 = require('framer-motion');
const PetalEffect_1 = require('../PetalEffect');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
const Toast_1 = require('../Toast');
const useAchievements_1 = require('@/lib/hooks/useAchievements');
const usePetalCollection_1 = require('@/lib/hooks/usePetalCollection');
const PetalCatch = () => {
  const [gameState, setGameState] = (0, react_1.useState)({
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    highScore: 0,
  });
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  const { showToast } = (0, Toast_1.useToast)();
  const { unlockAchievement } = (0, useAchievements_1.useAchievements)();
  const { collectPetal } = (0, usePetalCollection_1.usePetalCollection)();
  (0, react_1.useEffect)(() => {
    let timer;
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => ({
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
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      highScore: Math.max(prev.score, prev.highScore),
    }));
    playSound('gameComplete');
    vibrate('success');
    if (gameState.score > gameState.highScore) {
      showToast('New High Score! 🏆', 'achievement', '🏆');
      unlockAchievement('high-score');
    }
  };
  const handlePetalCollect = () => {
    if (!gameState.isPlaying) return;
    setGameState(prev => ({
      ...prev,
      score: prev.score + 1,
    }));
    collectPetal(1);
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
      <framer_motion_1.AnimatePresence>
        {gameState.isPlaying ? (
          <>
            <div className="absolute left-4 top-4 z-10 text-white">
              <div className="text-2xl font-bold">Score: {gameState.score}</div>
              <div className="text-xl">Time: {gameState.timeLeft}s</div>
            </div>
            <PetalEffect_1.PetalEffect count={5} interactive onCollect={handlePetalCollect} />
          </>
        ) : (
          <framer_motion_1.motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-white"
          >
            <h2 className="mb-4 text-4xl font-bold">Petal Catch</h2>
            <p className="mb-8 text-xl">Catch as many petals as you can!</p>
            <div className="mb-8 text-2xl">High Score: {gameState.highScore}</div>
            <framer_motion_1.motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="rounded-lg bg-pink-500 px-8 py-4 text-xl font-bold"
            >
              Start Game
            </framer_motion_1.motion.button>
          </framer_motion_1.motion.div>
        )}
      </framer_motion_1.AnimatePresence>
    </div>
  );
};
exports.PetalCatch = PetalCatch;
