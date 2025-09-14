"use client";
import Image from 'next/image';

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Bottom-anchored cherry tree to keep roots near the footer */}
      <div data-tree-root className="absolute inset-x-0 bottom-0 h-[85vh]">
        <Image
          src="/assets/images/CherryTree.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-bottom opacity-90 select-none"
          draggable={false as any}
        />
      </div>
    </div>
  );
}
