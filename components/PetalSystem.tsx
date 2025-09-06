'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import InteractivePetals from '@/components/petals/InteractivePetals';
import AestheticPetals from '@/components/petals/AestheticPetals';
import Canopy from '@/components/Canopy';

const PetalSystem: React.FC = () => {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <>
      {/* Canopy background for all pages */}
      <Canopy />
      
      {/* Conditional petal system */}
      {isHome ? (
        <InteractivePetals 
          maxPetals={8}
          spawnRate={0.1}
          petalColor="#F7BFD3"
        />
      ) : (
        <AestheticPetals 
          maxPetals={5}
          spawnRate={0.05}
          petalColor="#F7BFD3"
        />
      )}
    </>
  );
};

export default PetalSystem;