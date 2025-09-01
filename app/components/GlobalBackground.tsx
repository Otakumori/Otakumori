'use client';
import Image from 'next/image';

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Image
        src="/assets/images/tree-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-90"
      />
    </div>
  );
}
