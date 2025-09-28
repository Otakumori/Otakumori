'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import type * as THREE from 'three';

// Procedural torus component for the "O" shape
function ProceduralTorus() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.3, 16, 100]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#ec4899"
        metalness={0.8}
        roughness={0.2}
        envMapIntensity={1.0}
      />
    </mesh>
  );
}

// Environment-mapped "O" component
function GCubeO() {
  return (
    <div className="w-32 h-32">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#8b5cf6" intensity={0.5} />

        <Environment preset="studio" />

        <ProceduralTorus />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}

export default GCubeO;
