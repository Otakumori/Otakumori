/**
 * Otaku-mori Tag Component
 * Tags for difficulty, game type, categories
 */

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface OmTagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'difficulty' | 'category' | 'status';
  size?: 'sm' | 'md';
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: 'action' | 'puzzle' | 'rhythm' | 'sandbox' | 'microgames' | 'dungeon';
  status?: 'active' | 'coming-soon' | 'featured';
}

/**
 * Otaku-mori styled tag component
 * Used for difficulty, game type, status indicators
 */
export function OmTag({
  className,
  variant: _variant = 'default',
  size = 'md',
  difficulty,
  category,
  status,
  children,
  ...props
}: OmTagProps) {
  // Determine color based on variant and specific props
  let colorClasses = '';

  if (difficulty) {
    colorClasses = cn({
      'bg-emerald-500/20 text-emerald-200 border-emerald-400/30': difficulty === 'easy',
      'bg-yellow-500/20 text-yellow-200 border-yellow-400/30': difficulty === 'medium',
      'bg-red-500/20 text-red-200 border-red-400/30': difficulty === 'hard',
    });
  } else if (category) {
    colorClasses = cn({
      'bg-pink-500/20 text-pink-200 border-pink-400/30': category === 'action',
      'bg-purple-500/20 text-purple-200 border-purple-400/30': category === 'puzzle',
      'bg-blue-500/20 text-blue-200 border-blue-400/30': category === 'rhythm',
      'bg-green-500/20 text-green-200 border-green-400/30': category === 'sandbox',
      'bg-orange-500/20 text-orange-200 border-orange-400/30': category === 'microgames',
      'bg-indigo-500/20 text-indigo-200 border-indigo-400/30': category === 'dungeon',
    });
  } else if (status) {
    colorClasses = cn({
      'bg-pink-500/20 text-pink-200 border-pink-400/30': status === 'active',
      'bg-gray-500/20 text-gray-200 border-gray-400/30': status === 'coming-soon',
      'bg-yellow-500/20 text-yellow-200 border-yellow-400/30': status === 'featured',
    });
  } else {
    // Default variant
    colorClasses = 'bg-white/10 text-pink-200/80 border-white/20';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium backdrop-blur-sm',
        'transition-all duration-200',
        colorClasses,
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        },
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
