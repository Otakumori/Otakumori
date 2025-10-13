'use client';

import { SliderControl } from './SliderControl.safe';

interface NSFWCustomizerProps {
  config: any;
  onChange: (config: any) => void;
  gender: 'male' | 'female';
}

export function NSFWCustomizer({ config, onChange, gender }: NSFWCustomizerProps) {
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

  const ensureConfig = () => {
    if (!config) {
      onChange({
        enabled: false,
        features: {
          anatomyDetail: 0.0,
          arousalIndicators: false,
          interactionLevel: 'none',
        },
        customization: {},
      });
    }
  };

  const handleEnableChange = (enabled: boolean) => {
    if (enabled) {
      updateConfig('enabled', true);
      updateConfig('features.anatomyDetail', 0.5);
      updateConfig('features.arousalIndicators', false);
      updateConfig('features.interactionLevel', 'basic');
    } else {
      updateConfig('enabled', false);
    }
  };

  // Ensure config exists
  if (!config) {
    ensureConfig();
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="text-red-300 text-sm font-medium mb-2">Adult Content Warning</div>
        <div className="text-red-200 text-xs">
          This section contains adult customization options. Only enable if you're 18+ and
          comfortable with mature content.
        </div>
      </div>

      {/* Enable/Disable */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Adult Features</h4>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableNSFW"
            checked={config.enabled || false}
            onChange={(e) => handleEnableChange(e.target.checked)}
            className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
          />
          <label htmlFor="enableNSFW" className="text-white text-sm">
            Enable adult content customization
          </label>
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Feature Settings */}
          <div className="space-y-4">
            <h4 className="text-pink-300 font-medium">Feature Settings</h4>

            <SliderControl
              label="Anatomy Detail"
              value={config.features?.anatomyDetail || 0.0}
              min={0.0}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('features.anatomyDetail', value)}
              description="Level of anatomical detail and realism"
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="arousalIndicators"
                checked={config.features?.arousalIndicators || false}
                onChange={(e) => updateConfig('features.arousalIndicators', e.target.checked)}
                className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
              />
              <label htmlFor="arousalIndicators" className="text-white text-sm">
                Enable arousal indicators
              </label>
            </div>

            <div>
              <label htmlFor="nsfw-interaction-level" className="block text-white text-sm font-medium mb-2">
                Interaction Level
              </label>
              <select
                id="nsfw-interaction-level"
                value={config.features?.interactionLevel || 'none'}
                onChange={(e) => updateConfig('features.interactionLevel', e.target.value)}
                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
                <option value="explicit">Explicit</option>
              </select>
            </div>
          </div>

          {/* Gender-Specific Customization */}
          <div className="space-y-4">
            <h4 className="text-pink-300 font-medium">
              {gender === 'male' ? 'Male-Specific Features' : 'Female-Specific Features'}
            </h4>

            {gender === 'male' && (
              <>
                <SliderControl
                  label="Genital Size"
                  value={config.customization?.genitalSize || 1.0}
                  min={0.5}
                  max={1.5}
                  step={0.01}
                  onChange={(value: number) => updateConfig('customization.genitalSize', value)}
                  description="Size customization"
                />

                <SliderControl
                  label="Genital Shape"
                  value={config.customization?.genitalShape || 0.5}
                  min={0.0}
                  max={1.0}
                  step={0.01}
                  onChange={(value: number) => updateConfig('customization.genitalShape', value)}
                  description="Shape variation"
                />
              </>
            )}

            {gender === 'female' && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="breastPhysics"
                    checked={config.customization?.breastPhysics || false}
                    onChange={(e) => updateConfig('customization.breastPhysics', e.target.checked)}
                    className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="breastPhysics" className="text-white text-sm">
                    Enable breast physics
                  </label>
                </div>

                <SliderControl
                  label="Nipple Size"
                  value={config.customization?.nippleSize || 1.0}
                  min={0.5}
                  max={1.5}
                  step={0.01}
                  onChange={(value: number) => updateConfig('customization.nippleSize', value)}
                  description="Nipple size variation"
                />

                <SliderControl
                  label="Areola Size"
                  value={config.customization?.areolaSize || 1.0}
                  min={0.5}
                  max={1.5}
                  step={0.01}
                  onChange={(value: number) => updateConfig('customization.areolaSize', value)}
                  description="Areola size variation"
                />
              </>
            )}
          </div>

          {/* Universal Features */}
          <div className="space-y-4">
            <h4 className="text-pink-300 font-medium">Universal Features</h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enablePubicHair"
                  checked={!!config.customization?.pubicHair}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateConfig('customization.pubicHair', {
                        style: 'natural',
                        density: 0.5,
                        color: '#8B4513',
                      });
                    } else {
                      updateConfig('customization.pubicHair', undefined);
                    }
                  }}
                  className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                />
                <label htmlFor="enablePubicHair" className="text-white text-sm">
                  Enable pubic hair customization
                </label>
              </div>

              {config.customization?.pubicHair && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label htmlFor="nsfw-hair-style" className="block text-white text-sm font-medium mb-2">
                      Hair Style
                    </label>
                    <select
                      id="nsfw-hair-style"
                      value={config.customization.pubicHair.style || 'natural'}
                      onChange={(e) =>
                        updateConfig('customization.pubicHair.style', e.target.value)
                      }
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="natural">Natural</option>
                      <option value="trimmed">Trimmed</option>
                      <option value="shaped">Shaped</option>
                      <option value="landing-strip">Landing Strip</option>
                      <option value="brazilian">Brazilian</option>
                      <option value="completely-bare">Completely Bare</option>
                    </select>
                  </div>

                  <SliderControl
                    label="Hair Density"
                    value={config.customization.pubicHair.density || 0.5}
                    min={0.0}
                    max={1.0}
                    step={0.01}
                    onChange={(value: number) =>
                      updateConfig('customization.pubicHair.density', value)
                    }
                    description="Hair thickness and coverage"
                  />

                  <div className="space-y-2">
                    <label htmlFor="nsfw-hair-color" className="block text-white text-sm font-medium">
                      Hair Color
                    </label>
                    <input
                      id="nsfw-hair-color"
                      type="color"
                      value={config.customization.pubicHair.color || '#8B4513'}
                      onChange={(e) =>
                        updateConfig('customization.pubicHair.color', e.target.value)
                      }
                      className="w-full h-8 rounded border border-white/20 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="text-yellow-300 text-sm font-medium">Content Guidelines</div>
            <div className="text-yellow-200 text-xs mt-1">
              • All content must comply with platform guidelines • Explicit interactions are only
              available in gated areas • User preferences are respected for all content • Report any
              inappropriate content immediately
            </div>
          </div>
        </>
      )}
    </div>
  );
}
