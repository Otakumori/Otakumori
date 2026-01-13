'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { PetalEffect } from '@/components/PetalEffect';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  const opacity = useTransform(springY, [0, threshold], [0, 1]);
  const rotate = useTransform(springY, [0, threshold], [0, 180]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;
      
      if (deltaY > 0) {
        y.set(Math.min(deltaY, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      const currentY = y.get();
      if (currentY >= threshold) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      
      y.set(0);
      setIsPulling(false);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, onRefresh, threshold, y]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
        style={{ y: springY, opacity }}
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-full p-4 border border-white/20">
          <motion.div
            style={{ rotate }}
            className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full"
          />
        </div>
      </motion.div>

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <PetalEffect count={12} duration={2} />
        </div>
      )}

      <motion.div style={{ y: springY }}>
        {children}
      </motion.div>
    </div>
  );
}

