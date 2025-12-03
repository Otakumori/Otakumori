'use client';

import { Skeleton } from '@/app/components/ui/Skeleton';
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
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  return (
    <Skeleton />
  );
}

export default AvatarSkeleton;
