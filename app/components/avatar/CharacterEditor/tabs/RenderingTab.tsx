'use client';

import * as THREE from 'three';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import {
  QUALITY_PRESETS,
  DEFAULT_CEL_SHADING_CONFIG,
  DEFAULT_PHYSICS_CONFIG,
} from '@/app/lib/3d/avatar-parts';
import { CustomizationPanel } from '../CustomizationPanel';
import { SliderControl } from '../SliderControl';
import { ColorPicker } from '../ColorPicker';

interface RenderingTabProps {
  configuration: AvatarConfiguration;
  updateConfiguration: (updates: Partial<AvatarConfiguration>) => void;
}

export function RenderingTab({ configuration, updateConfiguration }: RenderingTabProps) {
  return (
    <div
      id="panel-rendering"
      role="tabpanel"
      aria-labelledby="tab-rendering"
      className="space-y-4"
    >
      <CustomizationPanel title="Quality Preset">
        <div className="grid grid-cols-2 gap-2">
          {Object.values(QUALITY_PRESETS).map((preset) => (
            <button
              key={preset.id}
              onClick={() => updateConfiguration({ qualityPreset: preset.id })}
              className={`p-3 rounded-lg border transition-all text-left ${
                configuration.qualityPreset === preset.id
                  ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
              }`}
            >
              <div className="text-sm font-medium">{preset.name}</div>
              <div className="text-xs text-white/60 mt-1">
                {preset.textureSize}px • {preset.samples}x samples
              </div>
            </button>
          ))}
        </div>
      </CustomizationPanel>

      <CustomizationPanel title="Cel-Shading (Anime Style)">
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={configuration.celShadingConfig?.enabled ?? true}
              onChange={(e) =>
                updateConfiguration({
                  celShadingConfig: {
                    ...(configuration.celShadingConfig ?? DEFAULT_CEL_SHADING_CONFIG),
                    enabled: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-white/80">Enable Cel-Shading</span>
          </label>
          {configuration.celShadingConfig?.enabled && (
            <>
              <SliderControl
                label="Shadow Steps"
                value={configuration.celShadingConfig?.shadowSteps ?? 3}
                min={2}
                max={5}
                step={1}
                onChange={(value) =>
                  updateConfiguration({
                    celShadingConfig: {
                      ...(configuration.celShadingConfig ?? DEFAULT_CEL_SHADING_CONFIG),
                      shadowSteps: Math.round(value),
                    },
                  })
                }
                format={(value) => `${Math.round(value)} steps`}
              />
              <SliderControl
                label="Rim Light Intensity"
                value={configuration.celShadingConfig?.rimLightIntensity ?? 0.5}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) =>
                  updateConfiguration({
                    celShadingConfig: {
                      ...(configuration.celShadingConfig ?? DEFAULT_CEL_SHADING_CONFIG),
                      rimLightIntensity: value,
                    },
                  })
                }
                format={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <SliderControl
                label="Outline Width"
                value={configuration.celShadingConfig?.outlineWidth ?? 0.02}
                min={0}
                max={0.1}
                step={0.001}
                onChange={(value) =>
                  updateConfiguration({
                    celShadingConfig: {
                      ...(configuration.celShadingConfig ?? DEFAULT_CEL_SHADING_CONFIG),
                      outlineWidth: value,
                    },
                  })
                }
                format={(value) => `${(value * 1000).toFixed(1)}px`}
              />
              <ColorPicker
                label="Rim Light Color"
                value={
                  new THREE.Color(
                    configuration.celShadingConfig?.rimLightColor ?? '#ffffff',
                  )
                }
                onChange={(color) =>
                  updateConfiguration({
                    celShadingConfig: {
                      ...(configuration.celShadingConfig ?? DEFAULT_CEL_SHADING_CONFIG),
                      rimLightColor: `#${color.getHexString()}`,
                    },
                  })
                }
              />
            </>
          )}
        </div>
      </CustomizationPanel>

      <CustomizationPanel title="Physics Simulation">
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={configuration.physicsConfig?.hairPhysics ?? true}
              onChange={(e) =>
                updateConfiguration({
                  physicsConfig: {
                    ...(configuration.physicsConfig ?? DEFAULT_PHYSICS_CONFIG),
                    hairPhysics: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-white/80">Hair Physics</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={configuration.physicsConfig?.clothPhysics ?? true}
              onChange={(e) =>
                updateConfiguration({
                  physicsConfig: {
                    ...(configuration.physicsConfig ?? DEFAULT_PHYSICS_CONFIG),
                    clothPhysics: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-white/80">Cloth Physics</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={configuration.physicsConfig?.bodyPhysics ?? false}
              onChange={(e) =>
                updateConfiguration({
                  physicsConfig: {
                    ...(configuration.physicsConfig ?? DEFAULT_PHYSICS_CONFIG),
                    bodyPhysics: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-white/80">Body Physics</span>
          </label>
          <div className="space-y-2">
            <div className="text-sm text-white/80 mb-2">Physics Quality</div>
            <div className="grid grid-cols-2 gap-2">
              {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() =>
                    updateConfiguration({
                      physicsConfig: {
                        ...(configuration.physicsConfig ?? DEFAULT_PHYSICS_CONFIG),
                        physicsQuality: quality,
                      },
                    })
                  }
                  className={`p-2 rounded-lg border transition-all text-left ${
                    configuration.physicsConfig?.physicsQuality === quality
                      ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
                  }`}
                >
                  <div className="text-xs font-medium capitalize">{quality}</div>
                </button>
              ))}
            </div>
          </div>
          <SliderControl
            label="Spring Stiffness"
            value={configuration.physicsConfig?.springStiffness ?? 0.8}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) =>
              updateConfiguration({
                physicsConfig: {
                  ...(configuration.physicsConfig ?? DEFAULT_PHYSICS_CONFIG),
                  springStiffness: value,
                },
              })
            }
            format={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <SliderControl
            label="Damping"
            value={configuration.physicsConfig?.damping ?? 0.9}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) =>
              updateConfiguration({
                physicsConfig: {
                  ...(configuration.physicsConfig ?? DEFAULT_PHYSICS_CONFIG),
                  damping: value,
                },
              })
            }
            format={(value) => `${(value * 100).toFixed(0)}%`}
          />
        </div>
      </CustomizationPanel>
    </div>
  );
}

