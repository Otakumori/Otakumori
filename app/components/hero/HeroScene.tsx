'use client';

import React from 'react';
import type { SeasonalHomeTheme } from '@/lib/seasonal/otakumoriTheme';

export default function HeroScene({ theme }: { theme: SeasonalHomeTheme }) {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,var(--otm-hero-shrine),transparent_48%),radial-gradient(circle_at_18%_62%,color-mix(in_srgb,var(--otm-hero-accent)_24%,transparent),transparent_32%),linear-gradient(180deg,var(--otm-hero-mist),var(--otm-hero-root)_58%,#030207)]" />
      <div className="absolute left-1/2 top-[18%] h-[52rem] w-[52rem] -translate-x-1/2 rounded-full border border-white/10 opacity-50 shadow-[0_0_120px_color-mix(in_srgb,var(--otm-hero-accent)_28%,transparent)]" />
      <div className="absolute bottom-[-22rem] left-1/2 h-[34rem] w-[82rem] -translate-x-1/2 rounded-[50%] border-t border-[color-mix(in_srgb,var(--otm-hero-ember)_36%,transparent)] bg-black/25" />
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.82))]" />
      <div
        className="absolute left-[8%] top-[18%] hidden h-[62%] w-px bg-gradient-to-b from-transparent via-[var(--otm-hero-ember)] to-transparent opacity-50 md:block"
        style={{ boxShadow: `0 0 38px ${theme.palette.ember}` }}
      />
      <div
        className="absolute right-[10%] top-[22%] hidden h-[52%] w-px bg-gradient-to-b from-transparent via-[var(--otm-hero-accent)] to-transparent opacity-40 md:block"
        style={{ boxShadow: `0 0 34px ${theme.palette.accent}` }}
      />
    </div>
  );
}
