'use client';

/**
 * 3D Character Integration for Petal Samurai
 * Character reacts to game events with physics and animations
 */

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimeToonMaterial } from '../../test/shaders/AnimeToonShader';

interface Character3DProps {
  className?: string;
}

interface CharacterReaction {
  type: 'hit' | 'combo' | 'damage' | 'victory';
  intensity: number;
}

export interface Character3DRef {
  triggerReaction: (reaction: CharacterReaction) => void;
  setExpression: (expression: 'idle' | 'happy' | 'hurt' | 'victory') => void;
}

// Inner character mesh component
function CharacterMesh(_props: any, ref: any) {
  const groupRef = useRef<THREE.Group>(null);
  const chestLeftRef = useRef<THREE.Mesh>(null);
  const chestRightRef = useRef<THREE.Mesh>(null);
  const hipsRef = useRef<THREE.Mesh>(null);
  
  const [expression, setExpression] = useState<'idle' | 'happy' | 'hurt' | 'victory'>('idle');
  const [reactionForce, setReactionForce] = useState(new THREE.Vector3());
  
  // Physics state
  const [physics] = useState(() => ({
    chestLeft: { pos: new THREE.Vector3(-0.12, 0.6, 0.15), vel: new THREE.Vector3(), rest: new THREE.Vector3(-0.12, 0.6, 0.15) },
    chestRight: { pos: new THREE.Vector3(0.12, 0.6, 0.15), vel: new THREE.Vector3(), rest: new THREE.Vector3(0.12, 0.6, 0.15) },
    hips: { pos: new THREE.Vector3(0, -0.2, 0.1), vel: new THREE.Vector3(), rest: new THREE.Vector3(0, -0.2, 0.1) },
  }));
  
  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    triggerReaction: (reaction: CharacterReaction) => {
      // Apply impulse force based on reaction
      const force = new THREE.Vector3(
        (Math.random() - 0.5) * reaction.intensity,
        reaction.intensity * 0.5,
        0
      );
      setReactionForce(force);
      
      // Set expression
      if (reaction.type === 'hit' || reaction.type === 'combo') {
        setExpression('happy');
        setTimeout(() => setExpression('idle'), 500);
      } else if (reaction.type === 'damage') {
        setExpression('hurt');
        setTimeout(() => setExpression('idle'), 800);
      } else if (reaction.type === 'victory') {
        setExpression('victory');
      }
    },
    setExpression: (expr: 'idle' | 'happy' | 'hurt' | 'victory') => {
      setExpression(expr);
    },
  }));
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Spring physics
    const STIFFNESS = 80;
    const DAMPING = 12;
    
    Object.values(physics).forEach((p) => {
      const displacement = p.pos.clone().sub(p.rest);
      const springForce = displacement.multiplyScalar(-STIFFNESS);
      const dampingForce = p.vel.clone().multiplyScalar(-DAMPING);
      
      // Add reaction impulse
      const impulse = reactionForce.clone().multiplyScalar(5);
      
      // Idle breathing
      const breathe = new THREE.Vector3(
        0,
        Math.sin(state.clock.elapsedTime * 2) * 0.01,
        0
      );
      
      const totalForce = springForce.add(dampingForce).add(impulse).add(breathe);
      p.vel.add(totalForce.multiplyScalar(delta));
      p.pos.add(p.vel.clone().multiplyScalar(delta));
    });
    
    // Apply to meshes
    if (chestLeftRef.current) chestLeftRef.current.position.copy(physics.chestLeft.pos);
    if (chestRightRef.current) chestRightRef.current.position.copy(physics.chestRight.pos);
    if (hipsRef.current) hipsRef.current.position.copy(physics.hips.pos);
    
    // Decay reaction force
    reactionForce.multiplyScalar(0.9);
    
    // Expression animations
    if (groupRef.current) {
      const targetScale = expression === 'happy' ? 1.05 : expression === 'hurt' ? 0.95 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });
  
  // Eye color based on expression
  const eyeColor = 
    expression === 'happy' ? '#ffaac9' :
    expression === 'hurt' ? '#ff4444' :
    expression === 'victory' ? '#ffd700' :
    '#4a90e2';
  
  const skinTone = '#fde4d0';
  
  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <AnimeToonMaterial color={skinTone} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.08, 1.42, 0.2]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial 
          color={eyeColor} 
          emissive={eyeColor} 
          emissiveIntensity={expression === 'victory' ? 1.0 : 0.5} 
        />
      </mesh>
      <mesh position={[0.08, 1.42, 0.2]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial 
          color={eyeColor} 
          emissive={eyeColor} 
          emissiveIntensity={expression === 'victory' ? 1.0 : 0.5} 
        />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 16, 32]} />
        <AnimeToonMaterial color={skinTone} />
      </mesh>
      
      {/* Breasts (with physics) */}
      <mesh ref={chestLeftRef} position={[-0.12, 0.6, 0.15]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <AnimeToonMaterial 
          color={new THREE.Color(skinTone).offsetHSL(0, 0, -0.05).getStyle()} 
          rimColor="#ffaac9"
          glossiness={0.8}
        />
      </mesh>
      <mesh ref={chestRightRef} position={[0.12, 0.6, 0.15]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <AnimeToonMaterial 
          color={new THREE.Color(skinTone).offsetHSL(0, 0, -0.05).getStyle()} 
          rimColor="#ffaac9"
          glossiness={0.8}
        />
      </mesh>
      
      {/* Hips (with physics) */}
      <mesh ref={hipsRef} position={[0, -0.2, 0.1]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <AnimeToonMaterial color={skinTone} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.45, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
        <AnimeToonMaterial color={skinTone} />
      </mesh>
      <mesh position={[0.45, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
        <AnimeToonMaterial color={skinTone} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.15, -0.7, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 16, 32]} />
        <AnimeToonMaterial color={skinTone} />
      </mesh>
      <mesh position={[0.15, -0.7, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 16, 32]} />
        <AnimeToonMaterial color={skinTone} />
      </mesh>
    </group>
  );
}

const CharacterMeshWithRef = forwardRef(CharacterMesh);

// Main component
const Character3D = forwardRef<Character3DRef, Character3DProps>(({ className = '' }, ref) => {
  const characterRef = useRef<Character3DRef>(null);
  
  useImperativeHandle(ref, () => ({
    triggerReaction: (reaction: CharacterReaction) => {
      characterRef.current?.triggerReaction(reaction);
    },
    setExpression: (expression: 'idle' | 'happy' | 'hurt' | 'victory') => {
      characterRef.current?.setExpression(expression);
    },
  }));
  
  return (
    <div className={`${className}`} style={{ pointerEvents: 'none' }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0.8, 2.5]} fov={40} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 3, 3]}
          intensity={1}
          castShadow
        />
        <pointLight position={[-2, 1, -2]} intensity={0.4} color="#ff69b4" />
        <pointLight position={[2, 1, 2]} intensity={0.4} color="#8b5cf6" />
        
        <Environment preset="sunset" />
        
        <Suspense fallback={null}>
          <CharacterMeshWithRef ref={characterRef} />
        </Suspense>
      </Canvas>
    </div>
  );
});

Character3D.displayName = 'Character3D';

export default Character3D;

