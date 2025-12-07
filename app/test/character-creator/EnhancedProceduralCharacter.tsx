'use client';

/**
 * Enhanced Procedural Character
 * Smooth organic shapes, not blocky primitives
 * Uses high-poly meshes and custom geometry for realistic curves
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterProps {
  config: any;
}

// Helper: Create smooth teardrop breast shape
function createBreastGeometry(size: number): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(size, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.85);
  
  // Modify vertices for teardrop shape
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    // More volume at bottom, tapers at top
    const factor = 1 + (y / size) * 0.3;
    positions.setX(i, positions.getX(i) * factor);
    positions.setZ(i, positions.getZ(i) * factor);
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

export default function EnhancedProceduralCharacter({ config }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const breastLeftRef = useRef<THREE.Mesh>(null);
  const breastRightRef = useRef<THREE.Mesh>(null);
  const hipsRef = useRef<THREE.Mesh>(null);
  const hairGroupRef = useRef<THREE.Group>(null);
  
  // Physics state
  const [physics] = useState(() => ({
    breastLeft: { pos: new THREE.Vector3(-0.12, 0.6, 0.16), vel: new THREE.Vector3(), rest: new THREE.Vector3(-0.12, 0.6, 0.16) },
    breastRight: { pos: new THREE.Vector3(0.12, 0.6, 0.16), vel: new THREE.Vector3(), rest: new THREE.Vector3(0.12, 0.6, 0.16) },
    hips: { pos: new THREE.Vector3(0, -0.2, 0.1), vel: new THREE.Vector3(), rest: new THREE.Vector3(0, -0.2, 0.1) },
  }));
  
  const [mouseVel, setMouseVel] = useState(new THREE.Vector3());
  const lastMouse = useRef(new THREE.Vector2());
  
  // High-quality materials
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.skinTone || '#fde4d0'),
    roughness: 0.35 - (config.skinGloss || 0.3) * 0.2,
    metalness: 0.05,
    envMapIntensity: 0.7,
  });
  
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f5deb3'),
    roughness: 0.7,
    metalness: 0.0,
  });
  
  // Physics simulation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const STIFFNESS = 80 / (config.jiggleIntensity || 1);
    const DAMPING = 10 + ((config.physicsDamping || 0.5) * 20);
    const FREQUENCY = config.jiggleSpeed || 1;
    
    Object.values(physics).forEach((p) => {
      const displacement = p.pos.clone().sub(p.rest);
      const springForce = displacement.multiplyScalar(-STIFFNESS);
      const dampingForce = p.vel.clone().multiplyScalar(-DAMPING);
      const impulse = mouseVel.clone().multiplyScalar((config.jiggleIntensity || 1) * 5);
      
      const breathe = new THREE.Vector3(
        Math.sin(state.clock.elapsedTime * FREQUENCY * 2) * 0.005,
        Math.cos(state.clock.elapsedTime * FREQUENCY * 2.5) * 0.015,
        Math.sin(state.clock.elapsedTime * FREQUENCY * 1.8) * 0.003
      );
      
      const totalForce = springForce.add(dampingForce).add(impulse).add(breathe);
      p.vel.add(totalForce.multiplyScalar(delta));
      p.pos.add(p.vel.clone().multiplyScalar(delta));
    });
    
    if (breastLeftRef.current) breastLeftRef.current.position.copy(physics.breastLeft.pos);
    if (breastRightRef.current) breastRightRef.current.position.copy(physics.breastRight.pos);
    if (hipsRef.current) hipsRef.current.position.copy(physics.hips.pos);
    
    // Hair sway
    if (hairGroupRef.current) {
      hairGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      hairGroupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.2) * 0.06;
    }
    
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
  
  const breastSize = 0.17 * (config.breastSize || 1.0);
  const hipSize = 0.27 * (config.hipWidth || 1.0);
  const waistSize = 0.26 * (config.waistSize || 1.0);
  const eyeSize = 0.045 * (config.eyeSize || 1.2);
  
  return (
    <group ref={groupRef} onPointerMove={handlePointerMove} scale={config.height || 1} position={[0, -0.8, 0]}>
      {/* === HEAD (High poly sphere) === */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.23, 64, 64]} />
        <primitive object={skinMaterial} />
      </mesh>
      
      {/* === ANIME EYES (Detailed) === */}
      {/* Left Eye Group */}
      <group position={[-0.08 * (config.eyeSpacing || 1), 1.52, 0.19]}>
        {/* Eye white (sclera) */}
        <mesh>
          <sphereGeometry args={[eyeSize, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        {/* Iris (blue) */}
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[eyeSize * 0.7, 32, 32]} />
          <meshStandardMaterial 
            color="#4a90e2" 
            emissive="#4a90e2" 
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.042]}>
          <sphereGeometry args={[eyeSize * 0.35, 24, 24]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Primary highlight */}
        <mesh position={[-0.012, 0.018, 0.048]}>
          <sphereGeometry args={[eyeSize * 0.25, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Secondary sparkle */}
        <mesh position={[0.01, -0.012, 0.048]}>
          <sphereGeometry args={[eyeSize * 0.12, 8, 8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
        </mesh>
      </group>
      
      {/* Right Eye Group */}
      <group position={[0.08 * (config.eyeSpacing || 1), 1.52, 0.19]}>
        <mesh>
          <sphereGeometry args={[eyeSize, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[eyeSize * 0.7, 32, 32]} />
          <meshStandardMaterial color="#4a90e2" emissive="#4a90e2" emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.042]}>
          <sphereGeometry args={[eyeSize * 0.35, 24, 24]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.012, 0.018, 0.048]}>
          <sphereGeometry args={[eyeSize * 0.25, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.01, -0.012, 0.048]}>
          <sphereGeometry args={[eyeSize * 0.12, 8, 8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
        </mesh>
      </group>
      
      {/* === NOSE (3D geometry, not flat) === */}
      <mesh position={[0, 1.43, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.018 * (config.noseWidth || 1), 0.06 * (config.noseHeight || 1), 4, 16]} />
        <primitive object={skinMaterial} />
      </mesh>
      {/* Nose tip */}
      <mesh position={[0, 1.40, 0.23]}>
        <sphereGeometry args={[0.022 * (config.noseWidth || 1), 16, 16]} />
        <primitive object={skinMaterial} />
      </mesh>
      
      {/* === LIPS (Volume, not flat) === */}
      {/* Upper lip */}
      <mesh position={[0, 1.36, 0.215]} rotation={[-0.15, 0, 0]}>
        <capsuleGeometry args={[0.04 * (config.mouthWidth || 1), 0.015 * (config.lipThickness || 1), 8, 16]} />
        <meshStandardMaterial 
          color={new THREE.Color(config.skinTone || '#fde4d0').offsetHSL(0, 0.25, -0.1)} 
          roughness={0.25}
        />
      </mesh>
      {/* Lower lip */}
      <mesh position={[0, 1.34, 0.215]} rotation={[0.15, 0, 0]}>
        <capsuleGeometry args={[0.042 * (config.mouthWidth || 1), 0.018 * (config.lipThickness || 1), 8, 16]} />
        <meshStandardMaterial 
          color={new THREE.Color(config.skinTone || '#fde4d0').offsetHSL(0, 0.25, -0.12)} 
          roughness={0.25}
        />
      </mesh>
      
      {/* === BLONDE HAIR (Detailed, multi-layer) === */}
      <group ref={hairGroupRef} position={[0, 1.55, 0]}>
        {/* Main hair cap (high poly) */}
        <mesh position={[0, 0.09, -0.09]} castShadow>
          <sphereGeometry args={[0.28, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <primitive object={hairMaterial} />
        </mesh>
        
        {/* Layered bangs (3 layers for depth) */}
        <mesh position={[0, -0.02, 0.18]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.36, 0.2, 0.04]} />
          <primitive object={hairMaterial} />
        </mesh>
        <mesh position={[0, -0.06, 0.19]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.32, 0.16, 0.03]} />
          <primitive object={hairMaterial} />
        </mesh>
        <mesh position={[0, -0.09, 0.20]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.28, 0.12, 0.03]} />
          <primitive object={hairMaterial} />
        </mesh>
        
        {/* Long side strands (flow down) */}
        <mesh position={[-0.21, -0.3, 0.06]} rotation={[0.1, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.05, 0.7, 12, 32]} />
          <primitive object={hairMaterial} />
        </mesh>
        <mesh position={[0.21, -0.3, 0.06]} rotation={[0.1, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.05, 0.7, 12, 32]} />
          <primitive object={hairMaterial} />
        </mesh>
        
        {/* Back braid (segmented for realism) */}
        <group position={[0, -0.25, -0.19]}>
          {/* Braid segments */}
          {[0, -0.25, -0.5, -0.75, -1.0].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} castShadow>
              <sphereGeometry args={[0.07 - i * 0.005, 24, 24]} />
              <primitive object={hairMaterial} />
            </mesh>
          ))}
          {/* Braid tie (blue ribbon) */}
          <mesh position={[0, -1.1, 0]}>
            <torusGeometry args={[0.055, 0.018, 12, 24]} />
            <meshStandardMaterial color="#4a90e2" roughness={0.4} />
          </mesh>
        </group>
      </group>
      
      {/* === NECK (Smooth cylinder with taper) === */}
      <mesh position={[0, 1.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.32, 32]} />
        <primitive object={skinMaterial} />
      </mesh>
      
      {/* === TORSO (Organic shape with curves) === */}
      {/* Upper torso */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[waistSize * 1.1, 0.35, 32, 64]} />
        <primitive object={skinMaterial} />
      </mesh>
      {/* Lower torso */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[waistSize, 0.35, 32, 64]} />
        <primitive object={skinMaterial} />
      </mesh>
      
      {/* === BREASTS (Teardrop geometry with physics) === */}
      {config.showNudity ? (
        <>
          <mesh ref={breastLeftRef} position={[-0.12, 0.63, 0.17]} castShadow receiveShadow>
            <primitive object={createBreastGeometry(breastSize)} />
            <meshStandardMaterial 
              color={new THREE.Color(config.skinTone || '#fde4d0').offsetHSL(0, 0.05, -0.02)}
              roughness={0.32 - (config.skinGloss || 0.3) * 0.15}
              metalness={0.08}
              envMapIntensity={0.7}
            />
          </mesh>
          <mesh ref={breastRightRef} position={[0.12, 0.63, 0.17]} castShadow receiveShadow>
            <primitive object={createBreastGeometry(breastSize)} />
            <meshStandardMaterial 
              color={new THREE.Color(config.skinTone || '#fde4d0').offsetHSL(0, 0.05, -0.02)}
              roughness={0.32 - (config.skinGloss || 0.3) * 0.15}
              metalness={0.08}
              envMapIntensity={0.7}
            />
          </mesh>
          
          {/* Nipples (3D, not flat circles) */}
          <mesh position={[-0.12, 0.68, 0.17 + breastSize * 0.72]}>
            <sphereGeometry args={[0.025 * (config.nipplesSize || 1), 24, 24]} />
            <meshStandardMaterial color={config.nipplesColor || '#f4a6b8'} roughness={0.35} />
          </mesh>
          <mesh position={[0.12, 0.68, 0.17 + breastSize * 0.72]}>
            <sphereGeometry args={[0.025 * (config.nipplesSize || 1), 24, 24]} />
            <meshStandardMaterial color={config.nipplesColor || '#f4a6b8'} roughness={0.35} />
          </mesh>
        </>
      ) : (
        // White & Gold Bikini Top (like reference image)
        <>
          {/* White cups */}
          <mesh position={[-0.11, 0.66, 0.15]} castShadow receiveShadow>
            <primitive object={createBreastGeometry(breastSize * 0.88)} />
            <meshStandardMaterial color="#ffffff" roughness={0.45} />
          </mesh>
          <mesh position={[0.11, 0.66, 0.15]} castShadow receiveShadow>
            <primitive object={createBreastGeometry(breastSize * 0.88)} />
            <meshStandardMaterial color="#ffffff" roughness={0.45} />
          </mesh>
          
          {/* Gold trim rings */}
          <mesh position={[-0.11, 0.68 + breastSize * 0.72, 0.15 + breastSize * 0.65]}>
            <torusGeometry args={[breastSize * 0.9, 0.012, 12, 32]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0.11, 0.68 + breastSize * 0.72, 0.15 + breastSize * 0.65]}>
            <torusGeometry args={[breastSize * 0.9, 0.012, 12, 32]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
          </mesh>
          
          {/* Center connector */}
          <mesh position={[0, 0.72, 0.15 + breastSize * 0.75]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.008, 0.22, 8, 16]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
          </mesh>
        </>
      )}
      
      {/* === HIPS & BUTT (Smooth rounded shape) === */}
      <mesh ref={hipsRef} position={[0, -0.18, 0.09]} castShadow receiveShadow>
        <sphereGeometry args={[hipSize, 64, 64]} />
        {config.showNudity ? (
          <primitive object={skinMaterial} />
        ) : (
          <meshStandardMaterial color="#ffffff" roughness={0.45} />
        )}
      </mesh>
      
      {/* Gold trim on bikini bottom */}
      {!config.showNudity && (
        <>
          <mesh position={[0, -0.18 + hipSize * 0.78, 0.09 + hipSize * 0.82]}>
            <torusGeometry args={[hipSize * 1.08, 0.012, 12, 48]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.18 - hipSize * 0.4, 0.09 + hipSize * 0.5]} rotation={[0.3, 0, 0]}>
            <torusGeometry args={[hipSize * 0.6, 0.012, 12, 32, Math.PI]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
          </mesh>
        </>
      )}
      
      {/* === ARMS (Smooth, tapered) === */}
      <mesh position={[-0.46, 0.52, 0]} rotation={[0.3, 0, 0.28]} castShadow receiveShadow>
        <capsuleGeometry args={[0.078, 0.58, 24, 48]} />
        <primitive object={skinMaterial} />
      </mesh>
      <mesh position={[0.46, 0.52, 0]} rotation={[0.3, 0, -0.28]} castShadow receiveShadow>
        <capsuleGeometry args={[0.078, 0.58, 24, 48]} />
        <primitive object={skinMaterial} />
      </mesh>
      
      {/* === THIGHS (Thick, smooth) === */}
      <mesh position={[-0.15, -0.68, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.125, 0.72, 32, 64]} />
        <primitive object={skinMaterial} />
      </mesh>
      <mesh position={[0.15, -0.68, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.125, 0.72, 32, 64]} />
        <primitive object={skinMaterial} />
      </mesh>
      
      {/* === CALVES === */}
      <mesh position={[-0.15, -1.18, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.09, 0.45, 24, 48]} />
        <primitive object={skinMaterial} />
      </mesh>
      <mesh position={[0.15, -1.18, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.09, 0.45, 24, 48]} />
        <primitive object={skinMaterial} />
      </mesh>
    </group>
  );
}

