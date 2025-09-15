'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const ConsoleCard = dynamic(() => import('../../console/ConsoleCard'), { ssr: false });

export default function GameRoute() {
  const params = useParams<{ gameKey: string }>();
  const gameKey = params?.gameKey;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ConsoleCard gameKey={gameKey} defaultFace={1} />
    </main>
  );
}
