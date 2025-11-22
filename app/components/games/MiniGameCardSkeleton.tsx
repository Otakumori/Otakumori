'use client';

/**
 * MiniGameCardSkeleton - Loading skeleton for mini-game cards
 *
 * Provides a consistent loading state that matches the arcade aesthetic.
 * Respects prefers-reduced-motion for accessibility.
 */
export function MiniGameCardSkeleton() {
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  return (
    <div className="group block focus:outline-none">
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {/* Image skeleton */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30">
          {prefersReducedMotion ? (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-pulse" />
          )}
        </div>

        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="h-5 bg-white/10 rounded w-3/4" />
          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-5/6" />
          </div>
          {/* Category badge */}
          <div className="h-6 bg-pink-500/20 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

export default MiniGameCardSkeleton;
