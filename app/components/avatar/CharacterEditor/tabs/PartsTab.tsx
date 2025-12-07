'use client';

import type { AvatarConfiguration, AvatarPartType } from '@/app/lib/3d/avatar-parts';
import { CustomizationPanel } from '../CustomizationPanel';
import { PartSelector } from '../PartSelector';

interface PartsTabProps {
  configuration: AvatarConfiguration;
  updateConfiguration: (updates: Partial<AvatarConfiguration>) => void;
  updatePart: (partType: AvatarPartType, partId: string) => void;
  showNsfwContent: boolean;
  searchQuery: string;
  selectedCategory: string;
  filteredParts: (partType: AvatarPartType) => ReturnType<typeof import('@/app/lib/3d/avatar-parts').avatarPartManager.getPartsByType>; // eslint-disable-line @typescript-eslint/consistent-type-imports
  onConfigurationChange?: (config: AvatarConfiguration) => void;
  }

const ANIME_PRESETS = [
  {
    id: 'sailor-moon',
    name: 'Sailor Moon',
    description: 'Magical girl style',
    config: {
      baseModel: 'female' as const,
      parts: {
        hair: 'hair_twin_tails',
        clothing: 'clothing_sailor_uniform',
      },
      morphTargets: {
        eyeSize: 1.5,
        eyeShape: 1.0,
        cheekbones: 0.7,
      },
      materialOverrides: {
        hair: { slot: 'hair', type: 'color' as const, value: '#FFD700' },
        clothing_primary: {
          slot: 'clothing',
          type: 'color' as const,
          value: '#4169E1',
        },
      },
    },
  },
  {
    id: 'sakura-kinomoto',
    name: 'Sakura',
    description: 'Cardcaptor style',
    config: {
      baseModel: 'female' as const,
      parts: {
        hair: 'hair_short_bob',
        clothing: 'clothing_school_uniform',
      },
      morphTargets: {
        eyeSize: 1.4,
        eyeShape: 0.9,
        cheekbones: 0.6,
      },
      materialOverrides: {
        hair: { slot: 'hair', type: 'color' as const, value: '#8B4513' },
        clothing_primary: {
          slot: 'clothing',
          type: 'color' as const,
          value: '#FF69B4',
        },
      },
    },
  },
  {
    id: 'anime-warrior',
    name: 'Anime Warrior',
    description: 'Fierce fighter',
    config: {
      baseModel: 'female' as const,
      parts: {
        hair: 'hair_long_pink',
        clothing: 'clothing_samurai',
      },
      morphTargets: {
        eyeSize: 1.3,
        eyeShape: 0.8,
        cheekbones: 0.5,
      },
      materialOverrides: {
        hair: { slot: 'hair', type: 'color' as const, value: '#FF69B4' },
        clothing_primary: {
          slot: 'clothing',
          type: 'color' as const,
          value: '#8B0000',
        },
      },
    },
  },
  {
    id: 'cute-idol',
    name: 'Cute Idol',
    description: 'Pop star style',
    config: {
      baseModel: 'female' as const,
      parts: {
        hair: 'hair_long_flowing',
        clothing: 'clothing_dance_outfit',
      },
      morphTargets: {
        eyeSize: 1.6,
        eyeShape: 1.0,
        cheekbones: 0.8,
      },
      materialOverrides: {
        hair: { slot: 'hair', type: 'color' as const, value: '#FF1493' },
        clothing_primary: {
          slot: 'clothing',
          type: 'color' as const,
          value: '#9370DB',
        },
      },
    },
  },
];

export function PartsTab({
  configuration,
  updateConfiguration,
  updatePart,
  showNsfwContent,
  searchQuery,
  selectedCategory,
  filteredParts,
  onConfigurationChange,
}: PartsTabProps) {
  return (
    <div id="panel-parts" role="tabpanel" aria-labelledby="tab-parts" className="space-y-4">
      <CustomizationPanel title="90s Anime Presets" collapsible defaultCollapsed={false}>
        <div className="grid grid-cols-2 gap-2">
          {ANIME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                const newConfig = {
                  ...configuration,
                  ...preset.config,
                  parts: { ...configuration.parts, ...preset.config.parts },
                  morphTargets: {
                    ...configuration.morphTargets,
                    ...preset.config.morphTargets,
                  },
                  materialOverrides: {
                    ...configuration.materialOverrides,
                    ...preset.config.materialOverrides,
                  },
                };
                updateConfiguration(newConfig);
                onConfigurationChange?.(newConfig);
              }}
              className="p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-left transition-colors"
            >
              <div className="text-sm font-medium text-white">{preset.name}</div>
              <div className="text-xs text-white/60 mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </CustomizationPanel>

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
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          resolveParts={filteredParts}
        />
        <PartSelector
          label="Hair"
          partType="hair"
          currentPartId={configuration.parts.hair}
          onPartChange={(partId) => updatePart('hair', partId)}
          showNsfwContent={showNsfwContent}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          resolveParts={filteredParts}
        />
      </CustomizationPanel>

      <CustomizationPanel title="Body">
        <PartSelector
          label="Body"
          partType="body"
          currentPartId={configuration.parts.body}
          onPartChange={(partId) => updatePart('body', partId)}
          showNsfwContent={showNsfwContent}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          resolveParts={filteredParts}
        />
      </CustomizationPanel>

      <CustomizationPanel title="Clothing">
        <PartSelector
          label="Clothing"
          partType="clothing"
          currentPartId={configuration.parts.clothing}
          onPartChange={(partId) => updatePart('clothing', partId)}
          showNsfwContent={showNsfwContent}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          resolveParts={filteredParts}
        />
        {showNsfwContent && (
          <PartSelector
            label="Lingerie"
            partType="lingerie"
            currentPartId={configuration.parts.lingerie}
            onPartChange={(partId) => updatePart('lingerie', partId)}
            showNsfwContent={showNsfwContent}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            resolveParts={filteredParts}
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
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          resolveParts={filteredParts}
        />
        {showNsfwContent && (
          <PartSelector
            label="Intimate Accessories"
            partType="intimate_accessories"
            currentPartId={configuration.parts.intimate_accessories}
            onPartChange={(partId) => updatePart('intimate_accessories', partId)}
            showNsfwContent={showNsfwContent}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            resolveParts={filteredParts}
          />
        )}
      </CustomizationPanel>
    </div>
  );
}

