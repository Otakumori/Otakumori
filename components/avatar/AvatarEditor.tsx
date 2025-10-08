'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import {
  ProceduralCharacterGenerator,
  type ProceduralCharacterConfig,
} from '@/lib/avatar/procedural-generator';
import { createCharacterPartMaterial } from '@/lib/avatar/anime-toon-material';
import {
  VerletPhysicsEngine,
  HairPhysicsSystem,
  ClothPhysicsSystem,
} from '@/lib/avatar/verlet-physics';

// Types for avatar editor
interface AvatarEditorProps {
  onClose: () => void;
  onSave: (config: ProceduralCharacterConfig) => void;
  initialConfig?: ProceduralCharacterConfig;
}

interface SliderConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  category: string;
  description?: string;
}

// Avatar Editor Component
export default function AvatarEditor({ onClose, onSave, initialConfig }: AvatarEditorProps) {
  const [config, setConfig] = useState<ProceduralCharacterConfig>(
    initialConfig || {
      gender: 'female',
      age: 'young-adult',
      body: {
        height: 0.95,
        weight: 0.6,
        muscleMass: 0.3,
        bodyFat: 0.4,
        shoulderWidth: 0.8,
        waistSize: 0.7,
        hipWidth: 1.1,
      },
      face: {
        faceShape: 0.4,
        jawline: 0.3,
        cheekbones: 0.7,
        eyeSize: 1.1,
        noseSize: 0.9,
        mouthSize: 1.0,
      },
      hair: {
        style: 'long',
        color: '#8B4513',
        texture: 'wavy',
      },
      materials: {
        skinTone: '#fdbcb4',
        eyeColor: '#4a90e2',
        lipColor: '#d4a574',
      },
    },
  );

  const [activeTab, setActiveTab] = useState('body');
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(false);
  const [isAdultMode, setIsAdultMode] = useState(false);
  const [characterMesh, setCharacterMesh] = useState<THREE.Group | null>(null);
  const [_hairStrands, _setHairStrands] = useState<any[]>([]);
  const [_clothMeshes, _setClothMeshes] = useState<any[]>([]);

  const generatorRef = useRef<ProceduralCharacterGenerator | null>(null);
  const physicsEngineRef = useRef<VerletPhysicsEngine | null>(null);
  const hairSystemRef = useRef<HairPhysicsSystem | null>(null);
  const clothSystemRef = useRef<ClothPhysicsSystem | null>(null);

  // Initialize systems
  useEffect(() => {
    generatorRef.current = new ProceduralCharacterGenerator();
    physicsEngineRef.current = new VerletPhysicsEngine();
    hairSystemRef.current = new HairPhysicsSystem(physicsEngineRef.current);
    clothSystemRef.current = new ClothPhysicsSystem(physicsEngineRef.current);

    generateCharacter();
  }, []);

  // Generate character mesh
  const generateCharacter = useCallback(() => {
    if (!generatorRef.current) return;

    const character = generatorRef.current.generateCharacter(config);
    setCharacterMesh(character);

    // Generate hair if enabled
    if (config.hair.style !== 'short') {
      generateHair();
    }

    // Generate clothing
    generateClothing();
  }, [config]);

  // Generate hair strands
  const generateHair = useCallback(() => {
    if (!hairSystemRef.current) return;

    const strands: any[] = [];
    const hairCount =
      config.hair.style === 'very-long' ? 200 : config.hair.style === 'long' ? 150 : 100;

    for (let i = 0; i < hairCount; i++) {
      const angle = (i / hairCount) * Math.PI * 2;
      const radius = 0.1 + Math.random() * 0.05;
      const rootPosition = new THREE.Vector3(
        Math.cos(angle) * radius,
        1.6,
        Math.sin(angle) * radius,
      );

      const direction = new THREE.Vector3(
        Math.cos(angle) * 0.1,
        -1,
        Math.sin(angle) * 0.1,
      ).normalize();

      const length =
        config.hair.style === 'very-long' ? 0.8 : config.hair.style === 'long' ? 0.6 : 0.4;

      const strand = hairSystemRef.current.addHairStrand(
        rootPosition,
        direction,
        length,
        8,
        0.01,
        config.hair.color,
      );

      strands.push(strand);
    }

    setHairStrands(strands);
  }, [config.hair]);

  // Generate clothing
  const generateClothing = useCallback(() => {
    if (!clothSystemRef.current) return;

    const cloth = clothSystemRef.current.addClothMesh(
      0.8,
      1.2,
      16,
      20,
      createCharacterPartMaterial('clothing', '#FF6B9D'),
    );

    setClothMeshes([cloth]);
  }, []);

  // Update character when config changes
  useEffect(() => {
    generateCharacter();
  }, [config, generateCharacter]);

  // Create slider configuration
  const createSliders = (): SliderConfig[] => {
    const sliders: SliderConfig[] = [];

    // Body sliders
    sliders.push(
      {
        id: 'height',
        label: 'Height',
        min: 0.7,
        max: 1.3,
        step: 0.01,
        value: config.body.height,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, body: { ...prev.body, height: value } })),
        category: 'body',
        description: 'Overall character height',
      },
      {
        id: 'weight',
        label: 'Weight',
        min: 0.4,
        max: 1.6,
        step: 0.01,
        value: config.body.weight,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, body: { ...prev.body, weight: value } })),
        category: 'body',
        description: 'Overall body weight',
      },
      {
        id: 'muscleMass',
        label: 'Muscle Mass',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: config.body.muscleMass,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, body: { ...prev.body, muscleMass: value } })),
        category: 'body',
        description: 'Muscle definition and size',
      },
      {
        id: 'bodyFat',
        label: 'Body Fat',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: config.body.bodyFat,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, body: { ...prev.body, bodyFat: value } })),
        category: 'body',
        description: 'Body fat percentage',
      },
      {
        id: 'shoulderWidth',
        label: 'Shoulder Width',
        min: 0.6,
        max: 1.4,
        step: 0.01,
        value: config.body.shoulderWidth,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, body: { ...prev.body, shoulderWidth: value } })),
        category: 'body',
        description: 'Width of shoulders',
      },
      {
        id: 'waistSize',
        label: 'Waist Size',
        min: 0.5,
        max: 1.3,
        step: 0.01,
        value: config.body.waistSize,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, body: { ...prev.body, waistSize: value } })),
        category: 'body',
        description: 'Waist circumference',
      },
      {
        id: 'hipWidth',
        label: 'Hip Width',
        min: 0.6,
        max: 1.4,
        step: 0.01,
        value: config.body.hipWidth,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, body: { ...prev.body, hipWidth: value } })),
        category: 'body',
        description: 'Hip width and shape',
      },
    );

    // Face sliders
    sliders.push(
      {
        id: 'faceShape',
        label: 'Face Shape',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: config.face.faceShape,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, face: { ...prev.face, faceShape: value } })),
        category: 'face',
        description: 'Round to angular face shape',
      },
      {
        id: 'jawline',
        label: 'Jawline',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: config.face.jawline,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, face: { ...prev.face, jawline: value } })),
        category: 'face',
        description: 'Soft to sharp jawline',
      },
      {
        id: 'cheekbones',
        label: 'Cheekbones',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: config.face.cheekbones,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, face: { ...prev.face, cheekbones: value } })),
        category: 'face',
        description: 'Flat to prominent cheekbones',
      },
      {
        id: 'eyeSize',
        label: 'Eye Size',
        min: 0.7,
        max: 1.3,
        step: 0.01,
        value: config.face.eyeSize,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, face: { ...prev.face, eyeSize: value } })),
        category: 'face',
        description: 'Size of eyes',
      },
      {
        id: 'noseSize',
        label: 'Nose Size',
        min: 0.7,
        max: 1.3,
        step: 0.01,
        value: config.face.noseSize,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, face: { ...prev.face, noseSize: value } })),
        category: 'face',
        description: 'Size of nose',
      },
      {
        id: 'mouthSize',
        label: 'Mouth Size',
        min: 0.7,
        max: 1.3,
        step: 0.01,
        value: config.face.mouthSize,
        onChange: (value) =>
          setConfig((prev) => ({ ...prev, face: { ...prev.face, mouthSize: value } })),
        category: 'face',
        description: 'Size of mouth',
      },
    );

    // Add more sliders for detailed customization
    const additionalSliders = [
      // Head proportions
      {
        id: 'headSize',
        label: 'Head Size',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'head',
      },
      {
        id: 'neckLength',
        label: 'Neck Length',
        min: 0.7,
        max: 1.3,
        step: 0.01,
        value: 1.0,
        category: 'head',
      },
      {
        id: 'headWidth',
        label: 'Head Width',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'head',
      },

      // Eye details
      {
        id: 'eyeSpacing',
        label: 'Eye Spacing',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'eyes',
      },
      {
        id: 'eyeHeight',
        label: 'Eye Height',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'eyes',
      },
      {
        id: 'eyeAngle',
        label: 'Eye Angle',
        min: -0.3,
        max: 0.3,
        step: 0.01,
        value: 0.0,
        category: 'eyes',
      },
      {
        id: 'eyelidShape',
        label: 'Eyelid Shape',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: 0.5,
        category: 'eyes',
      },
      {
        id: 'eyebrowThickness',
        label: 'Eyebrow Thickness',
        min: 0.5,
        max: 1.5,
        step: 0.01,
        value: 1.0,
        category: 'eyes',
      },
      {
        id: 'eyebrowAngle',
        label: 'Eyebrow Angle',
        min: -0.2,
        max: 0.2,
        step: 0.01,
        value: 0.0,
        category: 'eyes',
      },

      // Nose details
      {
        id: 'noseWidth',
        label: 'Nose Width',
        min: 0.7,
        max: 1.3,
        step: 0.01,
        value: 1.0,
        category: 'nose',
      },
      {
        id: 'noseHeight',
        label: 'Nose Height',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'nose',
      },
      {
        id: 'bridgeWidth',
        label: 'Bridge Width',
        min: 0.5,
        max: 1.3,
        step: 0.01,
        value: 1.0,
        category: 'nose',
      },
      {
        id: 'nostrilSize',
        label: 'Nostril Size',
        min: 0.7,
        max: 1.3,
        step: 0.01,
        value: 1.0,
        category: 'nose',
      },
      {
        id: 'noseTip',
        label: 'Nose Tip',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: 0.5,
        category: 'nose',
      },

      // Mouth details
      {
        id: 'mouthWidth',
        label: 'Mouth Width',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'mouth',
      },
      {
        id: 'lipThickness',
        label: 'Lip Thickness',
        min: 0.5,
        max: 1.5,
        step: 0.01,
        value: 1.0,
        category: 'mouth',
      },
      {
        id: 'lipShape',
        label: 'Lip Shape',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: 0.5,
        category: 'mouth',
      },
      {
        id: 'cupidBow',
        label: 'Cupid Bow',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: 0.5,
        category: 'mouth',
      },
      {
        id: 'mouthAngle',
        label: 'Mouth Angle',
        min: -0.2,
        max: 0.2,
        step: 0.01,
        value: 0.0,
        category: 'mouth',
      },

      // Body details
      {
        id: 'chestSize',
        label: 'Chest Size',
        min: 0.6,
        max: 1.4,
        step: 0.01,
        value: 1.0,
        category: 'body',
      },
      {
        id: 'armLength',
        label: 'Arm Length',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'body',
      },
      {
        id: 'legLength',
        label: 'Leg Length',
        min: 0.8,
        max: 1.3,
        step: 0.01,
        value: 1.0,
        category: 'body',
      },
      {
        id: 'handSize',
        label: 'Hand Size',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'body',
      },
      {
        id: 'footSize',
        label: 'Foot Size',
        min: 0.8,
        max: 1.2,
        step: 0.01,
        value: 1.0,
        category: 'body',
      },

      // Hair details
      {
        id: 'hairLength',
        label: 'Hair Length',
        min: 0.5,
        max: 1.5,
        step: 0.01,
        value: 1.0,
        category: 'hair',
      },
      {
        id: 'hairThickness',
        label: 'Hair Thickness',
        min: 0.5,
        max: 1.5,
        step: 0.01,
        value: 1.0,
        category: 'hair',
      },
      {
        id: 'hairDensity',
        label: 'Hair Density',
        min: 0.5,
        max: 1.5,
        step: 0.01,
        value: 1.0,
        category: 'hair',
      },
      {
        id: 'hairTexture',
        label: 'Hair Texture',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: 0.5,
        category: 'hair',
      },

      // Material properties
      {
        id: 'skinRoughness',
        label: 'Skin Roughness',
        min: 0.1,
        max: 1.0,
        step: 0.01,
        value: 0.8,
        category: 'materials',
      },
      {
        id: 'skinMetallic',
        label: 'Skin Metallic',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: 0.1,
        category: 'materials',
      },
      {
        id: 'rimIntensity',
        label: 'Rim Intensity',
        min: 0.0,
        max: 1.0,
        step: 0.01,
        value: 0.3,
        category: 'materials',
      },
      {
        id: 'toonSteps',
        label: 'Toon Steps',
        min: 2,
        max: 8,
        step: 1,
        value: 3,
        category: 'materials',
      },

      // Physics properties
      {
        id: 'hairStiffness',
        label: 'Hair Stiffness',
        min: 0.1,
        max: 1.0,
        step: 0.01,
        value: 0.5,
        category: 'physics',
      },
      {
        id: 'hairDamping',
        label: 'Hair Damping',
        min: 0.1,
        max: 1.0,
        step: 0.01,
        value: 0.8,
        category: 'physics',
      },
      {
        id: 'clothStiffness',
        label: 'Cloth Stiffness',
        min: 0.1,
        max: 1.0,
        step: 0.01,
        value: 0.7,
        category: 'physics',
      },
      {
        id: 'clothDamping',
        label: 'Cloth Damping',
        min: 0.1,
        max: 1.0,
        step: 0.01,
        value: 0.9,
        category: 'physics',
      },
      {
        id: 'windIntensity',
        label: 'Wind Intensity',
        min: 0.0,
        max: 2.0,
        step: 0.01,
        value: 0.5,
        category: 'physics',
      },
    ];

    // Add additional sliders
    additionalSliders.forEach((slider) => {
      sliders.push({
        ...slider,
        onChange: (_value) => {
          // For now, just log the change
          // TODO: Implement slider change handler
          // console.log(`${slider.id}: ${value}`);
        },
        description: `Adjust ${slider.label.toLowerCase()}`,
      });
    });

    return sliders;
  };

  const sliders = createSliders();
  const filteredSliders = sliders.filter((slider) => slider.category === activeTab);

  const categories = [
    { id: 'body', label: 'Body', icon: 'BD' },
    { id: 'face', label: 'Face', icon: 'FC' },
    { id: 'head', label: 'Head', icon: 'HD' },
    { id: 'eyes', label: 'Eyes', icon: 'EY' },
    { id: 'nose', label: 'Nose', icon: 'NS' },
    { id: 'mouth', label: 'Mouth', icon: 'MH' },
    { id: 'hair', label: 'Hair', icon: 'HR' },
    { id: 'materials', label: 'Materials', icon: 'MT' },
    { id: 'physics', label: 'Physics', icon: 'PH' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm"
    >
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />

          <Environment preset="studio" />

          {characterMesh && <primitive object={characterMesh} />}

          <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={10} blur={1.5} />
          <OrbitControls enablePan={false} enableZoom={true} minDistance={1.5} maxDistance={5} />
        </Canvas>

        {/* Viewport Controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={() => setIsPhysicsEnabled(!isPhysicsEnabled)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isPhysicsEnabled ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
            }`}
          >
            Physics: {isPhysicsEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setIsAdultMode(!isAdultMode)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isAdultMode ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
            }`}
          >
            Adult: {isAdultMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-black/90 backdrop-blur-lg border-l border-white/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Avatar Editor</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              ✕
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="p-4 border-b border-white/20">
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === category.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg">{category.icon}</div>
                  <div className="text-xs">{category.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredSliders.map((slider) => (
            <div key={slider.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">{slider.label}</label>
                <span className="text-xs text-white/60">{slider.value.toFixed(2)}</span>
              </div>

              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={slider.value}
                onChange={(e) => slider.onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />

              {slider.description && <p className="text-xs text-white/50">{slider.description}</p>}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/20 space-y-2">
          <button
            onClick={() => onSave(config)}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Save Avatar
          </button>

          <button
            onClick={() => generateCharacter()}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>
    </motion.div>
  );
}
