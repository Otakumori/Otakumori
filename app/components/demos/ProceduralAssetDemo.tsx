/**
 * Procedural Asset Generation Demo
 * Showcases the procedural texture generation system
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useProceduralAssets,
  PREDEFINED_PALETTES,
  type AssetType,
} from '@/app/hooks/useProceduralAssets';
import Image from 'next/image';

const ASSET_TYPES: AssetType[] = ['noise', 'voronoi', 'gradient'];
const PALETTE_NAMES = Object.keys(PREDEFINED_PALETTES);

export default function ProceduralAssetDemo() {
  const { generateAsset, isGenerating, getCacheSize, clearCache } = useProceduralAssets();
  const [generatedAssets, setGeneratedAssets] = useState<Array<{ name: string; dataUrl: string }>>(
    [],
  );
  const [selectedType, setSelectedType] = useState<AssetType>('noise');
  const [selectedPalette, setSelectedPalette] = useState('sakura');
  const [size, setSize] = useState(256);

  const handleGenerate = async () => {
    const asset = await generateAsset({
      type: selectedType,
      width: size,
      height: size,
      seed: `${selectedType}-${selectedPalette}-${Date.now()}`,
      palette: PREDEFINED_PALETTES[selectedPalette],
      config: {
        scale: 0.02,
        octaves: 4,
        pointCount: 15,
        direction: 'diagonal',
      },
    });

    setGeneratedAssets((prev) => [
      { name: `${selectedType}-${selectedPalette}-${Date.now()}`, dataUrl: asset.dataUrl },
      ...prev.slice(0, 8), // Keep only last 9 assets
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-5xl font-bold text-transparent">
            Procedural Asset Generator
          </h1>
          <p className="text-lg text-gray-300">
            Generate unique textures and patterns using advanced algorithms
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-lg">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Asset Type */}
            <div>
              <label htmlFor="asset-type" className="mb-2 block text-sm font-medium text-white">
                Asset Type
              </label>
              <select
                id="asset-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as AssetType)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur-lg transition-all hover:bg-white/20 focus:border-pink-500 focus:outline-none"
              >
                {ASSET_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-gray-900">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Palette */}
            <div>
              <label htmlFor="color-palette" className="mb-2 block text-sm font-medium text-white">
                Color Palette
              </label>
              <select
                id="color-palette"
                value={selectedPalette}
                onChange={(e) => setSelectedPalette(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur-lg transition-all hover:bg-white/20 focus:border-pink-500 focus:outline-none"
              >
                {PALETTE_NAMES.map((name) => (
                  <option key={name} value={name} className="bg-gray-900">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Size: {size}x{size}
              </label>
              <input
                type="range"
                min="64"
                max="512"
                step="64"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Asset'}
            </button>

            <div className="flex gap-4 text-sm text-gray-300">
              <span>Cache: {getCacheSize()} assets</span>
              <button
                onClick={clearCache}
                className="text-pink-400 transition-colors hover:text-pink-300"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* Palette Preview */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="mb-4 text-xl font-bold text-white">Current Palette: {selectedPalette}</h2>
          <div className="flex gap-2">
            {Object.entries(PREDEFINED_PALETTES[selectedPalette]).map(([name, color]) => (
              <div key={name} className="flex flex-col items-center">
                <div
                  className="h-16 w-16 rounded-lg border border-white/20 shadow-lg"
                  style={{ backgroundColor: color }}
                />
                <span className="mt-2 text-xs text-gray-300">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Assets Gallery */}
        <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="mb-6 text-2xl font-bold text-white">Generated Assets</h2>

          {generatedAssets.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No assets generated yet. Click "Generate Asset" to create one!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {generatedAssets.map((asset, index) => (
                <motion.div
                  key={asset.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-4"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={asset.dataUrl}
                      alt={asset.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="truncate text-xs text-gray-400">{asset.name}</p>
                  </div>

                  {/* Download Button */}
                  <a
                    href={asset.dataUrl}
                    download={`${asset.name}.png`}
                    className="absolute top-6 right-6 rounded-full bg-black/50 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                    title="Download"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="mb-4 text-xl font-bold text-white">How It Works</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold text-pink-400">Noise Texture</h3>
              <p className="text-sm text-gray-300">
                Uses Perlin/Simplex noise with multiple octaves to create organic, natural-looking
                patterns. Perfect for terrain, clouds, and organic materials.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-purple-400">Voronoi Diagram</h3>
              <p className="text-sm text-gray-300">
                Creates crystalline patterns by calculating distances to random points. Ideal for
                cell-like structures, crystals, and abstract patterns.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-blue-400">Gradient</h3>
              <p className="text-sm text-gray-300">
                Smooth color transitions in various directions. Great for backgrounds, lighting
                effects, and atmospheric elements.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
