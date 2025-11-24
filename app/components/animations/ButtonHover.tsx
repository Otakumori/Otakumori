'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/app/lib/accessibility';

interface ButtonHoverProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export function ButtonHover({
  children,
  className = '',
  variant = 'primary',
  disabled = false,
}: ButtonHoverProps) {
  const shouldAnimate = !prefersReducedMotion();

  if (disabled || !shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('relative inline-block', className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-pink-500/20 blur-xl opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
