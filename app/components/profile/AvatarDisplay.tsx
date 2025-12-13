'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { AvatarRenderer } from '@/app/adults/_components/AvatarRenderer.safe';
import { getAvatarSizeClasses } from '@/app/lib/avatar-sizes';
import { AvatarSkeleton } from '@/app/components/avatar/AvatarSkeleton';
import { AvatarFallback } from '@/app/components/avatar/AvatarFallback';
import type { AvatarSize } from '@/app/lib/avatar-sizes';

interface AvatarDisplayProps {
  userId?: string;
  size?: AvatarSize;
  showEditButton?: boolean;
  className?: string;
}

// Wrapper component with error handling for AvatarRenderer
function AvatarRendererWrapper({
  config,
  size,
  showInteractions,
  fallback,
}: {
  config: any;
  size: AvatarSize;
  showInteractions: boolean;
  fallback: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);
  const [_error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset error state when config changes
    setHasError(false);
    setError(null);
  }, [config]);

  if (hasError) {
    return <>{fallback}</>;
  }

  try {
    return (
      <ErrorBoundary
        fallback={fallback}
        onError={(err) => {
          setHasError(true);
          setError(err);
        }}
      >
        <AvatarRenderer config={config} size={size} showInteractions={showInteractions} />
      </ErrorBoundary>
    );
  } catch (err) {
    setHasError(true);
    setError(err instanceof Error ? err : new Error(String(err)));
    return <>{fallback}</>;
  }
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    void errorInfo;
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return this.props.children;
  }
}

export function AvatarDisplay({
  userId,
  size = 'md',
  showEditButton = false,
  className = '',
}: AvatarDisplayProps) {
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  // Fetch user's avatar configuration
  const { data: avatarData, isLoading } = useQuery({
    queryKey: ['user-avatar', userId || user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/avatar/load`);
      if (!response.ok) {
        throw new Error('Failed to load avatar');
      }
      const result = await response.json();
      // Fix: API returns { data: { user: { avatarConfig: ... } } }, so we need to return the user object
      const userData = result.data?.user || result.data;
      return userData;
    },
    enabled: !!userId || !!user?.id,
  });

  const sizeClasses = getAvatarSizeClasses(size);

  const isOwnProfile = !userId || userId === user?.id;

  // After fix: avatarData is already the user object (from result.data?.user), so avatarConfig is directly on avatarData
  let avatarConfig = avatarData?.avatarConfig;
  
  // Handle case where avatarConfig might be a JSON string (defensive check)
  if (typeof avatarConfig === 'string') {
    try {
      avatarConfig = JSON.parse(avatarConfig);
    } catch (e) {
      console.warn('[AvatarDisplay] Failed to parse avatarConfig string:', e);
      avatarConfig = null;
    }
  }
  
  // Validate avatarConfig structure - ensure it's an object, not null/undefined/string
  // Less strict validation - just check if it's a valid object, let AvatarRenderer handle format validation
  const isValidConfig = avatarConfig && 
    typeof avatarConfig === 'object' && 
    !Array.isArray(avatarConfig);

  if (isLoading) {
    return <AvatarSkeleton size={size} className={className} />;
  }

  if (!isValidConfig) {
    return (
      <div className={`${sizeClasses.container} ${className}`}>
        <AvatarFallback size={size} mode="user" className="w-full h-full" />
        {isOwnProfile && showEditButton && (
          <Link
            href="/adults/editor"
            className="mt-2 block text-xs text-pink-400 hover:text-pink-300 transition-colors text-center"
          >
            Create Avatar
          </Link>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={`${sizeClasses.container} rounded-lg overflow-hidden border border-white/20 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={reducedMotion ? {} : { scale: 1.02 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
    >
      {/* 3D Avatar Renderer */}
      <div className="w-full h-full relative">
        {isValidConfig ? (
          <AvatarRendererWrapper config={avatarConfig} size={size} showInteractions={true} fallback={<AvatarFallback size={size} mode="user" className="w-full h-full" />} />
        ) : (
          <AvatarFallback size={size} mode="user" className="w-full h-full" />
        )}

        {/* Overlay for edit button */}
        {isOwnProfile && showEditButton && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/adults/editor"
              className="px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors"
            >
              Edit Avatar
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AvatarDisplay;
