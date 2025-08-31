import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeKey = string;

const ICONS: Record<string, string> = {
  'site:first_visit': 'M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z',
  'site:daily_visitor': 'M12 3 a9 9 0 1 0 .01 0 M12 3 v9 l6 3',
  'profile:complete': 'M4 6 h16 v12 h-16 Z M7 10 h10 M7 13 h6',
  'profile:avatar': 'M12 7 a3 3 0 1 0 0.01 0 Z M6 19 c0-3.3 12-3.3 12 0',
  'shop:first_purchase': 'M4 6 H20 L18 20 H6 Z M8 10 H16 M9 14 H15',
  'shop:shopping_spree': 'M5 7 h14 l-2 11 h-10 Z M9 10 h6 M8 14 h8',
  'community:first_comment': 'M5 6 h14 v9 h-7 l-3 3 v-3 H5 Z',
  'community:comment_master': 'M4 6 h16 v10 h-6 l-2 2 l-2-2 H4 Z M7 10 h10',
  'lore:explorer': 'M12 4 L19 20 L12 16 L5 20 Z',
  'lore:master': 'M4 6 h16 v12 h-16 Z M8 9 h8 M8 12 h8 M8 15 h6',
  'lore:easter_egg_finder': 'M12 5 c5 0 7 12 0 12 s-5-12 0-12 Z',
  'lore:chaos_master': 'M4 12 h16 M12 4 v16 M6 6 l12 12 M18 6 l-12 12',
  'event:seasonal_participant': 'M12 3 L14 8 L20 9 L15 12 L17 18 L12 15 L7 18 L9 12 L4 9 L10 8 Z',
  'event:event_champion': 'M5 6 h14 v8 h-5 l-2 2 l-2-2 h-5 Z',
  'event:beta_tester': 'M6 6 h12 v12 h-12 Z M9 9 h6 M9 12 h4',
  'event:founder': 'M4 8 h16 v8 h-5 l-3 3 l-3-3 H4 Z',
};

function pickIcon(key: BadgeKey) {
  return ICONS[key] ?? 'M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z';
}

export default function AchievementBadge({
  label,
  keyId,
  className,
  hue = 325,
  detail = 0.12,
}: {
  label: string;
  keyId: BadgeKey;
  className?: string;
  hue?: number;
  detail?: number;
}) {
  const path = pickIcon(keyId);
  return (
    <svg
      className={cn('w-20 h-20 drop-shadow-sm', className)}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor={`hsl(${hue} 85% 65% / .9)`} />
          <stop offset="100%" stopColor={`hsl(${hue + 10} 85% 45% / .9)`} />
        </radialGradient>
        <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor={`hsl(${hue} 85% 80%)`} />
        </linearGradient>
        <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
          <path
            d="M0 0 L4 4 M-1 1 L1 -1 M3 5 L5 3"
            stroke={`hsl(${hue} 40% 80% / ${detail})`}
            strokeWidth="0.3"
          />
        </pattern>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="5" fill="url(#bg)" />
      <rect x="1" y="1" width="22" height="22" rx="5" fill="url(#scan)" />
      <path
        d={path}
        fill="none"
        stroke="url(#stroke)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <title>{label}</title>
    </svg>
  );
}
