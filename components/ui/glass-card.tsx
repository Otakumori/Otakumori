import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/12 bg-white/8 backdrop-blur-xl',
        'transition-all duration-300 ease-out hover:border-pink-400/40 hover:shadow-[0_20px_45px_rgba(236,72,153,0.22)]',
        'focus-within:border-pink-400/60 focus-within:shadow-[0_25px_55px_rgba(236,72,153,0.28)]',
        className,
      )}
      {...props}
    />
  );
}

export function GlassCardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'p-6 transition-transform duration-300 group-hover:translate-y-[-2px]',
        className,
      )}
      {...props}
    />
  );
}
