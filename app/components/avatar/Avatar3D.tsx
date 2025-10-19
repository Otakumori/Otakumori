'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { type GLTF } from 'three-stdlib';

// Import our systems
import { AnimeLightingSystem, LIGHTING_PRESETS } from '@/app/lib/3d/lighting-system';
import { ModelUtils } from '@/app/lib/3d/model-loader';
import {
  avatarPartManager,
  type AvatarConfiguration,
  type AvatarPart,
} from '@/app/lib/3d/avatar-parts';
import { AnimeMaterialFactory } from '@/app/lib/3d/anime-materials';
import type { AnimationController } from '@/app/lib/3d/animation-system';
import { createAnimationController } from '@/app/lib/3d/animation-system';
import { env } from '@/app/env';

export interface Avatar3DProps {
  configuration: AvatarConfiguration;
  lighting?: keyof typeof LIGHTING_PRESETS;
  cameraPosition?: [number, number, number];
  enableControls?: boolean;
  enableAnimations?: boolean;
  showOutline?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface AvatarPartMesh {
  part: AvatarPart;
  gltf: GLTF;
  meshes: THREE.Mesh[];
  materials: THREE.Material[];
  morphTargets?: Record<string, number>;
  animationController?: AnimationController;
}

export default function Avatar3D({
  configuration,
  lighting = 'studio',
  cameraPosition = [0, 1.5, 3],
  enableControls = true,
  enableAnimations = true,
  showOutline = false,
  quality = 'high',
  onLoad,
  onError,
}: Avatar3DProps) {
  const { scene, gl, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const lightingSystemRef = useRef<AnimeLightingSystem | null>(null);

  const [loadedParts, setLoadedParts] = useState<Map<string, AvatarPartMesh>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Quality settings
  const qualitySettings = useMemo(
    () => ({
      low: { textureSize: 512, shadowMapSize: 1024, samples: 1 },
      medium: { textureSize: 1024, shadowMapSize: 2048, samples: 2 },
      high: { textureSize: 2048, shadowMapSize: 4096, samples: 4 },
      ultra: { textureSize: 4096, shadowMapSize: 8192, samples: 8 },
    }),
    [],
  );

  const currentQuality = qualitySettings[quality];

  // Initialize lighting system
  useEffect(() => {
    if (!lightingSystemRef.current) {
      lightingSystemRef.current = new AnimeLightingSystem(scene, gl, camera);
    }

    const lightingPreset = LIGHTING_PRESETS[lighting];
    if (lightingPreset) {
      lightingSystemRef.current.applyPreset(lightingPreset);
    }

    return () => {
      lightingSystemRef.current?.dispose();
    };
  }, [scene, gl, camera, lighting]);

  // Load avatar parts
  useEffect(() => {
    const loadAvatarParts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setLoadingProgress(0);

        const partsToLoad: Array<{ type: string; partId: string }> = [];

        // Collect all parts that need to be loaded
        Object.entries(configuration.parts).forEach(([type, partId]) => {
          if (partId) {
            partsToLoad.push({ type, partId });
          }
        });

        // Load base model first
        if (configuration.baseModel !== 'custom') {
          partsToLoad.unshift({
            type: 'body',
            partId: `base_${configuration.baseModel}`,
          });
        }

        const loadedPartsMap = new Map<string, AvatarPartMesh>();
        const totalParts = partsToLoad.length;

        for (let i = 0; i < partsToLoad.length; i++) {
          const { partId } = partsToLoad[i];

          try {
            // Get part definition
            const part = avatarPartManager.getPart(partId);
            if (!part) {
              console.warn(`Part not found: ${partId}`);
              continue;
            }

            // Check compatibility
            const compatibility = avatarPartManager.checkPartCompatibility(
              partId,
              configuration.id,
            );
            if (!compatibility.compatible) {
              console.warn(
                `Part incompatible: ${partId}, conflicts: ${compatibility.conflicts.join(', ')}`,
              );
              continue;
            }

            // Load model
            const gltf = await ModelUtils.loadAvatarPart(partId, {
              useDraco: true,
              generateLOD: quality !== 'low',
              maxTextureSize: currentQuality.textureSize,
              allowNsfwContent: configuration.showNsfwContent,
              ageVerified: configuration.ageVerified,
            });

            // Process meshes and materials
            const meshes: THREE.Mesh[] = [];
            const materials: THREE.Material[] = [];

            (gltf as any).scene.traverse((child: any) => {
              if (child instanceof THREE.Mesh) {
                meshes.push(child);

                // Apply anime materials based on part type
                const material = createAnimeMaterial(child.material, part, configuration);
                child.material = material;
                materials.push(material);

                // Apply morph targets if available
                if (part.morphTargets && child.morphTargetInfluences) {
                  part.morphTargets.forEach((morphTarget) => {
                    const value =
                      configuration.morphTargets[morphTarget.name] ?? morphTarget.defaultValue;
                    const index = child.morphTargetDictionary?.[morphTarget.name];
                    if (index !== undefined && child.morphTargetInfluences) {
                      child.morphTargetInfluences[index] = value;
                    }
                  });
                }

                // Set cast shadows based on quality
                child.castShadow = quality !== 'low';
                child.receiveShadow = quality !== 'low';
              }
            });

            // Create animation controller if animations are available
            let animationController: AnimationController | undefined;
            if ((gltf as any).animations && (gltf as any).animations.length > 0) {
              const controller = createAnimationController(gltf as any, {
                autoPlay: enableAnimations,
                defaultState: configuration.defaultAnimation || 'idle',
                crossfadeTime: 0.3,
                enableBlending: true,
              });
              animationController = controller || undefined;
            }

            loadedPartsMap.set(partId, {
              part,
              gltf: gltf as any,
              meshes,
              materials,
              morphTargets: configuration.morphTargets,
              animationController,
            });

            setLoadingProgress(((i + 1) / totalParts) * 100);
          } catch (partError) {
            console.error(`Failed to load part ${partId}:`, partError);
            if (onError) {
              onError(partError as Error);
            }
          }
        }

        setLoadedParts(loadedPartsMap);
        setIsLoading(false);

        if (onLoad) {
          onLoad();
        }
      } catch (error) {
        console.error('Failed to load avatar:', error);
        setError(error as Error);
        setIsLoading(false);
        if (onError) {
          onError(error as Error);
        }
      }
    };

    loadAvatarParts();
  }, [configuration, quality, currentQuality, onLoad, onError]);

  // Create anime material for mesh
  const createAnimeMaterial = (
    originalMaterial: THREE.Material | THREE.Material[],
    part: AvatarPart,
    config: AvatarConfiguration,
  ): THREE.Material => {
    const _material = Array.isArray(originalMaterial) ? originalMaterial[0] : originalMaterial;

    // Determine material type based on part
    let materialType: 'skin' | 'hair' | 'clothing' | 'metal' = 'clothing';

    if (part.type === 'body' || part.type === 'head') {
      materialType = 'skin';
    } else if (part.type === 'hair') {
      materialType = 'hair';
    } else if (part.category === 'clothing') {
      materialType = 'clothing';
    }

    // Apply material customizations based on type and configuration
    let baseColor = 0xffffff;

    // Use configuration parts for material customization
    if (materialType === 'skin' && config.parts?.body) {
      baseColor = 0xffdbac; // Default skin tone
    } else if (materialType === 'hair' && config.parts?.hair) {
      baseColor = 0x8b4513; // Default brown hair
    } else if (materialType === 'clothing' && config.parts?.clothing) {
      baseColor = 0x666666; // Default gray
    }

    // Create anime material with configuration-based colors
    const animeMaterial = new THREE.MeshStandardMaterial({
      color: baseColor,
      metalness: 0.1,
      roughness: materialType === 'skin' ? 0.7 : 0.8,
      transparent: false,
    });

    // Apply quality-based enhancements
    if (quality === 'high' || quality === 'ultra') {
      animeMaterial.envMapIntensity = 0.3;
      // Note: clearcoat property may not exist on MeshStandardMaterial in all Three.js versions
      // animeMaterial.clearcoat = 0.1;
    }

    // Apply material overrides from configuration
    if (config.materialOverrides) {
      Object.entries(config.materialOverrides).forEach(([overrideKey, override]) => {
        // Log material override application for debugging
        console.warn(`Applying material override for ${overrideKey}:`, override.type);

        switch (override.type) {
          case 'color':
            if (override.value instanceof THREE.Color) {
              animeMaterial.color.copy(override.value);
            }
            break;
          case 'texture':
            // Load and apply custom texture
            console.warn(`Texture override for ${overrideKey}:`, override.value);
            break;
        }
      });
    }

    return animeMaterial;
  };

  // Animation loop
  useFrame((state, _delta) => {
    if (!enableAnimations || !groupRef.current) return;

    // Update materials with time
    loadedParts.forEach(({ materials }) => {
      materials.forEach((material) => {
        if (material instanceof THREE.ShaderMaterial && material.uniforms.uTime) {
          material.uniforms.uTime.value = state.clock.elapsedTime;
        }
      });
    });

    // Update animation controllers with delta for smooth interpolation
    loadedParts.forEach(({ animationController }) => {
      if (animationController && typeof animationController.update === 'function') {
        // Call update method without delta parameter for now
        animationController.update();
      }
    });

    // Update lighting system
    if (lightingSystemRef.current) {
      lightingSystemRef.current.render();
    }
  });

  // Render loaded parts
  const renderParts = () => {
    const partElements: React.ReactNode[] = [];

    loadedParts.forEach(({ gltf, part }, partId) => {
      // Clone the scene to avoid modifying the original
      const clonedScene = gltf.scene.clone();

      // Apply attachment point transformations
      if (part.attachmentPoints && groupRef.current) {
        part.attachmentPoints.forEach((attachmentPoint) => {
          clonedScene.position.copy(attachmentPoint.position);
          clonedScene.rotation.copy(attachmentPoint.rotation);
          clonedScene.scale.copy(attachmentPoint.scale);
        });
      }

      // Add outline if enabled
      if (showOutline && part.contentRating !== 'sfw') {
        const outlineMaterial = AnimeMaterialFactory.createOutlineMaterial(
          new THREE.Color(0, 0, 0),
          0.02,
          1.0,
        );

        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = [outlineMaterial, child.material];
          }
        });
      }

      partElements.push(
        <primitive
          key={partId}
          object={clonedScene}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={[1, 1, 1]}
        />,
      );
    });

    return partElements;
  };

  if (error) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {/* Environment */}
      <Environment preset="studio" />

      {/* Camera controls */}
      {enableControls && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      )}

      {/* Camera */}
      <PerspectiveCamera makeDefault position={cameraPosition} fov={50} near={0.1} far={1000} />

      {/* Loading indicator */}
      {isLoading && (
        <group position={[0, 2, 0]}>
          {/* Loading spinner */}
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
            <meshBasicMaterial color="#ec4899" />
          </mesh>

          {/* Progress bar */}
          <mesh position={[0, -0.3, 0]}>
            <planeGeometry args={[0.4, 0.02]} />
            <meshBasicMaterial color="white" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -0.3, 0.001]}>
            <planeGeometry args={[0.4 * (loadingProgress / 100), 0.02]} />
            <meshBasicMaterial color="#ec4899" />
          </mesh>

          {/* Progress text */}
          <mesh position={[0, -0.5, 0]}>
            <planeGeometry args={[0.1, 0.02]} />
            <meshBasicMaterial color="white" transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* Avatar parts */}
      {renderParts()}

      {/* Debug info */}
      {env.NODE_ENV === 'development' && (
        <mesh position={[0, -2, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="black" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

// Utility component for avatar viewer with controls
export function AvatarViewer({ configuration, ...props }: Avatar3DProps) {
  return (
    <div className="w-full h-full">
      <Avatar3D
        configuration={configuration}
        enableControls={true}
        enableAnimations={true}
        showOutline={false}
        {...props}
      />
    </div>
  );
}

// Utility component for avatar editor with enhanced controls
export function AvatarEditor({ configuration, ...props }: Avatar3DProps) {
  return (
    <div className="w-full h-full">
      <Avatar3D
        configuration={configuration}
        enableControls={true}
        enableAnimations={true}
        showOutline={true}
        quality="high"
        {...props}
      />
    </div>
  );
}
