/**
 * Texture Synthesis System
 * Procedurally generates textures for game assets using various algorithms
 */

import { createNoise2D } from 'simplex-noise';

export interface TextureConfig {
  width: number;
  height: number;
  seed?: string;
  scale?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  shadow: string;
}

/**
 * Convert hex color to RGB values
 */
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

/**
 * Interpolate between two colors
 */
function lerpColor(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  t: number,
): { r: number; g: number; b: number } {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * t),
    g: Math.round(color1.g + (color2.g - color1.g) * t),
    b: Math.round(color1.b + (color2.b - color1.b) * t),
  };
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: string): () => number {
  let value = 0;
  for (let i = 0; i < seed.length; i++) {
    value = (value << 5) - value + seed.charCodeAt(i);
    value = value & value;
  }

  return function () {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Generate Perlin/Simplex noise-based texture
 */
export function generateNoiseTexture(config: TextureConfig, palette: ColorPalette): ImageData {
  const {
    width,
    height,
    seed = 'default',
    scale = 0.01,
    octaves = 4,
    persistence = 0.5,
    lacunarity = 2,
  } = config;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);

  // Create noise function with seed
  const random = seededRandom(seed);
  const noise2D = createNoise2D(random);

  const primaryRgb = hexToRgb(palette.primary);
  const secondaryRgb = hexToRgb(palette.secondary);
  const accentRgb = hexToRgb(palette.accent);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0;
      let amplitude = 1;
      let frequency = scale;
      let maxValue = 0;

      // Octave-based noise
      for (let o = 0; o < octaves; o++) {
        value += noise2D(x * frequency, y * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
      }

      value = (value / maxValue + 1) / 2; // Normalize to 0-1

      // Color mapping based on noise value
      let color;
      if (value < 0.33) {
        color = lerpColor(primaryRgb, secondaryRgb, value * 3);
      } else if (value < 0.66) {
        color = lerpColor(secondaryRgb, accentRgb, (value - 0.33) * 3);
      } else {
        color = lerpColor(accentRgb, hexToRgb(palette.highlight), (value - 0.66) * 3);
      }

      const index = (y * width + x) * 4;
      imageData.data[index] = color.r;
      imageData.data[index + 1] = color.g;
      imageData.data[index + 2] = color.b;
      imageData.data[index + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Generate Voronoi diagram-based texture (crystalline patterns)
 */
export function generateVoronoiTexture(
  config: TextureConfig,
  palette: ColorPalette,
  pointCount: number = 20,
): ImageData {
  const { width, height, seed = 'default' } = config;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);

  const random = seededRandom(seed);

  // Generate random points
  const points: { x: number; y: number; color: { r: number; g: number; b: number } }[] = [];
  const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];

  for (let i = 0; i < pointCount; i++) {
    const colorHex = colors[Math.floor(random() * colors.length)];
    points.push({
      x: random() * width,
      y: random() * height,
      color: hexToRgb(colorHex),
    });
  }

  // Calculate Voronoi cells
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minDist = Infinity;
      let closestPoint = points[0];

      for (const point of points) {
        const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
        if (dist < minDist) {
          minDist = dist;
          closestPoint = point;
        }
      }

      const index = (y * width + x) * 4;
      // Add distance-based shading
      const shadeFactor = Math.min(minDist / 50, 1);
      imageData.data[index] = Math.round(closestPoint.color.r * (1 - shadeFactor * 0.3));
      imageData.data[index + 1] = Math.round(closestPoint.color.g * (1 - shadeFactor * 0.3));
      imageData.data[index + 2] = Math.round(closestPoint.color.b * (1 - shadeFactor * 0.3));
      imageData.data[index + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Apply cel-shading effect (anime-style)
 */
export function applyCelShading(imageData: ImageData, levels: number = 4): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Quantize each color channel
    data[i] = Math.floor((data[i] / 255) * levels) * (255 / levels);
    data[i + 1] = Math.floor((data[i + 1] / 255) * levels) * (255 / levels);
    data[i + 2] = Math.floor((data[i + 2] / 255) * levels) * (255 / levels);
  }

  return imageData;
}

/**
 * Apply dithering effect (retro aesthetic)
 */
export function applyDithering(imageData: ImageData, threshold: number = 128): ImageData {
  const data = imageData.data;
  const width = imageData.width;

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const oldR = data[index];
      const oldG = data[index + 1];
      const oldB = data[index + 2];

      // Floyd-Steinberg dithering
      const newR = oldR < threshold ? 0 : 255;
      const newG = oldG < threshold ? 0 : 255;
      const newB = oldB < threshold ? 0 : 255;

      data[index] = newR;
      data[index + 1] = newG;
      data[index + 2] = newB;

      const errR = oldR - newR;
      const errG = oldG - newG;
      const errB = oldB - newB;

      // Distribute error to neighboring pixels
      if (x + 1 < width) {
        const rightIndex = (y * width + (x + 1)) * 4;
        data[rightIndex] += (errR * 7) / 16;
        data[rightIndex + 1] += (errG * 7) / 16;
        data[rightIndex + 2] += (errB * 7) / 16;
      }

      if (y + 1 < imageData.height) {
        if (x > 0) {
          const bottomLeftIndex = ((y + 1) * width + (x - 1)) * 4;
          data[bottomLeftIndex] += (errR * 3) / 16;
          data[bottomLeftIndex + 1] += (errG * 3) / 16;
          data[bottomLeftIndex + 2] += (errB * 3) / 16;
        }

        const bottomIndex = ((y + 1) * width + x) * 4;
        data[bottomIndex] += (errR * 5) / 16;
        data[bottomIndex + 1] += (errG * 5) / 16;
        data[bottomIndex + 2] += (errB * 5) / 16;

        if (x + 1 < width) {
          const bottomRightIndex = ((y + 1) * width + (x + 1)) * 4;
          data[bottomRightIndex] += errR / 16;
          data[bottomRightIndex + 1] += errG / 16;
          data[bottomRightIndex + 2] += errB / 16;
        }
      }
    }
  }

  return imageData;
}

/**
 * Generate gradient texture
 */
export function generateGradientTexture(
  config: TextureConfig,
  color1: string,
  color2: string,
  angle: number = 0,
): ImageData {
  const { width, height } = config;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(
    0,
    0,
    width * Math.cos(angle),
    height * Math.sin(angle),
  );
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Composite multiple texture layers
 */
export function compositeTextures(
  base: ImageData,
  overlay: ImageData,
  blendMode: 'multiply' | 'screen' | 'overlay' | 'add' = 'multiply',
  opacity: number = 1,
): ImageData {
  const result = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height);

  for (let i = 0; i < base.data.length; i += 4) {
    const br = base.data[i];
    const bg = base.data[i + 1];
    const bb = base.data[i + 2];

    const or = overlay.data[i];
    const og = overlay.data[i + 1];
    const ob = overlay.data[i + 2];

    let r, g, b;

    switch (blendMode) {
      case 'multiply':
        r = (br * or) / 255;
        g = (bg * og) / 255;
        b = (bb * ob) / 255;
        break;
      case 'screen':
        r = 255 - ((255 - br) * (255 - or)) / 255;
        g = 255 - ((255 - bg) * (255 - og)) / 255;
        b = 255 - ((255 - bb) * (255 - ob)) / 255;
        break;
      case 'overlay':
        r = br < 128 ? (2 * br * or) / 255 : 255 - (2 * (255 - br) * (255 - or)) / 255;
        g = bg < 128 ? (2 * bg * og) / 255 : 255 - (2 * (255 - bg) * (255 - og)) / 255;
        b = bb < 128 ? (2 * bb * ob) / 255 : 255 - (2 * (255 - bb) * (255 - ob)) / 255;
        break;
      case 'add':
        r = Math.min(255, br + or);
        g = Math.min(255, bg + og);
        b = Math.min(255, bb + ob);
        break;
    }

    result.data[i] = Math.round(br + (r - br) * opacity);
    result.data[i + 1] = Math.round(bg + (g - bg) * opacity);
    result.data[i + 2] = Math.round(bb + (b - bb) * opacity);
  }

  return result;
}

/**
 * Convert ImageData to data URL for use in src attributes
 */
export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
