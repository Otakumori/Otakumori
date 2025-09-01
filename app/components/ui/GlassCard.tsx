'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  onClick,
}: GlassCardProps) {
  const baseClasses = 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg';
  const hoverClasses = hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-xl' : '';
  const clickableClasses = onClick !== undefined ? 'cursor-pointer' : '';

  const cardClasses = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`;

  const cardContent = <div className={cardClasses}>{children}</div>;

  if (onClick) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        whileHover={hover ? { scale: 1.02, rotateY: 2 } : {}}
        whileTap={onClick !== undefined ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cardClasses}
      whileHover={hover ? { scale: 1.02, rotateY: 2 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
