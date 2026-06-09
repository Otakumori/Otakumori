'use client';

import Link from 'next/link';

const CATEGORY_TILES = [
  {
    href: '/shop',
    label: 'Shop',
    glyphClass: 'mori-icon-glyph mori-icon-glyph--flower',
  },
  {
    href: '/mini-games',
    label: 'Mini-Games',
    glyphClass: 'mori-icon-glyph mori-icon-glyph--blade',
  },
  {
    href: '/community',
    label: 'Community',
    glyphClass: 'mori-icon-glyph mori-icon-glyph--sigil',
  },
  {
    href: '/blog',
    label: 'Blog',
    glyphClass: 'mori-icon-glyph mori-icon-glyph--heart',
  },
] as const;

export default function HeroContent() {
  return (
    <div
      id="main-content"
      className="relative z-20 flex min-h-[100svh] items-center justify-center px-4 py-24 text-center"
    >
      <div className="mori-frame mori-paper-texture mx-auto w-full max-w-3xl rounded-sm bg-black/25 px-6 py-10 backdrop-blur-[2px] md:px-10 md:py-12">
        <p className="mori-ui text-sm">Welcome Home, Traveler</p>

        <h1 className="mori-display mt-4 text-balance text-4xl md:text-6xl">Enter the Mori</h1>

        <p className="mori-body mx-auto mt-5 max-w-xl text-base leading-relaxed md:text-lg">
          A dark storybook anime-commerce world where petals, relics, games, and small rituals bloom
          together.
        </p>

        <div
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          aria-label="Explore Otaku-mori"
        >
          {CATEGORY_TILES.map((tile) => (
            <Link key={tile.href} href={tile.href} className="mori-icon-tile rounded-sm">
              <span className={tile.glyphClass} aria-hidden="true" />
              <span className="mori-ui text-xs normal-case tracking-[0.18em]">{tile.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/shop" className="mori-cta-primary w-full max-w-md rounded-sm sm:w-auto">
            Shop the collection
          </Link>
        </div>

        <p className="mori-body mt-6 text-sm">
          Relics, apparel, games, and fellow travelers await beyond the petals.
        </p>
      </div>
    </div>
  );
}
