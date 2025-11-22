'use client';

import CherryPetalLayer from './CherryPetalLayer';

/**
 * Client wrapper for CherryPetalLayer
 * Allows CherryPetalLayer to be used in server components
 */
export function CherryPetalLayerWrapper() {
  return <CherryPetalLayer maxPetals={15} clickDestination="/petal-shop" enabled={true} />;
}
