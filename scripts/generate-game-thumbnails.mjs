#!/usr/bin/env node
/**
 * Generate SVG placeholder thumbnails for all mini-games
 * Run: node scripts/generate-game-thumbnails.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'games');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Game configurations with theme colors and icons
const games = [
  {
    slug: 'petal-samurai',
    title: 'Petal Samurai',
    icon: '🌸⚔️',
    bgGradient: 'from-pink-600 to-purple-800',
    accentColor: '#ec4899',
  },
  {
    slug: 'memory-match',
    title: 'Memory Match',
    icon: '🎴',
    bgGradient: 'from-purple-600 to-pink-600',
    accentColor: '#a855f7',
  },
  {
    slug: 'otaku-beat-em-up',
    title: 'Otaku Beat-Em-Up',
    icon: '👊⭐',
    bgGradient: 'from-yellow-500 to-purple-700',
    accentColor: '#eab308',
  },
  {
    slug: 'bubble-girl',
    title: 'Bubble Girl',
    icon: '🫧👧',
    bgGradient: 'from-blue-400 to-pink-500',
    accentColor: '#60a5fa',
  },
  {
    slug: 'petal-storm-rhythm',
    title: 'Petal Storm Rhythm',
    icon: '🌸🎵',
    bgGradient: 'from-pink-500 to-red-600',
    accentColor: '#ec4899',
  },
  {
    slug: 'blossomware',
    title: 'Blossomware',
    icon: '🌸⚡',
    bgGradient: 'from-pink-400 to-purple-600',
    accentColor: '#f472b6',
  },
  {
    slug: 'dungeon-of-desire',
    title: 'Dungeon of Desire',
    icon: '🏰💕',
    bgGradient: 'from-purple-900 to-pink-700',
    accentColor: '#a855f7',
  },
  {
    slug: 'thigh-coliseum',
    title: 'Thigh Coliseum',
    icon: '🦵⚔️',
    bgGradient: 'from-red-600 to-purple-800',
    accentColor: '#dc2626',
  },
  {
    slug: 'puzzle-reveal',
    title: 'Puzzle Reveal',
    icon: '🧩🖼️',
    bgGradient: 'from-blue-600 to-purple-700',
    accentColor: '#3b82f6',
  },
];

// Tailwind color mappings for SVG
const colorMap = {
  'pink-400': '#f472b6',
  'pink-500': '#ec4899',
  'pink-600': '#db2777',
  'pink-700': '#be185d',
  'purple-600': '#9333ea',
  'purple-700': '#7e22ce',
  'purple-800': '#6b21a8',
  'purple-900': '#581c87',
  'red-600': '#dc2626',
  'yellow-500': '#eab308',
  'blue-400': '#60a5fa',
  'blue-600': '#2563eb',
};

function parseGradient(gradient) {
  const match = gradient.match(/from-(\S+) to-(\S+)/);
  if (!match) return { from: '#ec4899', to: '#9333ea' };
  return {
    from: colorMap[match[1]] || '#ec4899',
    to: colorMap[match[2]] || '#9333ea',
  };
}

function generateSVG(game) {
  const { from, to } = parseGradient(game.bgGradient);

  return `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${game.slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${from};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${to};stop-opacity:1" />
    </linearGradient>
    <filter id="glow-${game.slug}">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="300" fill="url(#bg-${game.slug})"/>
  
  <!-- Overlay pattern -->
  <rect width="400" height="300" fill="black" opacity="0.2"/>
  
  <!-- Grid pattern -->
  <pattern id="grid-${game.slug}" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/>
  </pattern>
  <rect width="400" height="300" fill="url(#grid-${game.slug})"/>
  
  <!-- Icon circle -->
  <circle cx="200" cy="120" r="50" fill="${game.accentColor}" opacity="0.3" filter="url(#glow-${game.slug})"/>
  <circle cx="200" cy="120" r="45" fill="${game.accentColor}" opacity="0.8"/>
  
  <!-- Icon text (emoji) -->
  <text x="200" y="140" font-size="48" text-anchor="middle" fill="white">${game.icon}</text>
  
  <!-- Title -->
  <text x="200" y="220" font-size="28" font-weight="bold" text-anchor="middle" fill="white" filter="url(#glow-${game.slug})">${game.title}</text>
  
  <!-- Decorative elements -->
  <circle cx="50" cy="50" r="20" fill="white" opacity="0.1"/>
  <circle cx="350" cy="50" r="15" fill="white" opacity="0.1"/>
  <circle cx="50" cy="250" r="15" fill="white" opacity="0.1"/>
  <circle cx="350" cy="250" r="20" fill="white" opacity="0.1"/>
</svg>`;
}

// Generate all thumbnails
console.log('🎨 Generating game thumbnails...\n');

games.forEach((game) => {
  const svg = generateSVG(game);
  const filename = `${game.slug}.svg`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, svg, 'utf8');
  console.log(`✅ Generated: ${filename}`);
});

console.log(`\n🎉 Successfully generated ${games.length} game thumbnails in ${OUTPUT_DIR}`);
console.log('\n📁 Files created:');
games.forEach((game) => {
  console.log(`   - ${game.slug}.svg`);
});
