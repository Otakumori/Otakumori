'use client';

import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import HeroScene from './HeroScene';
import HeroOverlay from './HeroOverlay';
import HeroContent from './HeroContent';
import HeroPetalField from './HeroPetalField';
import { defaultSeasonalHomeTheme, getSeasonalHomeTheme } from '@/lib/seasonal/otakumoriTheme';

export default function HeroRoot() {
  const [theme, setTheme] = useState(defaultSeasonalHomeTheme);

  useEffect(() => {
    setTheme(getSeasonalHomeTheme(new Date()));
  }, []);

  const style = useMemo(
    () => ({
      '--otm-hero-root': theme.palette.root,
      '--otm-hero-mist': theme.palette.mist,
      '--otm-hero-shrine': theme.palette.shrine,
      '--otm-hero-accent': theme.palette.accent,
      '--otm-hero-ember': theme.palette.ember,
    }) as CSSProperties,
    [theme],
  );

  return (
    <section
      className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[var(--otm-hero-root)] text-white"
      data-season={theme.season}
      style={style}
    >
      <HeroScene theme={theme} />
      <HeroOverlay />
      <HeroPetalField theme={theme} />
      <HeroContent theme={theme} />
    </section>
  );
}
