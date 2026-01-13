'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';

interface ScrollSelectProps {
  items: Array<{ id: string; label: string; value: any }>;
  onSelect: (value: any) => void;
  selectedId?: string;
}

export function ScrollSelect({ items, onSelect, selectedId }: ScrollSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  return (
    <div
      ref={containerRef}
      className="h-64 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
    >
      {items.map((item, index) => {
        const y = useTransform(
          scrollYProgress,
          [index / items.length, (index + 1) / items.length],
          [0, -50]
        );
        const opacity = useTransform(
          scrollYProgress,
          [index / items.length, (index + 1) / items.length],
          [0.5, 1]
        );
        const scale = useTransform(
          scrollYProgress,
          [index / items.length, (index + 1) / items.length],
          [0.9, 1]
        );

        return (
          <motion.div
            key={item.id}
            style={{ y, opacity, scale }}
            className="snap-center h-16 flex items-center justify-center cursor-pointer"
            onClick={() => onSelect(item.value)}
          >
            <div
              className={`px-6 py-3 rounded-lg transition-all ${
                selectedId === item.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {item.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

