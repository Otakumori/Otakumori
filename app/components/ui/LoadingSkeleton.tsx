"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const VARIANT_CLASSNAMES: Record<NonNullable<SkeletonProps["variant"]>, string> = {
  text: "h-4 rounded",
  rectangular: "rounded-md",
  circular: "rounded-full",
};

export function Skeleton({ className, variant = "rectangular", width, height, lines = 1 }: SkeletonProps) {
  const baseClass = "relative overflow-hidden bg-white/10";
  const style: React.CSSProperties = {
    width: width ?? "100%",
    ...(height ? { height } : {}),
    backgroundSize: "200% 100%",
  };

  const renderLine = (key: string | number) => (
    <motion.div
      key={key}
      className={cn(baseClass, VARIANT_CLASSNAMES[variant], className)}
      style={style}
      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
    />
  );

  if (lines > 1) {
    return <div className="space-y-2">{Array.from({ length: lines }).map((_, index) => renderLine(index))}</div>;
  }

  return renderLine("single");
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <Skeleton variant="rectangular" height="200px" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" width="80px" height="32px" />
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
      <Skeleton variant="rectangular" height="160px" />
      <div className="space-y-2">
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="rectangular" width="100px" height="24px" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="64px" height="64px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2 text-center">
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton variant="rectangular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
          <Skeleton variant="rectangular" width="80px" height="32px" />
        </div>
      ))}
    </div>
  );
}
