'use client';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface MotionButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    { variant = 'primary', size = 'md', disabled = false, children, className = '', ...props },
    ref,
  ) => {
    const baseClasses = 'font-medium rounded-xl focus-ring transition-all duration-200 ease-out';

    const variantClasses = {
      primary: 'glass-button text-white hover-scale',
      secondary: 'glass-panel text-white hover-scale',
      ghost: 'text-white/80 hover:text-white hover:bg-white/5',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed transform-none' : '';

    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

MotionButton.displayName = 'MotionButton';

export default MotionButton;
