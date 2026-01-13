/**
 * GLB Avatar Loader Component
 * Loads GLB models from URLs for use in games
 */

'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { logger } from '@/app/lib/logger';

interface GLBAvatarLoaderProps {
  glbUrl: string;
  position?: [number, number, number];
  scale?: [number, number, number] | number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Internal component that loads the GLB
 */
function GLBModel({ glbUrl, position, scale, onLoad, onError, quality }: GLBAvatarLoaderProps) {
  // Use useGLTF hook from drei to load the GLB file
  const { scene } = useGLTF(glbUrl);

  useEffect(() => {
    if (scene) {
      // Apply position and scale
      if (position) {
        scene.position.set(...position);
      }
      if (scale) {
        if (typeof scale === 'number') {
          scene.scale.set(scale, scale, scale);
        } else {
          scene.scale.set(...scale);
        }
      }

      // Apply quality-based optimizations
      if (quality === 'low') {
        // Reduce material complexity for low quality
        scene.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            if (child.material instanceof THREE.Material) {
              // Simplify materials
              const mat = child.material as THREE.MeshStandardMaterial;
              if (mat.map) mat.map = null;
              if (mat.normalMap) mat.normalMap = null;
            }
          }
        });
      }

      onLoad?.();
    }
  }, [scene, position, scale, quality, onLoad]);

  // Handle errors
  useEffect(() => {
    if (!scene) {
      const error = new Error(`Failed to load GLB from URL: ${glbUrl}`);
      logger.error('GLB Avatar Loader error:', undefined, undefined, error);
      onError?.(error);
    }
  }, [scene, glbUrl, onError]);

  // Render the scene using primitive for proper React Three Fiber integration
  if (!scene) {
    return null;
  }

  return <primitive object={scene.clone()} />;
}

/**
 * GLB Avatar Loader with Suspense wrapper
 */
export default function GLBAvatarLoader(props: GLBAvatarLoaderProps) {
  return (
    <Suspense fallback={null}>
      <GLBModel {...props} />
    </Suspense>
  );
}

/**
 * Preload GLB file for faster loading
 */
export function preloadGLB(url: string): void {
  try {
    // useGLTF.preload is available from @react-three/drei
    useGLTF.preload(url);
  } catch (error) {
    logger.warn('Failed to preload GLB:', undefined, { url, error });
  }
}

