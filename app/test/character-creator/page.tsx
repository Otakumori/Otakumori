'use client';

/**
 * Character Creator with Real-time Sliders
 * Every slider change updates the 3D model instantly
 * 
 * This is the foundation for the full NSFW character system
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimeToonMaterial } from '../shaders/AnimeToonShader';

// Character configuration interface
interface CharacterConfig {
  // Body
  height: number;
  breastSize: number;
  hipWidth: number;
  waistSize: number;
  thighThickness: number;
  
  // Physics
  jiggleIntensity: number;
  jiggleSpeed: number;
  physicsDamping: number;
  
  // Appearance
  skinTone: string;
  showNudity: boolean;
  useAnimeShader: boolean;
}

// Default config
const DEFAULT_CONFIG: CharacterConfig = {
  height: 1.0,
  breastSize: 1.0,
  hipWidth: 1.0,
  waistSize: 1.0,
  thighThickness: 1.0,
  jiggleIntensity: 1.0,
  jiggleSpeed: 1.0,
  physicsDamping: 0.5,
  skinTone: '#fde4d0',
  showNudity: false,
  useAnimeShader: true,
};

// Parametric character with sliders
function ParametricCharacter({ config }: { config: CharacterConfig }) {
  const bodyRef = useRef<THREE.Group>(null);
  const chestLeftRef = useRef<THREE.Mesh>(null);
  const chestRightRef = useRef<THREE.Mesh>(null);
  const hipsRef = useRef<THREE.Mesh>(null);
  const thighLeftRef = useRef<THREE.Mesh>(null);
  const thighRightRef = useRef<THREE.Mesh>(null);
  
  // Physics state for each body part
  const [physics] = useState(() => ({
    chestLeft: { pos: new THREE.Vector3(), vel: new THREE.Vector3(), rest: new THREE.Vector3(-0.12, 0.6, 0.15) },
    chestRight: { pos: new THREE.Vector3(), vel: new THREE.Vector3(), rest: new THREE.Vector3(0.12, 0.6, 0.15) },
    hips: { pos: new THREE.Vector3(), vel: new THREE.Vector3(), rest: new THREE.Vector3(0, -0.2, 0.1) },
    thighLeft: { pos: new THREE.Vector3(), vel: new THREE.Vector3(), rest: new THREE.Vector3(-0.15, -0.7, 0) },
    thighRight: { pos: new THREE.Vector3(), vel: new THREE.Vector3(), rest: new THREE.Vector3(0.15, -0.7, 0) },
  }));
  
  const [mouseVel, setMouseVel] = useState(new THREE.Vector3());
  const lastMouse = useRef(new THREE.Vector2());
  
  // Physics tuning from config
  const STIFFNESS = 80 / config.jiggleIntensity;
  const FREQUENCY = config.jiggleSpeed;
  const DAMPING = 10 + (config.physicsDamping * 20);
  
  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    
    // Apply spring physics to all jiggle parts
    Object.entries(physics).forEach(([key, p]) => {
      // Spring force
      const displacement = p.pos.clone().sub(p.rest);
      const springForce = displacement.multiplyScalar(-STIFFNESS);
      
      // Damping
      const dampingForce = p.vel.clone().multiplyScalar(-DAMPING);
      
      // Movement impulse from mouse
      const impulse = mouseVel.clone().multiplyScalar(config.jiggleIntensity * 5);
      
      // Idle jiggle (breathing, heartbeat)
      const idleJiggle = new THREE.Vector3(
        Math.sin(state.clock.elapsedTime * FREQUENCY * 2) * 0.005,
        Math.cos(state.clock.elapsedTime * FREQUENCY * 2.5) * 0.01,
        Math.sin(state.clock.elapsedTime * FREQUENCY * 1.8) * 0.003
      );
      
      // Total force
      const totalForce = springForce.add(dampingForce).add(impulse).add(idleJiggle);
      
      // Update velocity and position
      p.vel.add(totalForce.multiplyScalar(delta));
      p.pos.add(p.vel.clone().multiplyScalar(delta));
      
      // Apply to mesh
      const ref = 
        key === 'chestLeft' ? chestLeftRef :
        key === 'chestRight' ? chestRightRef :
        key === 'hips' ? hipsRef :
        key === 'thighLeft' ? thighLeftRef :
        thighRightRef;
      
      if (ref.current) {
        ref.current.position.copy(p.pos);
      }
    });
    
    // Decay mouse velocity
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
  
  // Calculate sizes from config
  const headSize = 0.25 * config.height;
  const breastSize = 0.15 * config.breastSize;
  const hipSize = 0.25 * config.hipWidth;
  const waistSize = 0.3 * config.waistSize;
  const thighSize = 0.1 * config.thighThickness;
  
  return (
    <group ref={bodyRef} onPointerMove={handlePointerMove} scale={config.height}>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[headSize, 32, 32]} />
        {config.useAnimeShader ? (
          <AnimeToonMaterial color={config.skinTone} />
        ) : (
          <meshStandardMaterial 
            color={config.skinTone}
            roughness={0.6}
            metalness={0.1}
          />
        )}
      </mesh>
      
      {/* Eyes (anime style) */}
      <mesh position={[-0.08, 1.42, 0.2]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#4a90e2" emissive="#4a90e2" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.08, 1.42, 0.2]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#4a90e2" emissive="#4a90e2" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[waistSize, 0.8, 16, 32]} />
        {config.useAnimeShader ? (
          <AnimeToonMaterial color={config.skinTone} />
        ) : (
          <meshStandardMaterial 
            color={config.skinTone}
            roughness={0.6}
            metalness={0.1}
          />
        )}
      </mesh>
      
      {/* Breasts (with physics) - separate left/right for realistic movement */}
      {config.showNudity ? (
        <>
          <mesh ref={chestLeftRef} position={[-0.12, 0.6, 0.15]} castShadow>
            <sphereGeometry args={[breastSize, 32, 32]} />
            {config.useAnimeShader ? (
              <AnimeToonMaterial 
                color={new THREE.Color(config.skinTone).offsetHSL(0, 0, -0.05).getStyle()} 
                rimColor="#ffaac9"
                glossiness={0.8}
              />
            ) : (
              <meshStandardMaterial 
                color={new THREE.Color(config.skinTone).offsetHSL(0, 0, -0.05)}
                roughness={0.5}
                metalness={0.1}
              />
            )}
          </mesh>
          <mesh ref={chestRightRef} position={[0.12, 0.6, 0.15]} castShadow>
            <sphereGeometry args={[breastSize, 32, 32]} />
            {config.useAnimeShader ? (
              <AnimeToonMaterial 
                color={new THREE.Color(config.skinTone).offsetHSL(0, 0, -0.05).getStyle()} 
                rimColor="#ffaac9"
                glossiness={0.8}
              />
            ) : (
              <meshStandardMaterial 
                color={new THREE.Color(config.skinTone).offsetHSL(0, 0, -0.05)}
                roughness={0.5}
                metalness={0.1}
              />
            )}
          </mesh>
        </>
      ) : (
        // Clothed version (top)
        <mesh position={[0, 0.6, 0.15]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.2]} />
          <meshStandardMaterial color="#ec4899" roughness={0.8} />
        </mesh>
      )}
      
      {/* Hips (with physics) */}
      <mesh ref={hipsRef} position={[0, -0.2, 0.1]} castShadow>
        <sphereGeometry args={[hipSize, 32, 32]} />
        <meshStandardMaterial 
          color={config.showNudity ? config.skinTone : '#8b5cf6'}
          roughness={config.showNudity ? 0.6 : 0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.45, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      <mesh position={[0.45, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      
      {/* Thighs (with physics) */}
      <mesh ref={thighLeftRef} position={[-0.15, -0.7, 0]} castShadow>
        <capsuleGeometry args={[thighSize, 0.6, 16, 32]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      <mesh ref={thighRightRef} position={[0.15, -0.7, 0]} castShadow>
        <capsuleGeometry args={[thighSize, 0.6, 16, 32]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
    </group>
  );
}

// Slider component
function Slider({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 2, 
  step = 0.1,
  description 
}: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void; 
  min?: number; 
  max?: number; 
  step?: number;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-white">{label}</label>
        <span className="text-xs text-pink-300">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-pink"
      />
      {description && (
        <p className="text-xs text-white/60">{description}</p>
      )}
    </div>
  );
}

export default function CharacterCreatorPage() {
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'body' | 'physics' | 'appearance'>('body');
  
  const updateConfig = (key: keyof CharacterConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <style jsx global>{`
        .slider-pink::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }
        .slider-pink::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }
      `}</style>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            ✨ Character Creator - Real-time Sliders
          </h1>
          <p className="text-pink-200">
            Every slider updates the 3D model instantly • Physics reacts to changes
          </p>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="absolute top-32 left-6 z-10 w-80 bg-black/70 backdrop-blur-lg rounded-xl border border-pink-500/30 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/20">
          {(['body', 'physics', 'appearance'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-pink-500 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Slider Content */}
        <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          {activeTab === 'body' && (
            <>
              <Slider
                label="Height"
                value={config.height}
                onChange={(v) => updateConfig('height', v)}
                min={0.7}
                max={1.3}
                description="Overall character height"
              />
              <Slider
                label="Breast Size"
                value={config.breastSize}
                onChange={(v) => updateConfig('breastSize', v)}
                min={0.5}
                max={2.0}
                description="Affects physics and jiggle"
              />
              <Slider
                label="Hip Width"
                value={config.hipWidth}
                onChange={(v) => updateConfig('hipWidth', v)}
                min={0.7}
                max={1.5}
                description="Hip size and curves"
              />
              <Slider
                label="Waist Size"
                value={config.waistSize}
                onChange={(v) => updateConfig('waistSize', v)}
                min={0.6}
                max={1.3}
                description="Torso thickness"
              />
              <Slider
                label="Thigh Thickness"
                value={config.thighThickness}
                onChange={(v) => updateConfig('thighThickness', v)}
                min={0.7}
                max={1.5}
                description="Leg muscle/fat"
              />
            </>
          )}
          
          {activeTab === 'physics' && (
            <>
              <Slider
                label="Jiggle Intensity"
                value={config.jiggleIntensity}
                onChange={(v) => updateConfig('jiggleIntensity', v)}
                min={0.1}
                max={2.0}
                description="How much parts bounce"
              />
              <Slider
                label="Jiggle Speed"
                value={config.jiggleSpeed}
                onChange={(v) => updateConfig('jiggleSpeed', v)}
                min={0.5}
                max={2.0}
                description="Frequency of oscillation"
              />
              <Slider
                label="Physics Damping"
                value={config.physicsDamping}
                onChange={(v) => updateConfig('physicsDamping', v)}
                min={0}
                max={1}
                step={0.05}
                description="Resistance to movement"
              />
              <div className="pt-4 border-t border-white/20">
                <p className="text-xs text-white/70">
                  💡 Move your mouse to test physics response
                </p>
              </div>
            </>
          )}
          
          {activeTab === 'appearance' && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Skin Tone
                </label>
                <div className="flex gap-2">
                  {['#fde4d0', '#f5c4a0', '#d4a574', '#8d5524', '#4a2511'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateConfig('skinTone', color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        config.skinTone === color ? 'border-pink-500 scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showNudity}
                    onChange={(e) => updateConfig('showNudity', e.target.checked)}
                    className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-white">Show Nudity (18+)</span>
                    <p className="text-xs text-white/60">Toggle clothing on/off</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={config.useAnimeShader}
                    onChange={(e) => updateConfig('useAnimeShader', e.target.checked)}
                    className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-white">Anime Cel-Shading</span>
                    <p className="text-xs text-white/60">Code Vein / Nikke style rendering</p>
                  </div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 3D Viewport */}
      <div className="h-screen w-full">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50} />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-3, 2, -3]} intensity={0.6} color="#ff69b4" />
          <pointLight position={[3, 2, 3]} intensity={0.6} color="#8b5cf6" />
          
          <Environment preset="sunset" />
          
          <Suspense fallback={null}>
            <ParametricCharacter config={config} />
          </Suspense>
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#2d1b4e" />
          </mesh>
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={6}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
        </Canvas>
      </div>
      
      {/* Status Bar */}
      <div className="absolute bottom-6 right-6 z-10 bg-black/70 backdrop-blur-lg rounded-xl p-4 border border-pink-500/30">
        <div className="flex items-center space-x-4 text-sm">
          <div>
            <span className="text-white/60">FPS:</span>
            <span className="text-pink-300 ml-2 font-mono">60</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div>
            <span className="text-white/60">Physics:</span>
            <span className="text-green-400 ml-2">✓ Active</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div>
            <span className="text-white/60">Nudity:</span>
            <span className={config.showNudity ? 'text-pink-400 ml-2' : 'text-white/40 ml-2'}>
              {config.showNudity ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

