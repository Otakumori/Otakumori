'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function ButtonMashersKiss({ onComplete, onFail, duration }: GameProps) {
  const [mashCount, setMashCount] = useState(0);
  const [isMashing, setIsMashing] = useState(false);
  const [showSilhouettes, setShowSilhouettes] = useState(false);
  const [kissProgress, setKissProgress] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowSilhouettes(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (kissProgress >= 100) {
      onComplete(100, 25);
    }
  }, [kissProgress, onComplete]);

  const handleMash = () => {
    if (isMashing) return;

    setIsMashing(true);
    setMashCount((prev) => prev + 1);
    setKissProgress((prev) => Math.min(prev + 8, 100));

    setTimeout(() => {
      setIsMashing(false);
    }, 100);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      handleMash();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-red-400 to-pink-500">
      {/* Background */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Silhouettes */}
      <AnimatePresence>
        {showSilhouettes && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-8">
            <motion.div
              animate={{
                x: kissProgress * 0.5,
                scale: isMashing ? 1.1 : 1,
              }}
              transition={{ duration: 0.1 }}
              className="text-6xl"
            >
              👤
            </motion.div>
            <motion.div
              animate={{
                x: -kissProgress * 0.5,
                scale: isMashing ? 1.1 : 1,
              }}
              transition={{ duration: 0.1 }}
              className="text-6xl"
            >
              👤
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kiss effect */}
      <AnimatePresence>
        {kissProgress >= 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-6xl">💋</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kiss progress */}
      <div className="absolute top-4 left-4 right-4 bg-black/60 rounded-lg p-2">
        <div className="flex justify-between text-white text-sm mb-1">
          <span>Kiss Progress</span>
          <span>{kissProgress}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <motion.div
            className="bg-pink-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${kissProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showSilhouettes
            ? 'Get ready...'
            : kissProgress < 100
              ? 'Mash to close the gap! (SPACE)'
              : 'Friend-zoned.'}
        </p>
      </div>

      {/* Click area */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleMash} />
    </div>
  );
}
