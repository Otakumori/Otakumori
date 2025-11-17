'use client';

import { getAvatarSizeClasses } from '@/app/lib/avatar-sizes';
import type { AvatarSize } from '@/app/lib/avatar-sizes';

interface AvatarSkeletonProps {
  size?: AvatarSize;
  className?: string;
}

/**
 * AvatarSkeleton - Consistent loading state for avatars
 * 
 * Provides a subtle, branded loading animation that matches the site's aesthetic.
 * Respects prefers-reduced-motion for accessibility.
 */
export function AvatarSkeleton({ size = 'md', className = '' }: AvatarSkeletonProps) {
  const sizeClasses = getAvatarSizeClasses(size);
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <div
      className={`${sizeClasses.container} ${className} rounded-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-white/10 flex items-center justify-center overflow-hidden`}
      role="status"
      aria-label="Loading avatar"
    >
      {prefersReducedMotion ? (
        // Static shimmer for reduced motion
        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20" />
      ) : (
        // Animated shimmer
        <div className="w-full h-full bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-purple-500/30 animate-pulse" />
      )}
    </div>
  );
}

export default AvatarSkeleton;

