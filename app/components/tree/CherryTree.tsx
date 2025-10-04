'use client';
import { motion, useAnimationFrame } from 'framer-motion';
import React, { useState } from 'react';
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

const TREE_IMG = '/assets/images/CherryTree.png';

const CherryTree: React.FC = () => {
  const { swayPhase } = useWind();
  // Sway: ±0.5deg, ±4px X, disables on reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState(0);
  useAnimationFrame((t) => {
    if (!prefersReducedMotion) setPhase(t / 4000);
  });
  const rotate = prefersReducedMotion ? 0 : Math.sin(phase) * 0.5;
  const translateX = prefersReducedMotion ? 0 : Math.sin(phase * 0.7) * 4;
  return (
    <motion.img
      src={TREE_IMG}
      alt="Cherry Blossom Tree"
      style={{ rotate: `${rotate}deg`, translateX }}
      className="object-contain object-left-bottom h-[100svh] w-auto pointer-events-none select-none"
      draggable={false}
      aria-hidden="true"
    />
  );
};

export default CherryTree;
