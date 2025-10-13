'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import {
  ProceduralCharacterGenerator,
  type ProceduralCharacterConfig,
} from '@/lib/avatar/procedural-generator';
import { GLBCharacterImporter, VRoidImporter } from '@/lib/avatar/glb-importer';
import { VerletPhysicsEngine } from '@/lib/avatar/verlet-physics';
import { HairPhysicsSystem, HairStrand } from '@/lib/physics/hair-physics';
import { ClothPhysicsSystem, ClothMesh } from '@/lib/physics/cloth-physics';
import {
  useAdultGating,
  AgeVerificationModal,
  ContentLevelSelector,
} from '@/lib/avatar/adult-gating';
import AvatarEditor from './AvatarEditor';

// Types for the integrated avatar system
interface AvatarSystemProps {
  onClose: () => void;
  onSave: (config: ProceduralCharacterConfig) => void;
  initialConfig?: ProceduralCharacterConfig;
  enablePhysics?: boolean;
  enableAdultContent?: boolean;
}

// Main avatar system component
export default function AvatarSystem({
  onClose,
  onSave,
  initialConfig,
  enablePhysics = false,
  enableAdultContent = false,
}: AvatarSystemProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'import'>('view');
  const [character, setCharacter] = useState<THREE.Group | null>(null);
  const [hairStrands, setHairStrands] = useState<HairStrand[]>([]);
  const [clothMeshes, setClothMeshes] = useState<ClothMesh[]>([]);
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

  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(enablePhysics);
  const [isAdultMode, setIsAdultMode] = useState(enableAdultContent);

  // Adult gating
  const {
    adultStatus,
    loading: adultLoading,
    verifyAge,
    setContentLevel,
    setPhysicsLevel,
    canAccessContent: _canAccessContent,
    getAvailableContent: _getAvailableContent,
  } = useAdultGating();

  // Refs for systems
  const generatorRef = useRef<ProceduralCharacterGenerator | null>(null);
  const importerRef = useRef<GLBCharacterImporter | null>(null);
  const vroidImporterRef = useRef<VRoidImporter | null>(null);
  const physicsEngineRef = useRef<VerletPhysicsEngine | null>(null);
  const hairSystemRef = useRef<HairPhysicsSystem | null>(null);
  const clothSystemRef = useRef<ClothPhysicsSystem | null>(null);

  // Initialize systems
  useEffect(() => {
    generatorRef.current = new ProceduralCharacterGenerator();
    importerRef.current = new GLBCharacterImporter();
    vroidImporterRef.current = new VRoidImporter();
    physicsEngineRef.current = new VerletPhysicsEngine();
    hairSystemRef.current = new HairPhysicsSystem();
    clothSystemRef.current = new ClothPhysicsSystem();

    generateCharacter();
  }, []);

  // Generate character
  const generateCharacter = useCallback(async () => {
    if (!generatorRef.current) return;

    try {
      const character = generatorRef.current.generateCharacter(config);
      setCharacter(character);

      // Generate hair if physics is enabled
      if (isPhysicsEnabled && config.hair.style !== 'short') {
        await generateHair();
      }

      // Generate clothing if physics is enabled
      if (isPhysicsEnabled) {
        await generateClothing();
      }
    } catch (error) {
      console.error('Error generating character:', error);
    }
  }, [config, isPhysicsEnabled]);

  // Generate hair strands
  const generateHair = useCallback(async () => {
    if (!hairSystemRef.current) return;

    try {
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

        // Create and add strand manually
        const strand = new HairStrand(
          rootPosition.x,
          rootPosition.y,
          8, // segmentCount
          length / 8, // segmentLength
          config.hair.color,
          2, // thickness
        );
        hairSystemRef.current.addStrand(strand);

        strands.push(strand);
      }

      setHairStrands(strands);
    } catch (error) {
      console.error('Error generating hair:', error);
    }
  }, [config.hair]);

  // Generate clothing
  const generateClothing = useCallback(async () => {
    if (!clothSystemRef.current) return;

    try {
      // Create cloth mesh manually
      const cloth = new ClothMesh(
        0, // startX
        0, // startY
        0.8, // width
        1.2, // height
        16, // cols
        20, // rows
        '#FF6B9D', // color
        0.8, // opacity
      );
      clothSystemRef.current.addMesh(cloth);

      setClothMeshes([cloth]);
    } catch (error) {
      console.error('Error generating clothing:', error);
    }
  }, []);

  // Handle physics toggle
  const handlePhysicsToggle = async () => {
    if (isAdultMode && !adultStatus?.isVerified) {
      setShowAgeVerification(true);
      return;
    }

    setIsPhysicsEnabled(!isPhysicsEnabled);

    if (!isPhysicsEnabled) {
      await generateHair();
      await generateClothing();
    } else {
      setHairStrands([]);
      setClothMeshes([]);
    }
  };

  // Handle adult mode toggle
  const handleAdultModeToggle = async () => {
    if (!isAdultMode && !adultStatus?.isVerified) {
      setShowAgeVerification(true);
      return;
    }

    setIsAdultMode(!isAdultMode);
  };

  // Handle age verification
  const handleAgeVerification = async (age: number) => {
    const success = await verifyAge(age);
    if (success) {
      setShowAgeVerification(false);
      setIsAdultMode(true);
    }
  };

  // Handle content level change
  const handleContentLevelChange = async (level: 'mild' | 'moderate' | 'explicit') => {
    await setContentLevel(level);
  };

  // Handle physics level change
  const handlePhysicsLevelChange = async (level: 'basic' | 'enhanced' | 'realistic') => {
    await setPhysicsLevel(level);
  };

  // Handle GLB import
  const handleGLBImport = async (file: File) => {
    if (!importerRef.current) return;

    try {
      const importedCharacter = await importerRef.current.loadFromFile(file, {
        scale: 1.0,
        enablePhysics: isPhysicsEnabled,
        enableMorphTargets: true,
      });

      setCharacter(importedCharacter.model);
    } catch (error) {
      console.error('Error importing GLB:', error);
    }
  };

  // Handle VRoid import
  const handleVRoidImport = async (file: File) => {
    if (!vroidImporterRef.current) return;

    try {
      const importedCharacter = await vroidImporterRef.current.loadFromFile(file, {
        scale: 1.0,
        enablePhysics: isPhysicsEnabled,
        enableMorphTargets: true,
      });

      setCharacter(importedCharacter.model);
    } catch (error) {
      console.error('Error importing VRoid:', error);
    }
  };

  // Update character when config changes
  useEffect(() => {
    generateCharacter();
  }, [config, generateCharacter]);

  // Physics update loop
  useFrame((state, delta) => {
    if (isPhysicsEnabled && physicsEngineRef.current) {
      physicsEngineRef.current.update(delta);
    }
  });

  if (adultLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-white">Loading avatar system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />

          <Environment preset="studio" />

          {character && <primitive object={character} />}

          {/* Render hair strands with physics */}
          {hairStrands.map((strand, idx) => (
            <primitive key={`hair-${idx}`} object={strand} />
          ))}

          {/* Render cloth meshes with physics */}
          {clothMeshes.map((cloth, idx) => (
            <primitive key={`cloth-${idx}`} object={cloth} />
          ))}

          <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={10} blur={1.5} />
          <OrbitControls enablePan={false} enableZoom={true} minDistance={1.5} maxDistance={5} />
        </Canvas>

        {/* Viewport Controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={handlePhysicsToggle}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isPhysicsEnabled ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
            }`}
          >
            Physics: {isPhysicsEnabled ? 'ON' : 'OFF'}
          </button>

          {enableAdultContent && (
            <button
              onClick={handleAdultModeToggle}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isAdultMode ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
              }`}
            >
              Adult: {isAdultMode ? 'ON' : 'OFF'}
            </button>
          )}
        </div>

        {/* Mode Selector */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setMode('view')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              mode === 'view' ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
            }`}
          >
            View
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              mode === 'edit' ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setMode('import')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              mode === 'import' ? 'bg-pink-500 text-white' : 'bg-white/20 text-white'
            }`}
          >
            Import
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-black/90 backdrop-blur-lg border-l border-white/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Avatar System</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              ✕
            </button>
          </div>
        </div>

        {/* Content based on mode */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'view' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Character View</h3>
              <p className="text-white/70">
                View your character with physics and adult content controls.
              </p>

              {/* Adult content controls */}
              {enableAdultContent && adultStatus && (
                <div className="space-y-4">
                  <ContentLevelSelector
                    currentLevel={adultStatus.contentLevel}
                    onLevelChange={handleContentLevelChange}
                  />

                  <div className="space-y-2">
                    <label
                      htmlFor="physics-level-select"
                      className="block text-sm font-medium text-white"
                    >
                      Physics Level
                    </label>
                    <select
                      id="physics-level-select"
                      value={adultStatus.physicsLevel || 'basic'}
                      onChange={(e) => handlePhysicsLevelChange(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="basic">Basic</option>
                      <option value="enhanced">Enhanced</option>
                      <option value="realistic">Realistic</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'edit' && (
            <AvatarEditor
              onClose={() => setMode('view')}
              onSave={(newConfig) => {
                setConfig(newConfig);
                onSave(newConfig);
              }}
              initialConfig={config}
            />
          )}

          {mode === 'import' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Import Character</h3>

              <div className="space-y-2">
                <label htmlFor="glb-file-input" className="block text-sm font-medium text-white">
                  GLB File
                </label>
                <input
                  id="glb-file-input"
                  type="file"
                  accept=".glb"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleGLBImport(file);
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="vroid-file-input" className="block text-sm font-medium text-white">
                  VRoid File
                </label>
                <input
                  id="vroid-file-input"
                  type="file"
                  accept=".glb"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVRoidImport(file);
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <p className="text-white/70 text-sm">
                Import characters from GLB files or VRoid Studio exports.
              </p>
            </div>
          )}
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

      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={showAgeVerification}
        onClose={() => setShowAgeVerification(false)}
        onVerify={handleAgeVerification}
      />
    </div>
  );
}
