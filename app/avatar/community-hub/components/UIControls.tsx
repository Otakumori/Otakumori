/**
 * UI Controls Component - All customization panels
 */

'use client';

import { logger } from '@/app/lib/logger';
import React, { useState, useCallback, useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import type { CharacterConfig } from '../lib/character-state';
import { HAIR_STYLES, OUTFIT_STYLES, ACCESSORY_TYPES, FACE_PRESETS } from '../lib/constants';
import { generateRandomConfig, cloneConfig } from '../lib/character-state';
import ColorPicker from './ColorPicker';
import SliderControl from './SliderControl';
import {
  exportJSON,
  exportGLB,
  exportZIP,
  copyJSONToClipboard,
  generateFilename,
} from '../lib/export';
import type * as THREE from 'three';

interface UIControlsProps {
  config: CharacterConfig;
  onConfigChange: (config: CharacterConfig) => void;
  sceneRef?: React.MutableRefObject<THREE.Group | null>;
}

export default function UIControls({ config, onConfigChange, sceneRef }: UIControlsProps) {
  const [activeTab, setActiveTab] = useState('body');
  const [isExporting, setIsExporting] = useState(false);

  // Memoize export filename generation to avoid recalculation on each render
  const exportFilename = useMemo(() => {
    return {
      json: generateFilename('avatar', 'json'),
      glb: generateFilename('avatar', 'glb'),
      zip: generateFilename('avatar-export', 'zip'),
    };
  }, []);

  const updateConfig = useCallback(
    (updates: Partial<CharacterConfig>) => {
      const newConfig = cloneConfig(config);
      Object.assign(newConfig, updates);
      onConfigChange(newConfig);
    },
    [config, onConfigChange],
  );

  const handleRandomize = useCallback(() => {
    const randomConfig = generateRandomConfig();
    onConfigChange(randomConfig);
  }, [onConfigChange]);

  const handleReset = useCallback(() => {
    const defaultConfig = cloneConfig(config);
    // Reset to defaults but keep structure
    defaultConfig.hair = { style: 'short', rootColor: '#FF66CC', tipColor: '#FFAAC0', gloss: 0.5 };
    defaultConfig.eyes = { irisShape: 1, colorLeft: '#4B0082', colorRight: '#4B0082' };
    defaultConfig.outfit = { id: 'casual', primaryColor: '#1C1C1C', secondaryColor: '#444444' };
    defaultConfig.accessories = [];
    defaultConfig.physique = { height: 0.5, width: 0.5, bust: 0.5, waist: 0.5, hips: 0.5 };
    defaultConfig.skinTone = '#FFDBAC';
    onConfigChange(defaultConfig);
  }, [onConfigChange]);

  const handleExportJSON = () => {
    try {
      exportJSON(config, exportFilename.json);
    } catch (error) {
      logger.error('Export failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      alert('Failed to export JSON. Check console for details.');
    }
  };

  const handleExportGLB = async () => {
    if (!sceneRef?.current) {
      alert('Scene not ready. Please wait a moment and try again.');
      return;
    }

    setIsExporting(true);
    try {
      await exportGLB(sceneRef.current, exportFilename.glb);
    } catch (error) {
      logger.error('Export failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      alert('Failed to export GLB. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZIP = async () => {
    if (!sceneRef?.current) {
      alert('Scene not ready. Please wait a moment and try again.');
      return;
    }

    setIsExporting(true);
    try {
      await exportZIP(config, sceneRef.current, exportFilename.zip);
    } catch (error) {
      logger.error('Export failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      alert('Failed to export ZIP. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    const success = await copyJSONToClipboard(config);
    if (success) {
      alert('Configuration copied to clipboard!');
    } else {
      alert('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="flex h-full flex-col bg-black/40 backdrop-blur-lg">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <h2 className="text-xl font-bold text-white">Avatar Customization</h2>
        <p className="text-sm text-white/70">Customize your character in real-time</p>
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <Tabs.List className="flex border-b border-white/10">
          {[
            { id: 'body', label: 'Body' },
            { id: 'face', label: 'Face' },
            { id: 'hair', label: 'Hair' },
            { id: 'outfit', label: 'Outfit' },
            { id: 'accessories', label: 'Accessories' },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className={cn(
                'flex-1 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-white/70 transition-colors',
                'hover:text-white focus:outline-none',
                activeTab === tab.id && 'border-pink-500 text-white',
              )}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Body Tab */}
          <Tabs.Content value="body" className="space-y-4">
            <div className="space-y-4">
              <div>
                <fieldset>
                  <legend className="mb-2 block text-sm font-medium text-white/90">Gender</legend>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateConfig({ gender: 'male' })}
                      className={cn(
                        'flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                        config.gender === 'male'
                          ? 'border-pink-500 bg-pink-500/20 text-white'
                          : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10',
                      )}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => updateConfig({ gender: 'female' })}
                      className={cn(
                        'flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                        config.gender === 'female'
                          ? 'border-pink-500 bg-pink-500/20 text-white'
                          : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10',
                      )}
                    >
                      Female
                    </button>
                  </div>
                </fieldset>
              </div>

              <ColorPicker
                label="Skin Tone"
                value={config.skinTone}
                onChange={(color) => updateConfig({ skinTone: color })}
              />

              <SliderControl
                label="Height"
                value={config.physique.height}
                onChange={(value) =>
                  updateConfig({
                    physique: { ...config.physique, height: value },
                  })
                }
              />

              <SliderControl
                label="Width"
                value={config.physique.width}
                onChange={(value) =>
                  updateConfig({
                    physique: { ...config.physique, width: value },
                  })
                }
              />

              {config.gender === 'female' && (
                <>
                  <SliderControl
                    label="Bust"
                    value={config.physique.bust}
                    onChange={(value) =>
                      updateConfig({
                        physique: { ...config.physique, bust: value },
                      })
                    }
                  />
                  <SliderControl
                    label="Waist"
                    value={config.physique.waist}
                    onChange={(value) =>
                      updateConfig({
                        physique: { ...config.physique, waist: value },
                      })
                    }
                  />
                  <SliderControl
                    label="Hips"
                    value={config.physique.hips}
                    onChange={(value) =>
                      updateConfig({
                        physique: { ...config.physique, hips: value },
                      })
                    }
                  />
                </>
              )}
            </div>
          </Tabs.Content>

          {/* Face Tab */}
          <Tabs.Content value="face" className="space-y-4">
            <div>
              <label htmlFor="face-preset-select" className="mb-2 block text-sm font-medium text-white/90">Face Preset</label>
              <select
                id="face-preset-select"
                value={config.faceId}
                onChange={(e) => updateConfig({ faceId: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              >
                {FACE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="left-eye-color" className="mb-2 block text-sm font-medium text-white/90">Left Eye Color</label>
              <ColorPicker
                value={config.eyes.colorLeft}
                onChange={(color) =>
                  updateConfig({
                    eyes: { ...config.eyes, colorLeft: color },
                  })
                }
                label=""
              />
            </div>

            <div>
              <label htmlFor="right-eye-color" className="mb-2 block text-sm font-medium text-white/90">
                Right Eye Color
              </label>
              <ColorPicker
                value={config.eyes.colorRight}
                onChange={(color) =>
                  updateConfig({
                    eyes: { ...config.eyes, colorRight: color },
                  })
                }
                label=""
              />
            </div>
          </Tabs.Content>

          {/* Hair Tab */}
          <Tabs.Content value="hair" className="space-y-4">
            <div>
              <label htmlFor="hair-style-select" className="mb-2 block text-sm font-medium text-white/90">Hair Style</label>
              <select
                id="hair-style-select"
                value={config.hair.style}
                onChange={(e) =>
                  updateConfig({
                    hair: { ...config.hair, style: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              >
                {HAIR_STYLES.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            <ColorPicker
              label="Root Color"
              value={config.hair.rootColor}
              onChange={(color) =>
                updateConfig({
                  hair: { ...config.hair, rootColor: color },
                })
              }
            />

            <ColorPicker
              label="Tip Color"
              value={config.hair.tipColor}
              onChange={(color) =>
                updateConfig({
                  hair: { ...config.hair, tipColor: color },
                })
              }
            />

            <SliderControl
              label="Gloss"
              value={config.hair.gloss}
              onChange={(value) =>
                updateConfig({
                  hair: { ...config.hair, gloss: value },
                })
              }
            />
          </Tabs.Content>

          {/* Outfit Tab */}
          <Tabs.Content value="outfit" className="space-y-4">
            <div>
              <label htmlFor="outfit-style-select" className="mb-2 block text-sm font-medium text-white/90">Outfit Style</label>
              <select
                id="outfit-style-select"
                value={config.outfit.id}
                onChange={(e) =>
                  updateConfig({
                    outfit: { ...config.outfit, id: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              >
                {OUTFIT_STYLES.map((outfit) => (
                  <option key={outfit.id} value={outfit.id}>
                    {outfit.name}
                  </option>
                ))}
              </select>
            </div>

            <ColorPicker
              label="Primary Color"
              value={config.outfit.primaryColor}
              onChange={(color) =>
                updateConfig({
                  outfit: { ...config.outfit, primaryColor: color },
                })
              }
            />

            <ColorPicker
              label="Secondary Color"
              value={config.outfit.secondaryColor}
              onChange={(color) =>
                updateConfig({
                  outfit: { ...config.outfit, secondaryColor: color },
                })
              }
            />
          </Tabs.Content>

          {/* Accessories Tab */}
          <Tabs.Content value="accessories" className="space-y-4">
            <div className="space-y-3">
              {config.accessories.map((accessory, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/20 bg-white/5 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <select
                      value={accessory.id}
                      onChange={(e) => {
                        const newAccessories = [...config.accessories];
                        newAccessories[index] = { ...accessory, id: e.target.value };
                        updateConfig({ accessories: newAccessories });
                      }}
                      className="flex-1 rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white"
                    >
                      {ACCESSORY_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const newAccessories = config.accessories.filter((_, i) => i !== index);
                        updateConfig({ accessories: newAccessories });
                      }}
                      className="ml-2 rounded px-2 py-1 text-sm text-red-400 hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    <SliderControl
                      label="Scale"
                      value={accessory.scale}
                      onChange={(value) => {
                        const newAccessories = [...config.accessories];
                        newAccessories[index] = { ...accessory, scale: value };
                        updateConfig({ accessories: newAccessories });
                      }}
                      min={0.5}
                      max={2}
                    />
                  </div>
                </div>
              ))}

              {config.accessories.length < 4 && (
                <button
                  onClick={() => {
                    const newAccessories = [
                      ...config.accessories,
                      {
                        id: 'horn_01',
                        pos: [0, 1.5, 0] as [number, number, number],
                        rot: [0, 0, 0] as [number, number, number],
                        scale: 1,
                      },
                    ];
                    updateConfig({ accessories: newAccessories });
                  }}
                  className="w-full rounded-lg border border-dashed border-white/30 bg-white/5 px-4 py-3 text-sm text-white/70 transition-colors hover:border-pink-500 hover:bg-pink-500/10 hover:text-white"
                >
                  + Add Accessory
                </button>
              )}
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>

      {/* Actions */}
      <div className="border-t border-white/10 p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRandomize}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Randomize
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJSON}
            className="rounded-lg border border-pink-500/50 bg-pink-500/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-500/30"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportGLB}
            disabled={isExporting}
            className="rounded-lg border border-pink-500/50 bg-pink-500/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export GLB'}
          </button>
        </div>

        <button
          onClick={handleExportZIP}
          disabled={isExporting}
          className="w-full rounded-lg border border-purple-500/50 bg-purple-500/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporting...' : 'Export ZIP (JSON + GLB)'}
        </button>

        <button
          onClick={handleCopyToClipboard}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Copy Config to Clipboard
        </button>
      </div>
    </div>
  );
}

