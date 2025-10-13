'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

// Neko character with ears and tail
function NekoCharacter({ happiness, isPetting }: { happiness: number; isPetting: boolean }) {
  return (
    <div className="relative">
      {/* Cat ears */}
      <div className="absolute -top-8 left-8 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-pink-600" />
      <div className="absolute -top-8 right-8 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-pink-600" />

      {/* Head */}
      <div className="w-24 h-24 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full relative shadow-2xl">
        {/* Eyes - change based on happiness */}
        <motion.div
          className="absolute top-8 left-4 text-2xl"
          animate={{ scale: isPetting ? 1.2 : 1 }}
        >
          {happiness > 70 ? '^' : happiness > 30 ? '･' : '－'}ω
          {happiness > 70 ? '^' : happiness > 30 ? '･' : '－'}
        </motion.div>

        {/* Blush */}
        <div className="absolute top-12 left-2 w-4 h-2 bg-red-400 rounded-full opacity-60" />
        <div className="absolute top-12 right-2 w-4 h-2 bg-red-400 rounded-full opacity-60" />

        {/* Whiskers */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`left-${i}`}
            className="absolute left-0 bg-white h-px"
            style={{
              width: '20px',
              top: `${40 + i * 5}px`,
              transform: `rotate(-${15 + i * 5}deg)`,
              transformOrigin: 'right',
            }}
          />
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`right-${i}`}
            className="absolute right-0 bg-white h-px"
            style={{
              width: '20px',
              top: `${40 + i * 5}px`,
              transform: `rotate(${15 + i * 5}deg)`,
              transformOrigin: 'left',
            }}
          />
        ))}
      </div>

      {/* Body */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-gradient-to-b from-pink-400 to-pink-600 rounded-t-full" />

      {/* Tail - swaying */}
      <motion.div
        className="absolute -bottom-12 -right-4 w-6 h-20 bg-gradient-to-b from-pink-500 to-pink-700 rounded-full origin-top"
        animate={{
          rotate: isPetting ? [0, 20, -20, 0] : [0, 10, -10, 0],
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* Paw prints when petting */}
      {isPetting && (
        <motion.div
          className="absolute top-full left-1/2 transform -translate-x-1/2 text-3xl"
          initial={{ scale: 0, y: 0 }}
          animate={{ scale: [0, 1, 0], y: 30 }}
          transition={{ duration: 0.6 }}
        >
          🐾
        </motion.div>
      )}
    </div>
  );
}

export default function NekoLapDance({ onComplete, _onFail, _duration }: GameProps) {
  const [isPetting, setIsPetting] = useState(false);
  const [showNeko, setShowNeko] = useState(false);
  const [happiness, setHappiness] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowNeko(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (happiness >= 100) {
      setTimeout(() => onComplete(100, 18), 800);
    }
  }, [happiness, onComplete]);

  const handlePet = useCallback(() => {
    if (isPetting || happiness >= 100) return;
    setIsPetting(true);
    setHappiness((prev) => Math.min(prev + 15, 100));
    setTimeout(() => setIsPetting(false), 400);
  }, [isPetting, happiness]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePet();
      }
    },
    [handlePet],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-pink-300 via-orange-200 to-yellow-200 overflow-hidden">
      {/* Floating hearts */}
      {happiness > 0 &&
        Array.from({ length: Math.floor(happiness / 20) }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            style={{ left: `${20 + i * 15}%`, bottom: 0 }}
            animate={{ y: [0, -200], opacity: [1, 0] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
          >
            💕
          </motion.div>
        ))}

      {/* Neko */}
      <AnimatePresence>
        {showNeko && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isPetting ? 1.05 : 1,
              opacity: 1,
              y: isPetting ? -10 : 0,
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <NekoCharacter happiness={happiness} isPetting={isPetting} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Happiness bar */}
      <div className="absolute top-4 left-4 right-4 max-w-md bg-white/50 backdrop-blur-lg rounded-lg p-4 border-2 border-pink-300">
        <div className="flex justify-between text-sm mb-2 font-bold">
          <span>😺 HAPPINESS</span>
          <span>{happiness}%</span>
        </div>
        <div className="w-full bg-pink-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-pink-400 to-pink-600 h-full"
            animate={{ width: `${happiness}%` }}
          />
        </div>
      </div>

      {/* Completion */}
      {happiness >= 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-500 text-white px-8 py-6 rounded-2xl text-center"
        >
          <p className="text-4xl mb-2">😻</p>
          <p className="text-2xl font-bold">PURR-FECT!</p>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-pink-800 text-base font-semibold">
          {!showNeko
            ? 'Neko appears...'
            : happiness < 100
              ? '🐱 PET THE NEKO! 🐱'
              : 'Maximum happiness!'}
        </p>
        {happiness < 100 && showNeko && (
          <p className="text-pink-700 text-xs mt-1">Press SPACE or CLICK</p>
        )}
      </div>

      <button
        className="absolute inset-0 bg-transparent border-none cursor-pointer"
        onClick={handlePet}
        disabled={happiness >= 100}
        aria-label="Pet the neko character"
      />
    </div>
  );
}
