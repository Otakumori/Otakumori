'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ACESFilmicToneMapping, Color, type Group, type Mesh } from 'three';

import type { AvatarSize } from '@/app/lib/avatar-sizes';
import { EnhancedProceduralMesh } from '@/app/lib/3d/enhanced-procedural-mesh';
import { assetRegistry } from '@/app/lib/3d/asset-registry';
import { MorphTargetSystem, type MorphTargetConfig } from '@/app/lib/3d/morph-target-system';

interface AvatarRendererProps {
  config: any;
  size?: AvatarSize;
  showInteractions?: boolean;
  physicsEnabled?: boolean;
  className?: string;
}

// AnimeToon Material Component (unused currently; kept for future shader/material work)
function _AnimeToonMaterial({ config }: { config: any }) {
  const materialRef = useRef<any>(undefined);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color = new Color(config.materials?.parameters?.colorA || '#FF6B9D');
      materialRef.current.metalness = config.materials?.parameters?.metallic || 0.1;
      materialRef.current.roughness = config.materials?.parameters?.roughness || 0.3;
      materialRef.current.emissive = new Color(config.materials?.parameters?.rimColor || '#FFD700');
      materialRef.current.emissiveIntensity = config.materials?.parameters?.rimStrength || 0.35;
    }
  }, [config]);

  return (
    <meshStandardMaterial
      ref={materialRef}
      color={config.materials?.parameters?.colorA || '#FF6B9D'}
      metalness={config.materials?.parameters?.metallic || 0.1}
      roughness={config.materials?.parameters?.roughness || 0.3}
      emissive={config.materials?.parameters?.rimColor || '#FFD700'}
      emissiveIntensity={config.materials?.parameters?.rimStrength || 0.35}
      transparent
      opacity={1.0}
      // Enhanced material properties for better quality
      envMapIntensity={1.0}
      flatShading={false}
    />
  );
}

// Simple Physics Component (Spring-based)
function SimplePhysics({ config, children }: { config: any; children: React.ReactNode }) {
  const groupRef = useRef<Group>(null);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    setTime(state.clock.getElapsedTime());

    if (groupRef.current && config.physics?.softBody?.enable) {
      // Simple spring-based physics
      const springIntensity = config.physics.softBody.stiffness || 0.4;
      const damping = config.physics.softBody.damping || 0.2;
      const maxDisplacement = config.physics.softBody.maxDisplacement || 0.06;

      // Apply subtle breathing motion with damping
      const breathScale = 1 + Math.sin(time * 2) * springIntensity * 0.02;
      const swayX = Math.sin(time * 0.5) * springIntensity * 0.01;
      const swayY = Math.cos(time * 0.3) * springIntensity * 0.005;

      // Apply damping to smooth out movement (frame-rate independent)
      const dampingFactor = Math.pow(1 - damping, delta * 60);

      // Clamp displacement to maxDisplacement
      const clampedSwayX = Math.max(-maxDisplacement, Math.min(maxDisplacement, swayX));
      const clampedSwayY = Math.max(-maxDisplacement, Math.min(maxDisplacement, swayY));

      // Apply with damping for smooth motion
      groupRef.current.scale.lerp(
        { x: breathScale, y: breathScale, z: breathScale } as any,
        dampingFactor,
      );
      groupRef.current.rotation.x += (clampedSwayY - groupRef.current.rotation.x) * dampingFactor;
      groupRef.current.rotation.z += (clampedSwayX - groupRef.current.rotation.z) * dampingFactor;

      // Clamp displacement
      groupRef.current.position.y = Math.min(
        maxDisplacement,
        Math.sin(time) * springIntensity * 0.01,
      );
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// Character Mesh Component
function CharacterMesh({ config }: { config: any }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (bodyGroupRef.current) {
      // Apply morph targets to all meshes in the body group
      bodyGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const morphTargets = child.morphTargetDictionary;
          const morphInfluences = child.morphTargetInfluences;
          if (morphTargets && morphInfluences) {
            // Use delta for smooth interpolation of morph targets (frame-rate independent)
            const interpSpeed = Math.min(delta * 5, 1); // Smooth interpolation

            // Apply face morphs with smooth transitions (for head mesh)
            if (child.name === 'Head') {
              if (morphTargets.eyeSize !== undefined) {
                const targetValue = (config.face?.eyes?.size || 1.0) - 1.0;
                morphInfluences[morphTargets.eyeSize] +=
                  (targetValue - morphInfluences[morphTargets.eyeSize]) * interpSpeed;
              }
              if (morphTargets.eyeSpacing !== undefined) {
                const targetValue = config.face?.eyes?.spacing || 0.5;
                morphInfluences[morphTargets.eyeSpacing] +=
                  (targetValue - morphInfluences[morphTargets.eyeSpacing]) * interpSpeed;
              }
              if (morphTargets.jawline !== undefined) {
                const targetValue = config.face?.faceShape?.jawline || 0.5;
                morphInfluences[morphTargets.jawline] +=
                  (targetValue - morphInfluences[morphTargets.jawline]) * interpSpeed;
              }
              if (morphTargets.cheekbones !== undefined) {
                const targetValue = config.face?.faceShape?.cheekbones || 0.5;
                morphInfluences[morphTargets.cheekbones] +=
                  (targetValue - morphInfluences[morphTargets.cheekbones]) * interpSpeed;
              }
              if (morphTargets.chin !== undefined) {
                const targetValue = config.face?.faceShape?.chin || 0.5;
                morphInfluences[morphTargets.chin] +=
                  (targetValue - morphInfluences[morphTargets.chin]) * interpSpeed;
              }
              
              // Expression morphs (can be animated)
              const time = state.clock.getElapsedTime();
              if (morphTargets.smile !== undefined) {
                const targetValue = config.face?.expression?.smile || 0;
                morphInfluences[morphTargets.smile] +=
                  (targetValue - morphInfluences[morphTargets.smile]) * interpSpeed;
              }
              if (morphTargets.frown !== undefined) {
                const targetValue = config.face?.expression?.frown || 0;
                morphInfluences[morphTargets.frown] +=
                  (targetValue - morphInfluences[morphTargets.frown]) * interpSpeed;
              }
              if (morphTargets.eyeBlink !== undefined) {
                // Auto-blink animation
                const blinkValue = Math.sin(time * 0.5) < -0.8 ? 1.0 : 0.0;
                morphInfluences[morphTargets.eyeBlink] +=
                  (blinkValue - morphInfluences[morphTargets.eyeBlink]) * interpSpeed;
              }
            }

            // Apply body morphs with smooth transitions (for torso mesh)
            if (child.name === 'Torso') {
              if (morphTargets.muscleMass !== undefined) {
                const targetValue = config.body?.muscleMass || 0.5;
                morphInfluences[morphTargets.muscleMass] +=
                  (targetValue - morphInfluences[morphTargets.muscleMass]) * interpSpeed;
              }
              if (morphTargets.bodyFat !== undefined) {
                const targetValue = config.body?.bodyFat || 0.5;
                morphInfluences[morphTargets.bodyFat] +=
                  (targetValue - morphInfluences[morphTargets.bodyFat]) * interpSpeed;
              }
              if (morphTargets.chestSize !== undefined) {
                const targetValue = config.body?.proportions?.chestSize || 1.0;
                morphInfluences[morphTargets.chestSize] +=
                  ((targetValue - 1.0) * 0.5 - morphInfluences[morphTargets.chestSize]) * interpSpeed;
              }
              if (morphTargets.breastSize !== undefined) {
                const targetValue = config.body?.genderFeatures?.breastSize || 0.8;
                morphInfluences[morphTargets.breastSize] +=
                  ((targetValue - 1.0) * 0.5 - morphInfluences[morphTargets.breastSize]) * interpSpeed;
              }
            }
          }
        }
      });
    }
  });

  // Generate humanoid body mesh instead of capsule
  const bodyGroupRef = useRef<Group>(null);
  
  useEffect(() => {
    if (!bodyGroupRef.current) return;
    
    // Clear existing children
    while (bodyGroupRef.current.children.length > 0) {
      const child = bodyGroupRef.current.children[0];
      bodyGroupRef.current.remove(child);
      if ((child as unknown) instanceof THREE.Mesh) {
        const mesh = child as unknown as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    }
    
    const group = bodyGroupRef.current;
    const height = config.body?.height || 1.0;
    const _weight = config.body?.weight || 1.0;
    const gender = config.gender || 'female';
    
    // Enhanced skin material
    const skinMaterial = EnhancedProceduralMesh.createSkinMaterial(
      config.materials?.parameters?.colorA || '#FFDBAC',
      {
        roughness: config.materials?.parameters?.roughness || 0.7,
        metalness: config.materials?.parameters?.metallic || 0.05,
        emissiveIntensity: config.materials?.parameters?.rimStrength || 0.1,
      },
    );
    
    // Head - Enhanced high-quality mesh
    const headSize = 0.18 * (config.body?.proportions?.headSize || 1.0);
    const headGeometry = EnhancedProceduralMesh.createHead(headSize, {
      segments: 32,
      smoothNormals: true,
      subdivision: 1,
      weldVertices: true,
      generateTangents: true,
    });
    
    // Create morph targets for head
    const headMorphConfig: MorphTargetConfig = {
      eyeSize: config.face?.eyes?.size || 1.0,
      eyeSpacing: config.face?.eyes?.spacing || 0.5,
      eyeHeight: config.face?.eyes?.height || 0.5,
      jawline: config.face?.faceShape?.jawline || 0.5,
      cheekbones: config.face?.faceShape?.cheekbones || 0.5,
      chin: config.face?.faceShape?.chin || 0.5,
      noseSize: config.face?.nose?.size || 1.0,
      mouthSize: config.face?.mouth?.size || 1.0,
      lipThickness: config.face?.mouth?.lipThickness || 0.5,
      // Expressions (can be animated)
      smile: config.face?.expression?.smile || 0,
      frown: config.face?.expression?.frown || 0,
      surprise: config.face?.expression?.surprise || 0,
      wink: config.face?.expression?.wink || 0,
      eyeBlink: config.face?.expression?.eyeBlink || 0,
    };
    const headMorphTargets = MorphTargetSystem.createMorphTargets(headGeometry, headMorphConfig, 'head');
    
    const headMesh = new THREE.Mesh(headGeometry, skinMaterial.clone());
    if (headMorphTargets.length > 0) {
      MorphTargetSystem.applyMorphTargets(headMesh, headMorphTargets, headMorphConfig);
    }
    headMesh.position.set(0, 1.5 + height * 0.2, 0);
    headMesh.name = 'Head';
    group.add(headMesh);
    
    // Neck - Enhanced high-quality mesh
    const neckLength = 0.12 * (config.body?.proportions?.neckLength || 1.0);
    const neckGeometry = EnhancedProceduralMesh.createLimb(0.07, neckLength, 0.9, {
      segments: 24,
      smoothNormals: true,
      subdivision: 1,
      weldVertices: true,
      generateTangents: true,
    });
    const neckMesh = new THREE.Mesh(neckGeometry, skinMaterial.clone());
    neckMesh.position.set(0, 1.4 + height * 0.15, 0);
    neckMesh.name = 'Neck';
    group.add(neckMesh);
    
    // Torso - Enhanced high-quality mesh with proper tapering
    const shoulderWidth = 0.25 * (config.body?.proportions?.shoulderWidth || 1.0);
    const waistSize = 0.18 * (config.body?.proportions?.waistSize || 1.0);
    const chestSize = 0.22 * (config.body?.proportions?.chestSize || 1.0);
    const torsoHeight = 0.5 + height * 0.15;
    
    const torsoGeometry = EnhancedProceduralMesh.createTorso(
      shoulderWidth,
      waistSize,
      torsoHeight,
      {
        segments: 32,
        smoothNormals: true,
        subdivision: 1,
        weldVertices: true,
        generateTangents: true,
      },
    );
    
    // Create morph targets for torso
    const torsoMorphConfig: MorphTargetConfig = {
      muscleMass: config.body?.muscleMass || 0.5,
      bodyFat: config.body?.bodyFat || 0.5,
      shoulderWidth: config.body?.proportions?.shoulderWidth || 1.0,
      chestSize: config.body?.proportions?.chestSize || 1.0,
      waistSize: config.body?.proportions?.waistSize || 0.8,
      hipWidth: config.body?.proportions?.hipWidth || 1.0,
      breastSize: gender === 'female' ? (config.body?.genderFeatures?.breastSize || 0.8) : 0,
      breastSeparation: gender === 'female' ? (config.body?.genderFeatures?.breastSeparation || 0) : 0,
    };
    const torsoMorphTargets = MorphTargetSystem.createMorphTargets(torsoGeometry, torsoMorphConfig, 'torso');
    
    const torsoMesh = new THREE.Mesh(torsoGeometry, skinMaterial.clone());
    if (torsoMorphTargets.length > 0) {
      MorphTargetSystem.applyMorphTargets(torsoMesh, torsoMorphTargets, torsoMorphConfig);
    }
    torsoMesh.position.set(0, 1.0 + height * 0.1, 0);
    
    // Gender-specific torso shaping (base scaling, morph targets handle details)
    if (gender === 'female') {
      const breastSize = config.body?.genderFeatures?.breastSize || 0.8;
      torsoMesh.scale.set(1, 1, 0.85 + breastSize * 0.15);
    } else {
      torsoMesh.scale.set(1, 1, 1.0 + chestSize * 0.1);
    }
    
    torsoMesh.name = 'Torso';
    group.add(torsoMesh);
    
    // Hips - Enhanced high-quality mesh
    const hipWidth = 0.22 * (config.body?.proportions?.hipWidth || 1.0);
    const hipGeometry = EnhancedProceduralMesh.createTorso(hipWidth, waistSize, 0.15, {
      segments: 32,
      smoothNormals: true,
      subdivision: 1,
      weldVertices: true,
      generateTangents: true,
    });
    const hipMesh = new THREE.Mesh(hipGeometry, skinMaterial.clone());
    hipMesh.position.set(0, 0.75 + height * 0.05, 0);
    hipMesh.name = 'Hips';
    group.add(hipMesh);
    
    // Arms - Enhanced high-quality meshes
    const armLength = 0.4 * (config.body?.proportions?.armLength || 1.0);
    const armRadius = 0.05;
    
    // Left arm
    const leftArmGeometry = EnhancedProceduralMesh.createLimb(armRadius, armLength, 0.9, {
      segments: 24,
      smoothNormals: true,
      subdivision: 1,
      weldVertices: true,
      generateTangents: true,
    });
    const armMorphConfig: MorphTargetConfig = {
      armThickness: config.body?.proportions?.armThickness || 1.0,
    };
    const armMorphTargets = MorphTargetSystem.createMorphTargets(leftArmGeometry, armMorphConfig, 'limb');
    const leftArmMesh = new THREE.Mesh(leftArmGeometry, skinMaterial.clone());
    if (armMorphTargets.length > 0) {
      MorphTargetSystem.applyMorphTargets(leftArmMesh, armMorphTargets, armMorphConfig);
    }
    leftArmMesh.position.set(-(shoulderWidth + armLength / 2), 1.0 + height * 0.1, 0);
    leftArmMesh.rotation.z = Math.PI / 2;
    leftArmMesh.name = 'LeftArm';
    group.add(leftArmMesh);
    
    // Right arm
    const rightArmGeometry = EnhancedProceduralMesh.createLimb(armRadius, armLength, 0.9, {
      segments: 24,
      smoothNormals: true,
      subdivision: 1,
      weldVertices: true,
      generateTangents: true,
    });
    const rightArmMesh = new THREE.Mesh(rightArmGeometry, skinMaterial.clone());
    if (armMorphTargets.length > 0) {
      MorphTargetSystem.applyMorphTargets(rightArmMesh, armMorphTargets, armMorphConfig);
    }
    rightArmMesh.position.set(shoulderWidth + armLength / 2, 1.0 + height * 0.1, 0);
    rightArmMesh.rotation.z = -Math.PI / 2;
    rightArmMesh.name = 'RightArm';
    group.add(rightArmMesh);
    
    // Legs - Enhanced high-quality meshes
    const legLength = 0.6 * (config.body?.proportions?.legLength || 1.0);
    const legRadius = 0.07;
    const thighGap = gender === 'female' ? (config.body?.genderFeatures?.thighGap || 0.3) * 0.1 : 0.05;
    
    // Left leg
    const leftLegGeometry = EnhancedProceduralMesh.createLimb(legRadius, legLength, 0.85, {
      segments: 24,
      smoothNormals: true,
      subdivision: 1,
      weldVertices: true,
      generateTangents: true,
    });
    const legMorphConfig: MorphTargetConfig = {
      legThickness: config.body?.proportions?.legThickness || 1.0,
      thighThickness: config.body?.proportions?.thighThickness || 1.0,
    };
    const legMorphTargets = MorphTargetSystem.createMorphTargets(leftLegGeometry, legMorphConfig, 'limb');
    const leftLegMesh = new THREE.Mesh(leftLegGeometry, skinMaterial.clone());
    if (legMorphTargets.length > 0) {
      MorphTargetSystem.applyMorphTargets(leftLegMesh, legMorphTargets, legMorphConfig);
    }
    leftLegMesh.position.set(-(hipWidth * 0.6 - thighGap), -legLength / 2 + height * 0.05, 0);
    leftLegMesh.name = 'LeftLeg';
    group.add(leftLegMesh);
    
    // Right leg
    const rightLegGeometry = EnhancedProceduralMesh.createLimb(legRadius, legLength, 0.85, {
      segments: 24,
      smoothNormals: true,
      subdivision: 1,
      weldVertices: true,
      generateTangents: true,
    });
    const rightLegMesh = new THREE.Mesh(rightLegGeometry, skinMaterial.clone());
    if (legMorphTargets.length > 0) {
      MorphTargetSystem.applyMorphTargets(rightLegMesh, legMorphTargets, legMorphConfig);
    }
    rightLegMesh.position.set(hipWidth * 0.6 - thighGap, -legLength / 2 + height * 0.05, 0);
    rightLegMesh.name = 'RightLeg';
    group.add(rightLegMesh);
    
    return () => {
      // Cleanup on unmount
      group.traverse((child) => {
        if ((child as unknown) instanceof THREE.Mesh) {
          const mesh = child as unknown as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: THREE.Material) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    };
  }, [config]);
  
  return <group ref={bodyGroupRef} />;
}

// Hair Component with GLB asset loading support
function HairComponent({ config }: { config: any }) {
  const [hairModel, setHairModel] = useState<THREE.Group | null>(null);
  const hairGroupRef = useRef<Group>(null);

  useEffect(() => {
    if (!config.hair) {
      setHairModel(null);
      return;
    }

    const loadHairAsset = async () => {
      try {
        // Try to load GLB asset first
        const hairId = config.hair.style || config.hair.id;
        const gender = config.gender || 'female';
        
        // Find matching hair asset
        const hairAssets = assetRegistry.findAssetsByType('hair', gender);
        const matchingAsset = hairAssets.find(
          (asset) => asset.id === hairId || asset.category === config.hair.style,
        );

        if (matchingAsset && matchingAsset.glbPath) {
          const model = await assetRegistry.loadAsset(matchingAsset.id);
          if (model?.gltf?.scene) {
            // Clone the scene to avoid modifying the original
            const clonedScene = model.gltf.scene.clone();
            setHairModel(clonedScene);
            return;
          }
        }

        // Fallback to procedural hair
        const hairColor = config.hair.color?.primary || '#8B4513';
        const hairMaterial = EnhancedProceduralMesh.createHairMaterial(hairColor, {
          roughness: 0.8,
          metalness: 0.1,
          emissiveIntensity: 0.15,
        });

        // Create procedural hair geometry
        const hairGeometry = EnhancedProceduralMesh.createHead(0.6, {
          segments: 32,
          smoothNormals: true,
          subdivision: 1,
          weldVertices: true,
          generateTangents: true,
        });

        // Modify geometry for hair shape
        const positions = hairGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i);
          if (y > 0) {
            positions.setY(i, y * 1.2); // Extend upward for hair
          }
        }
        positions.needsUpdate = true;
        hairGeometry.computeVertexNormals();

        const hairMesh = new THREE.Mesh(hairGeometry, hairMaterial);
        const proceduralGroup = new THREE.Group();
        proceduralGroup.add(hairMesh);
        setHairModel(proceduralGroup);
      } catch (error) {
        console.error('[HairComponent] Failed to load hair:', error);
        setHairModel(null);
      }
    };

    loadHairAsset();
  }, [config.hair, config.gender]);

  if (!hairModel) return null;

  return (
    <group ref={hairGroupRef} position={[0, 1.5, 0]}>
      <primitive object={hairModel} />
    </group>
  );
}

// Outfit Component with GLB asset loading support
function OutfitComponent({ config }: { config: any }) {
  const [outfitModel, setOutfitModel] = useState<THREE.Group | null>(null);
  const outfitGroupRef = useRef<Group>(null);

  useEffect(() => {
    if (!config.outfit) {
      setOutfitModel(null);
      return;
    }

    const loadOutfitAsset = async () => {
      try {
        // Try to load GLB asset first
        const outfitId = config.outfit.id || config.outfit.type;
        const gender = config.gender || 'female';
        
        // Find matching outfit asset
        const outfitAssets = assetRegistry.findAssetsByType('clothing', gender);
        const matchingAsset = outfitAssets.find(
          (asset) => asset.id === outfitId || asset.category === config.outfit.type,
        );

        if (matchingAsset && matchingAsset.glbPath) {
          const model = await assetRegistry.loadAsset(matchingAsset.id);
          if (model?.gltf?.scene) {
            // Clone the scene to avoid modifying the original
            const clonedScene = model.gltf.scene.clone();
            
            // Apply outfit color if specified
            if (config.outfit.primary?.color) {
              clonedScene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                  const material = child.material as THREE.MeshStandardMaterial;
                  if (material.isMeshStandardMaterial) {
                    material.color = new THREE.Color(config.outfit.primary.color);
                  }
                }
              });
            }
            
            setOutfitModel(clonedScene);
            return;
          }
        }

        // Fallback to procedural outfit
        const outfitColor = config.outfit.primary?.color || '#FF6B9D';
        const outfitMaterial = EnhancedProceduralMesh.createClothingMaterial(outfitColor, {
          roughness: 0.6,
          metalness: 0.2,
          emissiveIntensity: 0.08,
        });

        // Create procedural outfit geometry
        const outfitGeometry = EnhancedProceduralMesh.createTorso(0.6, 0.4, 1.2, {
          segments: 32,
          smoothNormals: true,
          subdivision: 1,
          weldVertices: true,
          generateTangents: true,
        });

        const outfitMesh = new THREE.Mesh(outfitGeometry, outfitMaterial);
        const proceduralGroup = new THREE.Group();
        proceduralGroup.add(outfitMesh);
        setOutfitModel(proceduralGroup);
      } catch (error) {
        console.error('[OutfitComponent] Failed to load outfit:', error);
        setOutfitModel(null);
      }
    };

    loadOutfitAsset();
  }, [config.outfit, config.gender]);

  if (!outfitModel) return null;

  return (
    <group ref={outfitGroupRef} position={[0, 1.0, 0]}>
      <primitive object={outfitModel} />
    </group>
  );
}

// Scene Component
function AvatarScene({ config, physicsEnabled = true }: { config: any; physicsEnabled?: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    // Set up camera
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1.5, 0);
  }, [camera, config, physicsEnabled]);

  return (
    <>
      {/* Enhanced Lighting - Code Vein style anime lighting */}
      <ambientLight intensity={0.5} color="#ffffff" />
      {/* Key light - main illumination (anime style top-right) */}
      <directionalLight position={[5, 8, 3]} intensity={1.5} color="#ffffff" castShadow />
      {/* Fill light - soft fill from front-left */}
      <directionalLight position={[-3, 2, 2]} intensity={0.6} color="#fff5e6" />
      {/* Rim light - back lighting for anime edge glow */}
      <directionalLight position={[0, 2, -5]} intensity={0.8} color="#ec4899" />
      {/* Accent light - pink accent from side */}
      <directionalLight position={[5, 3, 2]} intensity={0.4} color="#ec4899" />
      {/* Purple accent light */}
      <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#8b5cf6" />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Character */}
      {physicsEnabled ? (
        <SimplePhysics config={config}>
          <CharacterMesh config={config} />
          <HairComponent config={config} />
          <OutfitComponent config={config} />
        </SimplePhysics>
      ) : (
        <>
          <CharacterMesh config={config} />
          <HairComponent config={config} />
          <OutfitComponent config={config} />
        </>
      )}

      {/* Ground shadow */}
      <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={10} blur={1.5} far={4.5} />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

// Main Avatar Renderer Component
export function AvatarRenderer({
  config,
  size = 'md',
  showInteractions = false,
  physicsEnabled = false,
  className = '',
}: AvatarRendererProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-black/20 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-white text-sm">Loading Avatar...</p>
        </div>
      </div>
    );
  }

  // Map canonical sizes to container classes
  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-24 h-24',
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
    xl: 'w-[512px] h-[512px]',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false,
          precision: 'highp',
          preserveDrawingBuffer: false,
          premultipliedAlpha: false,
        }}
        dpr={[1, 2]} // Support high DPI displays
        performance={{ min: 0.5 }} // Maintain 60fps
        className="rounded-lg"
      >
        <Suspense fallback={null}>
          <AvatarScene config={config} physicsEnabled={physicsEnabled} />
        </Suspense>
      </Canvas>

      {/* Interaction overlay */}
      {showInteractions && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/50 rounded-lg p-2">
              <div className="text-white text-xs text-center">
                {config.gender} • {config.age} • {(config.body?.height * 100)?.toFixed(0)}% height
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
