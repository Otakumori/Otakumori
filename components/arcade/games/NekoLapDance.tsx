'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function NekoLapDance({ onComplete, _onFail, _duration }: GameProps) {
  const [_petCount, setPetCount] = useState(0);
  const [isPetting, setIsPetting] = useState(false);
  const [showNeko, setShowNeko] = useState(false);
  const [happiness, setHappiness] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowNeko(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (happiness >= 100) {
      onComplete(100, 18);
    }
  }, [happiness, onComplete]);

  const handlePet = () => {
    if (isPetting) return;

    setIsPetting(true);
    setPetCount((prev) => prev + 1);
    setHappiness((prev) => Math.min(prev + 15, 100));

    setTimeout(() => {
      setIsPetting(false);
    }, 300);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handlePet();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-orange-200 to-pink-300">
      {/* Background */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Neko */}
      <AnimatePresence>
        {showNeko && (
          <motion.div
            animate={{
              scale: isPetting ? 1.1 : 1,
              rotate: isPetting ? 5 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-8xl">{happiness >= 100 ? '' : ''}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet effect */}
      <AnimatePresence>
        {isPetting && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-4xl">
              <span role="img" aria-label="Heart">
                
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Happiness bar */}
      <div className="absolute top-4 left-4 right-4 bg-black/60 rounded-lg p-2">
        <div className="flex justify-between text-white text-sm mb-1">
          <span>Happiness</span>
          <span>{happiness}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <motion.div
            className="bg-pink-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${happiness}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showNeko ? 'Get ready...' : happiness < 100 ? 'Pet the neko! (SPACE)' : 'Purrs!'}
        </p>
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handlePet}
        aria-label="Pet the neko to increase happiness"
      />
    </div>
  );
}
