'use client';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface MotionCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'hover' | 'interactive';
  children: React.ReactNode;
}

const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    const baseClasses = 'glass-panel rounded-2xl';

    const variantClasses = {
      default: '',
      hover: 'card-hover cursor-pointer',
      interactive: 'card-hover cursor-pointer hover-scale',
    };

    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        whileHover={variant === 'hover' || variant === 'interactive' ? { y: -2 } : {}}
        whileTap={variant === 'interactive' ? { scale: 0.98 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

MotionCard.displayName = 'MotionCard';

export default MotionCard;
