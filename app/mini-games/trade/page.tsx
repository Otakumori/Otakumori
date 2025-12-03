'use client';

import { generateSEO } from '@/app/lib/seo';
import dynamic from 'next/dynamic';

const ConsoleCard = dynamic(() => import('../console/ConsoleCard'), { ssr: false });

export function generateMetadata() {
  return generateSEO({
    title: 'Scarlet Bazaar',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\trade\page.tsx',
  });
}
export default function TradeAlias() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ConsoleCard defaultFace={4} />
    </main>
  );
}
