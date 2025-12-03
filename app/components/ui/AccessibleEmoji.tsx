'use client';

import React from 'react';

/**
 * Accessible Emoji Component
 * Properly wraps emojis for screen reader accessibility
 * Uses ASCII characters instead of colored emojis
 */

interface AccessibleEmojiProps {
  symbol: string;
  label: string;
  className?: string;
}

export default function AccessibleEmoji({
  symbol,
  label,
  className = '',
}: AccessibleEmojiProps) {
  return (
    <span role="img" aria-label={label} className={className}>
      {symbol}
    </span>
  );
}

// Common emoji shortcuts for convenience - using ASCII characters
export const Emojis = {
  Trophy: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol= "[T]" label="Trophy" className={ className } />
  ),
  Star: ({ className }: { className?: string }) => (
  <AccessibleEmoji symbol= "*" label = "Star" className = { className } />
  ),
  Sparkles: ({ className }: { className?: string }) => (
  <AccessibleEmoji symbol= "*" label = "Sparkles" className = { className } />
  ),
  Fire: ({ className }: { className?: string }) => (
  <AccessibleEmoji symbol= "^" label = "Fire" className = { className } />
  ),
  Heart: ({ className }: { className?: string }) => (
  <AccessibleEmoji symbol= "<3" label = "Heart" className = { className } />
  ),
  Camera: ({ className }: { className?: string }) => (
  <AccessibleEmoji symbol= "[C]" label = "Camera" className = { className } />
  ),
  Movie: ({ className }: { className?: string }) => (
  <AccessibleEmoji symbol= "[M]" label = "Movie camera" className = { className } />
  ),
  Sakura: ({ className }: { className?: string }) => (
  <AccessibleEmoji symbol= "*" label = "Cherry blossom" className = { className } />
  ),
};
