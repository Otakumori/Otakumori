'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, ...props }, ref) => {
    const baseClasses = cn(
      // Base styles
      'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 focus:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50',
      // Glass effect with pulse animation
      'backdrop-blur-lg',
      'active:scale-95',
      // Button pulse effect
      'button-pulse',
      // Variants
      {
        // Primary: enhanced glassmorphic with iridescent hint
        'glass-button-primary': variant === 'primary',
        // Secondary: darker glass
        'bg-white/10 border border-white/20 text-pink-200/80 hover:bg-white/15 hover:border-white/30 shadow-md':
          variant === 'secondary',
        // Ghost: minimal with holographic hover
        'bg-transparent border-0 text-pink-200/60 hover:text-pink-200/90 hover:bg-white/5':
          variant === 'ghost',
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
        <Link href={href}>
          <button className={baseClasses} ref={ref} {...props} />
        </Link>
      );
    }

    return <button className={baseClasses} ref={ref} {...props} />;
  },
);

GlassButton.displayName = 'GlassButton';

export default GlassButton;
