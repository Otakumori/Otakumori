'use client';

import { Skeleton } from '@/app/components/ui/Skeleton';

/**
 * Petal-themed loading animation component
 */
function PetalLoadingAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-16 h-16">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-pink-500/30 animate-ping"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-pink-500/50" />
        </div>
      </div>
    </div>
  );
}

/**
 * Shop section skeleton loader
 */
export function ShopSectionSkeleton() {
  return (
    <div className="rounded-2xl p-8 relative">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative">
            <Skeleton className="aspect-square rounded-xl mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
      <PetalLoadingAnimation />
    </div>
  );
}

/**
 * Blog section skeleton loader
 */
export function BlogSectionSkeleton() {
  return (
    <div className="rounded-2xl p-8 relative">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative">
            <Skeleton className="aspect-video rounded-xl mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      <PetalLoadingAnimation />
    </div>
  );
}

/**
 * Mini-games section skeleton loader
 */
export function MiniGamesSectionSkeleton() {
  return (
    <div className="rounded-2xl p-8 relative">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative">
            <Skeleton className="aspect-video rounded-xl" />
          </div>
        ))}
      </div>
      <PetalLoadingAnimation />
    </div>
  );
}

/**
 * Generic section skeleton with progress indicator
 */
export function SectionSkeleton({
  title,
  description,
  itemCount = 3,
}: {
  title?: string;
  description?: string;
  itemCount?: number;
}) {
  return (
    <div className="rounded-2xl p-8 relative">
      {(title || description) && (
        <div className="mb-6">
          {title && <Skeleton className="h-8 w-48 mb-2" />}
          {description && <Skeleton className="h-4 w-64" />}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: itemCount }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
      <PetalLoadingAnimation />
    </div>
  );
}

