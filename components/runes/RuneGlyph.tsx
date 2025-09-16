'use client';

import { type CanonicalRuneId } from '@/types/runes';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface RuneGlyphProps {
  canonicalId?: CanonicalRuneId;
  runeId?: CanonicalRuneId; // Alternative prop name
  glyph?: string;
  glyphOverride?: string; // Alternative prop name
  displayName?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  style?: 'emoji' | 'material';
  className?: string;
}

export default function RuneGlyph({
  canonicalId,
  runeId,
  glyph,
  glyphOverride,
  displayName,
  size = 'md',
  animated = false,
  style = 'emoji',
  className = '',
}: RuneGlyphProps) {
  // Use the first available ID
  const id = canonicalId || runeId;
  
  // Use the first available glyph
  const glyphText = glyphOverride || glyph || '✧';
  
  // Size classes
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };
  
  // Animation variants
  const animationVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 },
  };
  
  const content: ReactNode = (
    <span 
      className={`${sizeClasses[size]} ${className}`}
      title={displayName || id}
      role="img"
      aria-label={displayName || `Rune ${id || 'unknown'}`}
    >
      {glyphText}
    </span>
  );
  
  if (animated) {
    return (
      <motion.div
        variants={animationVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    );
  }
  
  return content;
}
