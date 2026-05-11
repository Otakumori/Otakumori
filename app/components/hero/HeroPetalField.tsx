'use client';

import React from 'react';
import type { SeasonalHomeTheme } from '@/lib/seasonal/otakumoriTheme';

const PETAL_POSITIONS = [
  [8, 8, 0, 0.8],
  [18, 18, 2, 0.65],
  [27, 7, 4, 0.9],
  [39, 15, 1, 0.7],
  [51, 9, 5, 0.8],
  [64, 19, 3, 0.62],
  [76, 10, 6, 0.74],
  [88, 17, 2, 0.88],
  [12, 38, 5, 0.7],
  [31, 45, 1, 0.86],
  [46, 32, 3, 0.58],
  [59, 42, 6, 0.72],
  [73, 35, 4, 0.68],
  [91, 48, 0, 0.8],
] as const;

export default function HeroPetalField({ theme }: { theme: SeasonalHomeTheme }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {PETAL_POSITIONS.map(([left, top, delay, scale], index) => (
        <span
          key={`${left}-${top}`}
          className="otm-season-petal absolute block"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${Math.round(13 * scale)}px`,
            height: `${Math.round(21 * scale)}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${theme.motion.driftSeconds + (index % 4)}s`,
            background: index % 3 === 0 ? theme.palette.petalAlt : theme.palette.petal,
          }}
        />
      ))}
    </div>
  );
}
