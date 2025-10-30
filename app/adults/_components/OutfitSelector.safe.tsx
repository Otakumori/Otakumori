'use client';

import { SliderControl } from './SliderControl.safe';

interface OutfitSelectorProps {
  config: any;
  onChange: (config: any) => void;
  gender: 'male' | 'female';
}

export function OutfitSelector({ config, onChange, gender }: OutfitSelectorProps) {
  // Log gender context for outfit recommendations
  console.warn('OutfitSelector initialized for gender:', gender);

  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] = { ...current[keys[i]] };
    }

    current[keys[keys.length - 1]] = value;
    onChange(newConfig);
  };

  const outfitTypes = [
    {
      id: 'school-uniform',
      name: 'School Uniform',
      description: 'Classic anime school uniform',
      anime: true,
    },
    { id: 'casual', name: 'Casual', description: 'Everyday casual clothing', anime: false },
    { id: 'formal', name: 'Formal', description: 'Elegant formal wear', anime: false },
    { id: 'athletic', name: 'Athletic', description: 'Sporty athletic wear', anime: false },
    { id: 'fantasy', name: 'Fantasy', description: 'Fantasy RPG-inspired outfit', anime: true },
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'Futuristic cyberpunk style', anime: true },
    { id: 'gothic', name: 'Gothic', description: 'Dark gothic fashion', anime: true },
    { id: 'kawaii', name: 'Kawaii', description: 'Cute kawaii fashion', anime: true },
  ];

  const animeAccessories = [
    { id: 'cat-ears', name: 'Cat Ears', description: 'Cute cat ear headband' },
    { id: 'glasses', name: 'Glasses', description: 'Anime-style glasses' },
    { id: 'choker', name: 'Choker', description: 'Decorative choker necklace' },
    { id: 'gloves', name: 'Gloves', description: 'Stylish gloves' },
    { id: 'socks', name: 'Thigh Highs', description: 'Thigh high socks' },
    { id: 'shoes', name: 'Anime Shoes', description: 'Stylish anime shoes' },
    { id: 'bag', name: 'School Bag', description: 'Anime school bag' },
    { id: 'watch', name: 'Watch', description: 'Stylish watch accessory' },
  ];

  const gamingAccessories = [
    { id: 'sword', name: 'Sword', description: 'Fantasy sword accessory' },
    { id: 'shield', name: 'Shield', description: 'Knight shield accessory' },
    { id: 'staff', name: 'Staff', description: 'Magical staff accessory' },
    { id: 'bow', name: 'Bow', description: 'Archer bow accessory' },
    { id: 'wand', name: 'Wand', description: 'Magic wand accessory' },
    { id: 'gun', name: 'Energy Gun', description: 'Cyberpunk energy weapon' },
    { id: 'helmet', name: 'Helmet', description: 'Gaming helmet accessory' },
    { id: 'backpack', name: 'Adventure Pack', description: 'Adventure backpack' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold">Outfits & Accessories</h3>

      {/* Primary Outfit Type */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Outfit Type</h4>

        <div className="grid grid-cols-2 gap-2">
          {outfitTypes.map((outfit) => (
            <button
              key={outfit.id}
              onClick={() => updateConfig('primary.type', outfit.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                config.primary?.type === outfit.id
                  ? 'bg-pink-500/30 border border-pink-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white">{outfit.name}</div>
                {outfit.anime && (
                  <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">
                    Anime
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-400 mt-1">{outfit.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Outfit Color */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Outfit Colors</h4>

        <div className="space-y-2">
          <label htmlFor="outfit-primary-color" className="block text-white text-sm font-medium">
            Primary Color
          </label>
          <input
            id="outfit-primary-color"
            type="color"
            value={config.primary?.color || '#FF6B9D'}
            onChange={(e) => updateConfig('primary.color', e.target.value)}
            className="w-full h-10 rounded-lg border border-white/20 cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableSecondary"
            checked={!!config.secondary?.type}
            onChange={(e) => {
              if (e.target.checked) {
                updateConfig('secondary.type', 'underlayer');
                updateConfig('secondary.color', '#FFFFFF');
                updateConfig('secondary.opacity', 0.5);
              } else {
                updateConfig('secondary', {});
              }
            }}
            className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
          />
          <label htmlFor="enableSecondary" className="text-white text-sm">
            Enable secondary outfit layer
          </label>
        </div>

        {config.secondary?.type && (
          <div className="space-y-3 ml-6">
            <div className="space-y-2">
              <label
                htmlFor="outfit-secondary-color"
                className="block text-white text-sm font-medium"
              >
                Secondary Color
              </label>
              <input
                id="outfit-secondary-color"
                type="color"
                value={config.secondary?.color || '#FFFFFF'}
                onChange={(e) => updateConfig('secondary.color', e.target.value)}
                className="w-full h-8 rounded border border-white/20 cursor-pointer"
              />
            </div>

            <SliderControl
              label="Layer Opacity"
              value={config.secondary?.opacity || 0.5}
              min={0.0}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('secondary.opacity', value)}
              description="Transparency of secondary layer"
            />
          </div>
        )}
      </div>

      {/* Outfit Fit */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Outfit Fit</h4>

        <SliderControl
          label="Tightness"
          value={config.fit?.tightness || 0.6}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('fit.tightness', value)}
          description="How tight the outfit fits"
        />

        <SliderControl
          label="Length"
          value={config.fit?.length || 0.7}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('fit.length', value)}
          description="Length of the outfit"
        />

        <div>
          <label htmlFor="outfit-style-level" className="block text-white text-sm font-medium mb-2">
            Style Level
          </label>
          <select
            id="outfit-style-level"
            value={config.fit?.style || 'moderate'}
            onChange={(e) => updateConfig('fit.style', e.target.value)}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="revealing">Revealing</option>
            <option value="suggestive">Suggestive</option>
          </select>
        </div>
      </div>

      {/* Anime Accessories */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Anime Accessories</h4>

        <div className="grid grid-cols-2 gap-2">
          {animeAccessories.map((accessory) => (
            <button
              key={accessory.id}
              onClick={() => {
                const currentAccessories = config.primary?.accessories || [];
                if (currentAccessories.includes(accessory.id)) {
                  updateConfig(
                    'primary.accessories',
                    currentAccessories.filter((id: string) => id !== accessory.id),
                  );
                } else {
                  updateConfig('primary.accessories', [...currentAccessories, accessory.id]);
                }
              }}
              className={`p-2 rounded-lg text-left transition-colors ${
                config.primary?.accessories?.includes(accessory.id)
                  ? 'bg-pink-500/30 border border-pink-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="text-sm font-medium text-white">{accessory.name}</div>
              <div className="text-xs text-zinc-400">{accessory.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Gaming Accessories */}
      {(config.primary?.type === 'fantasy' || config.primary?.type === 'cyberpunk') && (
        <div className="space-y-4">
          <h4 className="text-pink-300 font-medium">Gaming Accessories</h4>

          <div className="grid grid-cols-2 gap-2">
            {gamingAccessories.map((accessory) => (
              <button
                key={accessory.id}
                onClick={() => {
                  const currentAccessories = config.primary?.accessories || [];
                  if (currentAccessories.includes(accessory.id)) {
                    updateConfig(
                      'primary.accessories',
                      currentAccessories.filter((id: string) => id !== accessory.id),
                    );
                  } else {
                    updateConfig('primary.accessories', [...currentAccessories, accessory.id]);
                  }
                }}
                className={`p-2 rounded-lg text-left transition-colors ${
                  config.primary?.accessories?.includes(accessory.id)
                    ? 'bg-purple-500/30 border border-purple-400/50'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="text-sm font-medium text-white">{accessory.name}</div>
                <div className="text-xs text-zinc-400">{accessory.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
