'use client';

/**
 * Blonde Anime Character - Reference Quality
 * Matching the aesthetic from your reference image
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterProps {
  config: any;

export default function BlondeAnimeCharacter({ config }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const breastLeftRef = useRef<THREE.Mesh>(null);
  const breastRightRef = useRef<THREE.Mesh>(null);
  const hipsRef = useRef<THREE.Mesh>(null);
  const hairGroupRef = useRef<THREE.Group>(null);
  
  // Physics state
  const [physics] = useState(() => ({
    breastLeft: { 
      pos: new THREE.Vector3(-0.12, 0.6, 0.15), 
      vel: new THREE.Vector3(), 
      rest: new THREE.Vector3(-0.12, 0.6, 0.15) 
    },
    breastRight: { 
      pos: new THREE.Vector3(0.12, 0.6, 0.15), 
      vel: new THREE.Vector3(), 
      rest: new THREE.Vector3(0.12, 0.6, 0.15) 
    },
    hips: { 
      pos: new THREE.Vector3(0, -0.2, 0.08), 
      vel: new THREE.Vector3(), 
      rest: new THREE.Vector3(0, -0.2, 0.08) 
    },
  }));
  
  const [mouseVel, setMouseVel] = useState(new THREE.Vector3());
  const lastMouse = useRef(new THREE.Vector2());
  
  // Physics simulation with spring forces
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const STIFFNESS = 80 / (config.jiggleIntensity || 1);
    const DAMPING = 10 + ((config.physicsDamping || 0.5) * 20);
    const FREQUENCY = config.jiggleSpeed || 1;
    
    // Apply spring physics
    Object.values(physics).forEach((p) => {
      const displacement = p.pos.clone().sub(p.rest);
      const springForce = displacement.multiplyScalar(-STIFFNESS);
      const dampingForce = p.vel.clone().multiplyScalar(-DAMPING);
      const impulse = mouseVel.clone().multiplyScalar((config.jiggleIntensity || 1) * 5);
      
      // Breathing animation
      const breathe = new THREE.Vector3(
        Math.sin(state.clock.elapsedTime * FREQUENCY * 2) * 0.005,
        Math.cos(state.clock.elapsedTime * FREQUENCY * 2.5) * 0.015,
        Math.sin(state.clock.elapsedTime * FREQUENCY * 1.8) * 0.003
      );
      
      const totalForce = springForce.add(dampingForce).add(impulse).add(breathe);
      p.vel.add(totalForce.multiplyScalar(delta));
      p.pos.add(p.vel.clone().multiplyScalar(delta));
    });
    
    // Apply to meshes
    if (breastLeftRef.current) breastLeftRef.current.position.copy(physics.breastLeft.pos);
    if (breastRightRef.current) breastRightRef.current.position.copy(physics.breastRight.pos);
    if (hipsRef.current) hipsRef.current.position.copy(physics.hips.pos);
    
    // Hair sway (gentle wind effect)
    if (hairGroupRef.current) {
      hairGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
      hairGroupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.2) * 0.05;
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
  
  // Calculate sizes
  const breastSize = 0.16 * (config.breastSize || 1.0);
  const hipSize = 0.26 * (config.hipWidth || 1.0);
  const waistSize = 0.27 * (config.waistSize || 1.0);
  const skinTone = config.skinTone || '#fde4d0';
  const skinGloss = config.skinGloss || 0.3;
  
  // High-quality skin material
  const skinMaterial = (
    <meshStandardMaterial 
      color={skinTone}
      roughness={0.35 - skinGloss * 0.2}
      metalness={0.05}
      envMapIntensity={0.6}
    />
  );
  
  // Hair color (blonde)
  const hairColor = '#f5deb3';
  
  return (
    <group 
      ref={groupRef} 
      onPointerMove={handlePointerMove} 
      scale={config.height || 1.0}
      position={[0, -0.8, 0]}
    >
      {/* === HEAD === */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.23, 64, 64]} />
        {skinMaterial}
      </mesh>
      
      {/* === ANIME EYES === */}
      {/* Left Eye */}
      <group position={[-0.08, 1.52, 0.18]}>
        {/* Eye white */}
        <mesh>
          <sphereGeometry args={[0.045 * (config.eyeSize || 1), 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Iris */}
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[0.03 * (config.eyeSize || 1), 16, 16]} />
          <meshStandardMaterial color="#4a90e2" emissive="#4a90e2" emissiveIntensity={0.4} />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.015 * (config.eyeSize || 1), 12, 12]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Highlight (sparkle) */}
        <mesh position={[-0.01, 0.015, 0.045]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.008, -0.01, 0.045]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      </group>
      
      {/* Right Eye */}
      <group position={[0.08, 1.52, 0.18]}>
        <mesh>
          <sphereGeometry args={[0.045 * (config.eyeSize || 1), 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[0.03 * (config.eyeSize || 1), 16, 16]} />
          <meshStandardMaterial color="#4a90e2" emissive="#4a90e2" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.015 * (config.eyeSize || 1), 12, 12]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.01, 0.015, 0.045]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.008, -0.01, 0.045]}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      </group>
      
      {/* === BLONDE HAIR === */}
      <group ref={hairGroupRef} position={[0, 1.55, 0]}>
        {/* Main hair volume (top/back) */}
        <mesh position={[0, 0.08, -0.08]} castShadow>
          <sphereGeometry args={[0.27, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshStandardMaterial color={hairColor} roughness={0.7} />
        </mesh>
        
        {/* Bangs (layered) */}
        <mesh position={[0, -0.02, 0.17]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.35, 0.18, 0.06]} />
          <meshStandardMaterial color={hairColor} roughness={0.7} />
        </mesh>
        
        {/* Side strands (flows down) */}
        <mesh position={[-0.2, -0.25, 0.05]} rotation={[0, 0, 0.25]}>
          <capsuleGeometry args={[0.045, 0.6, 8, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.7} />
        </mesh>
        <mesh position={[0.2, -0.25, 0.05]} rotation={[0, 0, -0.25]}>
          <capsuleGeometry args={[0.045, 0.6, 8, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.7} />
        </mesh>
        
        {/* Long back hair (braid effect) */}
        <mesh position={[0, -0.6, -0.18]} castShadow>
          <capsuleGeometry args={[0.08, 1.2, 8, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.7} />
        </mesh>
        
        {/* Braid tie (blue ribbon) */}
        <mesh position={[0, -1.15, -0.18]}>
          <torusGeometry args={[0.05, 0.015, 8, 16]} />
          <meshStandardMaterial color="#4a90e2" />
        </mesh>
      </group>
      
      {/* === CUTE MOUTH (smiling) === */}
      <mesh position={[0, 1.35, 0.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.045 * (config.mouthWidth || 1), 0.008 * (config.lipThickness || 1), 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color={new THREE.Color(skinTone).offsetHSL(0, 0.25, -0.12)} 
          roughness={0.3}
        />
      </mesh>
      
      {/* === NECK === */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.10, 0.12, 0.28, 24]} />
        {skinMaterial}
      </mesh>
      
      {/* === TORSO (smooth curves) === */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[waistSize, 0.65, 24, 48]} />
        {skinMaterial}
      </mesh>
      
      {/* === BREASTS (teardrop shape with physics) === */}
      {config.showNudity ? (
        <>
          <mesh ref={breastLeftRef} position={[-0.12, 0.63, 0.16]} castShadow receiveShadow>
            {/* Use spherical cap for teardrop shape */}
            <sphereGeometry args={[breastSize, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
            <meshStandardMaterial 
              color={new THREE.Color(skinTone).offsetHSL(0, 0.03, -0.02)}
              roughness={0.32 - skinGloss * 0.15}
              metalness={0.08}
            />
          </mesh>
          <mesh ref={breastRightRef} position={[0.12, 0.63, 0.16]} castShadow receiveShadow>
            <sphereGeometry args={[breastSize, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
            <meshStandardMaterial 
              color={new THREE.Color(skinTone).offsetHSL(0, 0.03, -0.02)}
              roughness={0.32 - skinGloss * 0.15}
              metalness={0.08}
            />
          </mesh>
          
          {/* Nipples (detailed) */}
          <mesh position={[-0.12, 0.68, 0.16 + breastSize * 0.7]}>
            <sphereGeometry args={[0.025 * (config.nipplesSize || 1), 24, 24]} />
            <meshStandardMaterial color={config.nipplesColor || '#f4a6b8'} roughness={0.4} />
          </mesh>
          <mesh position={[0.12, 0.68, 0.16 + breastSize * 0.7]}>
            <sphereGeometry args={[0.025 * (config.nipplesSize || 1), 24, 24]} />
            <meshStandardMaterial color={config.nipplesColor || '#f4a6b8'} roughness={0.4} />
          </mesh>
        </>
      ) : (
        // WHITE & GOLD BIKINI TOP (like reference)
        <>
          <mesh position={[-0.11, 0.65, 0.14]} castShadow receiveShadow>
            <sphereGeometry args={[breastSize * 0.88, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[0.11, 0.65, 0.14]} castShadow receiveShadow>
            <sphereGeometry args={[breastSize * 0.88, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          {/* Gold trim */}
          <mesh position={[-0.11, 0.65 + breastSize * 0.75, 0.14 + breastSize * 0.7]}>
            <torusGeometry args={[breastSize * 0.9, 0.008, 8, 24]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.11, 0.65 + breastSize * 0.75, 0.14 + breastSize * 0.7]}>
            <torusGeometry args={[breastSize * 0.9, 0.008, 8, 24]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}
      
      {/* === HIPS & BUTT (with physics) === */}
      <mesh ref={hipsRef} position={[0, -0.18, 0.08]} castShadow receiveShadow>
        <sphereGeometry args={[hipSize, 48, 48]} />
        {config.showNudity ? skinMaterial : <meshStandardMaterial color="#ffffff" roughness={0.5} />}
      </mesh>
      
      {/* Gold trim on bottoms */}
      {!config.showNudity && (
        <mesh position={[0, -0.18 + hipSize * 0.8, 0.08 + hipSize * 0.85]}>
          <torusGeometry args={[hipSize * 1.05, 0.008, 8, 32]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </mesh>
      )}
      
      {/* === ARMS (natural relaxed pose) === */}
      {/* Left arm - upper */}
      <mesh position={[-0.42, 0.58, 0]} rotation={[0.2, 0, 0.4]} castShadow receiveShadow>
        <capsuleGeometry args={[0.07, 0.32, 16, 32]} />
        {skinMaterial}
      </mesh>
      {/* Left forearm */}
      <mesh position={[-0.52, 0.18, 0.05]} rotation={[0.5, 0, 0.3]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06, 0.28, 16, 32]} />
        {skinMaterial}
      </mesh>
      {/* Left hand */}
      <mesh position={[-0.56, -0.05, 0.12]} rotation={[0.6, 0, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        {skinMaterial}
      </mesh>
      
      {/* Right arm - upper */}
      <mesh position={[0.42, 0.58, 0]} rotation={[0.2, 0, -0.4]} castShadow receiveShadow>
        <capsuleGeometry args={[0.07, 0.32, 16, 32]} />
        {skinMaterial}
      </mesh>
      {/* Right forearm */}
      <mesh position={[0.52, 0.18, 0.05]} rotation={[0.5, 0, -0.3]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06, 0.28, 16, 32]} />
        {skinMaterial}
      </mesh>
      {/* Right hand */}
      <mesh position={[0.56, -0.05, 0.12]} rotation={[0.6, 0, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        {skinMaterial}
      </mesh>
      
      {/* === THIGHS (smooth, detailed) === */}
      <mesh position={[-0.15, -0.68, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.12, 0.7, 20, 40]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0.15, -0.68, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.12, 0.7, 20, 40]} />
        {skinMaterial}
      </mesh>
      
      {/* === CALVES === */}
      <mesh position={[-0.15, -1.15, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.08, 0.4, 16, 32]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0.15, -1.15, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.08, 0.4, 16, 32]} />
        {skinMaterial}
      </mesh>
      
      {/* === FEET === */}
      <mesh position={[-0.15, -1.42, 0.05]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.08, 0.18]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0.15, -1.42, 0.05]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.08, 0.18]} />
        {skinMaterial}
      </mesh>
    </group>
  );
}

