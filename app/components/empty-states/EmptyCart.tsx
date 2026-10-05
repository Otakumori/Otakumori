'use client';

import Link from 'next/link';
import { paths } from '@/lib/paths';
import { approvedVisualAssets } from '@/lib/approved-visual-assets';
import { MoriArtwork } from '@/app/components/approved-art/MoriArtwork';

export function EmptyCart() {
  return (
    <section className="om-empty-cart flex flex-col items-center gap-3 px-4 py-8 text-center">
      <MoriArtwork src={approvedVisualAssets.emptyStates.cart} />
      <h2 className="max-w-lg text-xl font-normal leading-relaxed text-[#f6eddf]">
        Your bottomless bag is... seemingly empty?
      </h2>
      <p className="max-w-md text-sm text-white/60">
        Wanna add something?
      </p>
      <Link
        href={paths.shop()}
        className="mori-button-primary mt-3 inline-flex px-5 py-2 text-sm"
      >
        Browse the goods
      </Link>
    </section>
  );
}
