'use client';

import { useState } from 'react';
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
      if (!response.ok) throw new Error('Failed to load avatar');
      const result = await response.json();
      return result.data;
    },
    enabled: !!userId || !!user?.id,
  });

  const sizeClasses = getAvatarSizeClasses(size);

  const isOwnProfile = !userId || userId === user?.id;

  if (isLoading) {
    return <AvatarSkeleton size={size} className={className} />;
  }

  if (!avatarData?.avatarConfig) {
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
        <AvatarRenderer config={avatarData.avatarConfig} size={size} showInteractions={true} />

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
