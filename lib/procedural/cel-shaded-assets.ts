/**
 * Cel-Shaded Asset Generator
 * High-quality anime-style assets with cel-shading, gradients, and outlines
 */

import { createNoise2D } from 'simplex-noise';
import alea from 'seedrandom';

export interface CelShadedConfig {
  width: number;
  height: number;
  seed: string;
  shadeSteps: number; // 2-4 for classic cel-shading
  outlineWidth: number;
  outlineColor: string;
  highlightIntensity: number;
  shadowIntensity: number;
}

export type AssetTheme =
  | 'sakura'
  | 'neon'
  | 'dark'
  | 'pastel'
  | 'fire'
  | 'ice'
  | 'nature'
  | 'cosmic';

const THEME_PALETTES: Record<
  AssetTheme,
  {
    primary: string[];
    secondary: string[];
    accent: string[];
    highlight: string;
    shadow: string;
  }
> = {
  sakura: {
    primary: ['#FFB7C5', '#FF69B4', '#FF1493', '#DB7093'],
    secondary: ['#FFC0CB', '#FFE4E1', '#FFF0F5'],
    accent: ['#8B4789', '#9370DB', '#BA55D3'],
    highlight: '#FFFFFF',
    shadow: '#4A0E4E',
  },
  neon: {
    primary: ['#00FFFF', '#00CED1', '#1E90FF', '#4169E1'],
    secondary: ['#FF00FF', '#FF1493', '#FF69B4'],
    accent: ['#00FF00', '#32CD32', '#7FFF00'],
    highlight: '#FFFFFF',
    shadow: '#0A0A0A',
  },
  dark: {
    primary: ['#1A1A2E', '#16213E', '#0F3460', '#533483'],
    secondary: ['#2C3E50', '#34495E', '#7F8C8D'],
    accent: ['#E94B3CFF', '#C0392B', '#A93226'],
    highlight: '#ECF0F1',
    shadow: '#000000',
  },
  pastel: {
    primary: ['#FFD1DC', '#FFABAB', '#FFC3A0', '#FF677D'],
    secondary: ['#D4A5A5', '#F9ED69', '#F08A5D'],
    accent: ['#B83B5E', '#6A2C70', '#08D9D6'],
    highlight: '#FFFFFF',
    shadow: '#5A4A6F',
  },
  fire: {
    primary: ['#FF4500', '#FF6347', '#FF7F50', '#FFA07A'],
    secondary: ['#FFD700', '#FFA500', '#FF8C00'],
    accent: ['#8B0000', '#A52A2A', '#B22222'],
    highlight: '#FFFFE0',
    shadow: '#2B0000',
  },
  ice: {
    primary: ['#E0FFFF', '#AFEEEE', '#87CEEB', '#4682B4'],
    secondary: ['#B0E0E6', '#ADD8E6', '#87CEFA'],
    accent: ['#4169E1', '#1E90FF', '#00BFFF'],
    highlight: '#FFFFFF',
    shadow: '#191970',
  },
  nature: {
    primary: ['#90EE90', '#98FB98', '#00FA9A', '#00FF7F'],
    secondary: ['#7CFC00', '#ADFF2F', '#32CD32'],
    accent: ['#228B22', '#006400', '#2E8B57'],
    highlight: '#F0FFF0',
    shadow: '#013220',
  },
  cosmic: {
    primary: ['#4B0082', '#8A2BE2', '#9370DB', '#BA55D3'],
    secondary: ['#DDA0DD', '#EE82EE', '#DA70D6'],
    accent: ['#FF00FF', '#FF1493', '#C71585'],
    highlight: '#FFFFFF',
    shadow: '#1A0033',
  },
};

/**
 * Generate a cel-shaded background
 */
export function generateCelShadedBackground(config: CelShadedConfig, theme: AssetTheme): ImageData {
  const { width, height, seed, shadeSteps, highlightIntensity } = config;
  const palette = THEME_PALETTES[theme];
  const rng = alea(seed);
  const noise2D = createNoise2D(rng);

  const imageData = new ImageData(width, height);
  const data = imageData.data;

  // Generate base noise field
  const scale = 0.005;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Multi-octave noise for depth
      const noise1 = noise2D(x * scale, y * scale);
      const noise2 = noise2D(x * scale * 2, y * scale * 2) * 0.5;
      const noise3 = noise2D(x * scale * 4, y * scale * 4) * 0.25;
      const noiseValue = (noise1 + noise2 + noise3) / 1.75;

      // Quantize to cel-shading steps
      const step = Math.floor(((noiseValue + 1) / 2) * shadeSteps) / shadeSteps;

      // Select color based on step
      const colorIndex = Math.floor(step * (palette.primary.length - 1));
      const baseColor = hexToRgb(palette.primary[colorIndex]);

      // Add highlights
      const highlightMult = highlightIntensity * (step > 0.7 ? 1 : 0);
      const highlightColor = hexToRgb(palette.highlight);

      data[idx] = baseColor.r + highlightMult * (highlightColor.r - baseColor.r);
      data[idx + 1] = baseColor.g + highlightMult * (highlightColor.g - baseColor.g);
      data[idx + 2] = baseColor.b + highlightMult * (highlightColor.b - baseColor.b);
      data[idx + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Generate character/sprite with cel-shading
 */
export function generateCelShadedSprite(
  config: CelShadedConfig,
  theme: AssetTheme,
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'hexagon' = 'circle',
): ImageData {
  const { width, height, seed, shadeSteps, outlineWidth, outlineColor } = config;
  const palette = THEME_PALETTES[theme];
  const rng = alea(seed);

  const imageData = new ImageData(width, height);
  const data = imageData.data;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - outlineWidth * 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Shape test
      let inShape = false;
      switch (shape) {
        case 'circle':
          inShape = distance < radius;
          break;
        case 'square':
          inShape = Math.abs(dx) < radius && Math.abs(dy) < radius;
          break;
        case 'triangle':
          inShape = dy > -radius / 2 && dy < radius && Math.abs(dx) < (radius - dy) / Math.sqrt(3);
          break;
        case 'star':
          inShape = isInStar(dx, dy, radius, 5);
          break;
        case 'hexagon':
          inShape = isInHexagon(dx, dy, radius);
          break;
      }

      if (inShape) {
        // Calculate shading based on distance, light direction, and subtle random variation
        const normalizedDist = distance / radius;
        const directionalLight = (Math.cos(angle - Math.PI / 6) + 1) / 2;
        const randomOffset = (rng() - 0.5) * 0.05;
        const shading = Math.min(
          1,
          Math.max(0, 1 - normalizedDist * 0.6 + directionalLight * 0.2 + randomOffset),
        );

        // Quantize to cel-shading steps
        const step = Math.floor(shading * shadeSteps) / shadeSteps;

        // Select color
        const colorIndex = Math.floor(step * (palette.primary.length - 1));
        const color = hexToRgb(palette.primary[colorIndex]);

        data[idx] = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = 255;

        // Outline
        if (distance > radius - outlineWidth) {
          const outlineRgb = hexToRgb(outlineColor);
          data[idx] = outlineRgb.r;
          data[idx + 1] = outlineRgb.g;
          data[idx + 2] = outlineRgb.b;
        }
      } else {
        // Transparent
        data[idx + 3] = 0;
      }
    }
  }

  return imageData;
}

/**
 * Generate game UI element (button, panel, etc.)
 */
export function generateUIElement(
  config: CelShadedConfig,
  theme: AssetTheme,
  type: 'button' | 'panel' | 'card' | 'badge',
): ImageData {
  const { width, height, outlineWidth, outlineColor } = config;
  const palette = THEME_PALETTES[theme];

  const imageData = new ImageData(width, height);
  const data = imageData.data;

  const borderRadius = type === 'button' ? 15 : type === 'card' ? 20 : 10;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Rounded rectangle with gradient
      const inBounds = isInRoundedRect(x, y, width, height, borderRadius);

      if (inBounds) {
        // Gradient from top to bottom
        const t = y / height;
        const color1 = hexToRgb(palette.primary[0]);
        const color2 = hexToRgb(palette.primary[Math.min(2, palette.primary.length - 1)]);

        data[idx] = lerp(color1.r, color2.r, t);
        data[idx + 1] = lerp(color1.g, color2.g, t);
        data[idx + 2] = lerp(color1.b, color2.b, t);
        data[idx + 3] = 255;

        // Outline
        const isEdge =
          x < outlineWidth ||
          x >= width - outlineWidth ||
          y < outlineWidth ||
          y >= height - outlineWidth;

        if (isEdge) {
          const outlineRgb = hexToRgb(outlineColor);
          data[idx] = outlineRgb.r;
          data[idx + 1] = outlineRgb.g;
          data[idx + 2] = outlineRgb.b;
        }
      } else {
        data[idx + 3] = 0;
      }
    }
  }

  return imageData;
}

// Helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function isInRoundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): boolean {
  if (x < radius && y < radius) {
    return Math.sqrt((x - radius) ** 2 + (y - radius) ** 2) <= radius;
  }
  if (x >= width - radius && y < radius) {
    return Math.sqrt((x - (width - radius)) ** 2 + (y - radius) ** 2) <= radius;
  }
  if (x < radius && y >= height - radius) {
    return Math.sqrt((x - radius) ** 2 + (y - (height - radius)) ** 2) <= radius;
  }
  if (x >= width - radius && y >= height - radius) {
    return Math.sqrt((x - (width - radius)) ** 2 + (y - (height - radius)) ** 2) <= radius;
  }
  return true;
}

function isInStar(dx: number, dy: number, radius: number, points: number): boolean {
  const angle = Math.atan2(dy, dx);
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angleStep = (Math.PI * 2) / points;
  const localAngle = ((angle % angleStep) + angleStep) % angleStep;
  const innerRadius = radius * 0.4;
  const outerRadius = radius;

  const t = localAngle / angleStep;
  const currentRadius = innerRadius + (outerRadius - innerRadius) * (1 - Math.abs(t - 0.5) * 2);

  return distance < currentRadius;
}

function isInHexagon(dx: number, dy: number, radius: number): boolean {
  const abs_dx = Math.abs(dx);
  const abs_dy = Math.abs(dy);
  return (
    abs_dy < radius &&
    abs_dx < (radius * Math.sqrt(3)) / 2 &&
    abs_dy < (radius * 3) / 2 - abs_dx * Math.sqrt(3)
  );
}
