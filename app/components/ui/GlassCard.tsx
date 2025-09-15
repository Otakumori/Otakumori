'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle';
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        className={cn(
          // Base styles
          'relative rounded-xl border transition-all duration-200',
          // Glass effect
          'backdrop-blur-sm bg-white/5 border-white/10',
          'hover:bg-white/10 hover:border-white/20',
          // Variants
          {
            'shadow-lg': variant === 'default',
            'shadow-xl bg-white/10 border-white/20': variant === 'elevated',
            'shadow-sm bg-white/2 border-white/5': variant === 'subtle',
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
