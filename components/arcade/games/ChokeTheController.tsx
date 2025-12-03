'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function ChokeTheController({ onComplete, _onFail, _duration }: GameProps) {
  const [vibration, setVibration] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [mashCount, setMashCount] = useState(0);
  const [showController, setShowController] = useState(false);
  const [particleEffect, setParticleEffect] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowController(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  // Decay vibration over time
  useEffect(() => {
    if (isComplete || vibration === 0) return;

    const decayInterval = setInterval(() => {
      setVibration((prev) => Math.max(prev - 1, 0));
    }, 100);

    return () => clearInterval(decayInterval);
  }, [vibration, isComplete]);

  useEffect(() => {
    if (vibration >= 100 && !isComplete) {
      setIsComplete(true);
      setParticleEffect(true);
      onComplete(100, 20);
    }
  }, [vibration, isComplete, onComplete]);

  const handleMash = useCallback(() => {
    if (isComplete) return;

    setMashCount((prev) => prev + 1);
    setVibration((prev) => Math.min(prev + 6, 100));
  }, [isComplete]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
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
    <div className="w-full h-full relative bg-gradient-to-br from-purple-950 via-pink-950 to-black overflow-hidden">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(236, 72, 153, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 72, 153, 0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Progress bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-64 h-8 bg-black/60 rounded-full border border-pink-500/30 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${vibration}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-bold drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            {Math.floor(vibration)}%
          </span>
        </div>
      </div>

      {/* Controller */}
      <AnimatePresence>
        {showController && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: vibration > 0 ? [0, -5, 5, -5, 5, 0] : 0,
              x: vibration > 0 ? Math.sin(vibration * 0.3) * (vibration / 10) : 0,
              y: vibration > 0 ? Math.cos(vibration * 0.2) * (vibration / 15) : 0,
            }}
            transition={{
              scale: { type: 'spring', stiffness: 200, damping: 15 },
              rotate: { duration: 0.2, repeat: vibration > 0 ? Infinity : 0 },
              x: { duration: 0.1 },
              y: { duration: 0.1 },
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            {/* GameCube-style controller */}
            <div className="relative">
              {/* Main body */}
              <div
                className="w-48 h-32 bg-gradient-to-br from-purple-600 to-purple-800 rounded-[3rem] border-4 border-purple-700 relative shadow-2xl"
                style={{
                  filter: vibration > 50 ? `blur(${(vibration - 50) / 50}px)` : 'none',
                }}
              >
                {/* Left grip */}
                <div className="absolute -left-8 top-8 w-16 h-20 bg-gradient-to-br from-purple-700 to-purple-900 rounded-l-full border-4 border-purple-700" />

                {/* Right grip */}
                <div className="absolute -right-8 top-8 w-16 h-20 bg-gradient-to-br from-purple-700 to-purple-900 rounded-r-full border-4 border-purple-700" />

                {/* D-pad (left) */}
                <div className="absolute top-8 left-8 w-12 h-12">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-12 bg-gray-700 rounded" />
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-3 bg-gray-700 rounded" />
                </div>

                {/* Buttons (right) */}
                <div className="absolute top-8 right-8 w-12 h-12">
                  <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-green-600" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 bg-red-500 rounded-full border-2 border-red-600" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-600" />
                </div>

                {/* C-stick */}
                <div className="absolute bottom-6 right-12 w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-500" />

                {/* Analog stick */}
                <div className="absolute bottom-6 left-12 w-10 h-10 bg-gray-600 rounded-full border-2 border-gray-700">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-400 rounded-full" />
                </div>

                {/* Vibration glow overlay */}
                <motion.div
                  className="absolute inset-0 rounded-[3rem] pointer-events-none"
                  animate={{
                    boxShadow:
                      vibration > 0
                        ? `0 0 ${vibration / 2}px rgba(236, 72, 153, ${vibration / 100}), inset 0 0 ${vibration / 3}px rgba(236, 72, 153, ${vibration / 150})`
                        : 'none',
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Particle burst on completion */}
              <AnimatePresence>
                {particleEffect &&
                  Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-pink-400 rounded-full"
                      initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                      animate={{
                        scale: 0,
                        opacity: 0,
                        x: Math.cos((i / 12) * Math.PI * 2) * 100,
                        y: Math.sin((i / 12) * Math.PI * 2) * 100,
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion effect */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <div className="text-6xl mb-2">
              <span role="img" aria-label="Cherry blossom">
                <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
              </span>
            </div>
            <p className="text-pink-200 text-2xl font-bold drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">
              CHOKED!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-pink-200 text-base font-semibold mb-1 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
          {!showController
            ? 'Get ready...'
            : !isComplete
              ? `MASH TO BUILD PRESSURE! (${mashCount} mashes)`
              : 'Controller destroyed!'}
        </p>
        {!isComplete && showController && (
          <p className="text-pink-200/70 text-xs drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            Press SPACE or click rapidly • Pressure decays over time!
          </p>
        )}
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleMash}
        disabled={isComplete}
        aria-label="Mash to increase controller vibration pressure"
      />
    </div>
  );
}
