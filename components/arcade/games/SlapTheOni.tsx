'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function SlapTheOni({ onComplete, onFail, duration }: GameProps) {
  const [oniPosition, setOniPosition] = useState({ x: 50, y: 50 });
  const [isSlapped, setIsSlapped] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [score, setScore] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show target after a brief delay
    const showTimer = setTimeout(() => setShowTarget(true), 500);

    // Move oni around randomly
    const moveTimer = setInterval(() => {
      if (!isSlapped) {
        setOniPosition({
          x: 20 + Math.random() * 60,
          y: 30 + Math.random() * 40,
        });
      }
    }, 800);

    return () => {
      clearTimeout(showTimer);
      clearInterval(moveTimer);
    };
  }, [isSlapped]);

  const handleSlap = () => {
    if (!showTarget || isSlapped) return;

    setIsSlapped(true);
    setScore(100);
    onComplete(100, 15);
  };

  const handleMiss = () => {
    if (isSlapped) return;
    onFail();
  };

  return (
    <div
      ref={gameRef}
      className="w-full h-full relative bg-gradient-to-br from-purple-900 to-red-900 cursor-pointer"
      onClick={handleSlap}
      onMouseLeave={handleMiss}
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Oni Target */}
      <AnimatePresence>
        {showTarget && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute w-16 h-16 rounded-full border-4 border-red-500 bg-red-500/20"
            style={{
              left: `${oniPosition.x}%`,
              top: `${oniPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Oni face */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-2xl">👹</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slap effect */}
      <AnimatePresence>
        {isSlapped && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 3, opacity: 0 }}
            className="absolute w-20 h-20 bg-yellow-400 rounded-full"
            style={{
              left: `${oniPosition.x}%`,
              top: `${oniPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showTarget ? 'Get ready...' : !isSlapped ? 'SLAP THE ONI!' : 'Too slow, Senpai.'}
        </p>
      </div>
    </div>
  );
}
