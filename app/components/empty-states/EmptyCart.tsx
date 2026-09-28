'use client';

import Link from 'next/link';
import { paths } from '@/lib/paths';
import { approvedVisualAssets } from '@/lib/approved-visual-assets';
import { MoriArtwork } from '@/app/components/approved-art/MoriArtwork';

export function EmptyCart() {
  return (
    <section className="mori-foundation-frame flex flex-col items-center gap-3 border-[#c6a77d]/35 bg-transparent px-6 py-8 text-center shadow-none backdrop-blur-none">
      <MoriArtwork src={approvedVisualAssets.emptyStates.cart} />
      <h2 className="text-sm font-semibold tracking-[0.28em] uppercase text-white/80">
        Your cart is feeling light
      </h2>
      <p className="max-w-md text-sm text-white/60">
        Add something pretty and let it bloom in here.
      </p>
      <Link
        href={paths.shop()}
        className="mori-button-primary mt-3 inline-flex px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
      >
        Browse products
      </Link>
    </section>
  );
}
