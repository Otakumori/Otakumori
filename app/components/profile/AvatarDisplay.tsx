'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AvatarRenderer } from '@/app/adults/_components/AvatarRenderer.safe';

interface AvatarDisplayProps {
  userId?: string;
  size?: 'small' | 'medium' | 'large';
  showEditButton?: boolean;
  className?: string;
}

export function AvatarDisplay({
  userId,
  size = 'medium',
  showEditButton = false,
  className = '',
}: AvatarDisplayProps) {
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);

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

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-64 h-64',
  };

  const isOwnProfile = !userId || userId === user?.id;

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-white/10 animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!avatarData?.avatarConfig) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-white/10 border border-white/20 ${className}`}
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
          <div className="w-8 h-8 mb-2 rounded-full bg-pink-500/20 flex items-center justify-center">
            <span className="text-pink-400 text-lg">👤</span>
          </div>
          <p className="text-xs text-zinc-400">{isOwnProfile ? 'No avatar yet' : 'No avatar'}</p>
          {isOwnProfile && showEditButton && (
            <Link
              href="/adults/editor"
              className="mt-2 text-xs text-pink-400 hover:text-pink-300 transition-colors"
            >
              Create Avatar
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-lg overflow-hidden border border-white/20 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
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
