/**
 * Character Canvas - React Three Fiber scene for avatar rendering
 */

'use client';

import { logger } from '@/app/lib/logger';
import React, { Suspense, useMemo, useRef, useEffect, memo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { CharacterConfig } from '../lib/character-state';
import {
  generateBaseBody,
  generateHair,
  generateOutfit,
  generateAccessory,
} from '../lib/procedural-meshes';
import {
  applyMaterialsToGroup,
  createOutlineMesh,
} from '../lib/materials';
import { CAMERA_POSITION, CAMERA_TARGET } from '../lib/constants';

interface CharacterCanvasProps {
  config: CharacterConfig;
  showOutline?: boolean;
  onSceneReady?: (scene: THREE.Group) => void;
}

/**
 * Character scene component that renders the avatar
 */
const CharacterScene = memo(function CharacterScene({
  config,
  showOutline = true,
  onSceneReady,
}: CharacterCanvasProps) {
  const sceneRef = useRef<THREE.Group>(null);
  const { scene } = useThree();
  
  // Use scene from useThree for advanced operations (debugging, exports, etc.)
  useEffect(() => {
    if (scene && sceneRef.current) {
      // Scene from useThree provides access to the full Three.js scene graph
      // This can be used for scene-wide operations, debugging, or exports
      // The sceneRef provides the character group, while scene provides the full context
      const characterInScene = scene.getObjectByName('Character');
      if (characterInScene) {
        // Character is in the scene, ready for operations
        // Scene is available for advanced scene graph operations
      }
    }
  }, [scene]);

  // Generate character meshes
  const characterGroup = useMemo(() => {
    try {
      const group = new THREE.Group();
      group.name = 'Character';

      // Generate base body
      const body = generateBaseBody(config);
      group.add(body);

      // Generate hair
      const hair = generateHair(config);
      hair.position.set(0, 0, 0);
      group.add(hair);

      // Generate outfit
      const outfit = generateOutfit(config);
      outfit.position.set(0, 0, 0);
      group.add(outfit);

      // Generate accessories
      config.accessories.forEach((accessory) => {
        const accessoryMesh = generateAccessory(
          accessory.id,
          accessory.pos,
          accessory.rot,
          accessory.scale,
        );
        group.add(accessoryMesh);
      });

      // Apply materials
      applyMaterialsToGroup(group, {
        skinTone: config.skinTone,
        hairRootColor: config.hair.rootColor,
        hairTipColor: config.hair.tipColor,
        hairGloss: config.hair.gloss,
        outfitPrimaryColor: config.outfit.primaryColor,
        outfitSecondaryColor: config.outfit.secondaryColor,
      });

      // Add outlines if enabled
      if (showOutline) {
        const outlineGroup = new THREE.Group();
        outlineGroup.name = 'Outlines';
        group.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.isBodyPart !== true) {
            try {
              const outline = createOutlineMesh(child, 0.02, 0x000000);
              outlineGroup.add(outline);
            } catch (error) {
              logger.warn('Failed to create outline for mesh:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
            }
          }
        });
        group.add(outlineGroup);
      }

      return group;
    } catch (error) {
      logger.warn('Failed to generate character, using fallback:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
      // Fallback - simple box
      const fallbackGroup = new THREE.Group();
      const geometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
      const material = new THREE.MeshStandardMaterial({ color: 0xff66cc });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0.75;
      fallbackGroup.add(mesh);
      return fallbackGroup;
    }
  }, [config, showOutline]);

  // Update scene when character changes
  useEffect(() => {
    if (sceneRef.current) {
      // Remove old character
      const oldCharacter = sceneRef.current.getObjectByName('Character');
      if (oldCharacter) {
        sceneRef.current.remove(oldCharacter);
        // Dispose of geometries and materials
        oldCharacter.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      // Add new character
      sceneRef.current.add(characterGroup);

      // Notify parent
      if (onSceneReady && sceneRef.current) {
        onSceneReady(sceneRef.current);
      }
    }
  }, [characterGroup, onSceneReady]);

  // Idle animation: breathing and subtle swaying
  useFrame((state) => {
    if (sceneRef.current) {
      const character = sceneRef.current.getObjectByName('Character');
      if (character) {
        const time = state.clock.elapsedTime;
        
        // Breathing effect - subtle scale on Y axis
        const breathingScale = 1 + Math.sin(time * 1.5) * 0.01;
        character.scale.y = breathingScale;
        
        // Subtle swaying - small rotation on Y axis
        const swayAmount = Math.sin(time * 0.8) * 0.02;
        character.rotation.y = swayAmount;
        
        // Subtle vertical bob
        const bobAmount = Math.sin(time * 1.2) * 0.005;
        character.position.y = bobAmount;
      }
    }
  });

  return (
    <group ref={sceneRef}>
      <primitive object={characterGroup} />
    </group>
  );
});

/**
 * Lighting setup for the scene
 */
const SceneLighting = memo(function SceneLighting() {
  return (
    <>
      {/* Key light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      {/* Fill light */}
      <directionalLight position={[-3, 2, -3]} intensity={0.4} />
      {/* Rim light */}
      <directionalLight position={[0, 2, -5]} intensity={0.6} color="#ff6b9d" />
      {/* Ambient light */}
      <ambientLight intensity={0.3} />
    </>
  );
});

/**
 * Main Character Canvas component
 */
export default function CharacterCanvas({
  config,
  showOutline = true,
  onSceneReady,
}: CharacterCanvasProps) {
  return (
    <div className="h-full w-full bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#ec4899" />
            </mesh>
          }
        >
          {/* Camera */}
          <PerspectiveCamera
            makeDefault
            position={CAMERA_POSITION}
            fov={50}
            near={0.1}
            far={1000}
          />

          {/* Controls - Left-drag rotate, scroll zoom, no pan, prevent flips */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={1.5}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
            target={CAMERA_TARGET}
            dampingFactor={0.05}
            enableDamping={true}
          />

          {/* Lighting */}
          <SceneLighting />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Character */}
          <CharacterScene config={config} showOutline={showOutline} onSceneReady={onSceneReady} />

          {/* Ground plane for shadows */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#1a1a1a" transparent opacity={0.3} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}

