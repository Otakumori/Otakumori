'use client';

import React from 'react';
import Link from 'next/link';
import { paths } from '@/lib/paths';
import type { SeasonalHomeTheme } from '@/lib/seasonal/otakumoriTheme';

export default function HeroContent({ theme }: { theme: SeasonalHomeTheme }) {
  return (
    <div className="relative z-20 flex min-h-[100svh] items-center px-4 py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_23rem] lg:items-end">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[var(--otm-hero-ember)]">
            {theme.label}
          </p>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-normal text-white md:text-7xl">
            Otaku-mori remembers the path you take.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-pink-50/78 md:text-lg">
            {theme.invocation} {theme.promise}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={paths.shop()} className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[var(--otm-hero-accent)] bg-[color-mix(in_srgb,var(--otm-hero-accent)_26%,black)] px-6 text-sm font-semibold text-white shadow-[0_0_32px_color-mix(in_srgb,var(--otm-hero-accent)_28%,transparent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--otm-hero-accent)_38%,black)]">
              Shop relic drops
            </Link>

            <Link href={paths.games()} className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[var(--otm-hero-ember)] hover:bg-white/[0.12]">
              Enter arcade
            </Link>

            <Link href={paths.community()} className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-white/15 bg-black/25 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10">
              Join the grove
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/12 bg-black/28 p-5 shadow-2xl shadow-black/40 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-sm font-medium text-white">Core path</span>
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--otm-hero-ember)]">{theme.season}</span>
          </div>
          <div className="mt-5 space-y-4 text-sm text-pink-50/75">
            <div className="flex items-center justify-between gap-4">
              <span>Buy-ready shop</span>
              <span className="text-[var(--otm-hero-accent)]">online</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Cart memory</span>
              <span className="text-[var(--otm-hero-accent)]">synced</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Checkout handoff</span>
              <span className="text-[var(--otm-hero-ember)]">server-trusted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
