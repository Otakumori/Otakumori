'use client';

import Image from 'next/image';

/**
 * Static left-anchored cherry-blossom tree
 * - No parallax. Fixed behind content.
 * - Visually spans header → footer with a bottom fade.
 * - Pointer-events: none (won't block UI).
 * - Hidden petal spawn anchor aligned to upper canopy.
 *
 * Primary: WebP @2x  | Fallbacks kept in repo:
 *   /assets/images/cherry-tree@2x.webp
 *   /assets/images/CherryTree.png
 *   /assets/images/cherry-tree-original.png
 *   /assets/images/cherry-tree@1x.webp
 */

type TreeLeftAlignedProps = {
  src?: string;
  trunkCenterPx?: number;
};

export default function TreeLeftAligned({ 
  src = '/assets/images/cherry-tree@2x.webp',
  trunkCenterPx = 380 
}: TreeLeftAlignedProps) {
  return (
    <>
      {/* Fixed art layer behind everything */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 -z-[5] h-[120vh] w-[55vw] md:w-[45vw] lg:w-[40vw] tree-left-aligned"
        data-trunk-center={trunkCenterPx}
      >
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt=""
            priority
            fill
            sizes="(max-width:768px) 55vw, (max-width:1024px) 45vw, 40vw"
            className="select-none object-left object-contain"
          />

          {/* Soft bottom fade so roots blend into footer on any page length */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#080611]" />
        </div>
      </div>

      {/* Hidden petal spawn anchor (targets upper-right canopy).
          Invisible but present for petal spawning. */}
      <div
        id="petal-spawn-anchor"
        aria-hidden
        className="fixed -z-[4] opacity-0 pointer-events-none petal-spawn-anchor"
      />
    </>
  );
}