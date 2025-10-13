#!/usr/bin/env node
/**
 * Generate logo-style petal SVG assets with seasonal and rarity variants
 * Matches the aesthetic of circlelogo.png
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a stylized cherry blossom petal SVG
 * @param {Object} config - Configuration for the petal
 * @returns {string} SVG markup
 */
function generatePetalSVG(config) {
  const {
    primaryColor = '#FF69B4',
    secondaryColor = '#FFB7C5',
    accentColor = '#FF1493',
    glowColor = '#FFC0CB',
    size = 100,
    style = 'normal', // normal, crystalline, glitch, ethereal
    name = 'Cherry Petal',
  } = config;

  const centerX = size / 2;
  const centerY = size / 2;
  const petalLength = size * 0.35;
  const petalWidth = size * 0.15;

  // Generate 5 petal paths (cherry blossom has 5 petals)
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2; // Start from top
    const x = centerX + Math.cos(angle) * petalLength;
    const y = centerY + Math.sin(angle) * petalLength;

    // Control points for petal curve
    const cp1x = centerX + Math.cos(angle - 0.3) * petalWidth;
    const cp1y = centerY + Math.sin(angle - 0.3) * petalWidth;
    const cp2x = centerX + Math.cos(angle + 0.3) * petalWidth;
    const cp2y = centerY + Math.sin(angle + 0.3) * petalWidth;

    const petalPath = `
      M ${centerX},${centerY}
      Q ${cp1x},${cp1y} ${x},${y}
      Q ${cp2x},${cp2y} ${centerX},${centerY}
      Z
    `;

    petals.push({
      path: petalPath,
      gradient: `petal-gradient-${i}`,
    });
  }

  // Style-specific effects
  const getStyleEffects = () => {
    switch (style) {
      case 'crystalline':
        return `
          <filter id="crystalline-effect">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur"/>
            <feColorMatrix in="blur" type="matrix" values="
              1.5 0 0 0 0
              0 1.5 0 0 0
              0 0 2 0 0
              0 0 0 1 0
            " result="matrix"/>
            <feComposite in="SourceGraphic" in2="matrix" operator="over"/>
          </filter>
          <pattern id="ice-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <path d="M0,5 L10,5 M5,0 L5,10" stroke="white" stroke-width="0.5" opacity="0.3"/>
          </pattern>
        `;

      case 'glitch':
        return `
          <filter id="glitch-effect">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        `;

      case 'ethereal':
        return `
          <filter id="ethereal-effect">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur"/>
            <feColorMatrix in="blur" type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 0.8 0
            "/>
          </filter>
        `;

      default:
        return '';
    }
  };

  const filterAttr = style !== 'normal' ? `filter="url(#${style}-effect)"` : '';
  const patternAttr = style === 'crystalline' ? 'fill="url(#ice-pattern)"' : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" 
     xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     aria-label="${name}">
  <title>${name}</title>
  <desc>Procedurally generated ${style} cherry blossom petal for Otaku-mori</desc>
  
  <defs>
    <!-- Gradients for each petal -->
    ${petals
      .map(
        (_, i) => `
      <radialGradient id="petal-gradient-${i}" cx="50%" cy="30%">
        <stop offset="0%" style="stop-color:${secondaryColor};stop-opacity:1" />
        <stop offset="60%" style="stop-color:${primaryColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.9" />
      </radialGradient>
    `,
      )
      .join('')}
    
    <!-- Glow effect -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Center gradient -->
    <radialGradient id="center-gradient">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0" />
    </radialGradient>
    
    ${getStyleEffects()}
  </defs>
  
  <!-- Outer glow -->
  <circle cx="${centerX}" cy="${centerY}" r="${size * 0.45}" 
          fill="${glowColor}" opacity="0.3" filter="url(#glow)" />
  
  <!-- Petals -->
  <g ${filterAttr}>
    ${petals
      .map(
        (petal) => `
      <path d="${petal.path}" 
            fill="url(#${petal.gradient})" 
            stroke="${accentColor}" 
            stroke-width="0.5"
            opacity="0.95"
            ${patternAttr} />
    `,
      )
      .join('')}
  </g>
  
  <!-- Center circle -->
  <circle cx="${centerX}" cy="${centerY}" r="${size * 0.08}" 
          fill="url(#center-gradient)" 
          stroke="#FFA500" 
          stroke-width="1" />
  
  <!-- Highlight -->
  <ellipse cx="${centerX - size * 0.05}" cy="${centerY - size * 0.05}" 
           rx="${size * 0.12}" ry="${size * 0.18}" 
           fill="white" 
           opacity="0.3" 
           transform="rotate(-45 ${centerX} ${centerY})" />
</svg>`;
}

// Configuration for different petal types
const petalConfigs = [
  {
    filename: 'petal-logo-style.svg',
    config: {
      primaryColor: '#FF69B4',
      secondaryColor: '#FFB7C5',
      accentColor: '#FF1493',
      glowColor: '#FFC0CB',
      size: 100,
      style: 'normal',
      name: 'Cherry Petal - Logo Style',
    },
  },
  {
    filename: 'petal-normal.svg',
    config: {
      primaryColor: '#FF69B4',
      secondaryColor: '#FFB7C5',
      accentColor: '#FF1493',
      glowColor: '#FFC0CB',
      size: 80,
      style: 'normal',
      name: 'Cherry Petal',
    },
  },
  {
    filename: 'petal-golden.svg',
    config: {
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      accentColor: '#FF8C00',
      glowColor: '#FFE55C',
      size: 80,
      style: 'ethereal',
      name: 'Golden Bloom',
    },
  },
  {
    filename: 'petal-glitch.svg',
    config: {
      primaryColor: '#9D4EDD',
      secondaryColor: '#C77DFF',
      accentColor: '#7209B7',
      glowColor: '#E0AAFF',
      size: 80,
      style: 'glitch',
      name: 'Glitch Fragment',
    },
  },
  {
    filename: 'petal-blackLotus.svg',
    config: {
      primaryColor: '#1A1A2E',
      secondaryColor: '#16213E',
      accentColor: '#6A0DAD',
      glowColor: '#9D4EDD',
      size: 80,
      style: 'ethereal',
      name: 'Black Lotus',
    },
  },
  // Seasonal variants
  {
    filename: 'petal-spring.svg',
    config: {
      primaryColor: '#FFB7C5',
      secondaryColor: '#FFC0CB',
      accentColor: '#FF69B4',
      glowColor: '#FFE5EC',
      size: 80,
      style: 'normal',
      name: 'Spring Cherry Petal',
    },
  },
  {
    filename: 'petal-summer.svg',
    config: {
      primaryColor: '#FFD700',
      secondaryColor: '#FFED4E',
      accentColor: '#FFA500',
      glowColor: '#FFF8DC',
      size: 80,
      style: 'ethereal',
      name: 'Summer Golden Petal',
    },
  },
  {
    filename: 'petal-autumn.svg',
    config: {
      primaryColor: '#FF6347',
      secondaryColor: '#FF7F50',
      accentColor: '#FF4500',
      glowColor: '#FFA07A',
      size: 80,
      style: 'normal',
      name: 'Autumn Red Petal',
    },
  },
  {
    filename: 'petal-winter.svg',
    config: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#E0E0E0',
      accentColor: '#B0C4DE',
      glowColor: '#F0F8FF',
      size: 80,
      style: 'crystalline',
      name: 'Winter Crystalline Petal',
    },
  },
];

// Generate all petal assets
console.log('🌸 Generating petal assets...\n');

let successCount = 0;
let errorCount = 0;

petalConfigs.forEach(({ filename, config }) => {
  try {
    const svg = generatePetalSVG(config);
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, svg, 'utf8');
    console.log(`✓ Generated: ${filename}`);
    successCount++;
  } catch (error) {
    console.error(`✗ Failed to generate ${filename}:`, error.message);
    errorCount++;
  }
});

console.log(`\n🎉 Complete! Generated ${successCount} assets (${errorCount} errors)`);
console.log(`📁 Output directory: ${OUTPUT_DIR}`);
