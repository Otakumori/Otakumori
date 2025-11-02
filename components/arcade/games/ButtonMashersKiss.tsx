'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

// Anime-style character silhouettes
function CharacterSilhouette({ side, progress }: { side: 'left' | 'right'; progress: number }) {
  const isLeft = side === 'left';
  const xOffset = isLeft ? progress * 0.8 : -progress * 0.8;

  return (
    <motion.div
      animate={{ x: xOffset }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative"
    >
      {/* Head */}
      <div className="w-20 h-24 bg-gradient-to-br from-purple-900 to-purple-950 rounded-full relative shadow-2xl">
        {/* Hair */}
        <div
          className={`absolute ${isLeft ? '-right-4' : '-left-4'} top-0 w-12 h-16 bg-purple-950 rounded-full`}
        />

        {/* Eyes (closed when close to kiss) */}
        {progress < 70 && (
          <>
            <div
              className={`absolute top-8 ${isLeft ? 'left-4' : 'right-4'} w-3 h-4 bg-white rounded-full overflow-hidden`}
            >
              <div className="absolute top-1 left-1 w-2 h-2 bg-pink-500 rounded-full" />
            </div>
          </>
        )}

        {/* Blush */}
        {progress > 40 && (
          <>
            <div
              className={`absolute top-12 ${isLeft ? 'left-1' : 'right-1'} w-4 h-2 bg-pink-400 rounded-full opacity-60`}
            />
          </>
        )}

        {/* Lips */}
        <div
          className={`absolute bottom-8 ${isLeft ? 'right-2' : 'left-2'} w-3 h-2 bg-pink-500 rounded-full`}
        />
      </div>

      {/* Body */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-purple-900 to-purple-950 rounded-t-3xl" />
    </motion.div>
  );
}

// Heart particles
function HeartParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute text-2xl"
      aria-hidden="true"
      initial={{ scale: 0, opacity: 0, x, y, rotate: 0 }}
      animate={{
        scale: [0, 1, 1, 0],
        opacity: [0, 1, 1, 0],
        y: y - 60,
        rotate: [0, 360],
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: 'easeOut',
      }}
    >
      Heart
    </motion.div>
  );
}

export default function ButtonMashersKiss({ onComplete, _onFail, _duration }: GameProps) {
  const [_isMashing, setIsMashing] = useState(false);
  const [showSilhouettes, setShowSilhouettes] = useState(false);
  const [kissProgress, setKissProgress] = useState(0);
  const [heartBurst, setHeartBurst] = useState(0);
  const [mashSpeed, setMashSpeed] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowSilhouettes(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (kissProgress >= 100) {
      setTimeout(() => {
        onComplete(100 + mashSpeed * 2, 25); // Bonus for fast mashing
      }, 800);
    }
  }, [kissProgress, mashSpeed, onComplete]);

  // Track mash speed for bonus
  const lastMashTime = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - (window as any).lastMash || 1000;
    (window as any).lastMash = now;
    return timeDiff;
  }, []);

  const handleMash = useCallback(() => {
    if (kissProgress >= 100) return;

    const timeDiff = lastMashTime();
    const speed = Math.max(0, 10 - Math.floor(timeDiff / 100)); // Faster = higher speed
    setMashSpeed((prev) => Math.max(prev, speed));

    setIsMashing(true);
    setKissProgress((prev) => Math.min(prev + 8, 100));

    // Trigger heart particles occasionally
    if (Math.random() > 0.7) {
      setHeartBurst((prev) => prev + 1);
    }

    setTimeout(() => {
      setIsMashing(false);
    }, 100);
  }, [kissProgress, lastMashTime]);

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
    <div className="w-full h-full relative bg-gradient-to-br from-pink-400 via-red-400 to-pink-500 overflow-hidden">
      {/* Romantic background hearts */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl" aria-hidden="true"
            style={{
              left: `${(i * 7) % 90}%`,
              top: `${(i * 13) % 90}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            HeartHeart
          </motion.div>
        ))}
      </div>

      {/* Characters */}
      <AnimatePresence>
        {showSilhouettes && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div
              className="relative flex items-center"
              style={{ gap: `${Math.max(50, 200 - kissProgress * 1.5)}px` }}
            >
              <CharacterSilhouette side="left" progress={kissProgress} />
              <CharacterSilhouette side="right" progress={kissProgress} />

              {/* Kiss spark when close */}
              {kissProgress > 80 && kissProgress < 100 && (
                <motion.div
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  <div className="w-8 h-8 bg-pink-300 rounded-full blur-md" />
                </motion.div>
              )}
            </div>

            {/* Flying hearts */}
            {Array.from({ length: Math.min(5, heartBurst) }).map((_, i) => (
              <HeartParticle
                key={`${heartBurst}-${i}`}
                delay={i * 0.1}
                x={(Math.random() - 0.5) * 40}
                y={-20}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Progress HUD */}
      <div className="absolute top-4 left-4 right-4 max-w-md">
        <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4 border-2 border-pink-300 shadow-2xl">
          <div className="flex justify-between text-white text-sm mb-2 font-bold drop-shadow-lg">
            <span>ROMANTIC TENSION</span>
            <span>{kissProgress}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4 border-2 border-pink-300 overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 h-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${kissProgress}%` }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Animated pulse */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>

          {/* Speed bonus indicator */}
          {mashSpeed > 5 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-2 text-center text-yellow-300 text-xs font-bold drop-shadow-lg"
            >
              Speed bonus x{mashSpeed}
            </motion.div>
          )}
        </div>
      </div>

      {/* Kiss completion */}
      <AnimatePresence>
        {kissProgress >= 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="bg-gradient-to-br from-pink-500 to-red-600 text-white px-10 py-8 rounded-3xl shadow-2xl border-4 border-pink-300"
            >
              <p className="text-5xl mb-3">KISS</p>
              <p className="text-3xl font-bold mb-2">TRUE LOVE!</p>
              <p className="text-xl">Connection Complete</p>
              {mashSpeed > 5 && (
                <p className="text-sm mt-2 text-yellow-200">
                  Bonus: +{mashSpeed * 2} Petals for passion!
                </p>
              )}
            </motion.div>

            {/* Explosion of hearts */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl" aria-hidden="true"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i / 20) * Math.PI * 2) * 150,
                  y: Math.sin((i / 20) * Math.PI * 2) * 150,
                }}
                transition={{ duration: 1, delay: i * 0.05 }}
              >
                Heart
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-white text-base font-bold drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
          {!showSilhouettes
            ? 'Hearts align...'
            : kissProgress < 100
              ? 'Mash to build tension!'
              : 'Love blossoms!'}
        </p>
        {kissProgress < 100 && showSilhouettes && (
          <p className="text-white/90 text-xs mt-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            Press SPACE or CLICK rapidly - Speed = Bonus Petals!
          </p>
        )}
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleMash}
        disabled={kissProgress >= 100}
        aria-label="Mash to build romantic tension between the characters"
      />
    </div>
  );
}
