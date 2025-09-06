'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import type { ReactNode } from 'react';

// Motion variants for consistent animations
export const motionVariants: Record<string, any> = {
  // Page entrance animations
  pageEnter: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  
  // Stagger children animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.04
      }
    }
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Card hover animations
  cardHover: {
    y: -2,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  
  // Button press animations
  buttonPress: {
    scale: 0.98,
    transition: { duration: 0.12, ease: 'easeOut' }
  },
  
  // Toast animations
  toastEnter: {
    y: 12,
    opacity: 0,
    scale: 0.95
  },
  
  toastAnimate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  toastExit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Dialog animations
  dialogBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  dialogPanel: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Micro feedback animations
  microFeedback: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Petal collection animation
  petalCollect: {
    scale: [1, 1.1, 0],
    opacity: [1, 0.8, 0],
    transition: { duration: 0.16, ease: 'easeOut' }
  },
  
  // Achievement unlock animation
  achievementUnlock: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.9, 1],
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  
  // Score pop animation
  scorePop: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.9, 0],
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Filter chip animation
  filterChipPress: {
    scale: 0.98,
    transition: { duration: 0.15, ease: 'easeOut' }
  },
  
  // Count up animation
  countUp: {
    y: [4, 0],
    opacity: [0.7, 1],
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Tab underline animation
  tabUnderline: {
    scaleX: [0, 1],
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Image crossfade
  imageCrossfade: {
    opacity: [0, 1],
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Loading progress
  loadingProgress: {
    scaleX: [0, 1],
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Insiders nudge
  insidersNudge: {
    y: [-16, 0],
    opacity: [0, 1],
    transition: { duration: 0.4, ease: 'easeOut', delay: 1.2 }
  }
};

// Motion components with reduced motion support
export const MotionDiv = motion.div;
export const MotionButton = motion.button;
export const MotionSpan = motion.span;
export const MotionImg = motion.img;
export const MotionH1 = motion.h1;
export const MotionH2 = motion.h2;
export const MotionH3 = motion.h3;
export const MotionP = motion.p;

// Utility function to check for reduced motion
export const useReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Motion provider component
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}
