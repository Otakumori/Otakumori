#!/usr/bin/env node
/**
 * Generate seasonal tree variations as SVG files
 * Run: node scripts/generate-seasonal-trees.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'season');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Seasonal configurations
const seasons = [
  {
    name: 'spring',
    title: 'Spring Cherry Tree',
    trunkColor: '#8B4513',
    branchColor: '#A0522D',
    leafColors: ['#FFB7C5', '#FF69B4', '#98FB98', '#90EE90'],
    petalColors: ['#FFB7C5', '#FF69B4', '#FFC0CB'],
    skyGradient: 'from-blue-200 to-pink-100',
    description: 'Fresh cherry blossoms with new green leaves',
  },
  {
    name: 'summer',
    title: 'Summer Cherry Tree',
    trunkColor: '#654321',
    branchColor: '#8B4513',
    leafColors: ['#228B22', '#32CD32', '#00FF00', '#ADFF2F'],
    petalColors: ['#FF1493', '#DC143C', '#B22222'],
    skyGradient: 'from-blue-400 to-green-200',
    description: 'Full bloom with vibrant colors and lush foliage',
  },
  {
    name: 'fall',
    title: 'Autumn Cherry Tree',
    trunkColor: '#8B4513',
    branchColor: '#A0522D',
    leafColors: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'],
    petalColors: ['#FF4500', '#DC143C', '#B8860B'],
    skyGradient: 'from-orange-200 to-yellow-100',
    description: 'Falling leaves with warm autumn tones',
  },
  {
    name: 'winter',
    title: 'Winter Cherry Tree',
    trunkColor: '#696969',
    branchColor: '#808080',
    leafColors: ['#E6E6FA', '#F0F8FF', '#F5F5F5', '#DCDCDC'],
    petalColors: ['#B0E0E6', '#87CEEB', '#E0E6FF'],
    skyGradient: 'from-gray-200 to-blue-100',
    description: 'Snow-covered branches with cool winter tones',
  },
];

function generateTreeSVG(season) {
  const width = 1200;
  const height = 900;

  // Generate random branch positions
  const branches = [];
  for (let i = 0; i < 15; i++) {
    branches.push({
      x1: 300 + Math.random() * 100,
      y1: 400 + Math.random() * 300,
      x2: 200 + Math.random() * 400,
      y2: 200 + Math.random() * 400,
      thickness: 3 + Math.random() * 8,
    });
  }

  // Generate random leaf/petal clusters
  const clusters = [];
  for (let i = 0; i < 80; i++) {
    clusters.push({
      x: 150 + Math.random() * 500,
      y: 100 + Math.random() * 500,
      size: 15 + Math.random() * 25,
      color: season.leafColors[Math.floor(Math.random() * season.leafColors.length)],
    });
  }

  // Generate floating petals
  const petals = [];
  for (let i = 0; i < 20; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 8 + Math.random() * 12,
      rotation: Math.random() * 360,
      color: season.petalColors[Math.floor(Math.random() * season.petalColors.length)],
    });
  }

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="trunk-${season.name}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${season.trunkColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#654321;stop-opacity:1" />
    </radialGradient>
    <filter id="shadow-${season.name}">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
    <filter id="glow-${season.name}">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="transparent"/>
  
  <!-- Main trunk -->
  <ellipse cx="350" cy="600" rx="40" ry="300" fill="url(#trunk-${season.name})" filter="url(#shadow-${season.name})"/>
  
  <!-- Branches -->
  ${branches
    .map(
      (branch) => `
    <line x1="${branch.x1}" y1="${branch.y1}" x2="${branch.x2}" y2="${branch.y2}" 
          stroke="${season.branchColor}" stroke-width="${branch.thickness}" 
          stroke-linecap="round" filter="url(#shadow-${season.name})"/>
  `,
    )
    .join('')}
  
  <!-- Leaf/Blossom clusters -->
  ${clusters
    .map(
      (cluster) => `
    <circle cx="${cluster.x}" cy="${cluster.y}" r="${cluster.size}" 
            fill="${cluster.color}" opacity="0.8" filter="url(#glow-${season.name})"/>
  `,
    )
    .join('')}
  
  <!-- Floating petals -->
  ${petals
    .map(
      (petal, i) => `
    <g transform="translate(${petal.x}, ${petal.y}) rotate(${petal.rotation})">
      <ellipse rx="${petal.size}" ry="${petal.size * 0.6}" fill="${petal.color}" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" 
                         values="0;360" dur="${8 + (i % 4)}s" repeatCount="indefinite"/>
      </ellipse>
    </g>
  `,
    )
    .join('')}
  
  <!-- Tree title -->
  <text x="600" y="50" font-size="32" font-weight="bold" text-anchor="middle" 
        fill="#333" filter="url(#shadow-${season.name})">${season.title}</text>
</svg>`;
}

// Generate all seasonal trees
console.log('🌸 Generating seasonal tree variations...\n');

seasons.forEach((season) => {
  const svg = generateTreeSVG(season);
  const filename = `tree-${season.name}.svg`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, svg, 'utf8');
  console.log(`✅ Generated: ${filename} - ${season.description}`);
});

console.log(
  `\n🎉 Successfully generated ${seasons.length} seasonal tree variations in ${OUTPUT_DIR}`,
);
console.log('\n📁 Files created:');
seasons.forEach((season) => {
  console.log(`   - tree-${season.name}.svg`);
});

console.log(
  '\n💡 Note: These are SVG files. To convert to WebP, use an image conversion tool or service.',
);
console.log('   Recommended: Use an online converter or imagemagick to create WebP versions.');
