'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { type GLTF } from 'three-stdlib';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

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
import { RUNTIME_FLAGS } from '@/constants.client';

// Import procedural generation systems
import { ProceduralBodyGenerator } from '@/app/lib/3d/procedural-body';
import { ProceduralHairGenerator } from '@/app/lib/3d/procedural-hair';
import type { ProceduralAvatarConfig } from '@/app/stores/avatarStore';

export interface Avatar3DProps {
  configuration: AvatarConfiguration;
  lighting?: keyof typeof LIGHTING_PRESETS;
  cameraPosition?: [number, number, number];
  enableControls?: boolean;
  enableAnimations?: boolean;
  animationState?: string;
  showOutline?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  // NEW: Procedural avatar support
  proceduralConfig?: ProceduralAvatarConfig;
  useProcedural?: boolean;
  // Cel-shading and physics configs from configuration
  celShadingConfig?: {
    enabled: boolean;
    shadowSteps: number;
    rimLightColor: string;
    rimLightIntensity: number;
    outlineWidth: number;
    outlineColor: string;
  };
  physicsConfig?: {
    hairPhysics: boolean;
    clothPhysics: boolean;
    bodyPhysics: boolean;
    physicsQuality: 'low' | 'medium' | 'high' | 'ultra';
    springStiffness: number;
    damping: number;
  };
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
  animationState = 'idle',
  showOutline = false,
  quality = 'high',
  onLoad,
  onError,
  proceduralConfig,
  useProcedural = false,
  celShadingConfig,
  physicsConfig,
}: Avatar3DProps) {
  const { scene, gl, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const lightingSystemRef = useRef<AnimeLightingSystem | null>(null);

  const [loadedParts, setLoadedParts] = useState<Map<string, AvatarPartMesh>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Procedural avatar state
  const [proceduralAvatar, setProceduralAvatar] = useState<THREE.Group | null>(null);

  // Quality settings - Enhanced for better than Code Vein quality
  const qualitySettings = useMemo(
    () => ({
      low: { textureSize: 1024, shadowMapSize: 2048, samples: 2 }, // Upgraded from 512
      medium: { textureSize: 2048, shadowMapSize: 4096, samples: 4 }, // Upgraded from 1024
      high: { textureSize: 4096, shadowMapSize: 8192, samples: 8 }, // Upgraded from 2048
      ultra: { textureSize: 4096, shadowMapSize: 8192, samples: 16 }, // Enhanced samples
    }),
    [],
  );

  const currentQuality = qualitySettings[quality];

  // Cel-shading configuration (anime-style rendering)
  const celShading = celShadingConfig ?? configuration.celShadingConfig;

  // Physics configuration
  const physics = physicsConfig ?? configuration.physicsConfig;

  // Use cel-shading and physics configs (will be used for rendering)

  const _celShadingEnabled = celShading?.enabled ?? true;

  const _physicsEnabled = (physics?.hairPhysics ?? true) || (physics?.clothPhysics ?? true);

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

  // Generate procedural avatar
  useEffect(() => {
    if (!useProcedural || !proceduralConfig || !proceduralConfig.enabled) {
      setProceduralAvatar(null);
      return;
    }

    try {
      setIsLoading(true);
      setLoadingProgress(25);

      const avatar = new THREE.Group();
      avatar.name = 'ProceduralAvatar';

      // Generate body
      const body = ProceduralBodyGenerator.generateBody(proceduralConfig.body);
      body.position.y = 0;
      avatar.add(body);
      setLoadingProgress(60);

      // Generate hair
      const hair = ProceduralHairGenerator.generateHair(proceduralConfig.hair);
      hair.position.y = 0;
      avatar.add(hair);
      setLoadingProgress(90);

      setProceduralAvatar(avatar);
      setIsLoading(false);
      setLoadingProgress(100);

      if (onLoad) {
        onLoad();
      }
    } catch (err) {
      getLogger().then((logger) => {
        logger.error('Failed to generate procedural avatar:', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
      });
      setError(err as Error);
      setIsLoading(false);
      if (onError) {
        onError(err as Error);
      }
    }
  }, [useProcedural, proceduralConfig, onLoad, onError]);

  // Load avatar parts (traditional method)
  useEffect(() => {
    // Skip if using procedural mode
    if (useProcedural && proceduralConfig?.enabled) {
      return;
    }

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
              getLogger().then((logger) => {
                logger.warn(`Part not found: ${partId}`);
              });
              continue;
            }

            // Check compatibility
            const compatibility = avatarPartManager.checkPartCompatibility(
              partId,
              configuration.id,
            );
            if (!compatibility.compatible) {
              getLogger().then((logger) => {
                logger.warn(
                  `Part incompatible: ${partId}, conflicts: ${compatibility.conflicts.join(', ')}`,
                );
              });
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
            getLogger().then((logger) => {
              logger.error(`Failed to load part ${partId}:`, undefined, undefined, partError instanceof Error ? partError : new Error(String(partError)));
            });
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
        getLogger().then((logger) => {
          logger.error('Failed to load avatar:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        });
        setError(error as Error);
        setIsLoading(false);
        if (onError) {
          onError(error as Error);
        }
      }
    };

    loadAvatarParts();
  }, [configuration, quality, currentQuality, onLoad, onError, useProcedural, proceduralConfig]);

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
        getLogger().then((logger) => {
          logger.warn(`Applying material override for ${overrideKey}:`, undefined, { value: override.type });
        });

        switch (override.type) {
          case 'color':
            if (override.value instanceof THREE.Color) {
              animeMaterial.color.copy(override.value);
            }
            break;
          case 'texture':
            // Load and apply custom texture
            getLogger().then((logger) => {
              logger.warn(`Texture override for ${overrideKey}:`, undefined, { value: override.value });
            });
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

  useEffect(() => {
    if (!enableAnimations) {
      return;
    }

    loadedParts.forEach(({ animationController }) => {
      if (animationController && typeof animationController.setState === 'function') {
        animationController.setState(animationState);
      }
    });
  }, [animationState, enableAnimations, loadedParts]);

  // Render procedural avatar
  const renderProceduralAvatar = () => {
    if (!proceduralAvatar) return null;

    return (
      <primitive
        key="procedural-avatar"
        object={proceduralAvatar}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
      />
    );
  };

  // Render loaded parts (traditional method)
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

      {/* Avatar parts - render procedural OR traditional */}
      {useProcedural && proceduralConfig?.enabled ? renderProceduralAvatar() : renderParts()}

      {/* Debug info */}
      {RUNTIME_FLAGS.isDev && (
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
