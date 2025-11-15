/**
 * WebGL Avatar Renderer Component
 * Main React Three Fiber component for rendering avatars
 */

'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { AvatarProfile, RepresentationMode } from '../types/avatar';
import { assembleAvatar } from '../pipeline/assembleAvatar';
import { loadRegistry } from '../registry/loader';
import { getRepresentationTransform } from './representationModes';
import { applyOutline } from '../materials/outlinePass';
import { isAvatarsEnabled } from '../config/flags';

export interface AvatarRendererProps {
  profile: AvatarProfile;
  mode?: RepresentationMode;
  size?: 'small' | 'medium' | 'large';
  enableBloom?: boolean;
  enableOutline?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Avatar Scene Component (internal)
 */
function AvatarScene({
  profile,
  mode = 'fullBody',
  enableOutline = true,
  onLoad,
  onError,
}: {
  profile: AvatarProfile;
  mode: RepresentationMode;
  enableOutline: boolean;
  onLoad?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}) {
  const [avatarGroup, setAvatarGroup] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAvatar() {
      try {
        setIsLoading(true);

        // Check if avatars are enabled
        if (!isAvatarsEnabled()) {
          // Return preset/fallback
          const fallbackGroup = new THREE.Group();
          fallbackGroup.name = 'AvatarFallback';
          // Add simple placeholder mesh
          const placeholder = new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0xff69b4 }),
          );
          fallbackGroup.add(placeholder);
          if (mounted) {
            setAvatarGroup(fallbackGroup);
            setIsLoading(false);
            onLoad?.();
          }
          return;
        }

        // Load registry
        const registry = await loadRegistry();

        // Assemble avatar
        const assembled = await assembleAvatar(profile, registry);

        if (!mounted) return;

        // Get transform config for outline settings
        const transformConfig = getRepresentationTransform(mode);

        // Apply outline if enabled
        let finalGroup = assembled.group;
        if (enableOutline) {
          finalGroup = applyOutline(assembled.group, {
            outlineWidth: transformConfig.shadingTweaks.outlineWidth,
            outlineColor: transformConfig.shadingTweaks.outlineColor,
          });
        }

        setAvatarGroup(finalGroup);
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        if (mounted) {
          setIsLoading(false);
          onError?.(error instanceof Error ? error : new Error('Failed to load avatar'));
        }
      }
    }

    loadAvatar();

    return () => {
      mounted = false;
    };
  }, [profile, mode, enableOutline, onLoad, onError]);

  // Transform is computed in parent component

  if (isLoading) {
    return null; // Or return loading indicator
  }

  if (!avatarGroup) {
    return null;
  }

  // Apply scale from representation transform
  const transformConfig = getRepresentationTransform(mode);
  
  return (
    <>
      <primitive object={avatarGroup} ref={groupRef} scale={transformConfig.scale} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, 10, -5]} intensity={0.5} />
    </>
  );
}

/**
 * Main Avatar Renderer Component
 */
export function AvatarRenderer({
  profile,
  mode = 'fullBody',
  size = 'medium',
  enableOutline = true,
  onLoad,
  onError,
}: AvatarRendererProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-64 h-64',
    large: 'w-96 h-96',
  };

  // Get representation transform config for camera positioning
  const representationConfig = useMemo(() => getRepresentationTransform(mode), [mode]);

  if (!mounted) {
    return (
      <div className={`${sizeClasses[size]} bg-black/20 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2" />
          <p className="text-white text-sm">Loading Avatar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <Canvas
        camera={{
          position: representationConfig.cameraOffset,
          fov: mode === 'portrait' ? 45 : 50,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="rounded-lg"
      >
        <AvatarScene
          profile={profile}
          mode={mode}
          enableOutline={enableOutline}
          onLoad={onLoad ?? undefined}
          onError={onError ?? undefined}
        />
        {mode !== 'fullBody' && <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />}
      </Canvas>
    </div>
  );
}

/**
 * Methods for switching representation modes (via ref)
 */
export interface AvatarRendererRef {
  renderFullBody: () => void;
  renderBust: () => void;
  renderPortrait: () => void;
  renderChibi: () => void;
}

// Note: To use ref methods, the component would need to be wrapped with forwardRef
// For now, mode switching is done via props

