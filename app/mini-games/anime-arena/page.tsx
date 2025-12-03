'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the game scene to avoid SSR issues with Three.js
const AnimeArenaScene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <div className="text-center">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
        <p className="text-pink-200">Loading Arena...</p>
      </div>
    </div>
  ),
});

);
}
export default function AnimeArenaPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <Suspense fallback={null}>
        <AnimeArenaScene />
      </Suspense>
    </div>
  );
}

