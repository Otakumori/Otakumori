'use client';

import { logger } from '@/app/lib/logger';
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
      logger.warn('Boot audio not available:', undefined, { message: err.message });
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

    // Phase transitions (total ~5s)
    const logoTimer = setTimeout(() => {
      setPhase('logo');
    }, 1000); // Sakura O-cube arrival
    const burstTimer = setTimeout(() => {
      setPhase('burst');
      setShowPetals(true);
    }, 2000); // Sakura petal burst
    const completeTimer = setTimeout(() => {
      setPhase('complete');
    }, 3000); // Wordmark phase begins

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 5000); // Total duration (~5s)

    timeoutRefs.current.push(logoTimer, burstTimer, completeTimer, finishTimer);

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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-visible"
      data-gamecube-boot="true"
      style={{
        // Japanese sakura edition background - deep indigo with sakura pink accents
        background: `
          radial-gradient(ellipse at center, #1a1320 0%, #0d0f1c 50%, #080611 100%),
          radial-gradient(ellipse at 30% 20%, rgba(255, 199, 217, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(244, 114, 182, 0.06) 0%, transparent 50%)
        `,
      }}
    >
      {/* Traditional Japanese seigaiha (wave) pattern overlay - subtle */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 199, 217, 0.1) 10px,
            rgba(255, 199, 217, 0.1) 20px
          )`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Floating sakura petals background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`bg-petal-${i}`}
            className="absolute"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0.1,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${100 + Math.random() * 20}%`],
              x: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100 + (Math.random() - 0.5) * 20}%`,
              ],
              rotate: [0, 360],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
            style={{
              width: '12px',
              height: '12px',
              clipPath:
                'polygon(50% 0%, 30% 20%, 15% 40%, 10% 60%, 15% 80%, 30% 95%, 50% 100%, 70% 95%, 85% 80%, 90% 60%, 85% 40%, 70% 20%)',
              background: `radial-gradient(ellipse at 35% 25%, rgba(255, 199, 217, 0.4) 0%, rgba(255, 159, 190, 0.3) 40%, rgba(255, 106, 156, 0.25) 70%, transparent 100%)`,
              boxShadow: `0 0 8px rgba(244, 114, 182, 0.2)`,
              filter: 'blur(0.4px)',
            }}
          />
        ))}
      </div>
      {/* Skip button - Japanese sakura edition */}
      <AnimatePresence>
        {showSkip && skipable && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={skipBoot}
            className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 text-xs rounded-lg border border-white/10 transition-colors"
            style={{
              borderColor: 'rgba(255, 199, 217, 0.3)',
              background: 'rgba(255, 199, 217, 0.05)',
            }}
          >
            <span className="mr-2">スキップ</span>
            <span className="text-white/50">(Skip)</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Spinning Sakura O-cube phase */}
      {phase === 'spin' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center relative">
          {/* Orbiting sakura petals around cube */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`orbit-petal-${i}`}
                className="absolute"
                style={{
                  width: '16px',
                  height: '16px',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-8px',
                  marginTop: '-8px',
                  clipPath:
                    'polygon(50% 0%, 30% 20%, 15% 40%, 10% 60%, 15% 80%, 30% 95%, 50% 100%, 70% 95%, 85% 80%, 90% 60%, 85% 40%, 70% 20%)',
                  background: `radial-gradient(ellipse at 35% 25%, rgba(255, 199, 217, 0.85) 0%, rgba(255, 159, 190, 0.75) 40%, rgba(255, 106, 156, 0.65) 70%, transparent 100%)`,
                  boxShadow: '0 0 10px rgba(244, 114, 182, 0.5), 0 0 5px rgba(219, 39, 119, 0.3)',
                  filter: 'blur(0.3px)',
                  border: '0.3px solid rgba(255, 159, 190, 0.2)',
                }}
                animate={{
                  rotate: [0, 360],
                  x: [
                    `calc(96px * cos(${i * 45}deg))`,
                    `calc(96px * cos(${i * 45}deg + 360deg))`,
                  ],
                  y: [
                    `calc(96px * sin(${i * 45}deg))`,
                    `calc(96px * sin(${i * 45}deg + 360deg))`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* 3D CSS Sakura O-Cube */}
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
              {/* Japanese Sakura O-Cube faces - traditional Japanese aesthetic */}
              {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
                <div
                  key={face}
                  className="absolute w-full h-full"
                  style={{
                    // Japanese sakura gradient - brand-accurate colors
                    background:
                      'radial-gradient(ellipse at 35% 25%, rgba(255, 199, 217, 1) 0%, rgba(255, 159, 190, 0.95) 30%, rgba(255, 106, 156, 0.9) 50%, rgba(244, 114, 182, 0.85) 70%, rgba(219, 39, 119, 0.8) 100%)',
                    border: '2px solid rgba(255, 159, 190, 0.8)',
                    boxShadow: 'inset 0 0 20px rgba(255, 199, 217, 0.3), 0 0 30px rgba(244, 114, 182, 0.4), 0 0 15px rgba(139, 92, 246, 0.2)',
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
                  {/* Hollow O-shaped center - Japanese sakura aesthetic */}
                  <div
                    className="absolute inset-8 rounded-full"
                    style={{
                      clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
                      background: 'radial-gradient(ellipse, rgba(219, 39, 119, 0.35) 0%, rgba(139, 92, 246, 0.2) 40%, rgba(0, 0, 0, 0.8) 100%)',
                      border: '2px solid rgba(255, 199, 217, 0.5)',
                      boxShadow: 'inset 0 0 15px rgba(244, 114, 182, 0.5), inset 0 0 8px rgba(139, 92, 246, 0.3)',
                    }}
                  />
                  
                  {/* Subtle Japanese pattern overlay - seigaiha waves */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 2px,
                        rgba(255, 199, 217, 0.3) 2px,
                        rgba(255, 199, 217, 0.3) 4px
                      )`,
                      backgroundSize: '8px 8px',
                    }}
                  />

                  {/* Sakura petal pattern overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(236, 72, 153, 0.2) 70%, rgba(219, 39, 119, 0.3) 100%)',
                    }}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Logo reveal phase - Sakura O-cube settles */}
      {phase === 'logo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative"
        >
          {/* Gentle sakura petals floating around */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`float-petal-${i}`}
                className="absolute"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: [
                    '50%',
                    `${50 + Math.cos((i * 30 * Math.PI) / 180) * 30}%`,
                    `${50 + Math.cos((i * 30 * Math.PI) / 180) * 40}%`,
                  ],
                  y: [
                    '50%',
                    `${50 + Math.sin((i * 30 * Math.PI) / 180) * 20}%`,
                    `${50 + Math.sin((i * 30 * Math.PI) / 180) * 30}%`,
                  ],
                  opacity: [0, 0.6, 0.8, 0.6],
                  scale: [0, 1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '16px',
                  height: '16px',
                  clipPath:
                    'polygon(50% 0%, 30% 20%, 15% 40%, 10% 60%, 15% 80%, 30% 95%, 50% 100%, 70% 95%, 85% 80%, 90% 60%, 85% 40%, 70% 20%)',
                  background: `radial-gradient(ellipse at 35% 25%, rgba(255, 199, 217, 0.85) 0%, rgba(255, 159, 190, 0.75) 40%, rgba(255, 106, 156, 0.65) 70%, transparent 100%)`,
                  boxShadow: '0 0 12px rgba(244, 114, 182, 0.5), 0 0 6px rgba(219, 39, 119, 0.3)',
                  filter: 'blur(0.3px)',
                  border: '0.3px solid rgba(255, 159, 190, 0.2)',
                }}
              />
            ))}
          </div>

          {/* Settled Sakura O-Cube */}
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
              {/* Front face of Japanese Sakura O-Cube */}
              <div
                className="absolute w-full h-full"
                style={{
                  background:
                    'radial-gradient(ellipse at 35% 25%, rgba(255, 199, 217, 1) 0%, rgba(255, 159, 190, 0.95) 30%, rgba(255, 106, 156, 0.9) 50%, rgba(244, 114, 182, 0.85) 70%, rgba(219, 39, 119, 0.8) 100%)',
                  border: '2px solid rgba(255, 159, 190, 0.8)',
                  transform: 'translateZ(96px)',
                  boxShadow:
                    'inset 0 0 25px rgba(255, 199, 217, 0.4), 0 0 40px rgba(244, 114, 182, 0.7), 0 0 60px rgba(219, 39, 119, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
                }}
              >
                {/* Hollow O-shaped center - Japanese sakura aesthetic */}
                <div
                  className="absolute inset-8 rounded-full"
                  style={{
                    clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
                    background: 'radial-gradient(ellipse, rgba(219, 39, 119, 0.4) 0%, rgba(139, 92, 246, 0.25) 40%, rgba(0, 0, 0, 0.7) 100%)',
                    border: '2px solid rgba(255, 199, 217, 0.5)',
                    boxShadow: 'inset 0 0 20px rgba(244, 114, 182, 0.6), inset 0 0 10px rgba(139, 92, 246, 0.4)',
                  }}
                />
                
                {/* Japanese pattern overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 2px,
                      rgba(255, 199, 217, 0.3) 2px,
                      rgba(255, 199, 217, 0.3) 4px
                    )`,
                    backgroundSize: '8px 8px',
                  }}
                />

                {/* Enhanced sakura glow effect */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(236, 72, 153, 0.3) 70%, rgba(219, 39, 119, 0.4) 100%)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Sakura petal burst phase */}
      {phase === 'burst' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative"
          style={{ overflow: 'visible', position: 'relative' }}
        >
          {/* Sakura O-Cube with intense cherry blossom glow */}
          <div className="relative w-48 h-48 mx-auto mb-8" style={{ perspective: '800px' }}>
            <div
              className="absolute inset-0 transform-gpu"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute w-full h-full"
                animate={{
                  boxShadow: [
                    'inset 0 0 30px rgba(255, 192, 203, 0.5), 0 0 50px rgba(236, 72, 153, 0.8), 0 0 80px rgba(219, 39, 119, 0.6)',
                    'inset 0 0 40px rgba(255, 192, 203, 0.7), 0 0 80px rgba(236, 72, 153, 1), 0 0 120px rgba(219, 39, 119, 0.8)',
                    'inset 0 0 30px rgba(255, 192, 203, 0.5), 0 0 50px rgba(236, 72, 153, 0.8), 0 0 80px rgba(219, 39, 119, 0.6)',
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  background:
                    'radial-gradient(ellipse at 35% 25%, rgba(255, 199, 217, 1) 0%, rgba(255, 159, 190, 0.95) 30%, rgba(255, 106, 156, 0.9) 50%, rgba(244, 114, 182, 0.85) 70%, rgba(219, 39, 119, 0.8) 100%)',
                  border: '2px solid rgba(255, 159, 190, 0.9)',
                  transform: 'translateZ(96px)',
                }}
              >
                <div
                  className="absolute inset-8 rounded-full"
                  style={{
                    clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
                    background: 'radial-gradient(ellipse, rgba(219, 39, 119, 0.5) 0%, rgba(139, 92, 246, 0.3) 40%, rgba(0, 0, 0, 0.6) 100%)',
                    border: '2px solid rgba(255, 199, 217, 0.6)',
                    boxShadow: 'inset 0 0 25px rgba(244, 114, 182, 0.7), inset 0 0 12px rgba(139, 92, 246, 0.4)',
                  }}
                />
                
                {/* Japanese pattern overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 2px,
                      rgba(255, 199, 217, 0.3) 2px,
                      rgba(255, 199, 217, 0.3) 4px
                    )`,
                    backgroundSize: '8px 8px',
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Dramatic cherry blossom petal explosion - 120 petals bursting OUTSIDE the container */}
          {showPetals && (
            <div 
              className="fixed pointer-events-none" 
              style={{ 
                zIndex: 101,
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                overflow: 'visible',
                width: '100vw',
                height: '100vh',
              }}
            >
              {[...Array(120)].map((_, i) => {
                const angle = (i * 3 * Math.PI) / 180; // More petals, tighter spacing
                // Sensual, slower explosion - petals float gracefully outward
                const baseDistance = 300 + Math.random() * 500; // Moderate distance for graceful flow
                const distance = baseDistance + Math.sin(i * 0.5) * 100; // Wave pattern for organic feel
                // Brand-accurate sakura colors from Otaku-mori palette
                const brandPetalColors = [
                  { 
                    primary: 'rgba(255, 199, 217, 0.98)', // #ffc7d9 - Light sakura (brand)
                    secondary: 'rgba(255, 159, 190, 0.95)', // #ff9fbe - Mid sakura (brand)
                    accent: 'rgba(255, 106, 156, 0.92)', // #ff6a9c - Deep sakura (brand)
                    glow: 'rgba(244, 114, 182, 0.6)', // #f472b6 - Pink glow (brand)
                  },
                  {
                    primary: 'rgba(212, 165, 165, 0.96)', // #d4a5a5 - Muted rose (brand)
                    secondary: 'rgba(201, 153, 153, 0.93)', // #c99999 - Secondary muted rose (brand)
                    accent: 'rgba(216, 176, 176, 0.94)', // #d8b0b0 - Tertiary muted rose (brand)
                    glow: 'rgba(219, 39, 119, 0.5)', // #db2777 - Primary pink glow (brand)
                  },
                  {
                    primary: 'rgba(243, 183, 194, 0.97)', // #f3b7c2 - Sakura pink accent (brand)
                    secondary: 'rgba(244, 193, 203, 0.94)', // #f4c1cb - Lighter sakura pink (brand)
                    accent: 'rgba(236, 72, 153, 0.9)', // #ec4899 - Pink accent (brand)
                    glow: 'rgba(139, 92, 246, 0.4)', // #8b5cf6 - Purple accent glow (brand)
                  },
                ];
                const colorSet = brandPetalColors[i % brandPetalColors.length];
                const petalSize = 16 + Math.random() * 12; // Larger, more premium petals
                
                // Physics-based motion: gravity, wind, floating
                const gravity = 0.3 + Math.random() * 0.4; // Varying fall rates
                const windX = (Math.random() - 0.5) * 0.3; // Horizontal drift
                const floatAmplitude = 20 + Math.random() * 30; // Floating motion amplitude
                
                // Calculate final positions with physics
                const finalX = typeof window !== 'undefined' 
                  ? window.innerWidth / 2 + Math.cos(angle) * distance + windX * distance
                  : 0;
                const finalY = typeof window !== 'undefined'
                  ? window.innerHeight / 2 + Math.sin(angle) * distance * (1 - gravity) - 150 // Upward float with gravity
                  : 0;
                
                // Rotation with physics - slower, more graceful
                const rotationSpeed = 0.5 + Math.random() * 1.5; // Slower rotation
                const totalRotation = rotationSpeed * 360; // Gradual rotation
                
                return (
                  <motion.div
                    key={i}
                    initial={{
                      left: typeof window !== 'undefined' ? window.innerWidth / 2 : '50%',
                      top: typeof window !== 'undefined' ? window.innerHeight / 2 : '50%',
                      scale: 0,
                      opacity: 0,
                      rotate: Math.random() * 360, // Random starting rotation
                      x: '-50%', // Center the petal on its position
                      y: '-50%',
                    }}
                    animate={{
                      // Sensual, slower motion with physics
                      left: finalX,
                      top: finalY,
                      scale: [0, 1.8, 1.6, 1.4, 1.2, 1.0, 0.9, 0.8], // Gradual, sensual scale
                      opacity: [0, 0.8, 1, 1, 0.95, 0.85, 0.7, 0], // Fade in and out gracefully
                      rotate: totalRotation, // Slow, graceful rotation
                      // Floating motion - gentle up/down drift
                      y: [
                        '-50%',
                        `calc(-50% + ${Math.sin(0) * floatAmplitude}px)`,
                        `calc(-50% + ${Math.sin(Math.PI * 0.5) * floatAmplitude}px)`,
                        `calc(-50% + ${Math.sin(Math.PI) * floatAmplitude}px)`,
                        `calc(-50% + ${Math.sin(Math.PI * 1.5) * floatAmplitude}px)`,
                        `calc(-50% + ${Math.sin(Math.PI * 2) * floatAmplitude}px)`,
                      ],
                    }}
                    transition={{
                      duration: 4.5 + Math.random() * 2, // Much slower, sensual duration
                      delay: i * 0.02, // Slower stagger for graceful cascade
                      ease: [0.4, 0.0, 0.2, 1.0], // Smooth, sensual easing
                      // Separate timing for floating motion
                      y: {
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      },
                    }}
                    className="fixed"
                    style={{
                      width: `${petalSize}px`,
                      height: `${petalSize * 1.2}px`,
                      clipPath:
                        'polygon(50% 0%, 30% 20%, 15% 40%, 10% 60%, 15% 80%, 30% 95%, 50% 100%, 70% 95%, 85% 80%, 90% 60%, 85% 40%, 70% 20%)',
                      // Premium brand-accurate gradient with multiple stops
                      background: `radial-gradient(ellipse at 35% 25%, 
                        ${colorSet.primary} 0%, 
                        ${colorSet.secondary} 25%, 
                        ${colorSet.accent} 50%, 
                        ${colorSet.secondary.replace('0.93', '0.7').replace('0.94', '0.7').replace('0.95', '0.7')} 75%, 
                        transparent 100%),
                        linear-gradient(135deg, 
                        ${colorSet.primary} 0%, 
                        ${colorSet.secondary} 50%, 
                        ${colorSet.accent} 100%)`,
                      // Enhanced brand glow with multiple shadow layers
                      boxShadow: `
                        0 0 ${petalSize * 1.5}px ${colorSet.glow},
                        0 0 ${petalSize * 0.8}px ${colorSet.accent.replace('0.92', '0.4').replace('0.9', '0.4').replace('0.94', '0.4')},
                        0 0 ${petalSize * 0.4}px rgba(255, 255, 255, 0.6),
                        inset 0 0 ${petalSize * 0.4}px rgba(255, 255, 255, 0.4),
                        inset 0 0 ${petalSize * 0.2}px ${colorSet.primary.replace('0.98', '0.3').replace('0.96', '0.3').replace('0.97', '0.3')}
                      `,
                      // Premium blur with brand consistency
                      filter: 'blur(0.6px) drop-shadow(0 0 2px rgba(244, 114, 182, 0.3))',
                      transformOrigin: 'center center',
                      pointerEvents: 'none',
                      willChange: 'transform, opacity',
                      // Brand-accurate border for definition
                      border: `0.5px solid ${colorSet.accent.replace('0.92', '0.3').replace('0.9', '0.3').replace('0.94', '0.3')}`,
                      // Premium texture hint
                      backgroundBlendMode: 'overlay',
                    }}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Complete phase - Sakura wordmark */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center relative"
        >
          {/* Final sakura petals floating */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`final-petal-${i}`}
                className="absolute"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: [
                    '50%',
                    `${50 + Math.cos((i * 24 * Math.PI) / 180) * 25}%`,
                    `${50 + Math.cos((i * 24 * Math.PI) / 180) * 35}%`,
                  ],
                  y: [
                    '50%',
                    `${50 + Math.sin((i * 24 * Math.PI) / 180) * 15 - 10}%`,
                    `${50 + Math.sin((i * 24 * Math.PI) / 180) * 25 - 20}%`,
                  ],
                  opacity: [0, 0.7, 0.9, 0.7],
                  scale: [0, 1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '12px',
                  height: '12px',
                  clipPath:
                    'polygon(50% 0%, 30% 20%, 15% 40%, 10% 60%, 15% 80%, 30% 95%, 50% 100%, 70% 95%, 85% 80%, 90% 60%, 85% 40%, 70% 20%)',
                  background: `radial-gradient(ellipse at 35% 25%, rgba(243, 183, 194, 0.8) 0%, rgba(244, 193, 203, 0.7) 40%, rgba(236, 72, 153, 0.6) 70%, transparent 100%)`,
                  boxShadow: '0 0 10px rgba(244, 114, 182, 0.4), 0 0 5px rgba(139, 92, 246, 0.2)',
                  filter: 'blur(0.4px)',
                  border: '0.3px solid rgba(243, 183, 194, 0.25)',
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Japanese sakura edition wordmark */}
            <div className="flex flex-col items-center">
              {/* Japanese kanji subtitle - Sakura Edition */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-medium mb-3"
                style={{
                  fontFamily: 'serif',
                  color: 'rgba(255, 199, 217, 0.9)',
                  textShadow: '0 0 20px rgba(244, 114, 182, 0.6), 0 0 40px rgba(219, 39, 119, 0.4)',
                  letterSpacing: '0.1em',
                }}
              >
                桜エディション
              </motion.div>
              
              {/* Main brand wordmark */}
              <h1
                className="text-5xl font-bold tracking-[0.3em] mb-2"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  background: 'linear-gradient(135deg, rgba(255, 199, 217, 1) 0%, rgba(255, 159, 190, 0.95) 30%, rgba(255, 106, 156, 0.9) 70%, rgba(219, 39, 119, 0.85) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 30px rgba(244, 114, 182, 0.8), 0 0 60px rgba(219, 39, 119, 0.6)',
                  filter: 'drop-shadow(0 0 10px rgba(255, 199, 217, 0.5))',
                }}
              >
                OTAKU-MORI
              </h1>
              
              {/* Japanese reading - hiragana/katakana */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-medium tracking-wide mb-1"
                style={{
                  fontFamily: 'serif',
                  color: 'rgba(255, 199, 217, 0.85)',
                  fontSize: '0.5em',
                  textShadow: '0 0 12px rgba(244, 114, 182, 0.5), 0 0 24px rgba(219, 39, 119, 0.3)',
                  letterSpacing: '0.15em',
                }}
              >
                オタクモリ
              </motion.p>
              
              {/* Trademark and year */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-2xl font-medium tracking-wide"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  color: 'rgba(255, 199, 217, 0.9)',
                  fontSize: '0.6em',
                  marginTop: '0.3rem',
                  textShadow: '0 0 15px rgba(244, 114, 182, 0.6), 0 0 30px rgba(219, 39, 119, 0.4)',
                }}
              >
                ™ 2025
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
