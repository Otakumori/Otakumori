/**
 * Procedural Memory Card Component
 * Generates unique card back textures using procedural generation
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProceduralAsset, PREDEFINED_PALETTES } from '@/app/hooks/useProceduralAssets';
import Image from 'next/image';

interface ProceduralMemoryCardProps {
  isFlipped: boolean;
  isMatched: boolean;
  frontImage: string;
  characterName: string;
  onClick: () => void;
  disabled: boolean;
  theme?: 'sakura' | 'cyberpunk' | 'forest' | 'fire' | 'ice' | 'void';
}

export default function ProceduralMemoryCard({
  isFlipped,
  isMatched,
  frontImage,
  characterName,
  onClick,
  disabled,
  theme = 'void',
}: ProceduralMemoryCardProps) {
  // Generate unique card back texture
  const { asset: cardBackTexture, isLoading } = useProceduralAsset(
    useMemo(
      () => ({
        type: 'voronoi' as const,
        width: 256,
        height: 384,
        seed: `memory-card-${theme}`,
        palette: PREDEFINED_PALETTES[theme],
        config: {
          pointCount: 12,
        },
      }),
      [theme],
    ),
  );

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isMatched}
      className="relative aspect-[2/3] w-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
      whileHover={{ scale: disabled || isMatched ? 1 : 1.05 }}
      whileTap={{ scale: disabled || isMatched ? 1 : 0.95 }}
      aria-label={`Memory card ${isFlipped ? `showing ${characterName}` : 'face down'}`}
    >
      <div className="relative h-full w-full perspective-1000">
        <motion.div
          className="relative h-full w-full preserve-3d"
          initial={false}
          animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
          transition={{
            duration: 0.6,
            ease: [0.68, -0.55, 0.265, 1.55],
          }}
        >
          {/* Card Back */}
          <div className="absolute inset-0 backface-hidden rounded-2xl border-4 border-white/30 bg-gradient-to-br from-purple-900 via-indigo-900 to-black shadow-2xl overflow-hidden">
            {isLoading ? (
              // Loading state
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <motion.div
                  className="h-12 w-12 rounded-full border-4 border-pink-500 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            ) : cardBackTexture ? (
              // Procedurally generated texture
              <div className="relative h-full w-full">
                <Image
                  src={cardBackTexture.dataUrl}
                  alt="Card back"
                  fill
                  className="object-cover opacity-40"
                />
                {/* Overlay pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/20 to-pink-500/30" />
                {/* Center logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full border-4 border-white/40 bg-gradient-to-br from-pink-500/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/80 drop-shadow-lg">?</span>
                  </div>
                </div>
              </div>
            ) : (
              // Fallback
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900">
                <span className="text-6xl opacity-30">?</span>
              </div>
            )}
          </div>

          {/* Card Front */}
          <div
            className="absolute inset-0 backface-hidden rounded-2xl border-4 border-pink-500/50 bg-white shadow-2xl overflow-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="relative h-full w-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
              {/* Character Image */}
              <div className="relative h-full w-full">
                <Image
                  src={frontImage}
                  alt={characterName}
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
              {/* Character Name */}
              <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/70 px-3 py-1.5 text-center backdrop-blur-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {characterName}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Matched Overlay */}
      {isMatched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-green-500/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </motion.button>
  );
}
