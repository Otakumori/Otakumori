/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CherryTreeProps {
  swayIntensity?: number;
  onPetalSpawn?: (x: number, y: number) => void;
  className?: string;
}

export function CherryTree({ swayIntensity = 0.5, onPetalSpawn, className = '' }: CherryTreeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSway, setCurrentSway] = useState(0);
  const treeRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Gentle sway animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    const sway = () => {
      const time = Date.now() * 0.001;
      const swayAmount = Math.sin(time * 0.3) * swayIntensity * 2;
      setCurrentSway(swayAmount);

      // Trigger petal spawns occasionally
      if (Math.random() < 0.1 && onPetalSpawn) {
        const x = 50 + Math.random() * 20 - 10; // Center with variation
        const y = 30 + Math.random() * 20 - 10; // Upper branches
        onPetalSpawn(x, y);
      }

      requestAnimationFrame(sway);
    };

    const animationId = requestAnimationFrame(sway);
    return () => cancelAnimationFrame(animationId);
  }, [swayIntensity, onPetalSpawn, prefersReducedMotion]);

  // Intersection observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.1,
    });

    if (treeRef.current) {
      observer.observe(treeRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={treeRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Cherry Tree SVG */}
      <motion.div
        className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform"
        style={{
          transform: `translateX(${currentSway}px)`,
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
                y: [0, -2, 0],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
        }
      >
        {/* Tree trunk */}
        <div className="absolute bottom-0 left-1/2 h-32 w-8 -translate-x-1/2 transform rounded-full bg-gradient-to-t from-amber-800 to-amber-600" />

        {/* Main branches */}
        <div className="absolute bottom-20 left-1/2 h-32 w-64 -translate-x-1/2 transform">
          {/* Left branch */}
          <div className="absolute bottom-0 left-0 h-16 w-24 origin-bottom-left -rotate-45 transform rounded-full bg-gradient-to-r from-amber-700 to-amber-500" />

          {/* Right branch */}
          <div className="absolute bottom-0 right-0 h-16 w-24 origin-bottom-right rotate-45 transform rounded-full bg-gradient-to-l from-amber-700 to-amber-500" />

          {/* Center branches */}
          <div className="absolute bottom-0 left-1/2 h-20 w-16 -translate-x-1/2 transform rounded-full bg-gradient-to-t from-amber-700 to-amber-500" />
        </div>

        {/* Cherry blossom clusters */}
        <div className="absolute bottom-16 left-1/2 h-40 w-80 -translate-x-1/2 transform">
          {/* Left cluster */}
          <div className="absolute bottom-0 left-0 h-32 w-32">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`left-${i}`}
                className="absolute h-3 w-3 rounded-full bg-pink-300 opacity-80"
                style={{
                  left: `${20 + Math.sin(i * 0.8) * 15}%`,
                  top: `${30 + Math.cos(i * 0.8) * 15}%`,
                }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8],
                        transition: {
                          duration: 3 + i * 0.2,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: 'easeInOut',
                        },
                      }
                }
              />
            ))}
          </div>

          {/* Right cluster */}
          <div className="absolute bottom-0 right-0 h-32 w-32">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`right-${i}`}
                className="absolute h-3 w-3 rounded-full bg-pink-300 opacity-80"
                style={{
                  left: `${20 + Math.sin(i * 0.8) * 15}%`,
                  top: `${30 + Math.cos(i * 0.8) * 15}%`,
                }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8],
                        transition: {
                          duration: 3 + i * 0.2,
                          repeat: Infinity,
                          delay: i * 0.1 + 0.5,
                          ease: 'easeInOut',
                        },
                      }
                }
              />
            ))}
          </div>

          {/* Center cluster */}
          <div className="absolute bottom-0 left-1/2 h-32 w-40 -translate-x-1/2 transform">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`center-${i}`}
                className="absolute h-3 w-3 rounded-full bg-pink-200 opacity-90"
                style={{
                  left: `${25 + Math.sin(i * 0.5) * 20}%`,
                  top: `${20 + Math.cos(i * 0.5) * 20}%`,
                }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        scale: [1, 1.2, 1],
                        opacity: [0.9, 1, 0.9],
                        transition: {
                          duration: 2.5 + i * 0.15,
                          repeat: Infinity,
                          delay: i * 0.08,
                          ease: 'easeInOut',
                        },
                      }
                }
              />
            ))}
          </div>
        </div>

        {/* Subtle leaf shimmer effect */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`shimmer-${i}`}
                className="absolute h-2 w-2 rounded-full bg-green-400 opacity-60"
                style={{
                  left: `${30 + Math.sin(i * 1.2) * 25}%`,
                  top: `${40 + Math.cos(i * 1.2) * 25}%`,
                }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.3, 1],
                  transition: {
                    duration: 4 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  },
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
