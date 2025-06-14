'use client';

import { useSession } from 'next-auth/react';
import { useAbyss } from '../../context/AbyssContext';

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

  const handleImageSelect = (image) => {
    // Implement image selection logic here
  };

  const handlePurchase = () => {
    // Implement purchase logic here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>
      <div className="mb-4">
        <p>Your Petals: {petals}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="border p-4 rounded-lg">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <h2 className="text-xl font-semibold">{image.title}</h2>
            <p className="text-gray-600">{image.description}</p>
            <p className="text-lg font-bold mt-2">{image.price} Petals</p>
            <button
              onClick={() => handleImageSelect(image)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
