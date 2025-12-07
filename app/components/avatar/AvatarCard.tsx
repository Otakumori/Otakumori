'use client';

import { logger } from '@/app/lib/logger';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AvatarCardProps {
  config: any;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showName?: boolean;
  name?: string;
  isOnline?: boolean;
  onClick?: () => void;

export function AvatarCard({
  config,
  size = 'medium',
  className = '',
  showName = false,
  name = 'Anonymous',
  isOnline = false,
  onClick,
}: AvatarCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  // Extract avatar characteristics for 2D representation
  const gender = config?.gender || 'female';
  const age = config?.age || 'young-adult';
  const hairColor = config?.hair?.color || '#8B4513';
  const skinTone = config?.face?.skin?.tone || 0.7;
  const eyeColor = config?.face?.eyes?.color || '#4A90E2';
  const outfitColor = config?.outfit?.primary?.color || '#FF6B9D';

  // Log avatar characteristics for debugging
  logger.warn('AvatarCard rendering:', undefined, { gender, age, hairColor });

  // Convert skin tone to hex
  const getSkinToneHex = (tone: number) => {
    const tones = [
      '#FDBCB4', // Light
      '#E8A87C', // Medium Light
      '#D08B5B', // Medium
      '#B87333', // Medium Dark
      '#8B4513', // Dark
    ];
    return tones[Math.floor(tone * tones.length)] || tones[2];
  };

  const skinHex = getSkinToneHex(skinTone);

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative cursor-pointer`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={reducedMotion ? {} : { scale: 1.05 }}
      whileTap={reducedMotion ? {} : { scale: 0.95 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
    >
      {/* Avatar Card Container */}
      <div className="w-full h-full rounded-xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />
        </div>

        {/* Avatar Representation */}
        <div className="w-full h-full flex items-center justify-center relative z-10">
          <div className="relative">
            {/* Head */}
            <div className="w-6 h-6 rounded-full mx-auto" style={{ backgroundColor: skinHex }} />

            {/* Hair */}
            <div
              className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-7 h-3 rounded-t-full"
              style={{ backgroundColor: hairColor }}
            />

            {/* Eyes */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: eyeColor }} />
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: eyeColor }} />
            </div>

            {/* Body/Outfit */}
            <div
              className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-6 rounded-b-lg"
              style={{ backgroundColor: outfitColor }}
            />
          </div>
        </div>

        {/* Online Status Indicator */}
        {isOnline && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full border border-white/50" />
        )}

        {/* Hover Effect */}
        {!reducedMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* Name Display */}
      {showName && (
        <div className="mt-2 text-center">
          <p className={`${textSizes[size]} text-white font-medium truncate`}>{name}</p>
        </div>
      )}

      {/* Gender/Age Indicator */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
        <span className="text-xs text-white">{gender === 'male' ? '' : ''}</span>
      </div>
    </motion.div>
  );
}

export default AvatarCard;
