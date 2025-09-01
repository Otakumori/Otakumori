 
 
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function ShopPage() {
  const { user, isLoaded } = useUser();
  const [items] = useState([
    { id: 1, name: 'Petal Boost', price: 100, description: 'Collect 2x petals for 1 hour' },
    { id: 2, name: 'Rare Petal', price: 500, description: 'Unlock rare petal types' },
    { id: 3, name: 'Custom Avatar', price: 1000, description: 'Create your own avatar' },
  ]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to access the shop</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Shop</h1>
      <div className="mb-4">
        <p>Your Petals: {user.petals}</p>
      </div>
      {/* Add your shop items here */}
    </div>
  );
}
