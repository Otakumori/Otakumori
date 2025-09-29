'use client';

import { SliderControl } from './SliderControl.safe';

interface MaterialEditorProps {
  config: any;
  onChange: (config: any) => void;
}

export function MaterialEditor({ config, onChange }: MaterialEditorProps) {
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

  const shaderTypes = [
    { id: 'AnimeToon', name: 'Anime Toon', description: 'Classic anime cel-shading style' },
    { id: 'Realistic', name: 'Realistic', description: 'Photorealistic rendering' },
    { id: 'CelShaded', name: 'Cel Shaded', description: 'Sharp cel-shading with hard edges' },
    { id: 'Stylized', name: 'Stylized', description: 'Custom stylized rendering' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold">Materials & Rendering</h3>

      {/* Shader Selection */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Shader Type</h4>

        <div className="grid grid-cols-2 gap-2">
          {shaderTypes.map((shader) => (
            <button
              key={shader.id}
              onClick={() => updateConfig('shader', shader.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                config.shader === shader.id
                  ? 'bg-pink-500/30 border border-pink-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="text-sm font-medium text-white">{shader.name}</div>
              <div className="text-xs text-zinc-400 mt-1">{shader.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Material Parameters */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Material Parameters</h4>

        <SliderControl
          label="Gloss Strength"
          value={config.parameters?.glossStrength || 0.6}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('parameters.glossStrength', value)}
          description="Surface glossiness and shine"
        />

        <SliderControl
          label="Rim Strength"
          value={config.parameters?.rimStrength || 0.35}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('parameters.rimStrength', value)}
          description="Rim lighting intensity"
        />

        <SliderControl
          label="Metallic"
          value={config.parameters?.metallic || 0.1}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('parameters.metallic', value)}
          description="Metal-like surface properties"
        />

        <SliderControl
          label="Roughness"
          value={config.parameters?.roughness || 0.3}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('parameters.roughness', value)}
          description="Surface roughness and scattering"
        />
      </div>

      {/* Color Controls */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Colors</h4>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-white text-sm font-medium">Primary Color</label>
            <input
              type="color"
              value={config.parameters?.colorA || '#FF6B9D'}
              onChange={(e) => updateConfig('parameters.colorA', e.target.value)}
              className="w-full h-10 rounded-lg border border-white/20 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white text-sm font-medium">Secondary Color</label>
            <input
              type="color"
              value={config.parameters?.colorB || '#8B5CF6'}
              onChange={(e) => updateConfig('parameters.colorB', e.target.value)}
              className="w-full h-10 rounded-lg border border-white/20 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white text-sm font-medium">Rim Color</label>
            <input
              type="color"
              value={config.parameters?.rimColor || '#FFD700'}
              onChange={(e) => updateConfig('parameters.rimColor', e.target.value)}
              className="w-full h-10 rounded-lg border border-white/20 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Texture Settings */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Textures</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Albedo Texture</label>
            <input
              type="url"
              value={config.textures?.albedo || ''}
              onChange={(e) => updateConfig('textures.albedo', e.target.value)}
              placeholder="URL to albedo texture"
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Normal Map</label>
            <input
              type="url"
              value={config.textures?.normal || ''}
              onChange={(e) => updateConfig('textures.normal', e.target.value)}
              placeholder="URL to normal map"
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">ORM Texture</label>
            <input
              type="url"
              value={config.textures?.orm || ''}
              onChange={(e) => updateConfig('textures.orm', e.target.value)}
              placeholder="URL to ORM (Occlusion/Roughness/Metallic) texture"
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Mask Texture</label>
            <input
              type="url"
              value={config.textures?.mask || ''}
              onChange={(e) => updateConfig('textures.mask', e.target.value)}
              placeholder="URL to mask texture"
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Decals</label>
            <input
              type="url"
              value={config.textures?.decals || ''}
              onChange={(e) => updateConfig('textures.decals', e.target.value)}
              placeholder="URL to decals texture"
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Texture Preview */}
      {config.textures?.albedo && (
        <div className="space-y-2">
          <h5 className="text-white text-sm font-medium">Texture Preview</h5>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 rounded-lg p-2">
              <img
                src={config.textures.albedo}
                alt="Albedo texture"
                className="w-full h-16 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="text-xs text-zinc-400 mt-1">Albedo</div>
            </div>
            {config.textures.normal && (
              <div className="bg-black/20 rounded-lg p-2">
                <img
                  src={config.textures.normal}
                  alt="Normal map"
                  className="w-full h-16 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="text-xs text-zinc-400 mt-1">Normal</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shader-Specific Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="text-blue-300 text-sm font-medium">Shader Information</div>
        <div className="text-blue-200 text-xs mt-1">
          {config.shader === 'AnimeToon' &&
            'Anime Toon shader provides classic cel-shading with smooth gradients and rim lighting.'}
          {config.shader === 'Realistic' &&
            'Realistic shader uses PBR materials for photorealistic rendering.'}
          {config.shader === 'CelShaded' &&
            'Cel Shaded provides sharp, flat shading with hard edges for a comic book look.'}
          {config.shader === 'Stylized' &&
            'Stylized shader allows for custom rendering effects and artistic styles.'}
        </div>
      </div>
    </div>
  );
}
