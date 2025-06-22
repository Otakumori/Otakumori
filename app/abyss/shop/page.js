'use client';

import { useSession } from 'next-auth/react';
import { useAbyss } from '../../context/AbyssContext';

export default function ShopPage() {
  const { data: session, status } = useSession();
  const { petals } = useAbyss();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access the shop</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Shop</h1>
      <div className="mb-4">
        <p>Your Petals: {petals}</p>
      </div>
      {/* Add your shop items here */}
    </div>
  );
}
