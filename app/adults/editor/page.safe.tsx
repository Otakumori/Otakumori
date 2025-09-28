'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AdultPreviewScene } from '@/app/adults/_components/AdultPreviewScene.safe';
import { type AdultPackType, type SliderSpecType, type GatedPrefsType } from '@/app/adults/_schema/pack.safe';

// Mock data - in production this would come from your API
const mockPacks: AdultPackType[] = [
  {
    slug: 'midnight_set_A',
    title: 'Midnight Set A',
    rarity: 'legendary',
    type: 'outfit',
    isAdultOnly: true,
    pricePetals: 2500,
    priceUsdCents: 1999,
    physicsProfile: {
      id: 'enhanced_physics',
      softBody: {
        enable: true,
        mass: 1.2,
        stiffness: 0.5,
        damping: 0.3,
        maxDisplacement: 0.08,
        collision: {
          pelvis: true,
          chest: true,
          spine: true,
          thighs: true,
        },
      },
      clothSim: {
        enable: true,
        bendStiffness: 0.6,
        stretchStiffness: 0.7,
        damping: 0.25,
        wind: 0.3,
        colliders: ['hips', 'chest', 'thighL', 'thighR'],
      },
    },
    interactions: [
      { id: 'pose:flair_A', kind: 'pose', intensity: 0.7, gated: true },
      { id: 'emote:wink_A', kind: 'emote', intensity: 0.5, gated: false },
      { id: 'camera:orbit_slow', kind: 'camera', intensity: 0.3, gated: false },
    ],
    materials: {
      shader: 'AnimeToon',
      params: {
        glossStrength: 0.8,
        rimStrength: 0.4,
        colorA: '#1a1a2e',
        colorB: '#16213e',
        rimColor: '#e94560',
      },
    },
    layers: ['outfit', 'accessories'],
    assets: {
      albedo: 'https://example.com/midnight_set_A_albedo.ktx2',
      normal: 'https://example.com/midnight_set_A_normal.ktx2',
      orm: 'https://example.com/midnight_set_A_orm.ktx2',
      mask: 'https://example.com/midnight_set_A_mask.ktx2',
    },
    sliders: [
      { id: 'outfit.tightness', label: 'Outfit Tightness', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['outfit_morph'] },
      { id: 'outfit.hemLength', label: 'Hem Length', min: 0, max: 1, step: 0.01, default: 0.3, affects: ['hem_morph'] },
      { id: 'accessories.gloss', label: 'Accessory Gloss', min: 0, max: 1, step: 0.01, default: 0.7, affects: ['accessory_shader'] },
    ],
  },
  {
    slug: 'neo_street_fighter',
    title: 'Neo Street Fighter',
    rarity: 'rare',
    type: 'outfit',
    isAdultOnly: true,
    pricePetals: 1500,
    priceUsdCents: 1299,
    physicsProfile: {
      id: 'standard_physics',
      softBody: {
        enable: false,
        mass: 1.0,
        stiffness: 0.4,
        damping: 0.2,
        maxDisplacement: 0.06,
        collision: {
          pelvis: true,
          chest: true,
          spine: false,
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
    interactions: [
      { id: 'pose:combat_ready', kind: 'pose', intensity: 0.8, gated: false },
      { id: 'emote:determined', kind: 'emote', intensity: 0.6, gated: false },
    ],
    materials: {
      shader: 'AnimeToon',
      params: {
        glossStrength: 0.4,
        rimStrength: 0.3,
        colorA: '#2c3e50',
        colorB: '#34495e',
        rimColor: '#3498db',
      },
    },
    layers: ['outfit'],
    assets: {
      albedo: 'https://example.com/neo_street_fighter_albedo.ktx2',
      normal: 'https://example.com/neo_street_fighter_normal.ktx2',
    },
    sliders: [
      { id: 'outfit.muscleDefinition', label: 'Muscle Definition', min: 0, max: 1, step: 0.01, default: 0.6, affects: ['muscle_morph'] },
      { id: 'outfit.athleticFit', label: 'Athletic Fit', min: 0, max: 1, step: 0.01, default: 0.8, affects: ['fit_morph'] },
    ],
  },
];

// Global slider definitions
const globalSliders: SliderSpecType[] = [
  // Body sliders
  { id: 'body.height', label: 'Height', min: 0.8, max: 1.2, step: 0.01, default: 1.0, affects: ['height_morph'] },
  { id: 'body.headSize', label: 'Head Size', min: 0.9, max: 1.1, step: 0.01, default: 1.0, affects: ['head_morph'] },
  { id: 'body.shoulderWidth', label: 'Shoulder Width', min: 0.8, max: 1.2, step: 0.01, default: 1.0, affects: ['shoulder_morph'] },
  { id: 'body.chestShape', label: 'Chest Shape', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['chest_morph'] },
  { id: 'body.waist', label: 'Waist', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['waist_morph'] },
  { id: 'body.hipWidth', label: 'Hip Width', min: 0.8, max: 1.2, step: 0.01, default: 1.0, affects: ['hip_morph'] },
  { id: 'body.gluteSize', label: 'Glute Size', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['glute_morph'] },
  { id: 'body.thighWidth', label: 'Thigh Width', min: 0.8, max: 1.2, step: 0.01, default: 1.0, affects: ['thigh_morph'] },
  { id: 'body.calfWidth', label: 'Calf Width', min: 0.8, max: 1.2, step: 0.01, default: 1.0, affects: ['calf_morph'] },
  { id: 'body.muscleTone', label: 'Muscle Tone', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['muscle_morph'] },
  { id: 'body.bodyFat', label: 'Body Fat', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['fat_morph'] },
  
  // Face sliders
  { id: 'face.eyeSize', label: 'Eye Size', min: 0.8, max: 1.2, step: 0.01, default: 1.0, affects: ['eye_morph'] },
  { id: 'face.eyeAngle', label: 'Eye Angle', min: -0.2, max: 0.2, step: 0.01, default: 0, affects: ['eye_angle_morph'] },
  { id: 'face.jaw', label: 'Jaw', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['jaw_morph'] },
  { id: 'face.chin', label: 'Chin', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['chin_morph'] },
  { id: 'face.cheek', label: 'Cheek', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['cheek_morph'] },
  { id: 'face.lipFullness', label: 'Lip Fullness', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['lip_morph'] },
  
  // Hair sliders
  { id: 'hair.length', label: 'Hair Length', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['hair_length_morph'] },
  { id: 'hair.volume', label: 'Hair Volume', min: 0, max: 1, step: 0.01, default: 0.5, affects: ['hair_volume_morph'] },
  { id: 'hair.glossFactor', label: 'Hair Gloss', min: 0, max: 1, step: 0.01, default: 0.7, affects: ['hair_gloss_shader'] },
];

// Physics presets
const physicsPresets = {
  standard: {
    softBody: { enable: false, mass: 1.0, stiffness: 0.4, damping: 0.2, maxDisplacement: 0.06 },
    clothSim: { enable: false, bendStiffness: 0.5, stretchStiffness: 0.6, damping: 0.2, wind: 0.0 },
  },
  enhanced: {
    softBody: { enable: true, mass: 1.0, stiffness: 0.4, damping: 0.2, maxDisplacement: 0.06 },
    clothSim: { enable: false, bendStiffness: 0.5, stretchStiffness: 0.6, damping: 0.2, wind: 0.0 },
  },
  max: {
    softBody: { enable: true, mass: 1.2, stiffness: 0.5, damping: 0.3, maxDisplacement: 0.08 },
    clothSim: { enable: true, bendStiffness: 0.6, stretchStiffness: 0.7, damping: 0.25, wind: 0.3 },
  },
};

export default function AdultEditorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'packs' | 'sliders' | 'physics' | 'interactions' | 'safety'>('packs');
  const [selectedPack, setSelectedPack] = useState<AdultPackType | null>(null);
  const [sliders, setSliders] = useState<Record<string, number>>({});
  const [physicsPreset, setPhysicsPreset] = useState<keyof typeof physicsPresets>('standard');
  const [gatedPrefs, setGatedPrefs] = useState<GatedPrefsType>({
    allowSuggestiveOutfits: false,
    allowSuggestivePhysics: false,
    allowSuggestiveInteractions: false,
  });

  // Check authentication and adult verification
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }
    
    if (isLoaded && user) {
      // Check adult verification
      const adultVerified = user.publicMetadata?.adultVerified as boolean;
      if (!adultVerified) {
        router.push('/adults/verify');
        return;
      }
      
      // Load user preferences
      const prefs = user.publicMetadata?.gatedPrefs as GatedPrefsType;
      if (prefs) {
        setGatedPrefs(prefs);
      }
    }
  }, [user, isLoaded, router]);

  // Initialize sliders with defaults
  useEffect(() => {
    const initialSliders: Record<string, number> = {};
    
    // Add global slider defaults
    globalSliders.forEach(slider => {
      initialSliders[slider.id] = slider.default;
    });
    
    // Add pack-specific slider defaults
    if (selectedPack) {
      selectedPack.sliders.forEach(slider => {
        initialSliders[slider.id] = slider.default;
      });
    }
    
    setSliders(initialSliders);
  }, [selectedPack]);

  // Handle slider changes
  const handleSliderChange = (sliderId: string, value: number) => {
    setSliders(prev => ({
      ...prev,
      [sliderId]: value,
    }));
  };

  // Handle pack selection
  const handlePackSelect = (pack: AdultPackType) => {
    setSelectedPack(pack);
    setActiveTab('sliders');
  };

  // Handle physics preset change
  const handlePhysicsPresetChange = (preset: keyof typeof physicsPresets) => {
    setPhysicsPreset(preset);
  };

  // Handle gated preference changes
  const handleGatedPrefChange = (key: keyof GatedPrefsType, value: boolean) => {
    setGatedPrefs(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Filter packs based on user preferences
  const filteredPacks = useMemo(() => {
    return mockPacks.filter(pack => {
      if (pack.type === 'outfit' && !gatedPrefs.allowSuggestiveOutfits) {
        return false;
      }
      if (pack.physicsProfile.softBody.enable && !gatedPrefs.allowSuggestivePhysics) {
        return false;
      }
      if (pack.interactions.some(i => i.gated) && !gatedPrefs.allowSuggestiveInteractions) {
        return false;
      }
      return true;
    });
  }, [gatedPrefs]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading editor...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      <div className="flex h-screen">
        {/* Left Panel - Preview Scene */}
        <div className="flex-1 relative">
          {selectedPack ? (
            <AdultPreviewScene
              pack={selectedPack}
              sliders={sliders}
              physicsConfig={physicsPresets[physicsPreset]}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-black">
              <div className="text-center text-white">
                <h2 className="text-2xl mb-4">Select a Pack</h2>
                <p className="text-gray-300">Choose a pack from the right panel to preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Controls */}
        <div className="w-96 bg-black/20 backdrop-blur-lg border-l border-white/10 p-6 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            {(['packs', 'sliders', 'physics', 'interactions', 'safety'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Packs Tab */}
            {activeTab === 'packs' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Available Packs</h3>
                <div className="space-y-3">
                  {filteredPacks.map(pack => (
                    <div
                      key={pack.slug}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedPack?.slug === pack.slug
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => handlePackSelect(pack)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePackSelect(pack);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${pack.title} pack`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{pack.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          pack.rarity === 'legendary' ? 'bg-purple-500 text-white' :
                          pack.rarity === 'rare' ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {pack.rarity}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {pack.pricePetals} petals
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pack.layers.map(layer => (
                          <span key={layer} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                            {layer}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sliders Tab */}
            {activeTab === 'sliders' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Customization</h3>
                
                {/* Global Sliders */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-3">Body</h4>
                  <div className="space-y-3">
                    {globalSliders.filter(s => s.id.startsWith('body.')).map(slider => (
                      <div key={slider.id}>
                        <label className="block text-sm text-gray-300 mb-1">
                          {slider.label}: {sliders[slider.id]?.toFixed(2) || slider.default.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min={slider.min}
                          max={slider.max}
                          step={slider.step}
                          value={sliders[slider.id] || slider.default}
                          onChange={(e) => handleSliderChange(slider.id, parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Face Sliders */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-3">Face</h4>
                  <div className="space-y-3">
                    {globalSliders.filter(s => s.id.startsWith('face.')).map(slider => (
                      <div key={slider.id}>
                        <label className="block text-sm text-gray-300 mb-1">
                          {slider.label}: {sliders[slider.id]?.toFixed(2) || slider.default.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min={slider.min}
                          max={slider.max}
                          step={slider.step}
                          value={sliders[slider.id] || slider.default}
                          onChange={(e) => handleSliderChange(slider.id, parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hair Sliders */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-3">Hair</h4>
                  <div className="space-y-3">
                    {globalSliders.filter(s => s.id.startsWith('hair.')).map(slider => (
                      <div key={slider.id}>
                        <label className="block text-sm text-gray-300 mb-1">
                          {slider.label}: {sliders[slider.id]?.toFixed(2) || slider.default.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min={slider.min}
                          max={slider.max}
                          step={slider.step}
                          value={sliders[slider.id] || slider.default}
                          onChange={(e) => handleSliderChange(slider.id, parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pack-specific Sliders */}
                {selectedPack && selectedPack.sliders.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-white mb-3">Pack-specific</h4>
                    <div className="space-y-3">
                      {selectedPack.sliders.map(slider => (
                        <div key={slider.id}>
                          <label className="block text-sm text-gray-300 mb-1">
                            {slider.label}: {sliders[slider.id]?.toFixed(2) || slider.default.toFixed(2)}
                          </label>
                          <input
                            type="range"
                            min={slider.min}
                            max={slider.max}
                            step={slider.step}
                            value={sliders[slider.id] || slider.default}
                            onChange={(e) => handleSliderChange(slider.id, parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Physics Tab */}
            {activeTab === 'physics' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Physics Settings</h3>
                
                <div className="mb-6">
                  <label className="block text-sm text-gray-300 mb-2">Physics Preset</label>
                  <select
                    value={physicsPreset}
                    onChange={(e) => handlePhysicsPresetChange(e.target.value as keyof typeof physicsPresets)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="max">Max</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-white mb-2">Soft Body Physics</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>Enable: {physicsPresets[physicsPreset].softBody.enable ? 'Yes' : 'No'}</div>
                      {physicsPresets[physicsPreset].softBody.enable && (
                        <>
                          <div>Mass: {physicsPresets[physicsPreset].softBody.mass}</div>
                          <div>Stiffness: {physicsPresets[physicsPreset].softBody.stiffness}</div>
                          <div>Damping: {physicsPresets[physicsPreset].softBody.damping}</div>
                          <div>Max Displacement: {physicsPresets[physicsPreset].softBody.maxDisplacement}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-white mb-2">Cloth Simulation</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>Enable: {physicsPresets[physicsPreset].clothSim.enable ? 'Yes' : 'No'}</div>
                      {physicsPresets[physicsPreset].clothSim.enable && (
                        <>
                          <div>Bend Stiffness: {physicsPresets[physicsPreset].clothSim.bendStiffness}</div>
                          <div>Stretch Stiffness: {physicsPresets[physicsPreset].clothSim.stretchStiffness}</div>
                          <div>Damping: {physicsPresets[physicsPreset].clothSim.damping}</div>
                          <div>Wind: {physicsPresets[physicsPreset].clothSim.wind}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interactions Tab */}
            {activeTab === 'interactions' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Interactions</h3>
                
                {selectedPack ? (
                  <div className="space-y-3">
                    {selectedPack.interactions.map(interaction => (
                      <div
                        key={interaction.id}
                        className={`p-3 rounded-lg border ${
                          interaction.gated && !gatedPrefs.allowSuggestiveInteractions
                            ? 'border-red-500/50 bg-red-500/10 opacity-50'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-medium">{interaction.id}</h4>
                            <p className="text-gray-300 text-sm">Type: {interaction.kind}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            interaction.gated ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                          }`}>
                            {interaction.gated ? 'Gated' : 'Safe'}
                          </span>
                        </div>
                        <div className="mt-2">
                          <label className="block text-sm text-gray-300 mb-1">
                            Intensity: {interaction.intensity.toFixed(2)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={interaction.intensity}
                            disabled={interaction.gated && !gatedPrefs.allowSuggestiveInteractions}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">Select a pack to view interactions</p>
                )}
              </div>
            )}

            {/* Safety Tab */}
            {activeTab === 'safety' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Safety Settings</h3>
                
                <div className="space-y-4">
                  <div>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="allow-suggestive-outfits"
                            checked={gatedPrefs.allowSuggestiveOutfits}
                            onChange={(e) => handleGatedPrefChange('allowSuggestiveOutfits', e.target.checked)}
                            className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                          />
                          <span className="text-white">Allow suggestive outfits</span>
                        </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allow-suggestive-physics"
                        checked={gatedPrefs.allowSuggestivePhysics}
                        onChange={(e) => handleGatedPrefChange('allowSuggestivePhysics', e.target.checked)}
                        className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                      />
                      <span className="text-white">Allow suggestive physics</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allow-suggestive-interactions"
                        checked={gatedPrefs.allowSuggestiveInteractions}
                        onChange={(e) => handleGatedPrefChange('allowSuggestiveInteractions', e.target.checked)}
                        className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                      />
                      <span className="text-white">Allow suggestive interactions</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <h4 className="text-yellow-400 font-medium mb-2">Warning</h4>
                  <p className="text-yellow-300 text-sm">
                    These settings control the visibility of adult content. Changes will be saved to your profile.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Button */}
          {selectedPack && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <button
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                onClick={() => {
                  // TODO: Implement purchase logic
                  console.log('Purchase pack:', selectedPack.slug);
                }}
              >
                Purchase {selectedPack.title} - {selectedPack.pricePetals} petals
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
