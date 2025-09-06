'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function PetalLick({ onComplete, onFail, _duration }: GameProps) {
  const [petalY, setPetalY] = useState(0);
  const [tongueY, setTongueY] = useState(80);
  const [isLicking, setIsLicking] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [showElements, setShowElements] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowElements(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!showElements) return;

    // Drop petal
    const dropTimer = setInterval(() => {
      setPetalY((prev) => {
        if (prev >= 100) {
          clearInterval(dropTimer);
          if (!isCaught) {
            onFail();
          }
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(dropTimer);
  }, [showElements, isCaught, onFail]);

  const handleLick = () => {
    if (isCaught) return;

    setIsLicking(true);
    setTongueY(60);

    // Check if tongue catches petal
    setTimeout(() => {
      if (petalY >= 50 && petalY <= 70) {
        setIsCaught(true);
        onComplete(100, 12);
      }
      setIsLicking(false);
      setTongueY(80);
    }, 200);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      handleLick();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-pink-200 to-purple-300">
      {/* Background */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Silhouette */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <div className="w-20 h-32 bg-black/60 rounded-t-full" />
      </div>

      {/* Petal */}
      <AnimatePresence>
        {showElements && (
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: `${petalY}%`, opacity: 1 }}
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <div className="w-4 h-4 bg-pink-400 rounded-full">
              <div className="w-full h-full bg-pink-300 rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tongue */}
      <AnimatePresence>
        {showElements && (
          <motion.div
            animate={{
              y: `${tongueY}%`,
              scaleY: isLicking ? 1.5 : 1,
            }}
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <div className="w-8 h-12 bg-red-400 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success effect */}
      <AnimatePresence>
        {isCaught && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-4xl">
              <span role="img" aria-label="Cherry blossom">
                🌸
              </span>
              <span role="img" aria-label="Cherry blossom">
                🌸
              </span>
              <span role="img" aria-label="Cherry blossom">
                🌸
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-black text-center">
        <p className="text-sm opacity-80">
          {!showElements ? 'Get ready...' : !isCaught ? 'Catch the petal!' : 'Too dry...'}
        </p>
        <p className="text-xs opacity-60 mt-1">Press SPACE to lick</p>
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleLick}
        aria-label="Lick to catch the falling petal"
      />
    </div>
  );
}
