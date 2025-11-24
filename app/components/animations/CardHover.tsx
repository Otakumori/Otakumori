'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/app/lib/accessibility';

interface CardHoverProps {
  children: ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export function CardHover({
  children,
  className = '',
  intensity = 'medium',
}: CardHoverProps) {
  const shouldAnimate = !prefersReducedMotion();

  const variants = {
    subtle: { y: -2, scale: 1.01 },
    medium: { y: -4, scale: 1.02 },
    strong: { y: -8, scale: 1.03 },
  };

  const shadowVariants = {
    subtle: '0 4px 20px -8px rgba(236, 72, 153, 0.2)',
    medium: '0 8px 30px -12px rgba(236, 72, 153, 0.3)',
    strong: '0 12px 40px -10px rgba(236, 72, 153, 0.4)',
  };

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('relative', className)}
      whileHover={variants[intensity]}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        boxShadow: '0 4px 20px -8px rgba(236, 72, 153, 0.1)',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-pink-500/10 opacity-0 blur-xl"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: shadowVariants[intensity],
        }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
