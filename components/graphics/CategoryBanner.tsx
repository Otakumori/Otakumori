'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type CategoryBannerProps = {
  title: string;
  subtitle?: string;
  className?: string;
  animate?: boolean;
};

export default function CategoryBanner({
  title,
  subtitle,
  className,
  animate = true,
}: CategoryBannerProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10',
        'bg-gradient-to-br from-purple-900/80 via-pink-900/60 to-purple-800/80',
        'backdrop-blur-sm shadow-2xl',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Animated background gradient */}
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2), rgba(147, 51, 234, 0.2))',
              'linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))',
              'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2), rgba(147, 51, 234, 0.2))',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Twinkling stars */}
      {animate && (
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12 text-center">
        <motion.h1
          className="text-3xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none" />
    </motion.div>
  );
}
