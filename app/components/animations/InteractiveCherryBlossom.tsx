/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Petal } from '../../types';

const InteractiveCherryBlossom: React.FC = () => {
  const [petals, setPetals] = useState<Petal[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;

    const createPetal = (): Petal => ({
      id: Math.random(), // Unique ID
      x: Math.random() * containerSize.width, // Start within container width
      y: -20, // Start above the container
      size: Math.random() * 15 + 10, // Petal size
      duration: Math.random() * 6 + 4, // Fall duration
      delay: Math.random() * 3, // Staggered delay
      collected: false, // Not collected initially
    });

    // Initial petals
    const initialPetals = Array.from({ length: 50 }, () => createPetal());
    setPetals(initialPetals);

    // Add new petals over time
    const interval = setInterval(() => {
      setPetals((prev) => [
        ...prev.filter((p) => !p.collected && p.y <= containerSize.height + p.size), // Keep active petals within bounds
        createPetal(),
      ]);
    }, 500); // Add a new petal every 500ms

    return () => clearInterval(interval);
  }, [containerSize]); // Re-run effect when container size changes

  // Remove petals that have fallen off screen
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setPetals((prev) => prev.filter((p) => p.y <= containerSize.height + p.size));
    }, 1000);
    return () => clearInterval(cleanupInterval);
  }, [containerSize]);

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
      <img
        src="/assets/cherry.jpg"
        alt="Cherry Blossom Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <AnimatePresence>
        {petals.map(
          (petal) =>
            !petal.collected && (
              <motion.div
                key={petal.id}
                className="absolute left-0 top-0 cursor-pointer"
                initial={{ x: petal.x, y: petal.y, opacity: 1 }}
                animate={{
                  y: containerSize.height + petal.size, // Fall to bottom of container
                  x: petal.x + (Math.random() * 200 - 100), // Horizontal drift
                  opacity: 0,
                  rotate: Math.random() * 360 + 180, // Rotate
                }}
                transition={{
                  duration: petal.duration,
                  delay: petal.delay,
                  ease: 'linear',
                  repeat: Infinity, // Petals keep falling
                  repeatType: 'loop',
                }}
                style={{
                  width: petal.size,
                  height: petal.size,
                }}
              >
                <div className="h-full w-full rounded-full bg-pink-300"></div>
              </motion.div>
            ),
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveCherryBlossom;
