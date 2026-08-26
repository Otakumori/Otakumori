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
          'relative rounded-2xl border transition-[border-color,background-color,box-shadow,transform] duration-200',
          {
            'border-white/[0.10] bg-[#0d090d]/82 shadow-[0_18px_48px_rgba(0,0,0,0.34)]': variant === 'default',
            'border-white/[0.12] bg-[#100b10]/88 shadow-[0_24px_60px_rgba(0,0,0,0.4)]': variant === 'elevated',
            'border-white/[0.07] bg-[#0a070a]/58': variant === 'subtle',
          },
          'hover:border-[#efc7d2]/18',
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
