/**
 * Otaku-mori Card Component
 * Consistent card styling with glassmorphic design
 */

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface OmCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
}

/**
 * Otaku-mori styled card component
 * Uses glassmorphic design with pink/gray palette
 */
export function OmCard({ className, variant = 'default', children, ...props }: OmCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/12 bg-white/8 backdrop-blur-xl',
        'transition-all duration-300 ease-out',
        // Variants
        {
          'hover:border-pink-400/40 hover:shadow-[0_20px_45px_rgba(236,72,153,0.22)]':
            variant === 'default',
          'border-pink-400/30 shadow-[0_25px_55px_rgba(236,72,153,0.28)]':
            variant === 'elevated',
          'border-white/8 bg-white/5': variant === 'flat',
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface OmCardContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card content wrapper with consistent padding
 */
export function OmCardContent({
  className,
  padding = 'md',
  children,
  ...props
}: OmCardContentProps) {
  return (
    <div
      className={cn(
        'transition-transform duration-300 group-hover:translate-y-[-2px]',
        {
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

