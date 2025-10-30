/**
 * React Three Fiber Avatar Renderer Component
 * Policy-agnostic renderer that receives pre-resolved equipment URLs
 */

import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AvatarSpecV15Type, EquipmentSlotType } from '../spec';

export interface ResolvedEquipment {
  id: string;
  url: string;
}

export interface AvatarRendererProps {
  spec: AvatarSpecV15Type;
  resolved: Partial<Record<EquipmentSlotType, ResolvedEquipment | null>>;
  reducedMotion?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * AvatarRenderer - Loads and renders avatar with resolved equipment
 * NO POLICY LOGIC - equipment is already resolved by server
 */
export function AvatarRenderer({
  spec,
  resolved,
  reducedMotion = false,
  onLoad,
  onError,
}: AvatarRendererProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load base mesh (useGLTF suspends on error, no error prop)
  const { scene: baseScene } = useGLTF(spec.baseMeshUrl);

  // Apply morph targets when scene loads
  useEffect(() => {
    if (!baseScene) return;

    try {
      // Find skinned meshes with morph targets
      baseScene.traverse((node) => {
        if (node instanceof THREE.SkinnedMesh || node instanceof THREE.Mesh) {
          const mesh = node as THREE.SkinnedMesh | THREE.Mesh;
          const influences = mesh.morphTargetInfluences;
          const dictionary = mesh.morphTargetDictionary;
          if (!influences || !dictionary) {
            return;
          }

          Object.entries(spec.morphWeights).forEach(([morphId, weight]) => {
            const index = dictionary[morphId];
            if (index !== undefined) {
              influences[index] = weight;
            }
          });
        }
      });

      setIsLoaded(true);
      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  }, [baseScene, spec.morphWeights, onLoad, onError]);

  // Idle animation (if not reduced motion)
  useFrame((state) => {
    if (!groupRef.current || reducedMotion || !isLoaded) return;

    // Subtle breathing/idle animation
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.01;
  });

  // Equipment loading would be handled here in full implementation
  // For now, we acknowledge the resolved equipment but don't render it yet
  useEffect(() => {
    // TODO: Load and attach equipment meshes from resolved URLs
    // This would involve:
    // 1. Loading each equipment GLTF
    // 2. Attaching to appropriate bones
    // 3. Applying palette colors to materials
    if (Object.keys(resolved).length > 0) {
      // Equipment present, would load here
    }
  }, [resolved]);

  return (
    <group
      ref={(group) => {
        groupRef.current = group ? (group as unknown as THREE.Group) : null;
      }}
    >
      {baseScene && <primitive object={baseScene.clone()} />}
    </group>
  );
}

// Preload utility for better performance
export function preloadAvatar(baseMeshUrl: string) {
  useGLTF.preload(baseMeshUrl);
}
