/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProfileHeaderProps {
  displayName: string;
  tier: number;
  status: string;
  tagline: string;
  fontStyle: 'clean' | 'runic';
  onFontToggle: () => void;
  backgroundUrl?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  tier,
  status,
  tagline,
  fontStyle,
  onFontToggle,
  backgroundUrl,
}) => {
  const [pulse, setPulse] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-pink-400/30 bg-gradient-to-br from-[#2d2233] to-[#3a2a3f] shadow-lg"
      style={{ minHeight: 180 }}
    >
      {/* Dynamic background */}
      {backgroundUrl && (
        <Image
          src={backgroundUrl}
          alt="Profile background"
          fill
          className="pointer-events-none select-none object-cover opacity-30"
        />
      )}
      {/* Subtle petal drift overlay (placeholder, can be replaced with animation) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* TODO: Add animated petals here */}
      </div>
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-between gap-4 px-8 py-6 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {/* Petal Tier Badge */}
            <motion.div
              animate={{ scale: pulse ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-400 bg-pink-200/20 shadow-lg shadow-pink-200/30"
            >
              <Image
                src={`/assets/achievements/tier-${tier}-petal.png`}
                alt={`Petal Tier ${tier}`}
                width={40}
                height={40}
                className="animate-pulse"
              />
            </motion.div>
            {/* Display Name */}
            <motion.h1
              onClick={() => {
                setPulse(true);
                setTimeout(() => setPulse(false), 500);
              }}
              animate={{ scale: pulse ? [1, 1.08, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className={`cursor-pointer select-none text-3xl font-bold ${fontStyle === 'runic' ? 'font-unifraktur-cook' : 'font-roboto-condensed'} text-white`}
            >
              {displayName}
            </motion.h1>
            {/* Font toggle */}
            <button
              onClick={onFontToggle}
              className="ml-2 rounded bg-pink-400/20 px-2 py-1 text-xs font-semibold text-pink-200 transition hover:bg-pink-400/40"
            >
              {fontStyle === 'runic' ? 'Runic' : 'Clean'}
            </button>
          </div>
          {/* Status & Tagline */}
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="font-roboto-condensed text-sm capitalize text-pink-200">{status}</span>
            <span className="mx-2 text-pink-400">•</span>
            <span className="font-cormorant-garamond text-base italic text-pink-200">
              {tagline}
            </span>
          </div>
        </div>
      </div>
      {/* Decorative border overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-xl border-2 border-pink-400/20"
        style={{ boxShadow: '0 0 32px 0 #f7c6d933' }}
      />
    </div>
  );
};
