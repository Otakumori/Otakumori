/**
 * 3D Avatar Renderer
 * WebGL-based avatar visualization using Three.js and React Three Fiber
 */

'use client';

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useAvatarStore } from '@/app/stores/avatarStore';
import { useProceduralAsset, PREDEFINED_PALETTES } from '@/app/hooks/useProceduralAssets';

interface AvatarMeshProps {
  partId: string;
  position?: [number, number, number];
  proceduralTexture?: boolean;
  textureUrl?: string;
}

function AvatarPart({
  partId,
  position = [0, 0, 0],
  proceduralTexture,
  textureUrl,
}: AvatarMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Generate procedural texture if needed
  const { asset: proceduralAsset } = useProceduralAsset(
    proceduralTexture
      ? {
          type: 'noise',
          width: 512,
          height: 512,
          seed: partId,
          palette: PREDEFINED_PALETTES.sakura,
          config: { scale: 0.05, octaves: 4 },
        }
      : null,
  );

  useEffect(() => {
    if (proceduralAsset) {
      const textureLoader = new THREE.TextureLoader();
      const loadedTexture = textureLoader.load(proceduralAsset.dataUrl);
      loadedTexture.wrapS = THREE.RepeatWrapping;
      loadedTexture.wrapT = THREE.RepeatWrapping;
      setTexture(loadedTexture);
    } else if (textureUrl) {
      const textureLoader = new THREE.TextureLoader();
      const loadedTexture = textureLoader.load(textureUrl);
      setTexture(loadedTexture);
    }
  }, [proceduralAsset, textureUrl]);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial map={texture} color="#ffffff" roughness={0.7} metalness={0.2} />
    </mesh>
  );
}

function AvatarModel() {
  const groupRef = useRef<THREE.Group>(null);
  const avatar = useAvatarStore((state) => state.avatar);

  // Idle animation
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      {avatar.body && <AvatarPart partId={avatar.body} position={[0, 0, 0]} proceduralTexture />}

      {/* Head */}
      {avatar.face && <AvatarPart partId={avatar.face} position={[0, 0.8, 0]} proceduralTexture />}

      {/* Hair */}
      {avatar.hair && <AvatarPart partId={avatar.hair} position={[0, 1.2, 0]} proceduralTexture />}

      {/* Accessories */}
      {avatar.accessories.map((accessoryId, index) => (
        <AvatarPart
          key={accessoryId}
          partId={accessoryId}
          position={[Math.cos(index) * 0.3, 0.5, Math.sin(index) * 0.3]}
          proceduralTexture
        />
      ))}
    </group>
  );
}

interface AvatarRenderer3DProps {
  width?: string | number;
  height?: string | number;
  enableControls?: boolean;
  autoRotate?: boolean;
  className?: string;
}

export default function AvatarRenderer3D({
  width = '100%',
  height = 400,
  enableControls = true,
  autoRotate = false,
  className = '',
}: AvatarRenderer3DProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-gray-900 to-black ${className}`}
      style={{ width, height }}
    >
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1, 3]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ff69b4" />
        <pointLight position={[5, 3, 5]} intensity={0.5} color="#8b5cf6" />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Avatar */}
        <Suspense
          fallback={
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial color="#ff69b4" wireframe />
            </mesh>
          }
        >
          <AvatarModel />
        </Suspense>

        {/* Controls */}
        {enableControls && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={5}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
          />
        )}
      </Canvas>

      {/* Loading Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-4 left-4 text-xs text-white/50">
          Use mouse to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );
}
