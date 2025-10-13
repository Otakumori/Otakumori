/**
 * Game-Specific Asset Generator
 * Creates high-quality, cel-shaded assets for all mini-games
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createCanvas, ImageData } from 'canvas';
import { createNoise2D } from 'simplex-noise';
import alea from 'seedrandom';

const GAME_THEMES = {
  'samurai-petal-slice': {
    theme: 'sakura',
    assets: ['katana', 'petal', 'slash-effect', 'background', 'score-panel'],
  },
  'anime-memory-match': {
    theme: 'pastel',
    assets: ['card-back', 'card-front-1', 'card-front-2', 'card-front-3', 'background'],
  },
  'bubble-pop-gacha': {
    theme: 'cosmic',
    assets: ['bubble-1', 'bubble-2', 'bubble-3', 'pop-effect', 'background'],
  },
  'rhythm-beat-em-up': {
    theme: 'neon',
    assets: ['note-1', 'note-2', 'note-3', 'combo-indicator', 'background'],
  },
  'petal-storm-rhythm': {
    theme: 'sakura',
    assets: ['petal-target', 'rhythm-line', 'perfect-effect', 'background'],
  },
  'puzzle-reveal': {
    theme: 'pastel',
    assets: ['puzzle-piece', 'reveal-effect', 'fog', 'background'],
  },
  'dungeon-of-desire': {
    theme: 'dark',
    assets: ['door', 'treasure', 'enemy', 'player', 'background'],
  },
  'maid-cafe-manager': {
    theme: 'pastel',
    assets: ['maid-1', 'maid-2', 'customer', 'table', 'background'],
  },
  'thigh-coliseum': {
    theme: 'fire',
    assets: ['fighter-1', 'fighter-2', 'arena', 'versus-panel', 'background'],
  },
  'quick-math': {
    theme: 'neon',
    assets: ['number-panel', 'operator', 'timer', 'background'],
  },
};

const THEME_PALETTES = {
  sakura: {
    primary: ['#FFB7C5', '#FF69B4', '#FF1493'],
    highlight: '#FFFFFF',
    shadow: '#4A0E4E',
  },
  neon: {
    primary: ['#00FFFF', '#00CED1', '#1E90FF'],
    highlight: '#FFFFFF',
    shadow: '#0A0A0A',
  },
  dark: {
    primary: ['#1A1A2E', '#16213E', '#0F3460'],
    highlight: '#ECF0F1',
    shadow: '#000000',
  },
  pastel: {
    primary: ['#FFD1DC', '#FFABAB', '#FFC3A0'],
    highlight: '#FFFFFF',
    shadow: '#5A4A6F',
  },
  fire: {
    primary: ['#FF4500', '#FF6347', '#FF7F50'],
    highlight: '#FFFFE0',
    shadow: '#2B0000',
  },
  cosmic: {
    primary: ['#4B0082', '#8A2BE2', '#9370DB'],
    highlight: '#FFFFFF',
    shadow: '#1A0033',
  },
  ice: {
    primary: ['#E0FFFF', '#AFEEEE', '#87CEEB'],
    highlight: '#FFFFFF',
    shadow: '#191970',
  },
  nature: {
    primary: ['#90EE90', '#98FB98', '#00FA9A'],
    highlight: '#F0FFF0',
    shadow: '#013220',
  },
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function generateCelShadedAsset(width, height, theme, assetName, seed) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const palette = THEME_PALETTES[theme];
  const rng = alea(seed);
  const noise2D = createNoise2D(rng);

  // Base gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.primary[0]);
  gradient.addColorStop(0.5, palette.primary[1]);
  gradient.addColorStop(1, palette.primary[2] || palette.primary[1]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add noise texture
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const noise = noise2D(x * 0.01, y * 0.01);
      const adjustment = noise * 20;

      data[idx] = Math.max(0, Math.min(255, data[idx] + adjustment));
      data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + adjustment));
      data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + adjustment));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add cel-shaded outline if it's a character or object
  if (!assetName.includes('background')) {
    ctx.strokeStyle = palette.shadow;
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, width - 10, height - 10);
  }

  // Add highlight
  ctx.fillStyle = palette.highlight + '40';
  ctx.fillRect(10, 10, width - 20, height / 3);

  return canvas.toBuffer('image/png');
}

async function main() {
  console.log('🎨 Generating high-quality game-specific assets...\n');

  for (const [gameId, config] of Object.entries(GAME_THEMES)) {
    console.log(`📦 Generating assets for: ${gameId}`);

    const outputDir = join(process.cwd(), 'public', 'assets', 'games', gameId);
    await mkdir(outputDir, { recursive: true });

    for (const assetName of config.assets) {
      const seed = `${gameId}-${assetName}`;
      const width = assetName.includes('background') ? 1920 : 512;
      const height = assetName.includes('background') ? 1080 : 512;

      const buffer = generateCelShadedAsset(width, height, config.theme, assetName, seed);

      const filename = `${assetName}.png`;
      const filepath = join(outputDir, filename);

      await writeFile(filepath, buffer);
      console.log(`  ✅ ${filename}`);
    }

    console.log('');
  }

  console.log('🎉 All game assets generated successfully!');
  console.log(`📁 Assets saved to: public/assets/games/`);
}

main().catch(console.error);
