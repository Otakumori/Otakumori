'use client';

import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circle';
  width?: string;
  height?: string;
}

export function Skeleton({
  variant = 'default',
  width,
  height,
  className = '',
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-white/5 rounded-xl animate-pulse';

  const variantClasses = {
    default: '',
    card: 'aspect-square',
    text: 'h-4 w-full',
    circle: 'rounded-full aspect-square',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      style={style}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden p-4 space-y-4">
      <Skeleton variant="card" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
      <Skeleton height="40px" />
    </div>
  );
}

export function ShopGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

