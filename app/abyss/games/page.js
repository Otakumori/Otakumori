'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function GamesPage() {
  const { user, isLoaded } = useUser();
  const [selectedGame, setSelectedGame] = useState(null);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to access the games</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Games</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link
          href="/abyss/games/mini-games"
          className="rounded-lg border p-6 transition-shadow hover:shadow-lg"
        >
          <h2 className="mb-2 text-2xl font-semibold">Mini Games</h2>
          <p>Play quick and fun mini-games to earn petals!</p>
        </Link>
        <Link
          href="/abyss/games/petal-collection"
          className="rounded-lg border p-6 transition-shadow hover:shadow-lg"
        >
          <h2 className="mb-2 text-2xl font-semibold">Petal Collection</h2>
          <p>Collect and manage your petals in this special game.</p>
        </Link>
      </div>
    </div>
  );
}
