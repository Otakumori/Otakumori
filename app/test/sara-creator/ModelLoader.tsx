'use client';

/**
 * Goth Girl Sara - Model Loader
 * Loads the Blender model and applies parametric controls
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SaraModelProps {
  config: any;

export default function SaraModel({ config }: SaraModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the GLB model
  const { scene, nodes, materials } = useGLTF('/models/goth-girl-sara.glb', true);
  
  // Physics state for jiggle
  const [physics] = useState(() => ({
    chest: { pos: new THREE.Vector3(), vel: new THREE.Vector3() },
    hips: { pos: new THREE.Vector3(), vel: new THREE.Vector3() },
  }));
  
  const [mouseVel, setMouseVel] = useState(new THREE.Vector3());
  const lastMouse = useRef(new THREE.Vector2());
  
  useEffect(() => {
    if (scene) {
      setModelLoaded(true);
      
      // Apply initial config
      scene.scale.set(
        config.height || 1,
        config.height || 1,
        config.height || 1
      );
      
      // Find and store references to specific body parts
      scene.traverse((child: any) => {
        if (child.isMesh) {
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Apply material tweaks
          if (child.material) {
            // Make skin glossier
            if (child.name.includes('Body') || child.name.includes('Face')) {
              child.material.roughness = 0.4 - (config.skinGloss || 0.3) * 0.3;
              child.material.metalness = 0.1;
              child.material.envMapIntensity = 0.6;
            }
            
            // Make hair blonde if config says so
            if (child.name.includes('Hair')) {
              child.material.color = new THREE.Color('#f5deb3'); // Blonde
              child.material.roughness = 0.7;
            }
          }
          
          // Apply morph targets if they exist
          if (child.morphTargetInfluences && child.morphTargetDictionary) {
            // Breast size morph (if exists)
            if (child.morphTargetDictionary['BreastSize']) {
              const idx = child.morphTargetDictionary['BreastSize'];
              child.morphTargetInfluences[idx] = (config.breastSize || 1) - 1;
            }
            
            // Eye size morph
            if (child.morphTargetDictionary['EyeSize']) {
              const idx = child.morphTargetDictionary['EyeSize'];
              child.morphTargetInfluences[idx] = (config.eyeSize || 1) - 1;
            }
          }
        }
      });
    }
  }, [scene, config]);
  
  // Physics simulation
  useFrame((state, delta) => {
    if (!groupRef.current || !modelLoaded) return;
    
    const STIFFNESS = 80 / (config.jiggleIntensity || 1);
    const DAMPING = 10 + ((config.physicsDamping || 0.5) * 20);
    
    // Apply jiggle physics to specific bones/parts
    scene.traverse((child: any) => {
      // Jiggle physics on chest bones
      if (child.isBone && child.name.includes('Breast')) {
        // Apply spring physics to rotation
        const idleJiggle = Math.sin(state.clock.elapsedTime * (config.jiggleSpeed || 1) * 3) * 0.02;
        const mouseImpulse = mouseVel.y * 0.001 * (config.jiggleIntensity || 1);
        
        child.rotation.x = idleJiggle + mouseImpulse;
      }
      
      // Hair sway
      if (child.isBone && child.name.includes('Hair')) {
        const sway = Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
        child.rotation.z = sway;
      }
    });
    
    mouseVel.multiplyScalar(0.95);
  });
  
  const handlePointerMove = (e: any) => {
    const current = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    const delta = current.clone().sub(lastMouse.current);
    setMouseVel(new THREE.Vector3(delta.x, delta.y, 0).multiplyScalar(10));
    lastMouse.current = current;
  };
  
  if (!scene) {
    return (
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#ec4899" wireframe />
      </mesh>
    );
  }
  
  return (
    <group ref={groupRef} onPointerMove={handlePointerMove}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/goth-girl-sara.glb');

