/**
 * Canonical Avatar Size System
 * 
 * This file defines the standard avatar size tokens used across the application.
 * All avatar components should use these sizes to ensure consistency and crisp rendering.
 * 
 * Usage:
 *   import { AVATAR_SIZES, getAvatarSizeClasses } from '@/app/lib/avatar-sizes';
 *   
 *   // In component:
 *   const sizeClasses = getAvatarSizeClasses('md');
 *   <div className={sizeClasses.container}>...</div>
 */

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Canonical avatar size definitions
 * - xs: Extra small (nav, badges, inline)
 * - sm: Small (lists, cards)
 * - md: Medium (default, profile previews)
 * - lg: Large (profile headers, featured)
 * - xl: Extra large (hero sections, detailed views)
 */
export const AVATAR_SIZES: Record<AvatarSize, {
  width: number;
  height: number;
  canvasSize: number; // For 3D rendering
  detail: 'low' | 'medium' | 'high' | 'ultra';
}> = {
  xs: {
    width: 24,
    height: 24,
    canvasSize: 64,
    detail: 'low',
  },
  sm: {
    width: 48,
    height: 48,
    canvasSize: 128,
    detail: 'low',
  },
  md: {
    width: 128,
    height: 128,
    canvasSize: 256,
    detail: 'medium',
  },
  lg: {
    width: 256,
    height: 256,
    canvasSize: 512,
    detail: 'high',
  },
  xl: {
    width: 512,
    height: 512,
    canvasSize: 1024,
    detail: 'ultra',
  },
};

/**
 * Get Tailwind classes for avatar container
 */
export function getAvatarSizeClasses(size: AvatarSize): {
  container: string;
  skeleton: string;
} {
  const sizeMap: Record<AvatarSize, { container: string; skeleton: string }> = {
    xs: {
      container: 'w-6 h-6',
      skeleton: 'w-6 h-6',
    },
    sm: {
      container: 'w-12 h-12',
      skeleton: 'w-12 h-12',
    },
    md: {
      container: 'w-32 h-32',
      skeleton: 'w-32 h-32',
    },
    lg: {
      container: 'w-64 h-64',
      skeleton: 'w-64 h-64',
    },
    xl: {
      container: 'w-[512px] h-[512px]',
      skeleton: 'w-[512px] h-[512px]',
    },
  };

  return sizeMap[size];
}

/**
 * Get pixel dimensions for a given size
 */
export function getAvatarDimensions(size: AvatarSize) {
  return AVATAR_SIZES[size];
}

