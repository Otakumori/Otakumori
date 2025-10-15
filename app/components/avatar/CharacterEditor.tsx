'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { AvatarEditor } from './Avatar3D';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import {
  avatarPartManager,
  type AvatarPartType,
  NSFW_MORPH_TARGETS,
} from '@/app/lib/3d/avatar-parts';

interface CharacterEditorProps {
  initialConfiguration?: AvatarConfiguration;
  onConfigurationChange?: (config: AvatarConfiguration) => void;
  onSave?: (config: AvatarConfiguration) => void;
  className?: string;
}

interface CustomizationPanelProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

function CustomizationPanel({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
}: CustomizationPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-4 mb-4">
      <div
        className={`flex items-center justify-between mb-3 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
        onKeyDown={(e) => {
          if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }
        }}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {collapsible && <span className="text-white/60 text-xl">{isCollapsed ? '▼' : '▲'}</span>}
      </div>
      {!isCollapsed && <div className="space-y-3">{children}</div>}
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format,
}: SliderControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-white/80">{label}</label>
        <span className="text-sm text-white/60 font-mono">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) 100%)`,
        }}
      />
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: THREE.Color;
  onChange: (color: THREE.Color) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = new THREE.Color(e.target.value);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-white/80">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={`#${value.getHexString()}`}
          onChange={handleColorChange}
          className="w-12 h-8 rounded border border-white/20 cursor-pointer"
        />
        <span className="text-sm text-white/60 font-mono">#{value.getHexString()}</span>
      </div>
    </div>
  );
}

interface PartSelectorProps {
  label: string;
  partType: AvatarPartType;
  currentPartId?: string;
  onPartChange: (partId: string) => void;
  showNsfwContent: boolean;
}

function PartSelector({
  label,
  partType,
  currentPartId,
  onPartChange,
  showNsfwContent,
}: PartSelectorProps) {
  const parts = useMemo(() => {
    const allParts = avatarPartManager.getPartsByType(partType);
    return allParts.filter((part) => {
      if (part.contentRating === 'sfw') return true;
      if (part.contentRating === 'nsfw') return showNsfwContent;
      if (part.contentRating === 'explicit') return showNsfwContent;
      return false;
    });
  }, [partType, showNsfwContent]);

  return (
    <div className="space-y-2">
      <label className="text-sm text-white/80">{label}</label>
      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
        {parts.map((part) => (
          <button
            key={part.id}
            onClick={() => onPartChange(part.id)}
            className={`p-2 rounded-lg border transition-all ${
              currentPartId === part.id
                ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            <div className="text-xs font-medium truncate">{part.name}</div>
            <div className="text-xs text-white/60 capitalize">{part.contentRating}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CharacterEditor({
  initialConfiguration,
  onConfigurationChange,
  onSave,
  className = '',
}: CharacterEditorProps) {
  const [configuration, setConfiguration] = useState<AvatarConfiguration>(() => {
    if (initialConfiguration) return initialConfiguration;

    // Create default configuration
    return avatarPartManager.createConfiguration('default-user', 'female');
  });

  const [activeTab, setActiveTab] = useState<'parts' | 'morphing' | 'materials' | 'lighting'>(
    'parts',
  );
  const [showNsfwContent, setShowNsfwContent] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  // Update configuration and notify parent
  const updateConfiguration = useCallback(
    (updates: Partial<AvatarConfiguration>) => {
      const newConfig = { ...configuration, ...updates, updatedAt: new Date() };
      setConfiguration(newConfig);
      onConfigurationChange?.(newConfig);
    },
    [configuration, onConfigurationChange],
  );

  // Update morph target
  const updateMorphTarget = useCallback(
    (targetName: string, value: number) => {
      const morphTarget = NSFW_MORPH_TARGETS[targetName];
      if (!morphTarget) return;

      const clampedValue = Math.max(morphTarget.min, Math.min(morphTarget.max, value));
      const newMorphTargets = { ...configuration.morphTargets, [targetName]: clampedValue };

      updateConfiguration({ morphTargets: newMorphTargets });
    },
    [configuration.morphTargets, updateConfiguration],
  );

  // Update part selection
  const updatePart = useCallback(
    (partType: AvatarPartType, partId: string) => {
      const newParts = { ...configuration.parts, [partType]: partId };
      updateConfiguration({ parts: newParts });
    },
    [configuration.parts, updateConfiguration],
  );

  // Update material override
  const updateMaterialOverride = useCallback(
    (slot: string, override: any) => {
      const newOverrides = { ...configuration.materialOverrides, [slot]: override };
      updateConfiguration({ materialOverrides: newOverrides });
    },
    [configuration.materialOverrides, updateConfiguration],
  );

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.(configuration);
  }, [configuration, onSave]);

  // Filter morph targets based on content settings
  const visibleMorphTargets = useMemo(() => {
    return Object.entries(NSFW_MORPH_TARGETS).filter(([_, morphTarget]) => {
      if (!morphTarget.adultContent) return true;
      return showNsfwContent && ageVerified;
    });
  }, [showNsfwContent, ageVerified]);

  return (
    <div
      className={`flex h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black ${className}`}
    >
      {/* Left Panel - Controls */}
      <div className="w-80 bg-black/20 backdrop-blur-lg border-r border-white/10 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Character Editor</h1>
            <p className="text-white/60 text-sm">Create your perfect avatar</p>
          </div>

          {/* Content Settings */}
          <CustomizationPanel title="Content Settings" defaultCollapsed={true}>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNsfwContent}
                  onChange={(e) => {
                    setShowNsfwContent(e.target.checked);
                    updateConfiguration({ showNsfwContent: e.target.checked });
                  }}
                  className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-white/80">Show NSFW Content</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageVerified}
                  onChange={(e) => {
                    setAgeVerified(e.target.checked);
                    updateConfiguration({ ageVerified: e.target.checked });
                  }}
                  className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-white/80">Age Verified (18+)</span>
              </label>
            </div>
          </CustomizationPanel>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 bg-white/10 rounded-lg p-1">
            {[
              { id: 'parts', label: 'Parts' },
              { id: 'morphing', label: 'Morphing' },
              { id: 'materials', label: 'Materials' },
              { id: 'lighting', label: 'Lighting' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'parts' && (
            <div className="space-y-4">
              <CustomizationPanel title="Base Model">
                <div className="space-y-2">
                  {(['male', 'female'] as const).map((model) => (
                    <label key={model} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="baseModel"
                        value={model}
                        checked={configuration.baseModel === model}
                        onChange={(e) =>
                          updateConfiguration({ baseModel: e.target.value as 'male' | 'female' })
                        }
                        className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 focus:ring-pink-500"
                      />
                      <span className="text-sm text-white/80 capitalize">{model}</span>
                    </label>
                  ))}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Head & Face">
                <PartSelector
                  label="Head"
                  partType="head"
                  currentPartId={configuration.parts.head}
                  onPartChange={(partId) => updatePart('head', partId)}
                  showNsfwContent={showNsfwContent}
                />
                <PartSelector
                  label="Hair"
                  partType="hair"
                  currentPartId={configuration.parts.hair}
                  onPartChange={(partId) => updatePart('hair', partId)}
                  showNsfwContent={showNsfwContent}
                />
              </CustomizationPanel>

              <CustomizationPanel title="Body">
                <PartSelector
                  label="Body"
                  partType="body"
                  currentPartId={configuration.parts.body}
                  onPartChange={(partId) => updatePart('body', partId)}
                  showNsfwContent={showNsfwContent}
                />
              </CustomizationPanel>

              <CustomizationPanel title="Clothing">
                <PartSelector
                  label="Clothing"
                  partType="clothing"
                  currentPartId={configuration.parts.clothing}
                  onPartChange={(partId) => updatePart('clothing', partId)}
                  showNsfwContent={showNsfwContent}
                />
                {showNsfwContent && (
                  <PartSelector
                    label="Lingerie"
                    partType="lingerie"
                    currentPartId={configuration.parts.lingerie}
                    onPartChange={(partId) => updatePart('lingerie', partId)}
                    showNsfwContent={showNsfwContent}
                  />
                )}
              </CustomizationPanel>

              <CustomizationPanel title="Accessories">
                <PartSelector
                  label="Accessories"
                  partType="accessories"
                  currentPartId={configuration.parts.accessories}
                  onPartChange={(partId) => updatePart('accessories', partId)}
                  showNsfwContent={showNsfwContent}
                />
                {showNsfwContent && (
                  <PartSelector
                    label="Intimate Accessories"
                    partType="intimate_accessories"
                    currentPartId={configuration.parts.intimate_accessories}
                    onPartChange={(partId) => updatePart('intimate_accessories', partId)}
                    showNsfwContent={showNsfwContent}
                  />
                )}
              </CustomizationPanel>
            </div>
          )}

          {activeTab === 'morphing' && (
            <div className="space-y-4">
              {visibleMorphTargets.map(([targetName, morphTarget]) => (
                <CustomizationPanel key={targetName} title={morphTarget.name} collapsible>
                  <SliderControl
                    label={morphTarget.name}
                    value={configuration.morphTargets[targetName] ?? morphTarget.defaultValue}
                    min={morphTarget.min}
                    max={morphTarget.max}
                    step={0.01}
                    onChange={(value) => updateMorphTarget(targetName, value)}
                    format={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                </CustomizationPanel>
              ))}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              <CustomizationPanel title="Skin Material">
                <ColorPicker
                  label="Skin Tone"
                  value={new THREE.Color(configuration.materialOverrides?.skin?.value || '#FFDBAC')}
                  onChange={(color) =>
                    updateMaterialOverride('skin', { type: 'color', value: color })
                  }
                />
                <SliderControl
                  label="Smoothness"
                  value={
                    typeof configuration.materialOverrides?.skin_smoothness?.value === 'number'
                      ? configuration.materialOverrides.skin_smoothness.value
                      : 0.8
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterialOverride('skin_smoothness', { type: 'value', value })
                  }
                />
              </CustomizationPanel>

              <CustomizationPanel title="Hair Material">
                <ColorPicker
                  label="Hair Color"
                  value={new THREE.Color(configuration.materialOverrides?.hair?.value || '#8B4513')}
                  onChange={(color) =>
                    updateMaterialOverride('hair', { type: 'color', value: color })
                  }
                />
                <SliderControl
                  label="Shine"
                  value={
                    typeof configuration.materialOverrides?.hair_shine?.value === 'number'
                      ? configuration.materialOverrides.hair_shine.value
                      : 0.6
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterialOverride('hair_shine', { type: 'value', value })
                  }
                />
              </CustomizationPanel>

              <CustomizationPanel title="Clothing Material">
                <ColorPicker
                  label="Primary Color"
                  value={
                    new THREE.Color(
                      configuration.materialOverrides?.clothing_primary?.value || '#FFFFFF',
                    )
                  }
                  onChange={(color) =>
                    updateMaterialOverride('clothing_primary', { type: 'color', value: color })
                  }
                />
                <SliderControl
                  label="Roughness"
                  value={
                    typeof configuration.materialOverrides?.clothing_roughness?.value === 'number'
                      ? configuration.materialOverrides.clothing_roughness.value
                      : 0.5
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterialOverride('clothing_roughness', { type: 'value', value })
                  }
                />
              </CustomizationPanel>
            </div>
          )}

          {activeTab === 'lighting' && (
            <div className="space-y-4">
              <CustomizationPanel title="Lighting Preset">
                <div className="space-y-2">
                  {['studio', 'dramatic', 'soft', 'anime', 'intimate'].map((preset) => (
                    <label key={preset} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="lighting"
                        value={preset}
                        className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 focus:ring-pink-500"
                      />
                      <span className="text-sm text-white/80 capitalize">{preset}</span>
                    </label>
                  ))}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Environment">
                <SliderControl
                  label="Environment Intensity"
                  value={0.8}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={() => {}}
                />
                <SliderControl
                  label="Ambient Light"
                  value={0.3}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={() => {}}
                />
              </CustomizationPanel>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleSave}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Save Character
            </button>
            <button
              onClick={() => {
                const newConfig = avatarPartManager.createConfiguration('default-user', 'female');
                setConfiguration(newConfig);
                onConfigurationChange?.(newConfig);
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-white/20"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - 3D Preview */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 1.5, 3], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            <AvatarEditor
              configuration={configuration}
              lighting="studio"
              enableControls={true}
              enableAnimations={true}
              showOutline={true}
              quality="high"
            />
          </Suspense>
        </Canvas>

        {/* Loading Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Loading avatar...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
