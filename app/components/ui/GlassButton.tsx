'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export default function GlassButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: GlassButtonProps) {
  const baseClasses =
    'relative overflow-hidden rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent';

  const variantClasses = {
    primary:
      'bg-white/20 backdrop-blur-sm border border-white/30 text-gray-900 hover:bg-white/30 hover:border-white/40',
    secondary:
      'bg-pink-500/20 backdrop-blur-sm border border-pink-500/30 text-pink-700 hover:bg-pink-500/30 hover:border-pink-500/40',
    ghost:
      'bg-transparent border border-white/20 text-gray-700 hover:bg-white/10 hover:border-white/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  const buttonContent = (
    <motion.button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={buttonClasses}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.a>
    );
  }

  return buttonContent;
}
