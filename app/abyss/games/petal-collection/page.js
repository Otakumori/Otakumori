/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function PetalCollectionPage() {
  const { user, isLoaded } = useUser();
  const [score, setScore] = useState(0);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to access the petal collection game</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Petal Collection</h1>
      <div className="mb-4">
        <p>Your Petals: {score}</p>
      </div>
      {/* Add your petal collection game content here */}
    </div>
  );
}
