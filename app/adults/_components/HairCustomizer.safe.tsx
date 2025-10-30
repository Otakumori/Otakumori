'use client';

import { SliderControl } from './SliderControl.safe';

interface HairCustomizerProps {
  config: any;
  onChange: (config: any) => void;
}

export function HairCustomizer({ config, onChange }: HairCustomizerProps) {
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

  const hairStyles = [
    { id: 'default', name: 'Default', description: 'Basic hairstyle' },
    { id: 'long-straight', name: 'Long Straight', description: 'Long straight hair' },
    { id: 'long-curly', name: 'Long Curly', description: 'Long curly hair' },
    { id: 'short-bob', name: 'Short Bob', description: 'Short bob cut' },
    { id: 'pixie-cut', name: 'Pixie Cut', description: 'Short pixie cut' },
    { id: 'ponytail', name: 'Ponytail', description: 'Ponytail style' },
    { id: 'twin-tails', name: 'Twin Tails', description: 'Twin tail hairstyle' },
    { id: 'space-buns', name: 'Space Buns', description: 'Space bun hairstyle' },
    { id: 'messy', name: 'Messy', description: 'Messy bedhead style' },
    { id: 'elegant', name: 'Elegant', description: 'Elegant formal style' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold">Hair & Style</h3>

      {/* Hair Style Selection */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Hair Style</h4>

        <div className="grid grid-cols-2 gap-2">
          {hairStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => updateConfig('style', style.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                config.style === style.id
                  ? 'bg-pink-500/30 border border-pink-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="text-sm font-medium text-white">{style.name}</div>
              <div className="text-xs text-zinc-400 mt-1">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Hair Properties */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Hair Properties</h4>

        <SliderControl
          label="Length"
          value={config.length}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('length', value)}
          description="Hair length from short to long"
        />

        <SliderControl
          label="Volume"
          value={config.volume}
          min={0.5}
          max={1.5}
          step={0.01}
          onChange={(value: number) => updateConfig('volume', value)}
          description="Hair thickness and volume"
        />

        <SliderControl
          label="Texture"
          value={config.texture}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('texture', value)}
          description="Straight to curly texture"
        />
      </div>

      {/* Hair Color */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Hair Color</h4>

        <div className="space-y-2">
          <label htmlFor="primaryColor" className="block text-white text-sm font-medium">
            Primary Color
          </label>
          <input
            id="primaryColor"
            type="color"
            value={config.color?.primary || '#8B4513'}
            onChange={(e) => updateConfig('color.primary', e.target.value)}
            className="w-full h-10 rounded-lg border border-white/20 cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableHighlights"
            checked={config.highlights?.enabled || false}
            onChange={(e) => updateConfig('highlights.enabled', e.target.checked)}
            className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
          />
          <label htmlFor="enableHighlights" className="text-white text-sm">
            Enable highlights
          </label>
        </div>

        {config.highlights?.enabled && (
          <div className="space-y-3 ml-6">
            <div className="space-y-2">
              <label htmlFor="highlightColor" className="block text-white text-sm font-medium">
                Highlight Color
              </label>
              <input
                id="highlightColor"
                type="color"
                value={config.highlights?.color || '#FFD700'}
                onChange={(e) => updateConfig('highlights.color', e.target.value)}
                className="w-full h-8 rounded border border-white/20 cursor-pointer"
              />
            </div>

            <SliderControl
              label="Highlight Intensity"
              value={config.highlights?.intensity || 0.5}
              min={0.0}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('highlights.intensity', value)}
              description="Highlight visibility and strength"
            />

            <div>
              <label
                htmlFor="highlightPattern"
                className="block text-white text-sm font-medium mb-2"
              >
                Highlight Pattern
              </label>
              <select
                id="highlightPattern"
                value={config.highlights?.pattern || 'streaks'}
                onChange={(e) => updateConfig('highlights.pattern', e.target.value)}
                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="streaks">Streaks</option>
                <option value="tips">Tips</option>
                <option value="roots">Roots</option>
                <option value="random">Random</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Hair Accessories */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Hair Accessories</h4>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'hairband', name: 'Hairband', description: 'Simple hairband' },
            { id: 'headband', name: 'Headband', description: 'Decorative headband' },
            { id: 'bow', name: 'Bow', description: 'Hair bow accessory' },
            { id: 'clip', name: 'Hair Clip', description: 'Decorative hair clip' },
            { id: 'flowers', name: 'Flowers', description: 'Flower accessories' },
            { id: 'ribbon', name: 'Ribbon', description: 'Hair ribbon' },
            { id: 'crown', name: 'Crown', description: 'Small crown accessory' },
            { id: 'none', name: 'None', description: 'No accessories' },
          ].map((accessory) => (
            <button
              key={accessory.id}
              onClick={() => {
                const currentAccessories = config.accessories || [];
                if (accessory.id === 'none') {
                  updateConfig('accessories', []);
                } else if (currentAccessories.includes(accessory.id)) {
                  updateConfig(
                    'accessories',
                    currentAccessories.filter((id: string) => id !== accessory.id),
                  );
                } else {
                  updateConfig('accessories', [...currentAccessories, accessory.id]);
                }
              }}
              className={`p-2 rounded-lg text-left transition-colors ${
                config.accessories?.includes(accessory.id) ||
                (accessory.id === 'none' &&
                  (!config.accessories || config.accessories.length === 0))
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
    </div>
  );
}
