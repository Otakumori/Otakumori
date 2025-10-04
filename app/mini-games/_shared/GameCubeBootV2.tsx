/**
 * Enterprise GameCube Boot Sequence V2
 *
 * Production-ready boot animation with:
 * - Advanced animation timing and physics
 * - Accessibility compliance (WCAG 2.1 AA+)
 * - Performance optimization (60fps target)
 * - Feature flag integration
 * - Analytics tracking
 * - Reduced motion support
 * - Skip functionality
 * - Session persistence
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useFeatureFlag } from '@/lib/feature-flags';

interface GameCubeBootV2Props {
  onBootComplete: () => void;
  onSkip?: () => void;
  skipAfterSeconds?: number;
  forceShow?: boolean;
}

type BootStage =
  | 'starting'
  | 'cubes_rolling'
  | 'cubes_assembling'
  | 'logo_reveal'
  | 'petal_burst'
  | 'complete';

interface CubeState {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

export default function GameCubeBootV2({
  onBootComplete,
  onSkip,
  skipAfterSeconds = 8,
  forceShow = false,
}: GameCubeBootV2Props) {
  const [bootStage, setBootStage] = useState<BootStage>('starting');
  const [cubes, setCubes] = useState<CubeState[]>([]);
  const [petals, setPetals] = useState<
    Array<{ id: number; x: number; y: number; vx: number; vy: number }>
  >([]);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [bootSeen, setBootSeen] = useState(!forceShow);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Feature flags
  const bootEnabled = useFeatureFlag('GAMECUBE_BOOT_ANIMATION') ?? true;
  const bootFrequency = useFeatureFlag('GAMECUBE_BOOT_FREQUENCY') ?? 'once_per_day';
  const audioEnabled = useFeatureFlag('GAMECUBE_AUDIO_ENABLED') ?? true;
  const reducedMotionSupport = useFeatureFlag('GAMECUBE_REDUCED_MOTION') ?? true;

  // Check if boot should be shown
  useEffect(() => {
    if (!bootEnabled) {
      onBootComplete();
      return;
    }

    if (prefersReducedMotion && reducedMotionSupport) {
      onBootComplete();
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    const hasBootedToday = localStorage.getItem(bootKey);

    if (!forceShow) {
      switch (String(bootFrequency)) {
        case 'once_per_day':
          if (hasBootedToday) {
            setBootSeen(true);
            onBootComplete();
            return;
          }
          break;
        case 'never':
          setBootSeen(true);
          onBootComplete();
          return;
        case 'always':
        default:
          break;
      }
    }

    setBootSeen(false);
    initializeBoot();
  }, [
    bootEnabled,
    bootFrequency,
    prefersReducedMotion,
    reducedMotionSupport,
    forceShow,
    onBootComplete,
  ]);

  const initializeBoot = useCallback(() => {
    // Initialize cubes for rolling animation
    const initialCubes: CubeState[] = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: -100 - i * 60, // Start off-screen left
      y: 50,
      rotation: 0,
      scale: 1,
      opacity: 1,
    }));

    setCubes(initialCubes);

    // Start animation sequence
    const timeout1 = setTimeout(() => {
      setBootStage('cubes_rolling');
      animateCubesRolling();
    }, 500);

    const timeout2 = setTimeout(() => {
      setBootStage('cubes_assembling');
      animateCubesAssembling();
    }, 1900);

    const timeout3 = setTimeout(() => {
      setBootStage('logo_reveal');
      playBootSound();
    }, 2700);

    const timeout4 = setTimeout(() => {
      setBootStage('petal_burst');
      animatePetalBurst();
    }, 3500);

    const timeout5 = setTimeout(() => {
      setBootStage('complete');
      completeBoot();
    }, 5000);

    // Show skip button after initial delay
    const skipTimeout = setTimeout(() => {
      setShowSkipButton(true);
    }, 2000);

    timeoutsRef.current = [timeout1, timeout2, timeout3, timeout4, timeout5, skipTimeout];
  }, []);

  const animateCubesRolling = useCallback(() => {
    const animate = () => {
      setCubes((prev) =>
        prev.map((cube, i) => ({
          ...cube,
          x: 150 + i * 80, // Move to center formation
          rotation: cube.rotation + 5, // Rolling effect
        })),
      );
    };

    const frameId = requestAnimationFrame(animate);
    setAnimationFrameId(frameId);
  }, []);

  const animateCubesAssembling = useCallback(() => {
    setCubes((prev) =>
      prev.map((cube, i) => {
        // Arrange cubes in O formation
        const positions = [
          { x: 100, y: 100 }, // Top-left
          { x: 200, y: 100 }, // Top-right
          { x: 100, y: 200 }, // Bottom-left
          { x: 200, y: 200 }, // Bottom-right
        ];

        return {
          ...cube,
          x: positions[i].x,
          y: positions[i].y,
          rotation: 0,
          scale: 0.8,
        };
      }),
    );
  }, []);

  const animatePetalBurst = useCallback(() => {
    const newPetals = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 150, // Center of O
      y: 150,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
    }));

    setPetals(newPetals);

    // Animate petals outward
    const animatePetals = () => {
      setPetals((prev) =>
        prev.map((petal) => ({
          ...petal,
          x: petal.x + petal.vx,
          y: petal.y + petal.vy,
          vx: petal.vx * 0.98, // Friction
          vy: petal.vy * 0.98,
        })),
      );
    };

    const intervalId = setInterval(animatePetals, 16); // ~60fps
    setTimeout(() => clearInterval(intervalId), 1500);
  }, []);

  const playBootSound = useCallback(() => {
    if (audioEnabled && typeof window !== 'undefined') {
      // Play GameCube boot sound
      try {
        const audio = new Audio('/sounds/gamecube-boot.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Fail silently if audio doesn't work
        });
      } catch (error) {
        // Fail silently
      }
    }
  }, [audioEnabled]);

  const completeBoot = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;

    localStorage.setItem(bootKey, 'true');

    // Track boot completion for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'gamecube_boot_complete', {
        event_category: 'mini_games',
        event_label: 'boot_sequence',
        value: 1,
      });
    }

    setTimeout(onBootComplete, 800);
  }, [onBootComplete]);

  const handleSkip = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(clearTimeout);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    // Track skip event
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'gamecube_boot_skip', {
        event_category: 'mini_games',
        event_label: bootStage,
        value: 1,
      });
    }

    onSkip?.();
    completeBoot();
  }, [animationFrameId, bootStage, onSkip, completeBoot]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter' || event.code === 'Escape') {
        event.preventDefault();
        handleSkip();
      }
    },
    [handleSkip],
  );

  useEffect(() => {
    if (!bootSeen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [bootSeen, handleKeyDown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationFrameId]);

  if (bootSeen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-black z-50 flex items-center justify-center overflow-hidden"
        role="img"
        aria-label="GameCube boot animation"
        data-gamecube-boot="true"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Cubes Container */}
        <div className="relative w-96 h-96">
          {cubes.map((cube) => (
            <motion.div
              key={cube.id}
              className="absolute w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-lg shadow-pink-500/50"
              style={{
                left: cube.x,
                top: cube.y,
                transform: `rotate(${cube.rotation}deg) scale(${cube.scale})`,
                opacity: cube.opacity,
              }}
              animate={{
                x: cube.x,
                y: cube.y,
                rotate: cube.rotation,
                scale: cube.scale,
                opacity: cube.opacity,
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
            />
          ))}

          {/* Logo Text */}
          <AnimatePresence>
            {bootStage === 'logo_reveal' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <h1 className="text-4xl font-bold text-white tracking-wider drop-shadow-2xl drop-shadow-pink-500/50">
                  OTAKU-MORI
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Petals */}
          {petals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute w-4 h-4 text-pink-300 pointer-events-none"
              style={{
                left: petal.x,
                top: petal.y,
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 1.5 }}
            >
              
            </motion.div>
          ))}
        </div>

        {/* Skip Button */}
        <AnimatePresence>
          {showSkipButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={handleSkip}
              className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
              aria-label="Skip boot animation"
            >
              Skip (Space/Enter)
            </motion.button>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        <div className="absolute bottom-8 left-8 flex items-center space-x-2 text-white/60">
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
          <span className="text-sm">Loading GameCube interface...</span>
        </div>

        {/* Accessibility announcements */}
        <div className="sr-only" aria-live="polite">
          {bootStage === 'starting' && 'GameCube boot sequence starting'}
          {bootStage === 'cubes_rolling' && 'Cubes rolling into position'}
          {bootStage === 'cubes_assembling' && 'Assembling GameCube logo'}
          {bootStage === 'logo_reveal' && 'Otaku-mori logo revealed'}
          {bootStage === 'petal_burst' && 'Cherry blossoms blooming'}
          {bootStage === 'complete' && 'Boot sequence complete'}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
