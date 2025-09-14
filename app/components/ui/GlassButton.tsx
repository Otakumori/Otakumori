'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
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
      'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50',
      // Glass effect
      'backdrop-blur-sm bg-white/10 border border-white/20',
      'hover:bg-white/20 hover:border-white/30',
      'active:scale-95',
      // Variants
      {
        'text-white shadow-lg': variant === 'primary',
        'text-white/80 shadow-md': variant === 'secondary',
        'text-white/60 shadow-sm hover:text-white/80': variant === 'ghost',
      },
      // Sizes
      {
        'h-8 px-3 text-sm': size === 'sm',
        'h-10 px-4 text-base': size === 'md',
        'h-12 px-6 text-lg': size === 'lg',
      },
      className
    );

    if (href) {
      return (
        <Link href={href}>
          <button
            className={baseClasses}
            ref={ref}
            {...props}
          />
        </Link>
      );
    }

    return (
      <button
        className={baseClasses}
        ref={ref}
        {...props}
      />
    );
  }
);

GlassButton.displayName = 'GlassButton';

export default GlassButton;
