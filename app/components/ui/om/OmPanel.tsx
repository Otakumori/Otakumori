/**
 * Otaku-mori Panel Component
 * Glassmorphic panel for overlays and modals
 */

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface OmPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'overlay' | 'modal';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Otaku-mori styled panel component
 * Glassmorphic panel with pink/gray aesthetic
 */
export function OmPanel({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: OmPanelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 backdrop-blur-lg',
        'transition-all duration-300',
        // Variants
        {
          'bg-white/10': variant === 'default',
          'bg-black/60': variant === 'overlay',
          'bg-white/10 shadow-[0_25px_55px_rgba(0,0,0,0.5)]': variant === 'modal',
        },
        // Sizes
        {
          'max-w-sm': size === 'sm',
          'max-w-md': size === 'md',
          'max-w-lg': size === 'lg',
          'max-w-full': size === 'full',
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface OmPanelContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Panel content wrapper with consistent padding
 */
export function OmPanelContent({
  className,
  padding = 'md',
  children,
  ...props
}: OmPanelContentProps) {
  return (
    <div
      className={cn(
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

