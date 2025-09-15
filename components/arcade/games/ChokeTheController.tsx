'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function ChokeTheController({ onComplete, _onFail, _duration }: GameProps) {
  const [vibration, setVibration] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [mashCount, setMashCount] = useState(0);
  const [showController, setShowController] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowController(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (vibration >= 100) {
      setIsComplete(true);
      onComplete(100, 20);
    }
  }, [vibration, onComplete]);

  const handleMash = () => {
    if (isComplete) return;

    setMashCount((prev) => prev + 1);
    setVibration((prev) => Math.min(prev + 8, 100));
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
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-800 to-gray-900">
      {/* Background */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Controller */}
      <AnimatePresence>
        {showController && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: vibration * 2,
              x: Math.sin(vibration * 0.1) * 10,
              y: Math.cos(vibration * 0.1) * 5,
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-32 h-20 bg-gray-700 rounded-lg border-2 border-gray-600 relative">
              {/* Controller details */}
              <div className="absolute top-2 left-2 w-4 h-4 bg-gray-500 rounded-full" />
              <div className="absolute top-2 right-2 w-4 h-4 bg-gray-500 rounded-full" />
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-500 rounded-full" />

              {/* Vibration indicator */}
              <div
                className="absolute inset-0 bg-red-500/20 rounded-lg transition-opacity duration-100"
                style={{ opacity: vibration / 100 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion effect */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-4xl">
              <span role="img" aria-label="Cherry blossom">
                🌸
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showController
            ? 'Get ready...'
            : !isComplete
              ? `MASH! (${mashCount})`
              : "Don't let go..."}
        </p>
        <p className="text-xs opacity-60 mt-1">Press SPACE or click rapidly</p>
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleMash}
        aria-label="Mash the controller to increase vibration"
      />
    </div>
  );
}
