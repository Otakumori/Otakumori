'use client';

import { getAvatarSizeClasses } from '@/app/lib/avatar-sizes';
import type { AvatarSize } from '@/app/lib/avatar-sizes';

interface AvatarFallbackProps {
  size?: AvatarSize;
  className?: string;
  mode?: 'preset' | 'user' | 'guest';
}

/**
 * AvatarFallback - Graceful fallback when avatar fails to load
 *
 * Shows a branded silhouette that matches the site's aesthetic.
 * Different styles for preset vs user avatars.
 */
export function AvatarFallback({
  size = 'md',
  className = '',
  mode = 'guest',
}: AvatarFallbackProps) {
  const sizeClasses = getAvatarSizeClasses(size);

  // Different fallback styles based on mode
  const fallbackStyles = {
    preset: 'bg-gradient-to-br from-purple-600/40 to-pink-600/40',
    user: 'bg-gradient-to-br from-purple-500/30 to-pink-500/30',
    guest: 'bg-gradient-to-br from-purple-900/30 to-pink-900/30',
  };

  return (
    <div
      className={`${sizeClasses.container} ${className} rounded-full ${fallbackStyles[mode]} border border-white/10 flex items-center justify-center overflow-hidden`}
      role="img"
      aria-label={`${mode} avatar placeholder`}
    >
      {/* Simple silhouette icon */}
      <svg
        className="w-1/2 h-1/2 text-white/40"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

export default AvatarFallback;
