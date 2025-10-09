'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Mesh } from 'three';

export default function Avatar() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Frame-rate independent idle animation
      meshRef.current.rotation.y += Math.sin(state.clock.elapsedTime * 0.5) * delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.3, 0.1]}>
      <boxGeometry args={[0.1, 0.2, 0.1]} />
      <meshStandardMaterial color="#ff6b9d" />
    </mesh>
  );
}
