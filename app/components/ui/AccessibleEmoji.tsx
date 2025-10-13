/**
 * Accessible Emoji Component
 * Properly wraps emojis for screen reader accessibility
 */

import React from 'react';

interface AccessibleEmojiProps {
  symbol: string;
  label: string;
  className?: string;
}

export default function AccessibleEmoji({ symbol, label, className = '' }: AccessibleEmojiProps) {
  return (
    <span role="img" aria-label={label} className={className}>
      {symbol}
    </span>
  );
}

// Common emoji shortcuts for convenience
export const Emojis = {
  Trophy: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol="🏆︎" label="Trophy" className={className} />
  ),
  Star: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol="★" label="Star" className={className} />
  ),
  Sparkles: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol="✨︎" label="Sparkles" className={className} />
  ),
  Fire: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol="🔥︎" label="Fire" className={className} />
  ),
  Heart: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol="❤" label="Heart" className={className} />
  ),
  Camera: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol="📸" label="Camera" className={className} />
  ),
  Movie: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol="🎬" label="Movie camera" className={className} />
  ),
  Sakura: ({ className }: { className?: string }) => (
    <AccessibleEmoji symbol="🌸" label="Cherry blossom" className={className} />
  ),
};
