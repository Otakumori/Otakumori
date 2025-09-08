// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
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
    return <div>{<><span role='img' aria-label='emoji'>L</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>...</>}</div>;
  }

  if (!user) {
    return <div>{<><span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>o</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>p</span></>}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{<><span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>p</span></>}</h1>
      <div className="mb-4">
        <p>{<><span role='img' aria-label='emoji'>Y</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>:</span>' '''</>}{user.petals}</p>
      </div>
      {/* Add your shop items here */}
    </div>
  );
}
