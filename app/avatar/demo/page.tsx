'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Avatar3D from '@/app/components/avatar/Avatar3D';
import type { BodyParameters } from '@/app/lib/3d/procedural-body';
import type { HairParameters } from '@/app/lib/3d/procedural-hair';
import * as THREE from 'three';

);
}
export default function AvatarDemoPage() {
  const [bodyParams, setBodyParams] = useState<BodyParameters>({
    height: 1.0,
    build: 'athletic',
    neckLength: 1.0,
    shoulderWidth: 1.0,
    chestSize: 1.0,
    waistSize: 0.8,
    hipWidth: 1.0,
    armLength: 1.0,
    legLength: 1.0,
    thighThickness: 1.0,
    muscleDefinition: 1.0,
    anatomyDetail: 'basic',
  });

  const [hairParams, setHairParams] = useState<HairParameters>({
    style: 'medium',
    color: new THREE.Color('#3D2817'),
    length: 0.4,
    volume: 1.0,
    waviness: 0.2,
    bangs: true,
  });

  const [showNSFW, setShowNSFW] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2 text-pink-400">Procedural Avatar Demo</h1>
        <p className="text-zinc-300 mb-8">
          Real-time 3D avatar generation - no asset files needed!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: 3D Preview */}
          <div className="h-[600px] rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg overflow-hidden">
            <Canvas>
              <Avatar3D
                configuration={{
                  id: 'demo',
                  userId: 'demo',
                  baseModel: 'female',
                  parts: {},
                  morphTargets: {},
                  materialOverrides: {},
                  contentRating: showNSFW ? 'nsfw' : 'sfw',
                  showNsfwContent: showNSFW,
                  ageVerified: showNSFW,
                  defaultAnimation: 'idle',
                  idleAnimations: ['idle'],
                  allowExport: false,
                  exportFormat: 'glb',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }}
                proceduralConfig={{
                  enabled: true,
                  body: bodyParams,
                  face: {
                    eyeSize: 1.0,
                    eyeShape: 'almond',
                    eyeSpacing: 1.0,
                    noseSize: 1.0,
                    mouthSize: 1.0,
                    jawShape: 'soft',
                    cheekbones: 0.5,
                  },
                  hair: hairParams,
                }}
                useProcedural={true}
                enableControls={true}
                enableAnimations={false}
                quality="high"
              />
            </Canvas>
            <div className="absolute bottom-4 left-4 text-xs text-white/50">
              Drag to rotate • Scroll to zoom
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {/* Body Proportions */}
            <Section title="Body Proportions">
              <Slider
                label="Height"
                value={bodyParams.height}
                onChange={(v) => setBodyParams({ ...bodyParams, height: v })}
                min={0.7}
                max={1.3}
                step={0.05}
              />
              <Slider
                label="Shoulder Width"
                value={bodyParams.shoulderWidth}
                onChange={(v) => setBodyParams({ ...bodyParams, shoulderWidth: v })}
                min={0.7}
                max={1.4}
                step={0.05}
              />
              <Slider
                label="Chest Size"
                value={bodyParams.chestSize}
                onChange={(v) => setBodyParams({ ...bodyParams, chestSize: v })}
                min={0.6}
                max={1.8}
                step={0.05}
              />
              <Slider
                label="Waist Size"
                value={bodyParams.waistSize}
                onChange={(v) => setBodyParams({ ...bodyParams, waistSize: v })}
                min={0.6}
                max={1.3}
                step={0.05}
              />
              <Slider
                label="Hip Width"
                value={bodyParams.hipWidth}
                onChange={(v) => setBodyParams({ ...bodyParams, hipWidth: v })}
                min={0.7}
                max={1.4}
                step={0.05}
              />
              <Slider
                label="Muscle Definition"
                value={bodyParams.muscleDefinition}
                onChange={(v) => setBodyParams({ ...bodyParams, muscleDefinition: v })}
                min={0}
                max={2}
                step={0.1}
              />

              {/* Build preset */}
              <div className="mt-4">
                <label
                  htmlFor="build-preset"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Build Preset
                </label>
                <div
                  id="build-preset"
                  className="grid grid-cols-2 gap-2"
                  role="group"
                  aria-label="Build preset options"
                >
                  {['slim', 'athletic', 'curvy', 'muscular'].map((build) => (
                    <button
                      key={build}
                      onClick={() =>
                        setBodyParams({
                          ...bodyParams,
                          build: build as BodyParameters['build'],
                        })
                      }
                      className={`px-4 py-2 rounded-lg border transition ${
                        bodyParams.build === build
                          ? 'bg-pink-500/30 border-pink-400 text-pink-300'
                          : 'bg-white/5 border-white/20 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      {build.charAt(0).toUpperCase() + build.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* Hair */}
            <Section title="Hair">
              <div className="mb-4">
                <label
                  htmlFor="hair-style"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Hair Style
                </label>
                <div
                  id="hair-style"
                  className="grid grid-cols-2 gap-2"
                  role="group"
                  aria-label="Hair style options"
                >
                  {['short', 'medium', 'long', 'twintails', 'ponytail', 'bob', 'pixie'].map(
                    (style) => (
                      <button
                        key={style}
                        onClick={() =>
                          setHairParams({
                            ...hairParams,
                            style: style as HairParameters['style'],
                          })
                        }
                        className={`px-3 py-2 rounded-lg border text-sm transition ${
                          hairParams.style === style
                            ? 'bg-purple-500/30 border-purple-400 text-purple-300'
                            : 'bg-white/5 border-white/20 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <Slider
                label="Hair Length"
                value={hairParams.length}
                onChange={(v) => setHairParams({ ...hairParams, length: v })}
                min={0.1}
                max={1.5}
                step={0.05}
              />
              <Slider
                label="Volume"
                value={hairParams.volume}
                onChange={(v) => setHairParams({ ...hairParams, volume: v })}
                min={0.5}
                max={2.0}
                step={0.1}
              />
              <Slider
                label="Waviness"
                value={hairParams.waviness}
                onChange={(v) => setHairParams({ ...hairParams, waviness: v })}
                min={0}
                max={1}
                step={0.05}
              />

              <div className="mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hairParams.bangs}
                    onChange={(e) => setHairParams({ ...hairParams, bangs: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <span className="text-sm text-zinc-300">Bangs</span>
                </label>
              </div>

              {/* Hair Color Picker */}
              <div className="mt-4">
                <label
                  htmlFor="hair-color"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Hair Color
                </label>
                <input
                  id="hair-color"
                  type="color"
                  value={
                    hairParams.color instanceof THREE.Color
                      ? `#${hairParams.color.getHexString()}`
                      : typeof hairParams.color === 'string'
                        ? hairParams.color
                        : '#3D2817'
                  }
                  onChange={(e) =>
                    setHairParams({
                      ...hairParams,
                      color: new THREE.Color(e.target.value),
                    })
                  }
                  className="w-full h-10 rounded-lg border border-white/20 bg-white/5"
                />
              </div>
            </Section>

            {/* NSFW Toggle (for demo purposes) */}
            <Section title="Adult Content (18+)">
              <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-400/30">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNSFW}
                    onChange={(e) => setShowNSFW(e.target.checked)}
                    className="w-4 h-4 rounded border-pink-400/50 bg-pink-500/20"
                  />
                  <span className="text-sm text-pink-300">
                    Enable NSFW anatomy morphs (demo only)
                  </span>
                </label>
              </div>

              {showNSFW && (
                <div className="mt-4 space-y-4">
                  <Slider
                    label="Breast Size"
                    value={bodyParams.breastSize || 1.0}
                    onChange={(v) => setBodyParams({ ...bodyParams, breastSize: v })}
                    min={0.5}
                    max={2.5}
                    step={0.1}
                  />
                  <Slider
                    label="Breast Separation"
                    value={bodyParams.breastSeparation || 0}
                    onChange={(v) => setBodyParams({ ...bodyParams, breastSeparation: v })}
                    min={-0.5}
                    max={0.5}
                    step={0.05}
                  />
                  <Slider
                    label="Buttock Size"
                    value={bodyParams.buttockSize || 1.0}
                    onChange={(v) => setBodyParams({ ...bodyParams, buttockSize: v })}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                  />
                </div>
              )}
            </Section>

            {/* Info */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/30 text-sm text-blue-300">
              <p className="font-semibold mb-2">Procedural Generation</p>
              <ul className="space-y-1 text-xs">
                <li>• No 3D model files required</li>
                <li>• Infinite customization possibilities</li>
                <li>• Tiny file size (~50KB parameters)</li>
                <li>• Instant generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.5);
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg">
      <h3 className="text-lg font-semibold text-pink-400 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        <span className="text-xs text-zinc-400 font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-pink"
      />
      <style>{`
        .slider-pink::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ec4899;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider-pink::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ec4899;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
