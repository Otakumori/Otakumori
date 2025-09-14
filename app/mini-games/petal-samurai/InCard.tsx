'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./Game'), { ssr: false });

export default function PetalSamuraiInCard() {
  return <Game mode="classic" />;
}

