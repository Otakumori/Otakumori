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
      'focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 focus:ring-offset-black',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'backdrop-blur-lg',
      'active:scale-95',
      // Variants
      {
        // Primary: pink gradient with glass effect
        'bg-gradient-to-r from-pink-500/80 to-purple-500/80 border border-pink-400/40 text-white shadow-lg hover:from-pink-500 hover:to-purple-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]':
          variant === 'primary',
        // Ghost: minimal glass effect
        'bg-white/5 border border-white/10 text-pink-200/80 hover:bg-white/10 hover:border-white/20 hover:text-pink-200':
          variant === 'ghost',
        // Danger: red/pink gradient
        'bg-gradient-to-r from-red-500/80 to-pink-500/80 border border-red-400/40 text-white shadow-lg hover:from-red-500 hover:to-pink-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]':
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

