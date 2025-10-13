'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

// Thighs closing in
function ThighTrapVisual({ progress }: { progress: number }) {
  const gap = Math.max(20, 200 - progress * 1.8);

  return (
    <div className="relative w-full h-64">
      {/* Left thigh */}
      <motion.div
        className="absolute left-0 top-0 w-32 h-64 bg-gradient-to-r from-pink-300 to-pink-500 rounded-r-3xl shadow-2xl"
        animate={{ x: progress * 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          boxShadow: '10px 0 30px rgba(236, 72, 153, 0.4)',
        }}
      >
        {/* Shading for depth */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20 rounded-r-3xl" />
      </motion.div>

      {/* Right thigh */}
      <motion.div
        className="absolute right-0 top-0 w-32 h-64 bg-gradient-to-l from-pink-300 to-pink-500 rounded-l-3xl shadow-2xl"
        animate={{ x: -progress * 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          boxShadow: '-10px 0 30px rgba(236, 72, 153, 0.4)',
        }}
      >
        {/* Shading for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 rounded-l-3xl" />
      </motion.div>

      {/* Player (getting squeezed) */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1 - progress / 200, 1],
          scaleX: progress > 80 ? 0.7 : 1,
        }}
      >
        <div className="w-12 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg relative shadow-lg">
          {/* Face (panicking) */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs">
            {progress > 80 ? '😱' : progress > 50 ? '😰' : '😅'}
          </div>
        </div>
      </motion.div>

      {/* Danger indicator when close */}
      {progress > 60 && (
        <motion.div
          className="absolute top-2 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-sm"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1, 0.9] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ⚠️ DANGER! ⚠️
        </motion.div>
      )}

      {/* Gap indicator */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs text-white/70">Gap: {Math.floor(gap)}px</p>
      </div>
    </div>
  );
}

export default function ThighTrap({ onComplete, onFail, _duration }: GameProps) {
  const [escapeProgress, setEscapeProgress] = useState(0);
  const [isMashing, setIsMashing] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [trapPressure, setTrapPressure] = useState(0);

  useEffect(() => {
    setShowGame(true);
  }, []);

  // Trap closes over time
  useEffect(() => {
    if (escapeProgress >= 100) return;

    const interval = setInterval(() => {
      setTrapPressure((prev) => {
        if (prev >= 100) {
          onFail();
          return 100;
        }
        return prev + 0.5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [escapeProgress, onFail]);

  useEffect(() => {
    if (escapeProgress >= 100) {
      setTimeout(() => onComplete(100, 28), 600);
    }
  }, [escapeProgress, onComplete]);

  const handleMash = useCallback(() => {
    if (isMashing || escapeProgress >= 100) return;

    setIsMashing(true);
    setEscapeProgress((prev) => Math.min(prev + 8, 100));
    setTrapPressure((prev) => Math.max(0, prev - 3)); // Reduce pressure when mashing

    setTimeout(() => setIsMashing(false), 100);
  }, [isMashing, escapeProgress]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        handleMash();
      }
    },
    [handleMash],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 overflow-hidden">
      {/* Pressure indicator */}
      <div className="absolute top-4 left-4 right-4 max-w-md bg-black/70 backdrop-blur-lg rounded-lg p-3 border-2 border-red-500">
        <div className="flex justify-between text-white text-sm mb-2 font-bold">
          <span>⚠️ TRAP PRESSURE</span>
          <span className="text-red-300">{Math.floor(trapPressure)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-red-500">
          <motion.div
            className="bg-gradient-to-r from-red-500 to-red-700 h-full"
            animate={{ width: `${trapPressure}%` }}
          />
        </div>
      </div>

      {/* Escape progress */}
      <div className="absolute top-20 left-4 right-4 max-w-md bg-black/70 backdrop-blur-lg rounded-lg p-3 border-2 border-green-500">
        <div className="flex justify-between text-white text-sm mb-2 font-bold">
          <span>🏃 ESCAPE PROGRESS</span>
          <span className="text-green-300">{Math.floor(escapeProgress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-green-500">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-green-700 h-full"
            animate={{ width: `${escapeProgress}%` }}
          />
        </div>
      </div>

      {/* Game */}
      <AnimatePresence>
        {showGame && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <ThighTrapVisual progress={trapPressure} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escape success */}
      {escapeProgress >= 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-8 py-6 rounded-2xl text-center border-4 border-green-400 z-20"
        >
          <p className="text-5xl mb-2">💪</p>
          <p className="text-3xl font-bold">ESCAPED!</p>
          <p className="text-sm mt-2">You broke free!</p>
        </motion.div>
      )}

      {/* Failure */}
      {trapPressure >= 100 && escapeProgress < 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-8 py-6 rounded-2xl text-center border-4 border-red-400 z-20"
        >
          <p className="text-5xl mb-2">💀</p>
          <p className="text-3xl font-bold">TRAPPED!</p>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-pink-200 text-base font-bold drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
          {escapeProgress < 100 && trapPressure < 100
            ? '⚠️ MASH TO ESCAPE THE THIGH TRAP! ⚠️'
            : escapeProgress >= 100
              ? 'Freedom achieved!'
              : 'Trapped!'}
        </p>
        {escapeProgress < 100 && trapPressure < 100 && (
          <p className="text-pink-200/70 text-xs mt-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            Press SPACE / Arrows / CLICK rapidly!
          </p>
        )}
      </div>

      <button
        className="absolute inset-0 bg-transparent border-none cursor-pointer"
        onClick={handleMash}
        disabled={escapeProgress >= 100 || trapPressure >= 100}
        aria-label="Mash to escape the thigh trap before being crushed"
      />
    </div>
  );
}
