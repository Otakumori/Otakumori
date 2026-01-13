'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface GalleryItem {
  id: string;
  content: React.ReactNode;
}

interface GalleryTransitionProps {
  items: GalleryItem[];
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
}

export function GalleryTransition({ items, viewMode = 'grid', onViewModeChange }: GalleryTransitionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const containerVariants = {
    list: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    },
    grid: {
      transition: { staggerChildren: 0.03, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    list: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    },
    grid: {
      initial: { opacity: 0, scale: 0.8, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.8, y: -20 }
    }
  };

  return (
    <div>
      {/* View mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onViewModeChange?.('list')}
          className={`px-4 py-2 rounded-lg transition-all ${
            viewMode === 'list' 
              ? 'bg-pink-500 text-white' 
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          List
        </button>
        <button
          onClick={() => onViewModeChange?.('grid')}
          className={`px-4 py-2 rounded-lg transition-all ${
            viewMode === 'grid' 
              ? 'bg-pink-500 text-white' 
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Grid
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate={viewMode}
        className={viewMode === 'list' ? 'space-y-2' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              layout
              onClick={() => setSelectedId(item.id)}
              className="cursor-pointer rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors"
            >
              {item.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

