'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./Game'), { ssr: false });

export default function MemoryMatchInCard() {
  return <Game mode="classic" />;
}
