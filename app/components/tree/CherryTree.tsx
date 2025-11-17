'use client';
import { motion, useAnimationFrame } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import useWind from '@/app/hooks/useWind';

// Normalized canopy points (0-1, relative to image width/height)
export const CANOPY_POINTS = [
  { x: 0.22, y: 0.18 },
  { x: 0.32, y: 0.13 },
  { x: 0.44, y: 0.1 },
  { x: 0.58, y: 0.13 },
  { x: 0.68, y: 0.19 },
  { x: 0.8, y: 0.23 },
  { x: 0.36, y: 0.22 },
  { x: 0.52, y: 0.18 },
  { x: 0.6, y: 0.15 },
  { x: 0.75, y: 0.21 },
];

const TREE_IMG = '/assets/images/cherry-tree.png';

const CherryTree: React.FC = () => {
  const { swayPhase: _swayPhase } = useWind();
  const [phase, setPhase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Pause animation when document is hidden
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useAnimationFrame((t) => {
    if (!prefersReducedMotion && isVisible) {
      setPhase(t / 4000);
    }
  });

  // Sway: ±0.5deg, ±2-4px X, disables on reduced motion or when hidden
  const rotate = prefersReducedMotion || !isVisible ? 0 : Math.sin(phase) * 0.5;
  const translateX = prefersReducedMotion || !isVisible ? 0 : Math.sin(phase * 0.7) * 3;

  return (
    <motion.img
      src={TREE_IMG}
      alt="Cherry Blossom Tree"
      style={{
        rotate: `${rotate}deg`,
        translateX,
        willChange: prefersReducedMotion || !isVisible ? 'auto' : 'transform',
      }}
      className="object-contain object-left-bottom h-[100svh] w-auto pointer-events-none select-none"
      draggable={false}
      aria-hidden="true"
    />
  );
};

export default CherryTree;
