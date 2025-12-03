'use client';

import dynamic from 'next/dynamic';

const ConsoleCard = dynamic(() => import('../console/ConsoleCard'), { ssr: false });

);
}
export default function TradeAlias() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ConsoleCard defaultFace={4} />
    </main>
  );
}
