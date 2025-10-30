'use client';

import { motion, type MotionProps, type MotionStyle } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const VARIANT_CLASSNAMES: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'h-4 rounded',
  rectangular: 'rounded-md',
  circular: 'rounded-full',
};

export function Skeleton(props: SkeletonProps) {
  const { className, variant = 'rectangular', width, height, lines = 1 } = props;

  const baseClass = 'relative overflow-hidden bg-white/10';

  const skeletonStyle: MotionStyle = {
    width: width ?? '100%',
    backgroundSize: '200% 100%',
  };

  if (height !== undefined) {
    skeletonStyle.height = height;
  }

  const renderLine = (key: string | number) => {
    const animationProps: MotionProps = {
      animate: { backgroundPosition: ['200% 0', '-200% 0'] },
      transition: { duration: 1.2, repeat: Infinity, ease: 'linear' },
    };

    return (
      <motion.div
        key={key}
        className={cn(baseClass, VARIANT_CLASSNAMES[variant], className)}
        style={skeletonStyle}
        {...animationProps}
      />
    );
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => renderLine(index))}
      </div>
    );
  }

  return renderLine('single');
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <Skeleton variant="rectangular" height={200} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
      <Skeleton variant="rectangular" height={160} />
      <div className="space-y-2">
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="70%" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="20%" />
      </div>
    </div>
  );
}

export function AvatarSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}
