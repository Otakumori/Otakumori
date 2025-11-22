'use client';

import { useCallback } from 'react';
import PhysicsCherryPetals from './PhysicsCherryPetals';
import { trackPetalCollection } from '@/app/lib/analytics/petals';

interface PhysicsCherryPetalsClientProps {
  density?: number;
}

/**
 * Client wrapper for PhysicsCherryPetals
 * Handles onCollect internally to avoid passing functions from Server Components
 */
export default function PhysicsCherryPetalsClient({ density = 2 }: PhysicsCherryPetalsClientProps) {
  // Handle collection internally with analytics tracking
  const handleCollect = useCallback((petalId: number) => {
    // Track petal collection for analytics
    trackPetalCollection({
      petalId,
      amount: 1,
      source: 'physics_cherry_petals',
      metadata: {
        component: 'PhysicsCherryPetalsClient',
        density,
      },
    });
  }, [density]);

  return <PhysicsCherryPetals density={density} onCollect={handleCollect} />;
}

