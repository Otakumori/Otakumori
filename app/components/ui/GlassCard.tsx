'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle';
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        className={cn(
          // Base styles - using theme colors
          'relative rounded-xl border transition-all duration-200',
          // Glass effect with purple-pink theme
          'backdrop-blur-lg',
          // Variants
          {
            'glass-panel': variant === 'default',
            'glass-panel shadow-xl': variant === 'elevated',
            'glass-panel opacity-80': variant === 'subtle',
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
