'use client';

import { useSession } from 'next-auth/react';
import { useAbyss } from '@/context/AbyssContext';

export default function PetalCollectionPage() {
  const { data: session, status } = useSession();
  const { petals, setPetals } = useAbyss();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access petal collection</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Petal Collection</h1>
      <div className="mb-4">
        <p>Your Petals: {petals}</p>
      </div>
      {/* Add your petal collection game content here */}
    </div>
  );
}
