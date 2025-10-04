'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { PhysicsPresetSelector } from './PhysicsPresetSelector.safe';
import { OutfitSelector } from './OutfitSelector.safe';
import { HairCustomizer } from './HairCustomizer.safe';
import { FaceCustomizer } from './FaceCustomizer.safe';
import { BodyCustomizer } from './BodyCustomizer.safe';
import { NSFWCustomizer } from './NSFWCustomizer.safe';
import { MaterialEditor } from './MaterialEditor.safe';
import { InteractionTester } from './InteractionTester.safe';

// Types for the ultra-detailed character system
interface UltraDetailedCharacterParams {
  // Basic Info
  gender: 'male' | 'female';
  age: 'teen' | 'young-adult' | 'adult' | 'mature';

  // Body Anatomy (Code Vein level detail)
  body: {
    height: number; // 0.7 to 1.3
    weight: number; // 0.6 to 1.5
    muscleMass: number; // 0.0 to 1.0
    bodyFat: number; // 0.0 to 1.0

    // Detailed proportions
    proportions: {
      headSize: number; // 0.8 to 1.2
      neckLength: number; // 0.7 to 1.3
      shoulderWidth: number; // 0.7 to 1.4
      chestSize: number; // 0.6 to 1.4
      waistSize: number; // 0.6 to 1.3
      hipWidth: number; // 0.7 to 1.4
      armLength: number; // 0.8 to 1.2
      legLength: number; // 0.8 to 1.3
    };

    // Gender-specific features
    genderFeatures: {
      // Male features
      beardDensity?: number; // 0.0 to 1.0
      chestHair?: number; // 0.0 to 1.0
      jawStrength?: number; // 0.5 to 1.3
      browRidge?: number; // 0.7 to 1.2

      // Female features
      breastSize?: number; // 0.0 to 1.2
      hipCurve?: number; // 0.7 to 1.3
      waistDefinition?: number; // 0.5 to 1.2
      thighGap?: number; // 0.0 to 1.0
    };
  };

  // Facial Features (extremely detailed)
  face: {
    // Face shape
    faceShape: {
      overall: number; // 0.0 to 1.0 (round to angular)
      jawline: number; // 0.0 to 1.0 (soft to sharp)
      cheekbones: number; // 0.0 to 1.0 (flat to prominent)
      chinShape: number; // 0.0 to 1.0 (round to pointed)
    };

    // Eyes
    eyes: {
      size: number; // 0.7 to 1.3
      spacing: number; // 0.8 to 1.2
      height: number; // 0.8 to 1.2
      angle: number; // -0.3 to 0.3
      eyelidShape: number; // 0.0 to 1.0
      eyeColor: string; // Hex color
      eyebrowThickness: number; // 0.5 to 1.5
      eyebrowAngle: number; // -0.2 to 0.2
    };

    // Nose
    nose: {
      size: number; // 0.7 to 1.3
      width: number; // 0.7 to 1.3
      height: number; // 0.8 to 1.2
      bridgeWidth: number; // 0.5 to 1.3
      nostrilSize: number; // 0.7 to 1.3
      noseTip: number; // 0.0 to 1.0 (upturned to downturned)
    };

    // Mouth
    mouth: {
      size: number; // 0.7 to 1.3
      width: number; // 0.8 to 1.2
      lipThickness: number; // 0.5 to 1.5
      lipShape: number; // 0.0 to 1.0 (thin to full)
      cupidBow: number; // 0.0 to 1.0 (flat to defined)
      mouthAngle: number; // -0.2 to 0.2
    };

    // Skin and complexion
    skin: {
      tone: string; // Hex color
      texture: number; // 0.0 to 1.0 (smooth to rough)
      blemishes: number; // 0.0 to 1.0 (none to many)
      freckles: number; // 0.0 to 1.0 (none to many)
      ageSpots: number; // 0.0 to 1.0 (none to many)
      wrinkles: number; // 0.0 to 1.0 (none to many)
    };
  };

  // Hair System (comprehensive)
  hair: {
    style: string; // Style ID
    length: number; // 0.0 to 1.0
    volume: number; // 0.5 to 1.5
    texture: number; // 0.0 to 1.0 (straight to curly)
    color: {
      primary: string; // Hex color
      secondary?: string; // Hex color for highlights
      gradient?: boolean; // Enable gradient
    };
    highlights: {
      enabled: boolean;
      color: string;
      intensity: number; // 0.0 to 1.0
      pattern: 'streaks' | 'tips' | 'roots' | 'random';
    };
    accessories: string[]; // Accessory IDs
  };

  // Outfit System (anime/gaming themed)
  outfit: {
    primary: {
      type:
        | 'school-uniform'
        | 'casual'
        | 'formal'
        | 'athletic'
        | 'fantasy'
        | 'cyberpunk'
        | 'gothic'
        | 'kawaii';
      color: string; // Primary color
      pattern?: string; // Pattern ID
      accessories: string[]; // Accessory IDs
    };
    secondary: {
      type?: string; // Optional secondary outfit
      color?: string;
      opacity: number; // 0.0 to 1.0 for layering
    };
    fit: {
      tightness: number; // 0.0 to 1.0 (loose to tight)
      length: number; // 0.0 to 1.0 (short to long)
      style: 'conservative' | 'moderate' | 'revealing' | 'suggestive';
    };
  };

  // Physics and Animation
  physics: {
    softBody: {
      enable: boolean;
      mass: number; // 0.5 to 2.0
      stiffness: number; // 0.1 to 1.0
      damping: number; // 0.1 to 1.0
      maxDisplacement: number; // 0.01 to 0.15
      collision: {
        pelvis: boolean;
        chest: boolean;
        spine: boolean;
        thighs: boolean;
      };
    };
    clothSim: {
      enable: boolean;
      bendStiffness: number; // 0.1 to 1.0
      stretchStiffness: number; // 0.1 to 1.0
      damping: number; // 0.1 to 1.0
      wind: number; // 0.0 to 2.0
      colliders: string[]; // Collider IDs
    };
  };

  // NSFW Features (gated content)
  nsfw?: {
    enabled: boolean;
    features: {
      anatomyDetail: number; // 0.0 to 1.0
      arousalIndicators: boolean;
      interactionLevel: 'none' | 'basic' | 'advanced' | 'explicit';
    };
    customization: {
      // Male-specific
      genitalSize?: number; // 0.5 to 1.5
      genitalShape?: number; // 0.0 to 1.0

      // Female-specific
      breastPhysics?: boolean;
      nippleSize?: number; // 0.5 to 1.5
      areolaSize?: number; // 0.5 to 1.5

      // Universal
      pubicHair?: {
        style: string;
        density: number; // 0.0 to 1.0
        color: string;
      };
    };
  };

  // Material and Rendering
  materials: {
    shader: 'AnimeToon' | 'Realistic' | 'CelShaded' | 'Stylized';
    parameters: {
      glossStrength: number; // 0.0 to 1.0
      rimStrength: number; // 0.0 to 1.0
      colorA: string; // Primary color
      colorB: string; // Secondary color
      rimColor: string; // Rim lighting color
      metallic: number; // 0.0 to 1.0
      roughness: number; // 0.0 to 1.0
    };
    textures: {
      albedo?: string; // URL
      normal?: string; // URL
      orm?: string; // URL (occlusion, roughness, metallic)
      mask?: string; // URL
      decals?: string; // URL
    };
  };

  // Interactions and Animations
  interactions: {
    poses: string[]; // Available poses
    emotes: string[]; // Available emotes
    cameraModes: string[]; // Camera interaction modes
    fx: string[]; // Visual effects
  };
}

interface UltraDetailedCharacterCreatorProps {
  initialConfig?: Partial<UltraDetailedCharacterParams>;
  onSave?: (config: UltraDetailedCharacterParams) => void;
  onPreview?: (config: UltraDetailedCharacterParams) => void;
}

export function UltraDetailedCharacterCreator({
  initialConfig,
  onSave,
  onPreview,
}: UltraDetailedCharacterCreatorProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [characterConfig, setCharacterConfig] = useState<UltraDetailedCharacterParams>({
    gender: 'female',
    age: 'young-adult',
    body: {
      height: 1.0,
      weight: 1.0,
      muscleMass: 0.5,
      bodyFat: 0.5,
      proportions: {
        headSize: 1.0,
        neckLength: 1.0,
        shoulderWidth: 1.0,
        chestSize: 1.0,
        waistSize: 1.0,
        hipWidth: 1.0,
        armLength: 1.0,
        legLength: 1.0,
      },
      genderFeatures: {},
    },
    face: {
      faceShape: {
        overall: 0.5,
        jawline: 0.5,
        cheekbones: 0.5,
        chinShape: 0.5,
      },
      eyes: {
        size: 1.0,
        spacing: 1.0,
        height: 1.0,
        angle: 0.0,
        eyelidShape: 0.5,
        eyeColor: '#4A90E2',
        eyebrowThickness: 1.0,
        eyebrowAngle: 0.0,
      },
      nose: {
        size: 1.0,
        width: 1.0,
        height: 1.0,
        bridgeWidth: 1.0,
        nostrilSize: 1.0,
        noseTip: 0.5,
      },
      mouth: {
        size: 1.0,
        width: 1.0,
        lipThickness: 1.0,
        lipShape: 0.5,
        cupidBow: 0.5,
        mouthAngle: 0.0,
      },
      skin: {
        tone: '#FDBBAE',
        texture: 0.3,
        blemishes: 0.1,
        freckles: 0.2,
        ageSpots: 0.0,
        wrinkles: 0.0,
      },
    },
    hair: {
      style: 'default',
      length: 0.7,
      volume: 1.0,
      texture: 0.3,
      color: {
        primary: '#8B4513',
      },
      highlights: {
        enabled: false,
        color: '#FFD700',
        intensity: 0.5,
        pattern: 'streaks',
      },
      accessories: [],
    },
    outfit: {
      primary: {
        type: 'casual',
        color: '#FF6B9D',
        accessories: [],
      },
      secondary: {
        type: 'casual',
        color: '#FFFFFF',
        opacity: 0.5,
      },
      fit: {
        tightness: 0.6,
        length: 0.7,
        style: 'moderate',
      },
    },
    physics: {
      softBody: {
        enable: false,
        mass: 1.0,
        stiffness: 0.4,
        damping: 0.2,
        maxDisplacement: 0.06,
        collision: {
          pelvis: true,
          chest: true,
          spine: true,
          thighs: true,
        },
      },
      clothSim: {
        enable: false,
        bendStiffness: 0.5,
        stretchStiffness: 0.6,
        damping: 0.2,
        wind: 0.0,
        colliders: [],
      },
    },
    materials: {
      shader: 'AnimeToon',
      parameters: {
        glossStrength: 0.6,
        rimStrength: 0.35,
        colorA: '#FF6B9D',
        colorB: '#8B5CF6',
        rimColor: '#FFD700',
        metallic: 0.1,
        roughness: 0.3,
      },
      textures: {
        albedo: undefined,
        normal: undefined,
        orm: undefined,
        mask: undefined,
      },
    },
    interactions: {
      poses: ['idle', 'standing', 'sitting'],
      emotes: ['happy', 'neutral', 'excited'],
      cameraModes: ['default', 'close-up'],
      fx: [],
    },
    ...initialConfig,
  });

  // Check user's gated preferences
  const { data: userPrefs } = useQuery({
    queryKey: ['user-gated-prefs', user?.id],
    queryFn: () => getUserGatedPreferences(user?.id),
    enabled: !!user?.id,
  });

  const canAccessNSFW = user?.publicMetadata?.adultVerified && userPrefs?.allowSuggestiveOutfits;

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '', description: 'Gender, age, body type' },
    { id: 'body', label: 'Body Anatomy', icon: '', description: 'Detailed body customization' },
    {
      id: 'face',
      label: 'Facial Features',
      icon: '',
      description: 'Face shape, eyes, nose, mouth',
    },
    { id: 'hair', label: 'Hair & Style', description: 'Hair, accessories, styling' },
    { id: 'outfit', label: 'Outfits', description: 'Clothing and accessories' },
    { id: 'physics', label: 'Physics', description: 'Movement and physics' },
    { id: 'materials', label: 'Materials', description: 'Shaders and textures' },
    { id: 'interactions', label: 'Interactions', description: 'Poses and emotes' },
    ...(canAccessNSFW
      ? [{ id: 'nsfw', label: 'Adult Features', description: 'NSFW customization' }]
      : []),
  ];

  // Save configuration
  const saveMutation = useMutation({
    mutationFn: async (config: UltraDetailedCharacterParams) => {
      const response = await fetch('/api/v1/avatar/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': `avatar-save-${Date.now()}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save avatar configuration');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-avatar', user?.id] });
      onSave?.(characterConfig);
    },
  });

  // Update configuration
  const updateConfig = useCallback(
    (path: string, value: any) => {
      setCharacterConfig((prev) => {
        const newConfig = { ...prev };
        const keys = path.split('.');
        let current: any = newConfig;

        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]] = { ...current[keys[i]] };
        }

        current[keys[keys.length - 1]] = value;
        return newConfig;
      });

      // Trigger preview update
      onPreview?.(characterConfig);
    },
    [characterConfig, onPreview],
  );

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setCharacterConfig({
      gender: 'female',
      age: 'young-adult',
      body: {
        height: 1.0,
        weight: 1.0,
        muscleMass: 0.5,
        bodyFat: 0.5,
        proportions: {
          headSize: 1.0,
          neckLength: 1.0,
          shoulderWidth: 1.0,
          chestSize: 1.0,
          waistSize: 1.0,
          hipWidth: 1.0,
          armLength: 1.0,
          legLength: 1.0,
        },
        genderFeatures: {},
      },
      face: {
        faceShape: { overall: 0.5, jawline: 0.5, cheekbones: 0.5, chinShape: 0.5 },
        eyes: {
          size: 1.0,
          spacing: 1.0,
          height: 1.0,
          angle: 0.0,
          eyelidShape: 0.5,
          eyeColor: '#FFD700',
          eyebrowThickness: 1.0,
          eyebrowAngle: 0.0,
        },
        nose: {
          size: 1.0,
          width: 1.0,
          height: 1.0,
          bridgeWidth: 1.0,
          nostrilSize: 1.0,
          noseTip: 0.5,
        },
        mouth: {
          size: 1.0,
          width: 1.0,
          lipThickness: 1.0,
          lipShape: 0.5,
          cupidBow: 0.5,
          mouthAngle: 0.0,
        },
        skin: {
          tone: '#FDBCB4',
          texture: 0.3,
          blemishes: 0.1,
          freckles: 0.2,
          ageSpots: 0.0,
          wrinkles: 0.1,
        },
      },
      hair: {
        style: 'default',
        length: 0.8,
        volume: 1.0,
        texture: 0.3,
        color: { primary: '#8B4513' },
        highlights: { enabled: false, color: '#FFD700', intensity: 0.5, pattern: 'streaks' },
        accessories: [],
      },
      outfit: {
        primary: { type: 'casual', color: '#FF6B9D', accessories: [] },
        secondary: { type: 'casual', color: '#FFFFFF', opacity: 0.5 },
        fit: { tightness: 0.6, length: 0.7, style: 'moderate' },
      },
      physics: {
        softBody: {
          enable: false,
          mass: 1.0,
          stiffness: 0.4,
          damping: 0.2,
          maxDisplacement: 0.06,
          collision: { pelvis: true, chest: true, spine: true, thighs: true },
        },
        clothSim: {
          enable: false,
          bendStiffness: 0.5,
          stretchStiffness: 0.6,
          damping: 0.2,
          wind: 0.0,
          colliders: [],
        },
      },
      materials: {
        shader: 'AnimeToon',
        parameters: {
          glossStrength: 0.6,
          rimStrength: 0.35,
          colorA: '#FF6B9D',
          colorB: '#8B5CF6',
          rimColor: '#FFD700',
          metallic: 0.1,
          roughness: 0.3,
        },
        textures: { albedo: undefined, normal: undefined, orm: undefined, mask: undefined },
      },
      interactions: {
        poses: ['idle', 'standing', 'sitting'],
        emotes: ['happy', 'neutral', 'excited'],
        cameraModes: ['default', 'close-up'],
        fx: [],
      },
      nsfw: {
        enabled: false,
        features: { anatomyDetail: 0.0, arousalIndicators: false, interactionLevel: 'none' },
        customization: {},
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      {/* Header */}
      <div className="bg-black/50 border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Ultra Detailed Character Creator</h1>
            <p className="text-zinc-300 mt-1">
              Code Vein-level customization with anime aesthetics
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>

            <button
              onClick={() => saveMutation.mutate(characterConfig)}
              disabled={saveMutation.isPending}
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Character'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/10 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4">Customization Tabs</h2>
              <div className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-pink-500/30 border border-pink-400/50'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="text-lg mb-1">{tab.icon}</div>
                    <div className="text-sm font-medium text-white">{tab.label}</div>
                    <div className="text-xs text-zinc-400 mt-1">{tab.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white/10 rounded-xl p-4">
              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-white font-semibold">Basic Information</h3>

                    <div>
                      <label className="block text-white text-sm mb-2">Gender</label>
                      <select
                        value={characterConfig.gender}
                        onChange={(e) => updateConfig('gender', e.target.value)}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white text-sm mb-2">Age</label>
                      <select
                        value={characterConfig.age}
                        onChange={(e) => updateConfig('age', e.target.value)}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="teen">Teen</option>
                        <option value="young-adult">Young Adult</option>
                        <option value="adult">Adult</option>
                        <option value="mature">Mature</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'body' && (
                  <motion.div
                    key="body"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <BodyCustomizer
                      config={characterConfig.body}
                      onChange={(bodyConfig: any) => updateConfig('body', bodyConfig)}
                      gender={characterConfig.gender}
                    />
                  </motion.div>
                )}

                {activeTab === 'face' && (
                  <motion.div
                    key="face"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <FaceCustomizer
                      config={characterConfig.face}
                      onChange={(faceConfig: any) => updateConfig('face', faceConfig)}
                    />
                  </motion.div>
                )}

                {activeTab === 'hair' && (
                  <motion.div
                    key="hair"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <HairCustomizer
                      config={characterConfig.hair}
                      onChange={(hairConfig: any) => updateConfig('hair', hairConfig)}
                    />
                  </motion.div>
                )}

                {activeTab === 'outfit' && (
                  <motion.div
                    key="outfit"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <OutfitSelector
                      config={characterConfig.outfit}
                      onChange={(outfitConfig: any) => updateConfig('outfit', outfitConfig)}
                      gender={characterConfig.gender}
                    />
                  </motion.div>
                )}

                {activeTab === 'physics' && (
                  <motion.div
                    key="physics"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <PhysicsPresetSelector
                      config={characterConfig.physics}
                      onChange={(physicsConfig: any) => updateConfig('physics', physicsConfig)}
                    />
                  </motion.div>
                )}

                {activeTab === 'materials' && (
                  <motion.div
                    key="materials"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <MaterialEditor
                      config={characterConfig.materials}
                      onChange={(materialConfig: any) => updateConfig('materials', materialConfig)}
                    />
                  </motion.div>
                )}

                {activeTab === 'interactions' && (
                  <motion.div
                    key="interactions"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <InteractionTester
                      config={characterConfig.interactions}
                      onChange={(interactionConfig: any) =>
                        updateConfig('interactions', interactionConfig)
                      }
                    />
                  </motion.div>
                )}

                {activeTab === 'nsfw' && canAccessNSFW && (
                  <motion.div
                    key="nsfw"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <NSFWCustomizer
                      config={characterConfig.nsfw}
                      onChange={(nsfwConfig: any) => updateConfig('nsfw', nsfwConfig)}
                      gender={characterConfig.gender}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel - Avatar Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Character Preview</h3>

              <div className="aspect-video bg-black/20 rounded-lg overflow-hidden">
                <AvatarRenderer
                  config={characterConfig}
                  size="large"
                  interactions={true}
                  physics={
                    characterConfig.physics.softBody.enable ||
                    characterConfig.physics.clothSim.enable
                  }
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-zinc-300">
                <div>
                  <strong>Gender:</strong> {characterConfig.gender}
                </div>
                <div>
                  <strong>Age:</strong> {characterConfig.age}
                </div>
                <div>
                  <strong>Height:</strong> {(characterConfig.body.height * 100).toFixed(0)}%
                </div>
                <div>
                  <strong>Weight:</strong> {(characterConfig.body.weight * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get user gated preferences
async function getUserGatedPreferences(userId: string | undefined) {
  if (!userId) return null;

  const response = await fetch(`/api/v1/user/gated-prefs/${userId}`);
  if (!response.ok) return null;

  const result = await response.json();
  return result.ok ? result.data : null;
}
