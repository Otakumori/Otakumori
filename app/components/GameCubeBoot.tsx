'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCubeBootProps {
  onComplete?: () => void;
  skipable?: boolean;
}

interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

export default function GameCubeBoot({ onComplete, skipable = true }: GameCubeBootProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<
    'rolling' | 'assembling' | 'reveal' | 'burst' | 'complete'
  >('rolling');
  const [showPetals, setShowPetals] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      handleComplete();
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    const hasSeenToday = localStorage.getItem(bootKey);

    if (hasSeenToday && skipable) {
      handleComplete();
      return;
    }

    // Initialize audio (optional)
    try {
      audioRef.current = new Audio('/assets/sounds/gamecube-startup.mp3');
      audioRef.current.volume = 0.3;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('Boot audio not available:', undefined, { message: err.message });
    }

    // Boot sequence timing
    const sequence = async () => {
      // Phase 1: Rolling cubes (900ms)
      setCurrentPhase('rolling');
      if (audioRef.current) {
        try {
          await audioRef.current.play();
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.warn('Audio play failed:', undefined, { message: err.message });
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 900));

      // Phase 2: Assembly (800ms)
      setCurrentPhase('assembling');
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Phase 3: Logo reveal (800ms)
      setCurrentPhase('reveal');
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Phase 4: Petal burst (1500ms)
      setCurrentPhase('burst');
      setShowPetals(true);
      generatePetals();
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Phase 5: Complete
      setCurrentPhase('complete');
      localStorage.setItem(bootKey, 'true');

      // Auto-complete after a brief pause
      setTimeout(() => {
        handleComplete();
      }, 500);
    };

    // Enable skip after 1.5 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 1500);

    sequence();

    return () => {
      clearTimeout(skipTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onComplete, skipable]);

  const generatePetals = () => {
    const newPetals: Petal[] = [];
    const colors = ['#FFB7C5', '#FF69B4', '#FFC0CB', '#FF1493'];

    for (let i = 0; i < 12; i++) {
      newPetals.push({
        id: i,
        x: 50 + Math.random() * 40, // Center around the O
        y: 50 + Math.random() * 40,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setPetals(newPetals);
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    if (!canSkip) return;
    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    localStorage.setItem(bootKey, 'true');

    if (audioRef.current) {
      audioRef.current.pause();
    }

    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Skip button */}
        {canSkip && skipable && (
          <motion.button
            className="absolute bottom-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Skip
          </motion.button>
        )}

        {/* Main animation container */}
        <div className="relative w-96 h-96 flex items-center justify-center">
          {/* Phase 1: Rolling cubes */}
          {currentPhase === 'rolling' && (
            <div className="flex space-x-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg"
                  initial={{ x: -200, rotate: 0 }}
                  animate={{ x: 0, rotate: 360 }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Phase 2: Assembly */}
          {currentPhase === 'assembling' && (
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: 'backOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Phase 3: Logo reveal */}
          {currentPhase === 'reveal' && (
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* O-shaped cube formation */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-8 border-pink-500 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-sm" />
                <div className="absolute inset-4 bg-transparent rounded-lg border-4 border-pink-400" />
              </div>

              {/* OTAKU-MORI text */}
              <motion.div
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h1 className="text-2xl font-bold text-white tracking-wider">OTAKU-MORI</h1>
              </motion.div>
            </motion.div>
          )}

          {/* Phase 4: Petal burst */}
          {currentPhase === 'burst' && (
            <>
              {/* O-shaped cube (static) */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-8 border-pink-500 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-sm" />
                <div className="absolute inset-4 bg-transparent rounded-lg border-4 border-pink-400" />
              </div>

              {/* OTAKU-MORI text */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                <h1 className="text-2xl font-bold text-white tracking-wider">OTAKU-MORI</h1>
              </div>

              {/* Petal burst animation */}
              {showPetals &&
                petals.map((petal) => (
                  <motion.div
                    key={petal.id}
                    className="absolute w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: petal.color,
                      left: `${petal.x}%`,
                      top: `${petal.y}%`,
                    }}
                    initial={{
                      scale: 0,
                      rotate: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      scale: petal.scale,
                      rotate: petal.rotation,
                      x: (Math.random() - 0.5) * 400,
                      y: (Math.random() - 0.5) * 400,
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: 'easeOut',
                      times: [0, 0.8, 1],
                    }}
                  />
                ))}
            </>
          )}

          {/* Phase 5: Complete */}
          {currentPhase === 'complete' && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 border-8 border-pink-500 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-sm" />
                <div className="absolute inset-4 bg-transparent rounded-lg border-4 border-pink-400" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wider mb-2">OTAKU-MORI</h1>
              <p className="text-pink-300 text-sm">Ready to play</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
