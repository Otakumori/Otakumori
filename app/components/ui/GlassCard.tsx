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
          'relative rounded-xl border transition-all duration-300',
          // Enhanced glass effect with our premium glassmorphic system
          'backdrop-blur-lg',
          // Variants with enhanced effects
          {
            'glass-iridescent hover-lift': variant === 'default',
            'glass-iridescent shadow-xl hover-lift': variant === 'elevated',
            'glass-reflection opacity-80': variant === 'subtle',
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
