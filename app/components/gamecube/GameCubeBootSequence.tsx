'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCubeBootSequenceProps {
  onComplete: () => void;
  skipable?: boolean;
}

export default function GameCubeBootSequence({
  onComplete,
  skipable = true,
}: GameCubeBootSequenceProps) {
  const [phase, setPhase] = useState<'spin' | 'logo' | 'burst' | 'complete'>('spin');
  const [showSkip, setShowSkip] = useState(false);
  const [showPetals, setShowPetals] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Boot sequence always shows (no localStorage gating)
  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    // Initialize audio (optional)
    try {
      audioRef.current = new Audio('/assets/sounds/gamecube-startup.mp3');
      audioRef.current.volume = 0.3;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.warn('Boot audio not available:', err.message);
    }

    // Play audio
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user might not have interacted with page yet)
      });
    }

    // Show skip button after 1 second
    const skipTimer = setTimeout(() => setShowSkip(true), 1000);
    timeoutRefs.current.push(skipTimer);

    // Phase transitions (authentic GameCube timing)
    const logoTimer = setTimeout(() => setPhase('logo'), 1000); // O-cube arrival
    const burstTimer = setTimeout(() => {
      setPhase('burst');
      setShowPetals(true);
    }, 2000); // Petal burst
    const completeTimer = setTimeout(() => {
      setPhase('complete');
      const finalTimer = setTimeout(onComplete, 600); // Wordmark display
      timeoutRefs.current.push(finalTimer);
    }, 2600); // Complete

    timeoutRefs.current.push(logoTimer, burstTimer, completeTimer);

    // Cleanup function
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onComplete]);

  const skipBoot = () => {
    // Clean up audio and timers
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    onComplete();
  };

  // Skip button keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSkip && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        skipBoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSkip]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #2e0b1a 0%, #0a0520 100%)',
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

      {/* Spinning O-cube phase */}
      {phase === 'spin' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          {/* 3D CSS O-Cube */}
          <div className="relative w-48 h-48 mx-auto mb-8" style={{ perspective: '800px' }}>
            <motion.div
              className="absolute inset-0 transform-gpu"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{
                rotateX: [0, 360],
                rotateY: [0, 720], // 2 full rotations
              }}
              transition={{
                duration: 1.0,
                ease: [0.45, 0, 0.15, 1], // Ease out cubic
              }}
            >
              {/* O-Cube faces with hollow center - SAKURA PINK */}
              {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
                <div
                  key={face}
                  className="absolute w-full h-full"
                  style={{
                    background: 'linear-gradient(135deg, #ffc7d9 0%, #ff9fbe 50%, #ec4899 100%)',
                    border: '2px solid #ff9fbe',
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
                  {/* Hollow O-shaped center */}
                  <div
                    className="absolute inset-8 bg-black rounded-full border-2 border-white/20"
                    style={{
                      clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
                    }}
                  />

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

      {/* Logo reveal phase - O-cube settles */}
      {phase === 'logo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Settled O-Cube */}
          <motion.div
            initial={{ scale: 1.08, rotateY: 0 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-48 h-48 mx-auto mb-8"
            style={{ perspective: '800px' }}
          >
            <div
              className="absolute inset-0 transform-gpu"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front face of O-Cube - SAKURA PINK */}
              <div
                className="absolute w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, #ffc7d9 0%, #ff9fbe 50%, #ec4899 100%)',
                  border: '2px solid #ff9fbe',
                  transform: 'translateZ(96px)',
                }}
              >
                {/* Hollow O-shaped center */}
                <div
                  className="absolute inset-8 bg-black rounded-full border-2 border-white/20"
                  style={{
                    clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
                  }}
                />

                {/* Glow effect */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)',
                    boxShadow: '0 0 30px rgba(236, 72, 153, 0.6)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Petal burst phase */}
      {phase === 'burst' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative"
        >
          {/* O-Cube with intense glow - SAKURA PINK */}
          <div className="relative w-48 h-48 mx-auto mb-8" style={{ perspective: '800px' }}>
            <div
              className="absolute inset-0 transform-gpu"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="absolute w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, #ffc7d9 0%, #ff9fbe 50%, #ec4899 100%)',
                  border: '2px solid #ff9fbe',
                  transform: 'translateZ(96px)',
                  boxShadow: '0 0 60px rgba(236, 72, 153, 1)',
                }}
              >
                <div
                  className="absolute inset-8 bg-black rounded-full border-2 border-white/20"
                  style={{
                    clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Cherry blossom petal burst */}
          {showPetals && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(60)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${50 + Math.cos((i * 6 * Math.PI) / 180) * (240 + Math.random() * 140)}%`,
                    y: `${50 + Math.sin((i * 6 * Math.PI) / 180) * (240 + Math.random() * 140)}%`,
                    scale: [0, 1.2, 0.8, 0],
                    opacity: [1, 1, 0.8, 0],
                    rotate: [0, Math.random() * 45, Math.random() * 90],
                  }}
                  transition={{
                    duration: 0.9 + Math.random() * 0.2,
                    delay: i * 0.02,
                    ease: 'easeOut',
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${
                      i % 3 === 0 ? '#FFC7D9' : i % 3 === 1 ? '#FF9FBE' : '#FF6A9C'
                    }, transparent)`,
                    filter: 'blur(0.5px)',
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Complete phase - Wordmark */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1
              className="text-5xl font-bold tracking-[0.3em] mb-2"
              style={{
                fontFamily: 'Arial, sans-serif',
                color: '#E8ECFF',
                textShadow: '0 0 20px rgba(232, 236, 255, 0.8), 0 0 40px rgba(232, 236, 255, 0.4)',
              }}
            >
              OTAKU-MORI
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-medium tracking-wide"
              style={{
                fontFamily: 'Arial, sans-serif',
                color: '#E8ECFF',
                fontSize: '0.6em',
                marginTop: '0.5rem',
              }}
            >
              ™ 2025
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
