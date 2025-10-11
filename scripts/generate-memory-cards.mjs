#!/usr/bin/env node
/**
 * Generate Otaku-mori branded memory card assets
 * Run: node scripts/generate-memory-cards.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'memory');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Card back design with Otaku-mori branding
function generateCardBack() {
  const width = 160;
  const height = 240;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="card-bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </radialGradient>
    <linearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <pattern id="sakura-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="3" fill="#ec4899" opacity="0.3"/>
      <circle cx="20" cy="20" r="6" fill="none" stroke="#8b5cf6" stroke-width="0.5" opacity="0.2"/>
    </pattern>
  </defs>
  
  <!-- Card background -->
  <rect width="${width}" height="${height}" rx="12" ry="12" fill="url(#card-bg)" stroke="url(#border-gradient)" stroke-width="2"/>
  
  <!-- Sakura pattern overlay -->
  <rect x="4" y="4" width="${width - 8}" height="${height - 8}" rx="8" ry="8" fill="url(#sakura-pattern)" opacity="0.6"/>
  
  <!-- Central logo area -->
  <circle cx="${width / 2}" cy="${height / 2}" r="35" fill="#1a1a2e" stroke="#ec4899" stroke-width="2" filter="url(#glow)"/>
  
  <!-- Cherry blossom icon -->
  <g transform="translate(${width / 2}, ${height / 2})">
    <!-- Petals -->
    <g fill="#ec4899" opacity="0.8">
      <ellipse cx="0" cy="-15" rx="8" ry="12" transform="rotate(0)"/>
      <ellipse cx="0" cy="-15" rx="8" ry="12" transform="rotate(72)"/>
      <ellipse cx="0" cy="-15" rx="8" ry="12" transform="rotate(144)"/>
      <ellipse cx="0" cy="-15" rx="8" ry="12" transform="rotate(216)"/>
      <ellipse cx="0" cy="-15" rx="8" ry="12" transform="rotate(288)"/>
    </g>
    <!-- Center -->
    <circle cx="0" cy="0" r="4" fill="#8b5cf6"/>
  </g>
  
  <!-- Brand text -->
  <text x="${width / 2}" y="${height - 30}" font-size="12" font-weight="bold" text-anchor="middle" fill="#ec4899" filter="url(#glow)">OTAKU</text>
  <text x="${width / 2}" y="${height - 15}" font-size="12" font-weight="bold" text-anchor="middle" fill="#8b5cf6" filter="url(#glow)">MORI</text>
  
  <!-- Corner decorations -->
  <circle cx="20" cy="20" r="3" fill="#ec4899" opacity="0.6"/>
  <circle cx="${width - 20}" cy="20" r="3" fill="#8b5cf6" opacity="0.6"/>
  <circle cx="20" cy="${height - 20}" r="3" fill="#8b5cf6" opacity="0.6"/>
  <circle cx="${width - 20}" cy="${height - 20}" r="3" fill="#ec4899" opacity="0.6"/>
</svg>`;
}

// Character card templates
const characterSets = [
  {
    name: 'kill-la-kill',
    title: 'Kill la Kill',
    characters: [
      { name: 'Ryuko', color: '#dc2626' },
      { name: 'Satsuki', color: '#1e40af' },
      { name: 'Mako', color: '#f59e0b' },
      { name: 'Senketsu', color: '#7c2d12' },
      { name: 'Nonon', color: '#ec4899' },
      { name: 'Gamagoori', color: '#166534' },
      { name: 'Sanageyama', color: '#0891b2' },
      { name: 'Inumuta', color: '#6366f1' },
    ],
  },
  {
    name: 'studio-ghibli',
    title: 'Studio Ghibli',
    characters: [
      { name: 'Totoro', color: '#22c55e' },
      { name: 'Chihiro', color: '#ec4899' },
      { name: 'Howl', color: '#8b5cf6' },
      { name: 'Sophie', color: '#f97316' },
      { name: 'Kiki', color: '#dc2626' },
      { name: 'Ashitaka', color: '#0891b2' },
      { name: 'San', color: '#16a34a' },
      { name: 'Calcifer', color: '#f59e0b' },
    ],
  },
];

function generateCharacterCard(character, setName) {
  const width = 160;
  const height = 240;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="char-bg-${character.name}" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:${character.color};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
    </radialGradient>
    <filter id="text-glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Card background -->
  <rect width="${width}" height="${height}" rx="12" ry="12" fill="url(#char-bg-${character.name})" stroke="${character.color}" stroke-width="2"/>
  
  <!-- Character placeholder area -->
  <rect x="20" y="30" width="${width - 40}" height="${height - 80}" rx="8" ry="8" fill="rgba(255,255,255,0.1)" stroke="${character.color}" stroke-width="1" opacity="0.8"/>
  
  <!-- Character name -->
  <text x="${width / 2}" y="${height - 25}" font-size="14" font-weight="bold" text-anchor="middle" fill="white" filter="url(#text-glow)">${character.name}</text>
  
  <!-- Series indicator -->
  <text x="${width / 2}" y="20" font-size="8" text-anchor="middle" fill="${character.color}" opacity="0.8">${setName.toUpperCase()}</text>
  
  <!-- Decorative elements -->
  <circle cx="${width / 2}" cy="${height / 2}" r="2" fill="${character.color}" opacity="0.6"/>
</svg>`;
}

// Generate card back
console.log('🎴 Generating Otaku-mori memory card assets...\n');

const cardBack = generateCardBack();
const cardBackPath = path.join(OUTPUT_DIR, 'otm-card-back.svg');
fs.writeFileSync(cardBackPath, cardBack, 'utf8');
console.log('✅ Generated: otm-card-back.svg - Otaku-mori branded card back');

// Generate character sets
characterSets.forEach((set) => {
  const setDir = path.join(OUTPUT_DIR, set.name);
  if (!fs.existsSync(setDir)) {
    fs.mkdirSync(setDir, { recursive: true });
  }

  console.log(`\n📦 Generating ${set.title} character set:`);

  set.characters.forEach((character) => {
    const characterCard = generateCharacterCard(character, set.title);
    const filename = `${character.name.toLowerCase()}.svg`;
    const filepath = path.join(setDir, filename);

    fs.writeFileSync(filepath, characterCard, 'utf8');
    console.log(`   ✅ ${filename}`);
  });
});

console.log(`\n🎉 Successfully generated memory card assets in ${OUTPUT_DIR}`);
console.log('\n📁 Structure created:');
console.log('   - otm-card-back.svg (branded card back)');
characterSets.forEach((set) => {
  console.log(`   - ${set.name}/ (${set.characters.length} character cards)`);
});

console.log(
  '\n💡 Note: These are SVG templates. Replace character placeholder areas with actual character artwork.',
);
