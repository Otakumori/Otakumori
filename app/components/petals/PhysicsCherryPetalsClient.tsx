'use client';

import { useCallback } from 'react';
import PhysicsCherryPetals from './PhysicsCherryPetals';

interface PhysicsCherryPetalsClientProps {
  density?: number;
}

/**
 * Client wrapper for PhysicsCherryPetals
 * Handles onCollect internally to avoid passing functions from Server Components
 */
export default function PhysicsCherryPetalsClient({ density = 2 }: PhysicsCherryPetalsClientProps) {
  // Handle collection internally - no need to pass function from server
  const handleCollect = useCallback((petalId: number) => {
    // Silent collection - no UI feedback, just tracking
    // Could be used for analytics, achievements, etc.
    // This is intentionally empty as per the original component's design
  }, []);

  return <PhysicsCherryPetals density={density} onCollect={handleCollect} />;
}

