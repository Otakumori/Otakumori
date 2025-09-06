'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function ThighTrap({ onComplete, _onFail, _duration }: GameProps) {
  const [_wiggleCount, setWiggleCount] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [showThighs, setShowThighs] = useState(false);
  const [escapeProgress, setEscapeProgress] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowThighs(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (escapeProgress >= 100) {
      onComplete(100, 28);
    }
  }, [escapeProgress, onComplete]);

  const handleWiggle = () => {
    if (isWiggling) return;

    setIsWiggling(true);
    setWiggleCount((prev) => prev + 1);
    setEscapeProgress((prev) => Math.min(prev + 12, 100));

    setTimeout(() => {
      setIsWiggling(false);
    }, 300);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      e.preventDefault();
      handleWiggle();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-pink-400 to-purple-500">
      {/* Background */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Thighs */}
      <AnimatePresence>
        {showThighs && (
          <motion.div
            animate={{
              scale: isWiggling ? 0.95 : 1,
              rotate: isWiggling ? 2 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-8xl">{escapeProgress >= 100 ? '🦵💨' : '🦵🦵'}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wiggle effect */}
      <AnimatePresence>
        {isWiggling && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-4xl">
              <span role="img" aria-label="Wind effect">💨</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escape progress */}
      <div className="absolute top-4 left-4 right-4 bg-black/60 rounded-lg p-2">
        <div className="flex justify-between text-white text-sm mb-1">
          <span>Escape Progress</span>
          <span>{escapeProgress}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <motion.div
            className="bg-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${escapeProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showThighs
            ? 'Get ready...'
            : escapeProgress < 100
              ? 'Wiggle to escape! (← →)'
              : 'Weakling survived!'}
        </p>
      </div>

      {/* Click area */}
        <button
          className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
          onClick={handleWiggle}
          aria-label="Wiggle to escape using arrow keys or click"
        />
    </div>
  );
}
