'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, InstancedMesh } from 'three';
import { useWorldEvent } from '@/app/world/WorldProvider';

export default function PetalBurst() {
  const meshRef = useRef<InstancedMesh>(null);
  const dispatch = useWorldEvent();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Simple petal animation
      meshRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 10]} position={[0, 0, 0.2]}>
      <planeGeometry args={[0.02, 0.02]} />
      <meshBasicMaterial color="#ff9ec7" transparent opacity={0.8} />
    </instancedMesh>
  );
}
