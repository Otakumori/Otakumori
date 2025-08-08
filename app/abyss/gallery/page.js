'use client';

import { useSession } from 'next-auth/react';
import { useAbyss } from '@/context/AbyssContext';

export default function Gallery() {
  const { data: session, status } = useSession();
  const { petals } = useAbyss();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access the gallery.</div>;
  }

  const images = [
    {
      id: 1,
      title: 'Cherry Blossom',
      description: 'Beautiful cherry blossoms in spring',
      url: '/images/gallery/cherry-blossom.jpg',
      price: 50,
    },
    {
      id: 2,
      title: 'Mountain View',
      description: 'Scenic mountain landscape',
      url: '/images/gallery/mountain.jpg',
      price: 75,
    },
    // Add more images as needed
  ];

  const handleImageSelect = image => {
    // Implement image selection logic here
  };

  const handlePurchase = () => {
    // Implement purchase logic here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Gallery</h1>
      <div className="mb-4">
        <p>Your Petals: {petals}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map(image => (
          <div key={image.id} className="rounded-lg border p-4">
            <img
              src={image.url}
              alt={image.title}
              className="mb-2 h-48 w-full rounded object-cover"
            />
            <h2 className="text-xl font-semibold">{image.title}</h2>
            <p className="text-gray-600">{image.description}</p>
            <p className="mt-2 text-lg font-bold">{image.price} Petals</p>
            <button
              onClick={() => handleImageSelect(image)}
              className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
