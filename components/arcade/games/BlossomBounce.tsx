'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function BlossomBounce({ onComplete, _onFail, _duration }: GameProps) {
  const [bounceCount, setBounceCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [_bounceHeight, setBounceHeight] = useState(50);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowElements(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (bounceCount >= 15) {
      onComplete(100, 35);
    }
  }, [bounceCount, onComplete]);

  const handleBounce = useCallback(() => {
    if (isBouncing) return;

    setIsBouncing(true);
    setBounceCount((prev) => prev + 1);
    setBounceHeight(80);

    setTimeout(() => {
      setIsBouncing(false);
      setBounceHeight(50);
    }, 400);
  }, [isBouncing]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleBounce();
      }
    },
    [handleBounce],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-pink-300 to-purple-400">
      {/* Background */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Bouncing elements */}
      <AnimatePresence>
        {showElements && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-8">
            <motion.div
              animate={{
                y: isBouncing ? -20 : 0,
                scale: isBouncing ? 1.2 : 1,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-6xl"
            >
              <span role="img" aria-label="Cherry blossom">
                
              </span>
            </motion.div>
            <motion.div
              animate={{
                y: isBouncing ? -20 : 0,
                scale: isBouncing ? 1.2 : 1,
              }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              className="text-6xl"
            >
              <span role="img" aria-label="Cherry blossom">
                
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg">
        <p className="text-sm">Bounces: {bounceCount}/15</p>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showElements
            ? 'Get ready...'
            : bounceCount < 15
              ? 'Keep bouncing! (SPACE)'
              : 'Perfect rhythm!'}
        </p>
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleBounce}
        aria-label="Bounce the cherry blossoms"
      />
    </div>
  );
}
