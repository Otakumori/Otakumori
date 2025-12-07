'use client';

/**
 * AAA Quality Character - Nikke/Code Vein Level
 * Anime-style cel-shading with detailed geometry
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterConfig {
  height: number;
  breastSize: number;
  hipWidth: number;
  waistSize: number;
  skinTone: string;
  skinGloss: number;
  eyeSize: number;
  eyeSpacing: number;
  noseWidth: number;
  noseHeight: number;
  lipThickness: number;
  mouthWidth: number;
  neckThickness: number;
  neckLength: number;
  jiggleIntensity: number;
  jiggleSpeed: number;
  physicsDamping: number;
  showNudity: boolean;
  nipplesSize: number;
  nipplesColor: string;
  [key: string]: any;
}

// Custom Toon Material with rim lighting
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uRimColor;
  uniform float uRimPower;
  uniform float uGloss;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    
    // Toon diffuse (4 steps for anime look)
    float NdotL = dot(normal, lightDir);
    float toon = floor(NdotL * 4.0) / 4.0;
    toon = max(toon, 0.3); // Ambient floor
    
    // Rim lighting (Fresnel)
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, uRimPower);
    vec3 rimLight = uRimColor * rim * 0.8;
    
    // Specular (anime highlight)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), uGloss * 100.0);
    spec = step(0.5, spec) * 0.4;
    
    // Combine
    vec3 finalColor = uColor * toon + rimLight + vec3(spec);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function AAACharacter({ config }: { config: CharacterConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const breastLeftRef = useRef<THREE.Mesh>(null);
  const breastRightRef = useRef<THREE.Mesh>(null);
  const hipsRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Group>(null);
  
  // Physics state
  const [physics] = useState(() => ({
    breastLeft: { pos: new THREE.Vector3(-0.12, 0.6, 0.15), vel: new THREE.Vector3(), rest: new THREE.Vector3(-0.12, 0.6, 0.15) },
    breastRight: { pos: new THREE.Vector3(0.12, 0.6, 0.15), vel: new THREE.Vector3(), rest: new THREE.Vector3(0.12, 0.6, 0.15) },
    hips: { pos: new THREE.Vector3(0, -0.2, 0.1), vel: new THREE.Vector3(), rest: new THREE.Vector3(0, -0.2, 0.1) },
  }));
  
  const [mouseVel, setMouseVel] = useState(new THREE.Vector3());
  const lastMouse = useRef(new THREE.Vector2());
  
  // Custom shader material
  const [toonMaterial] = useState(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(config.skinTone) },
      uRimColor: { value: new THREE.Color('#ffaac9') },
      uRimPower: { value: 3.0 },
      uGloss: { value: 0.6 },
    },
  }));
  
  // Update material color when config changes
  toonMaterial.uniforms.uColor.value.set(config.skinTone);
  
  // Physics simulation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const STIFFNESS = 80 / config.jiggleIntensity;
    const DAMPING = 10 + (config.physicsDamping * 20);
    const FREQUENCY = config.jiggleSpeed;
    
    // Physics for jiggly parts
    Object.values(physics).forEach((p) => {
      const displacement = p.pos.clone().sub(p.rest);
      const springForce = displacement.multiplyScalar(-STIFFNESS);
      const dampingForce = p.vel.clone().multiplyScalar(-DAMPING);
      const impulse = mouseVel.clone().multiplyScalar(config.jiggleIntensity * 5);
      
      // Idle breathing/jiggle
      const idleJiggle = new THREE.Vector3(
        Math.sin(state.clock.elapsedTime * FREQUENCY * 2) * 0.005,
        Math.cos(state.clock.elapsedTime * FREQUENCY * 2.5) * 0.01,
        Math.sin(state.clock.elapsedTime * FREQUENCY * 1.8) * 0.003
      );
      
      const totalForce = springForce.add(dampingForce).add(impulse).add(idleJiggle);
      p.vel.add(totalForce.multiplyScalar(delta));
      p.pos.add(p.vel.clone().multiplyScalar(delta));
    });
    
    // Apply to meshes
    if (breastLeftRef.current) breastLeftRef.current.position.copy(physics.breastLeft.pos);
    if (breastRightRef.current) breastRightRef.current.position.copy(physics.breastRight.pos);
    if (hipsRef.current) hipsRef.current.position.copy(physics.hips.pos);
    
    // Hair sway
    if (hairRef.current) {
      hairRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      hairRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.5) * 0.03;
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
  
  // Sizes
  const breastSize = 0.15 * config.breastSize * config.height;
  const hipSize = 0.25 * config.hipWidth * config.height;
  const waistSize = 0.28 * config.waistSize;
  
  // Skin material with better settings
  const skinMaterial = (
    <meshStandardMaterial 
      color={config.skinTone}
      roughness={0.4 - config.skinGloss * 0.2}
      metalness={0.1}
      envMapIntensity={0.5}
    />
  );
  
  return (
    <group ref={groupRef} onPointerMove={handlePointerMove} scale={config.height} position={[0, -0.5, 0]}>
      {/* Head with better proportions */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        {skinMaterial}
      </mesh>
      
      {/* Anime Eyes */}
      <mesh position={[-0.07 * config.eyeSpacing, 1.45, 0.18]}>
        <sphereGeometry args={[0.04 * config.eyeSize, 16, 16]} />
        <meshStandardMaterial color="#4a90e2" emissive="#4a90e2" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.07 * config.eyeSpacing, 1.45, 0.18]}>
        <sphereGeometry args={[0.04 * config.eyeSize, 16, 16]} />
        <meshStandardMaterial color="#4a90e2" emissive="#4a90e2" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Eye highlights (anime sparkle) */}
      <mesh position={[-0.065 * config.eyeSpacing, 1.47, 0.2]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.075 * config.eyeSpacing, 1.47, 0.2]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Cute mouth */}
      <mesh position={[0, 1.32, 0.2]} rotation={[0, 0, Math.PI / 32]}>
        <torusGeometry args={[0.04 * config.mouthWidth, 0.008 * config.lipThickness, 8, 16, Math.PI]} />
        <meshStandardMaterial color={new THREE.Color(config.skinTone).offsetHSL(0, 0.3, -0.15)} />
      </mesh>
      
      {/* Blonde Hair */}
      <group ref={hairRef} position={[0, 1.5, 0]}>
        {/* Main hair volume */}
        <mesh position={[0, 0.05, -0.05]} castShadow>
          <sphereGeometry args={[0.26, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.6} />
        </mesh>
        
        {/* Bangs */}
        <mesh position={[0, 0, 0.15]}>
          <boxGeometry args={[0.3, 0.15, 0.08]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.6} />
        </mesh>
        
        {/* Side hair strands */}
        <mesh position={[-0.18, -0.1, 0]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.04, 0.4, 8, 16]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.6} />
        </mesh>
        <mesh position={[0.18, -0.1, 0]} rotation={[0, 0, -0.3]}>
          <capsuleGeometry args={[0.04, 0.4, 8, 16]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.6} />
        </mesh>
        
        {/* Long back hair */}
        <mesh position={[0, -0.4, -0.15]} castShadow>
          <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.6} />
        </mesh>
      </group>
      
      {/* Neck with smooth transition */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1 * config.neckThickness, 0.09 * config.neckThickness, 0.25 * config.neckLength, 16]} />
        {skinMaterial}
      </mesh>
      
      {/* Torso with curves */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[waistSize, 0.7, 16, 32]} />
        {skinMaterial}
      </mesh>
      
      {/* Breasts (teardrop shape, not spheres) */}
      {config.showNudity ? (
        <>
          <mesh ref={breastLeftRef} position={[-0.12, 0.6, 0.15]} castShadow receiveShadow>
            <sphereGeometry args={[breastSize, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
            <meshStandardMaterial 
              color={new THREE.Color(config.skinTone).offsetHSL(0, 0.05, -0.03)}
              roughness={0.35 - config.skinGloss * 0.15}
              metalness={0.1}
            />
          </mesh>
          <mesh ref={breastRightRef} position={[0.12, 0.6, 0.15]} castShadow receiveShadow>
            <sphereGeometry args={[breastSize, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
            <meshStandardMaterial 
              color={new THREE.Color(config.skinTone).offsetHSL(0, 0.05, -0.03)}
              roughness={0.35 - config.skinGloss * 0.15}
              metalness={0.1}
            />
          </mesh>
          
          {/* Nipples */}
          <mesh position={[-0.12, 0.65, 0.15 + breastSize * 0.75]}>
            <sphereGeometry args={[0.02 * config.nipplesSize, 16, 16]} />
            <meshStandardMaterial color={config.nipplesColor} roughness={0.4} />
          </mesh>
          <mesh position={[0.12, 0.65, 0.15 + breastSize * 0.75]}>
            <sphereGeometry args={[0.02 * config.nipplesSize, 16, 16]} />
            <meshStandardMaterial color={config.nipplesColor} roughness={0.4} />
          </mesh>
        </>
      ) : (
        // Clothed version - pink bikini top
        <>
          <mesh position={[-0.11, 0.63, 0.13]}>
            <sphereGeometry args={[breastSize * 0.9, 16, 16]} />
            <meshStandardMaterial color="#ff6b9d" roughness={0.7} />
          </mesh>
          <mesh position={[0.11, 0.63, 0.13]}>
            <sphereGeometry args={[breastSize * 0.9, 16, 16]} />
            <meshStandardMaterial color="#ff6b9d" roughness={0.7} />
          </mesh>
        </>
      )}
      
      {/* Hips with better shape */}
      <mesh ref={hipsRef} position={[0, -0.2, 0.1]} castShadow receiveShadow>
        <sphereGeometry args={[hipSize, 32, 32]} />
        {config.showNudity ? skinMaterial : <meshStandardMaterial color="#8b5cf6" roughness={0.7} />}
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.42, 0.5, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
        <capsuleGeometry args={[0.07, 0.5, 12, 24]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0.42, 0.5, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
        <capsuleGeometry args={[0.07, 0.5, 12, 24]} />
        {skinMaterial}
      </mesh>
      
      {/* Thighs */}
      <mesh position={[-0.14, -0.7, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.11, 0.6, 12, 24]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0.14, -0.7, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.11, 0.6, 12, 24]} />
        {skinMaterial}
      </mesh>
    </group>
  );
}

