'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AvatarRenderer as R3FAvatarRenderer } from './AvatarRenderer.safe';
import type { UltraDetailedCharacterParams } from './UltraDetailedCharacterCreator.safe';

interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  gender: 'male' | 'female';
  thumbnail?: string;
  configData: Partial<UltraDetailedCharacterParams>;
}

interface PresetSelectorProps {
  onSelectPreset: (preset: CharacterPreset) => void;
  onStartFromScratch: () => void;
}

// Code Vein-quality presets - diverse, polished starting characters
const DEFAULT_PRESETS: CharacterPreset[] = [
  // Female Presets
  {
    id: 'anime-hero-f',
    name: 'Anime Hero',
    description: 'Classic shonen protagonist - bold and determined',
    category: 'hero',
    gender: 'female',
    configData: {
      gender: 'female',
      age: 'young-adult',
      body: {
        height: 1.05,
        weight: 0.9,
        muscleMass: 0.7,
        bodyFat: 0.3,
        proportions: {
          headSize: 0.95,
          neckLength: 1.0,
          shoulderWidth: 1.1,
          chestSize: 0.85,
          waistSize: 0.8,
          hipWidth: 0.9,
          armLength: 1.05,
          legLength: 1.1,
        },
        genderFeatures: {
          breastSize: 0.7,
          hipCurve: 0.8,
          waistDefinition: 0.9,
        },
      },
      face: {
        faceShape: {
          overall: 0.6,
          jawline: 0.7,
          cheekbones: 0.7,
          chinShape: 0.6,
        },
        eyes: {
          size: 1.2,
          spacing: 1.0,
          height: 1.0,
          angle: 0.0,
          eyelidShape: 0.5,
          eyeColor: '#4A90E2',
          eyebrowThickness: 0.9,
          eyebrowAngle: 0.1,
        },
        nose: {
          size: 0.9,
          width: 0.9,
          height: 1.0,
          bridgeWidth: 0.8,
          nostrilSize: 0.9,
          noseTip: 0.5,
        },
        mouth: {
          size: 1.0,
          width: 1.0,
          lipThickness: 0.8,
          lipShape: 0.6,
          cupidBow: 0.7,
          mouthAngle: 0.0,
        },
        skin: {
          tone: '#FFDBAC',
          texture: 0.5,
          blemishes: 0.0,
          freckles: 0.0,
          ageSpots: 0.0,
          wrinkles: 0.0,
        },
      },
      hair: {
        style: 'spiky',
        length: 0.7,
        volume: 1.0,
        texture: 0.3,
        color: {
          primary: '#FF6B9D',
        },
        highlights: {
          enabled: true,
          color: '#FFB6C1',
          intensity: 0.5,
          pattern: 'streaks',
        },
        accessories: [],
      },
      materials: {
        shader: 'AnimeToon',
        parameters: {
          glossStrength: 0.6,
          rimStrength: 0.4,
          colorA: '#FF6B9D',
          colorB: '#FFB6C1',
          rimColor: '#FFD700',
          metallic: 0.1,
          roughness: 0.3,
        },
        textures: {
          albedo: undefined,
          normal: undefined,
          orm: undefined,
          mask: undefined,
          decals: undefined,
        },
      },
    },
  },
  {
    id: 'kawaii-idol-f',
    name: 'Kawaii Idol',
    description: 'Cute and bubbly - perfect for cheerful moments',
    category: 'cute',
    gender: 'female',
    configData: {
      gender: 'female',
      age: 'teen',
      body: {
        height: 0.95,
        weight: 0.85,
        muscleMass: 0.3,
        bodyFat: 0.4,
        proportions: {
          headSize: 1.1,
          neckLength: 0.9,
          shoulderWidth: 0.85,
          chestSize: 0.75,
          waistSize: 0.75,
          hipWidth: 0.9,
          armLength: 0.95,
          legLength: 0.95,
        },
        genderFeatures: {
          breastSize: 0.6,
          hipCurve: 0.9,
          waistDefinition: 0.7,
        },
      },
      face: {
        faceShape: {
          overall: 0.3,
          jawline: 0.3,
          cheekbones: 0.4,
          chinShape: 0.2,
        },
        eyes: {
          size: 1.3,
          spacing: 1.1,
          height: 1.1,
          angle: -0.1,
          eyelidShape: 0.3,
          eyeColor: '#FF69B4',
          eyebrowThickness: 0.7,
          eyebrowAngle: -0.1,
        },
        nose: {
          size: 0.8,
          width: 0.85,
          height: 0.9,
          bridgeWidth: 0.7,
          nostrilSize: 0.8,
          noseTip: 0.3,
        },
        mouth: {
          size: 0.9,
          width: 0.9,
          lipThickness: 1.0,
          lipShape: 0.8,
          cupidBow: 0.9,
          mouthAngle: 0.1,
        },
        skin: {
          tone: '#FFE4B5',
          texture: 0.3,
          blemishes: 0.0,
          freckles: 0.2,
          ageSpots: 0.0,
          wrinkles: 0.0,
        },
      },
      hair: {
        style: 'twin-tails',
        length: 1.0,
        volume: 1.2,
        texture: 0.2,
        color: {
          primary: '#FFB6C1',
        },
        highlights: {
          enabled: true,
          color: '#FFFFFF',
          intensity: 0.7,
          pattern: 'tips',
        },
        accessories: [],
      },
      materials: {
        shader: 'AnimeToon',
        parameters: {
          glossStrength: 0.8,
          rimStrength: 0.5,
          colorA: '#FFB6C1',
          colorB: '#FFFFFF',
          rimColor: '#FFD700',
          metallic: 0.05,
          roughness: 0.2,
        },
        textures: {
          albedo: undefined,
          normal: undefined,
          orm: undefined,
          mask: undefined,
          decals: undefined,
        },
      },
    },
  },
  {
    id: 'cool-beauty-f',
    name: 'Cool Beauty',
    description: 'Mysterious and elegant - sophisticated charm',
    category: 'elegant',
    gender: 'female',
    configData: {
      gender: 'female',
      age: 'adult',
      body: {
        height: 1.0,
        weight: 0.9,
        muscleMass: 0.4,
        bodyFat: 0.35,
        proportions: {
          headSize: 1.0,
          neckLength: 1.1,
          shoulderWidth: 0.9,
          chestSize: 0.9,
          waistSize: 0.75,
          hipWidth: 0.95,
          armLength: 1.0,
          legLength: 1.05,
        },
        genderFeatures: {
          breastSize: 0.85,
          hipCurve: 0.9,
          waistDefinition: 0.95,
        },
      },
      face: {
        faceShape: {
          overall: 0.7,
          jawline: 0.6,
          cheekbones: 0.8,
          chinShape: 0.7,
        },
        eyes: {
          size: 1.1,
          spacing: 0.95,
          height: 0.95,
          angle: 0.1,
          eyelidShape: 0.7,
          eyeColor: '#8B4C89',
          eyebrowThickness: 0.8,
          eyebrowAngle: 0.15,
        },
        nose: {
          size: 0.95,
          width: 0.9,
          height: 1.05,
          bridgeWidth: 0.85,
          nostrilSize: 0.9,
          noseTip: 0.6,
        },
        mouth: {
          size: 0.95,
          width: 0.95,
          lipThickness: 0.9,
          lipShape: 0.7,
          cupidBow: 0.8,
          mouthAngle: -0.05,
        },
        skin: {
          tone: '#F5DEB3',
          texture: 0.6,
          blemishes: 0.0,
          freckles: 0.0,
          ageSpots: 0.0,
          wrinkles: 0.0,
        },
      },
      hair: {
        style: 'long-straight',
        length: 1.0,
        volume: 1.0,
        texture: 0.1,
        color: {
          primary: '#2C1810',
        },
        highlights: {
          enabled: true,
          color: '#4A4A4A',
          intensity: 0.4,
          pattern: 'streaks',
        },
        accessories: [],
      },
      materials: {
        shader: 'AnimeToon',
        parameters: {
          glossStrength: 0.7,
          rimStrength: 0.4,
          colorA: '#2C1810',
          colorB: '#4A4A4A',
          rimColor: '#8B4C89',
          metallic: 0.15,
          roughness: 0.25,
        },
        textures: {
          albedo: undefined,
          normal: undefined,
          orm: undefined,
          mask: undefined,
          decals: undefined,
        },
      },
    },
  },
  // Male Presets
  {
    id: 'anime-hero-m',
    name: 'Anime Hero',
    description: 'Classic shonen protagonist - strong and determined',
    category: 'hero',
    gender: 'male',
    configData: {
      gender: 'male',
      age: 'young-adult',
      body: {
        height: 1.1,
        weight: 1.0,
        muscleMass: 0.8,
        bodyFat: 0.2,
        proportions: {
          headSize: 0.95,
          neckLength: 1.1,
          shoulderWidth: 1.2,
          chestSize: 1.1,
          waistSize: 0.85,
          hipWidth: 0.9,
          armLength: 1.1,
          legLength: 1.15,
        },
        genderFeatures: {
          jawStrength: 1.1,
          browRidge: 1.0,
        },
      },
      face: {
        faceShape: {
          overall: 0.7,
          jawline: 0.8,
          cheekbones: 0.7,
          chinShape: 0.8,
        },
        eyes: {
          size: 1.0,
          spacing: 1.0,
          height: 0.95,
          angle: 0.0,
          eyelidShape: 0.6,
          eyeColor: '#4A90E2',
          eyebrowThickness: 1.1,
          eyebrowAngle: 0.1,
        },
        nose: {
          size: 1.0,
          width: 1.0,
          height: 1.05,
          bridgeWidth: 1.0,
          nostrilSize: 1.0,
          noseTip: 0.6,
        },
        mouth: {
          size: 1.0,
          width: 1.0,
          lipThickness: 0.7,
          lipShape: 0.5,
          cupidBow: 0.5,
          mouthAngle: 0.0,
        },
        skin: {
          tone: '#FFDBAC',
          texture: 0.5,
          blemishes: 0.0,
          freckles: 0.0,
          ageSpots: 0.0,
          wrinkles: 0.0,
        },
      },
      hair: {
        style: 'spiky',
        length: 0.7,
        volume: 1.0,
        texture: 0.3,
        color: {
          primary: '#FF6B9D',
        },
        highlights: {
          enabled: true,
          color: '#FFB6C1',
          intensity: 0.5,
          pattern: 'streaks',
        },
        accessories: [],
      },
      materials: {
        shader: 'AnimeToon',
        parameters: {
          glossStrength: 0.6,
          rimStrength: 0.4,
          colorA: '#FF6B9D',
          colorB: '#FFB6C1',
          rimColor: '#FFD700',
          metallic: 0.1,
          roughness: 0.3,
        },
        textures: {
          albedo: undefined,
          normal: undefined,
          orm: undefined,
          mask: undefined,
          decals: undefined,
        },
      },
    },
  },
];

export function PresetSelector({ onSelectPreset, onStartFromScratch }: PresetSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<CharacterPreset | null>(null);
  const [previewConfig, setPreviewConfig] = useState<Partial<UltraDetailedCharacterParams> | null>(null);

  // Load presets from API (fallback to defaults)
  const { data: apiPresets } = useQuery({
    queryKey: ['character-presets'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/character/presets');
        if (!res.ok) return DEFAULT_PRESETS;
        const data = await res.json();
        return data.ok ? data.data : DEFAULT_PRESETS;
      } catch {
        return DEFAULT_PRESETS;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const presets = apiPresets || DEFAULT_PRESETS;

  const handlePresetHover = useCallback((preset: CharacterPreset) => {
    setSelectedPreset(preset);
    setPreviewConfig(preset.configData as Partial<UltraDetailedCharacterParams>);
  }, []);

  const handleSelectPreset = useCallback((preset: CharacterPreset) => {
    onSelectPreset(preset);
  }, [onSelectPreset]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Character Creator</h1>
        <p className="text-purple-200">Choose a starting point or create from scratch</p>
      </motion.div>

      <div className="flex gap-8 w-full max-w-7xl">
        {/* Preset Grid */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            {presets.map((preset: CharacterPreset) => (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => handlePresetHover(preset)}
                onClick={() => {
                  handleSelectPreset(preset);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedPreset?.id === preset.id
                    ? 'border-pink-500 bg-pink-500/20'
                    : 'border-purple-500/50 bg-purple-900/30 hover:border-pink-400'
                }`}
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">{preset.name}</h3>
                  <p className="text-sm text-purple-200 mb-2">{preset.description}</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs rounded bg-purple-700 text-purple-100">
                      {preset.category}
                    </span>
                    <span className="px-2 py-1 text-xs rounded bg-pink-700 text-pink-100">
                      {preset.gender}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Start from Scratch Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onStartFromScratch();
            }}
            className="mt-6 w-full px-6 py-3 rounded-xl border-2 border-purple-400 bg-purple-800/50 hover:bg-purple-700/50 text-white font-semibold transition-all"
          >
            Start from Scratch
          </motion.button>
        </div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-96 h-[600px] rounded-xl border-2 border-purple-500/50 bg-purple-900/50 p-4"
        >
          {previewConfig ? (
            <div className="w-full h-full relative">
              <R3FAvatarRenderer
                config={previewConfig}
                size="lg"
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-purple-300">
              Hover over a preset to preview
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

