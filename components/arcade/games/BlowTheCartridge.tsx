'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function BlowTheCartridge({ onComplete, _onFail, _duration }: GameProps) {
  const [_blowCount, setBlowCount] = useState(0);
  const [isBlowing, setIsBlowing] = useState(false);
  const [showCartridge, setShowCartridge] = useState(false);
  const [cleanliness, setCleanliness] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowCartridge(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (cleanliness >= 100) {
      onComplete(100, 22);
    }
  }, [cleanliness, onComplete]);

  const handleBlow = useCallback(() => {
    if (isBlowing) return;

    setIsBlowing(true);
    setBlowCount((prev) => prev + 1);
    setCleanliness((prev) => Math.min(prev + 20, 100));

    setTimeout(() => {
      setIsBlowing(false);
    }, 500);
  }, [isBlowing]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handleBlow();
    }
  }, [handleBlow]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-600 to-gray-800">
      {/* Background */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Cartridge */}
      <AnimatePresence>
        {showCartridge && (
          <motion.div
            animate={{
              scale: isBlowing ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-16 h-20 bg-gray-700 rounded-lg border-2 border-gray-600 relative">
              {/* Dust particles */}
              <div className="absolute inset-0">
                {cleanliness < 100 && (
                  <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full" />
                )}
                {cleanliness < 80 && (
                  <div className="absolute top-4 right-3 w-1 h-1 bg-yellow-400 rounded-full" />
                )}
                {cleanliness < 60 && (
                  <div className="absolute bottom-3 left-3 w-1 h-1 bg-yellow-400 rounded-full" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blow effect */}
      <AnimatePresence>
        {isBlowing && (
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

      {/* Cleanliness bar */}
      <div className="absolute top-4 left-4 right-4 bg-black/60 rounded-lg p-2">
        <div className="flex justify-between text-white text-sm mb-1">
          <span>Cleanliness</span>
          <span>{cleanliness}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${cleanliness}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showCartridge
            ? 'Get ready...'
            : cleanliness < 100
              ? 'Blow the dust! (SPACE)'
              : 'Game loads with sensual beep!'}
        </p>
      </div>

      {/* Click area */}
        <button
          className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
          onClick={handleBlow}
          aria-label="Blow on cartridge to clean it"
        />
    </div>
  );
}
