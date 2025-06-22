'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function GamesPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
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
