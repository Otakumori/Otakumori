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
  ({ className, variant = 'primary', size = 'md', href, children, disabled, ...props }, ref) => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center rounded-full font-medium transition-[background-color,border-color,color,transform] duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#efc7d2]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080611]',
      {
        'border border-white/[0.14] bg-[#96586c]/78 text-[#fff1e4] hover:bg-[#a66579]/88': variant === 'primary',
        'border border-white/[0.11] bg-[#0b080b]/68 text-[#d9ccc7] hover:border-white/[0.18] hover:bg-[#151015] hover:text-white': variant === 'secondary',
        'border border-transparent bg-transparent text-[#cdbbb7] hover:bg-white/[0.035] hover:text-white': variant === 'ghost',
        'min-h-9 px-3 text-sm': size === 'sm',
        'min-h-11 px-4 text-sm': size === 'md',
        'min-h-12 px-6 text-base': size === 'lg',
      },
      className,
    );

    if (href) {
      return (
        <Link
          href={href}
          className={cn(baseClasses, disabled && 'pointer-events-none opacity-50')}
          aria-disabled={disabled || undefined}
        >
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={baseClasses} disabled={disabled} {...props}>
        {children}
      </button>
    );
  },
);

GlassButton.displayName = 'GlassButton';

export default GlassButton;
