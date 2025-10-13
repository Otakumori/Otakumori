/**
 * Generate All Procedural Assets
 * Runs at build time to create game assets using the procedural generation system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateNoiseTexture,
  generateVoronoiTexture,
  generateGradientTexture,
} from '../lib/procedural/texture-synthesizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/assets/procedural');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Convert ImageData to PNG buffer (using canvas)
 * In Node.js, we need to use a different approach
 */
async function imageDataToPNG(imageData, width, height) {
  // For Node.js build-time generation, we'll create a simple PNG
  // This is a simplified approach - in production, you might want to use 'sharp' or 'canvas'
  const { default: sharp } = await import('sharp');

  return sharp(Buffer.from(imageData.data.buffer), {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

/**
 * Anime-style color palettes for different game themes
 */
const PALETTES = {
  sakura: {
    primary: '#FFB7C5',
    secondary: '#FF69B4',
    accent: '#FF1493',
    highlight: '#FFF0F5',
    shadow: '#8B0A50',
  },
  cyberpunk: {
    primary: '#00FFFF',
    secondary: '#FF00FF',
    accent: '#FFFF00',
    highlight: '#FFFFFF',
    shadow: '#000033',
  },
  forest: {
    primary: '#228B22',
    secondary: '#90EE90',
    accent: '#00FF00',
    highlight: '#F0FFF0',
    shadow: '#006400',
  },
  fire: {
    primary: '#FF4500',
    secondary: '#FF6347',
    accent: '#FFD700',
    highlight: '#FFF8DC',
    shadow: '#8B0000',
  },
  ice: {
    primary: '#00CED1',
    secondary: '#B0E0E6',
    accent: '#FFFFFF',
    highlight: '#F0FFFF',
    shadow: '#000080',
  },
  void: {
    primary: '#4B0082',
    secondary: '#8A2BE2',
    accent: '#9370DB',
    highlight: '#E6E6FA',
    shadow: '#000000',
  },
};

/**
 * Asset generation configurations
 */
const ASSET_CONFIGS = [
  // Memory card backs
  {
    name: 'memory-card-sakura',
    type: 'noise',
    width: 256,
    height: 384,
    seed: 'sakura-memory',
    palette: PALETTES.sakura,
    config: { scale: 0.02, octaves: 4 },
  },
  {
    name: 'memory-card-cyberpunk',
    type: 'voronoi',
    width: 256,
    height: 384,
    seed: 'cyber-memory',
    palette: PALETTES.cyberpunk,
    config: { pointCount: 15 },
  },

  // Game backgrounds
  {
    name: 'bg-petal-samurai',
    type: 'gradient',
    width: 1920,
    height: 1080,
    seed: 'samurai-bg',
    palette: PALETTES.sakura,
    config: { direction: 'diagonal' },
  },
  {
    name: 'bg-puzzle-reveal',
    type: 'noise',
    width: 1920,
    height: 1080,
    seed: 'puzzle-bg',
    palette: PALETTES.void,
    config: { scale: 0.005, octaves: 6 },
  },

  // Particle textures
  {
    name: 'particle-petal',
    type: 'noise',
    width: 64,
    height: 64,
    seed: 'petal-particle',
    palette: PALETTES.sakura,
    config: { scale: 0.1, octaves: 2 },
  },
  {
    name: 'particle-spark',
    type: 'voronoi',
    width: 32,
    height: 32,
    seed: 'spark-particle',
    palette: PALETTES.fire,
    config: { pointCount: 5 },
  },

  // UI elements
  {
    name: 'ui-glass-panel',
    type: 'noise',
    width: 512,
    height: 512,
    seed: 'glass-panel',
    palette: {
      primary: '#FFFFFF',
      secondary: '#F0F0F0',
      accent: '#E0E0E0',
      highlight: '#FFFFFF',
      shadow: '#C0C0C0',
    },
    config: { scale: 0.05, octaves: 3 },
  },
];

/**
 * Generate a single asset
 */
async function generateAsset(assetConfig) {
  console.log(`Generating: ${assetConfig.name}...`);

  const { name, type, width, height, seed, palette, config } = assetConfig;

  let imageData;

  try {
    switch (type) {
      case 'noise':
        imageData = generateNoiseTexture({ width, height, seed, ...config }, palette);
        break;
      case 'voronoi':
        imageData = generateVoronoiTexture({ width, height, seed }, palette, config.pointCount);
        break;
      case 'gradient':
        imageData = generateGradientTexture(
          { width, height, seed },
          palette.primary,
          palette.secondary,
          0,
        );
        break;
      default:
        throw new Error(`Unknown asset type: ${type}`);
    }

    const pngBuffer = await imageDataToPNG(imageData, width, height);
    const outputPath = path.join(OUTPUT_DIR, `${name}.png`);
    fs.writeFileSync(outputPath, pngBuffer);

    console.log(`✓ Generated: ${name}.png (${width}x${height})`);
  } catch (error) {
    console.error(`✗ Failed to generate ${name}:`, error.message);
  }
}

/**
 * Main generation process
 */
async function main() {
  console.log('🎨 Starting procedural asset generation...\n');

  const startTime = Date.now();

  for (const config of ASSET_CONFIGS) {
    await generateAsset(config);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Generation complete! (${elapsed}s)`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📦 Generated ${ASSET_CONFIGS.length} assets`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
