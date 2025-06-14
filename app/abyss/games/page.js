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
      <h1 className="text-3xl font-bold mb-6">Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/abyss/games/mini-games"
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Mini Games</h2>
          <p>Play quick and fun mini-games to earn petals!</p>
        </Link>
        <Link
          href="/abyss/games/petal-collection"
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Petal Collection</h2>
          <p>Collect and manage your petals in this special game.</p>
        </Link>
      </div>
    </div>
  );
}
