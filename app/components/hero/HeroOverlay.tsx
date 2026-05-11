'use client';

import React from 'react';

export default function HeroOverlay() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.58),rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.68))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--otm-hero-accent)_16%,transparent),transparent_68%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:72px_72px]" />
    </div>
  );
}
