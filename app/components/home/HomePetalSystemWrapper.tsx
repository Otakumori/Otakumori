'use client';

import { Suspense } from 'react';
import PetalField from '@/app/components/effects/PetalField';

/**
 * HomePetalSystemWrapper
 * 
 * Client component wrapper for petal system on homepage.
 * Prevents server component errors by isolating client-side petal rendering.
 */
export default function HomePetalSystemWrapper() {
  return (
    <Suspense fallback={null}>
      <PetalField density="home" />
    </Suspense>
  );
}

