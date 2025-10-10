'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCubeBootSequenceProps {
  onComplete: () => void;
  skipable?: boolean;
}

export default function GameCubeBootSequence({
  onComplete,
  skipable = true,
}: GameCubeBootSequenceProps) {
  const [phase, setPhase] = useState<'spin' | 'logo' | 'complete'>('spin');
  const [showSkip, setShowSkip] = useState(false);
  const [bootSeen, setBootSeen] = useState(false);

  // Check if boot sequence was seen today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    const seen = localStorage.getItem(bootKey);
    setBootSeen(!!seen);

    if (seen) {
      onComplete();
      return;
    }

    // Show skip button after 1 second
    const skipTimer = setTimeout(() => setShowSkip(true), 1000);

    // Phase transitions (authentic GameCube timing)
    const timers = [
      setTimeout(() => setPhase('logo'), 1500), // Cube spin
      setTimeout(() => {
        setPhase('complete');
        setBootSeen(true);
        localStorage.setItem(bootKey, 'true');
        setTimeout(onComplete, 1000); // Logo display
      }, 3000),
    ];

    return () => {
      clearTimeout(skipTimer);
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  const skipBoot = () => {
    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    localStorage.setItem(bootKey, 'true');
    onComplete();
  };

  // Respect reduced motion preference
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
    }
  }, [onComplete]);

  if (bootSeen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0b2e 0%, #0a0520 100%)',
      }}
    >
      {/* Skip button */}
      <AnimatePresence>
        {showSkip && skipable && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={skipBoot}
            className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 text-xs rounded-lg border border-white/10 transition-colors"
          >
            Press any key to skip
          </motion.button>
        )}
      </AnimatePresence>

      {/* Spinning cube phase (authentic GameCube style) */}
      {phase === 'spin' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          {/* 3D CSS Cube */}
          <div className="relative w-48 h-48 mx-auto mb-8" style={{ perspective: '800px' }}>
            <motion.div
              className="absolute inset-0 transform-gpu"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{
                rotateX: [0, 360],
                rotateY: [0, 720], // 2 full rotations
              }}
              transition={{
                duration: 1.5,
                ease: [0.45, 0, 0.15, 1], // Ease out cubic
              }}
            >
              {/* Cube faces */}
              {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
                <div
                  key={face}
                  className="absolute w-full h-full"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 50%, #6b21a8 100%)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    transform:
                      face === 'front'
                        ? 'translateZ(96px)'
                        : face === 'back'
                          ? 'translateZ(-96px) rotateY(180deg)'
                          : face === 'right'
                            ? 'rotateY(90deg) translateZ(96px)'
                            : face === 'left'
                              ? 'rotateY(-90deg) translateZ(96px)'
                              : face === 'top'
                                ? 'rotateX(90deg) translateZ(96px)'
                                : 'rotateX(-90deg) translateZ(96px)',
                  }}
                >
                  {/* Subtle shine */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                    }}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Logo reveal phase */}
      {phase === 'logo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-5xl font-bold tracking-[0.3em] mb-2"
            style={{
              fontFamily: 'Arial, sans-serif',
              background: 'linear-gradient(180deg, #fff 0%, #c0c0c0 50%, #808080 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
            }}
          >
            OTAKU-MORI
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-0.5 w-40 mx-auto bg-gradient-to-r from-transparent via-purple-400 to-transparent"
          />
        </motion.div>
      )}

      {/* Complete phase */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1
            className="text-5xl font-bold tracking-[0.3em]"
            style={{
              fontFamily: 'Arial, sans-serif',
              background: 'linear-gradient(180deg, #fff 0%, #c0c0c0 50%, #808080 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            OTAKU-MORI
          </h1>
        </motion.div>
      )}
    </div>
  );
}
