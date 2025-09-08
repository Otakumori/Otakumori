// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function GalleryPage() {
  const { user, isLoaded } = useUser();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!isLoaded) {
    return <div>{<><span role='img' aria-label='emoji'>L</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>...</>}</div>;
  }

  if (!user) {
    return <div>{<><span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>o</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>y</span></>}</div>;
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
      <h1 className="mb-6 text-3xl font-bold">{<><span role='img' aria-label='emoji'>G</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>y</span></>}</h1>
      <div className="mb-4">
        <p>{<><span role='img' aria-label='emoji'>Y</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>:</span>' '''</>}{user.petals}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="rounded-lg border p-4">
            <img
              src={image.url}
              alt={image.title}
              className="mb-2 h-48 w-full rounded object-cover"
            />
            <h2 className="text-xl font-semibold">{image.title}</h2>
            <p className="text-gray-600">{image.description}</p>
            <p className="mt-2 text-lg font-bold">{image.price}{<>''' '<span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>s</span></>}</p>
            <button
              onClick={() => handleImageSelect(image)}
              className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >{<>''
              <span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>e</span>
              ''</>}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
