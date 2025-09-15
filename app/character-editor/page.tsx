// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { COPY } from '../lib/copy';

// Dynamically import the character editor to avoid SSR issues
const CharacterEditor = dynamic(() => import('./components/CharacterEditor'), { ssr: false });

export default function CharacterEditorPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('hair');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [characterConfig, setCharacterConfig] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'hair', name: 'Hair', icon: '𓍯𓂃' },
    { id: 'face', name: 'Face', icon: '(˶˃ ᵕ ˂˶)' },
    { id: 'body', name: 'Body', icon: '❔' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'accessories', name: 'Accessories', icon: '👓' },
  ];

  useEffect(() => {
    loadCharacterData();
  }, []);

  const loadCharacterData = async () => {
    try {
      setIsLoading(true);

      // Load presets and current config
      const [presetsResponse, configResponse] = await Promise.all([
        fetch('/api/v1/character/presets'),
        fetch('/api/v1/character/config'),
      ]);

      if (presetsResponse.ok) {
        const presetsData = await presetsResponse.json();
        setPresets(presetsData.data || []);
      }

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setCharacterConfig(configData.data?.config);
      }
    } catch (error) {
      console.error('Failed to load character data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
  };

  const handleSaveConfig = async () => {
    if (!characterConfig) return;

    try {
      const response = await fetch('/api/v1/character/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: characterConfig.name || 'My Character',
          configData: characterConfig.configData,
          isActive: true,
        }),
      });

      if (response.ok) {
        // Show success message
        console.log('Character saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900 p-4">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Character Editor</h1>
            <p className="text-gray-300">{COPY.loading.summon}</p>
          </GlassCard>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <GlassCard className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Character Editor
              </h1>
              <p className="text-gray-300 mt-2">
                Create your PS1/PS2 style avatar with retro charm
              </p>
            </div>
            <div className="flex gap-3">
              <GlassButton onClick={handleSaveConfig} className="px-6 py-2">
                Save Character
              </GlassButton>
              <GlassButton variant="secondary" className="px-6 py-2">
                Reset
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Viewport */}
          <div className="lg:col-span-2">
            <GlassCard className="h-[600px] p-4">
              <div className="h-full rounded-lg overflow-hidden bg-gray-900">
                <Canvas
                  camera={{ position: [0, 0, 5], fov: 50 }}
                  style={{ background: 'transparent' }}
                >
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
                  <Environment preset="studio" />

                  <CharacterEditor
                    config={characterConfig}
                    selectedPreset={selectedPreset}
                    onConfigChange={setCharacterConfig}
                  />
                </Canvas>
              </div>
            </GlassCard>
          </div>

          {/* Category Selection */}
          <div className="lg:col-span-1">
            <GlassCard className="p-4">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedCategory === category.id
                        ? 'bg-pink-500/20 border border-pink-500/50'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                    aria-label={`Select ${category.name} category`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Preset Selection */}
          <div className="lg:col-span-1">
            <GlassCard className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {categories.find((c) => c.id === selectedCategory)?.name} Presets
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {presets
                  .filter((preset) => preset.category === selectedCategory)
                  .map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedPreset === preset.id
                          ? 'bg-pink-500/20 border border-pink-500/50'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-sm text-gray-400 capitalize">{preset.rarity}</div>
                        </div>
                        {preset.isUnlocked ? (
                          <span className="text-green-400 text-sm" role="img" aria-label="unlocked">
                            ✓
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm" role="img" aria-label="locked">
                            🔒
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Character Info */}
        {characterConfig && (
          <GlassCard className="mt-6 p-4">
            <h3 className="text-lg font-semibold mb-4">Character Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="character-name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Character Name
                </label>
                <input
                  type="text"
                  id="character-name"
                  value={characterConfig.name || ''}
                  onChange={(e) =>
                    setCharacterConfig({
                      ...characterConfig,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                  placeholder="Enter character name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Created</label>
                <div className="p-2 rounded-lg bg-white/5 text-gray-300">
                  {characterConfig.createdAt
                    ? new Date(characterConfig.createdAt).toLocaleDateString()
                    : 'New'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="p-2 rounded-lg bg-white/5 text-gray-300">
                  {characterConfig.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </main>
  );
}
