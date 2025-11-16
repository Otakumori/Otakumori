/**
 * Otaku-mori Button Component
 * Primary/ghost/danger variants with pink/gray anime x gaming aesthetic
 */

'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface OmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

/**
 * Otaku-mori styled button component
 * Uses glassmorphic design with pink/gray palette
 */
export const OmButton = forwardRef<HTMLButtonElement, OmButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, children, ...props }, ref) => {
    const baseClasses = cn(
      // Base styles
      'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-black',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'backdrop-blur-lg',
      'active:scale-95',
      // Variants
      {
        // Primary: pink gradient with glass effect
        'bg-gradient-to-r from-primary/80 to-accent/80 border border-primary/40 text-white shadow-lg hover:from-primary hover:to-accent hover:shadow-[0_0_30px_var(--glow-pink-strong)]':
          variant === 'primary',
        // Ghost: minimal glass effect
        'bg-white/5 border border-glass-border text-text-secondary hover:bg-glass-bg-hover hover:border-border-hover hover:text-text-link-hover':
          variant === 'ghost',
        // Danger: red/pink gradient
        'bg-gradient-to-r from-red-500/80 to-primary/80 border border-red-400/40 text-white shadow-lg hover:from-red-500 hover:to-primary hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]':
          variant === 'danger',
      },
      // Sizes
      {
        'h-8 px-3 text-sm': size === 'sm',
        'h-10 px-4 text-base': size === 'md',
        'h-12 px-6 text-lg': size === 'lg',
      },
      className,
    );

    if (href) {
      return (
        <Link href={href} className={baseClasses}>
          {children}
        </Link>
      );
    }

    return (
      <button className={baseClasses} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

OmButton.displayName = 'OmButton';

