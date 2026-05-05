'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DimensionShiftEffect() {
  const overlayRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    
    // Pulse effect
    if (overlayRef.current) {
      const material = overlayRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.sin(timeRef.current * 5) * 0.05;
    }
  });

  return (
    <>
      {/* Visual effect overlay - monochrome filter effect */}
      <mesh ref={overlayRef} position={[0, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

