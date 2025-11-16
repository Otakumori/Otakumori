/**
 * Enhanced Texture Utilities
 * 
 * Procedural texture generators, gradient utilities, particle effects,
 * and bloom/glow utilities for enhanced visual quality.
 */

'use client';

export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  colors: Array<{ stop: number; color: string }>;
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  radius?: number;
}

/**
 * Create enhanced gradient for canvas
 */
export function createEnhancedGradient(
  ctx: CanvasRenderingContext2D,
  config: GradientConfig,
): CanvasGradient {
  let gradient: CanvasGradient;

  switch (config.type) {
    case 'linear':
      gradient = ctx.createLinearGradient(
        config.x0 || 0,
        config.y0 || 0,
        config.x1 || 100,
        config.y1 || 100,
      );
      break;
    case 'radial':
      gradient = ctx.createRadialGradient(
        config.x0 || 0,
        config.y0 || 0,
        0,
        config.x0 || 0,
        config.y0 || 0,
        config.radius || 100,
      );
      break;
    case 'conic':
      // Canvas doesn't support conic gradients natively, use radial as fallback
      gradient = ctx.createRadialGradient(
        config.x0 || 0,
        config.y0 || 0,
        0,
        config.x0 || 0,
        config.y0 || 0,
        config.radius || 100,
      );
      break;
    default:
      gradient = ctx.createLinearGradient(0, 0, 100, 100);
  }

  for (const colorStop of config.colors) {
    gradient.addColorStop(colorStop.stop, colorStop.color);
  }

  return gradient;
}

/**
 * Generate procedural noise texture
 */
export function generateNoiseTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.1,
): ImageData {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 255;
    data[i] = 128 + noise; // R
    data[i + 1] = 128 + noise; // G
    data[i + 2] = 128 + noise; // B
    data[i + 3] = 255; // A
  }

  return imageData;
}

/**
 * Generate procedural wood texture
 */
export function generateWoodTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grainColor: string = '#8b7355',
  baseColor: string = '#6b5d4f',
): ImageData {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const baseRGB = hexToRgb(baseColor);
  const grainRGB = hexToRgb(grainColor);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const grain = Math.sin(x * 0.1 + y * 0.05) * 0.3 + 0.7;
      const ring = Math.sin((x + y) * 0.02) * 0.2 + 0.8;

      data[i] = Math.floor(baseRGB.r * grain * ring + grainRGB.r * (1 - grain * ring));
      data[i + 1] = Math.floor(baseRGB.g * grain * ring + grainRGB.g * (1 - grain * ring));
      data[i + 2] = Math.floor(baseRGB.b * grain * ring + grainRGB.b * (1 - grain * ring));
      data[i + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Generate procedural stone texture
 */
export function generateStoneTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseColor: string = '#6b6b6b',
): ImageData {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const baseRGB = hexToRgb(baseColor);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const noise = (Math.random() - 0.5) * 0.3;
      const crack = Math.sin(x * 0.05) * Math.sin(y * 0.05) * 0.1;

      data[i] = Math.floor(baseRGB.r * (1 + noise + crack));
      data[i + 1] = Math.floor(baseRGB.g * (1 + noise + crack));
      data[i + 2] = Math.floor(baseRGB.b * (1 + noise + crack));
      data[i + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Generate procedural fabric texture
 */
export function generateFabricTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseColor: string = '#c0c0c0',
): ImageData {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const baseRGB = hexToRgb(baseColor);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const weave = Math.sin(x * 0.2) * Math.sin(y * 0.2) * 0.15;
      const noise = (Math.random() - 0.5) * 0.1;

      data[i] = Math.floor(baseRGB.r * (1 + weave + noise));
      data[i + 1] = Math.floor(baseRGB.g * (1 + weave + noise));
      data[i + 2] = Math.floor(baseRGB.b * (1 + weave + noise));
      data[i + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Create bloom effect (glow around shape)
 */
export function createBloomEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string = '#ffffff',
  intensity: number = 0.5,
  layers: number = 3,
): void {
  const rgb = hexToRgb(color);

  for (let i = 0; i < layers; i++) {
    const layerRadius = radius * (1 + i * 0.5);
    const layerAlpha = intensity / (i + 1);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${layerAlpha})`);
    gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${layerAlpha * 0.5})`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Create glow effect (simpler than bloom)
 */
export function createGlowEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string = '#ffffff',
  intensity: number = 0.3,
): void {
  const rgb = hexToRgb(color);
  const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.5);
  gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`);
  gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Create particle burst effect
 */
export function createParticleBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  particleCount: number = 20,
  color: string = '#ffffff',
  speed: number = 100,
  lifetime: number = 1.0,
): Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}> {
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
  }> = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
    const velocity = speed * (0.5 + Math.random() * 0.5);

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: lifetime,
      color,
    });
  }

  return particles;
}

/**
 * Update and render particles
 */
export function updateParticles(
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
  }>,
  deltaTime: number,
  gravity: number = 0,
): void {
  for (const particle of particles) {
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.vy += gravity * deltaTime;
    particle.life -= deltaTime;
  }
}

/**
 * Render particles
 */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
  }>,
): void {
  for (const particle of particles) {
    if (particle.life <= 0) continue;

    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Generate fallback texture for missing assets
 */
export function generateFallbackTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: 'checker' | 'gradient' | 'solid' = 'checker',
  color1: string = '#4a5568',
  color2: string = '#2d3748',
): ImageData {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let rgb = rgb1;

      if (type === 'checker') {
        const checker = Math.floor(x / 8) + Math.floor(y / 8);
        rgb = checker % 2 === 0 ? rgb1 : rgb2;
      } else if (type === 'gradient') {
        const t = x / width;
        rgb = {
          r: Math.floor(rgb1.r * (1 - t) + rgb2.r * t),
          g: Math.floor(rgb1.g * (1 - t) + rgb2.g * t),
          b: Math.floor(rgb1.b * (1 - t) + rgb2.b * t),
        };
      }

      data[i] = rgb.r;
      data[i + 1] = rgb.g;
      data[i + 2] = rgb.b;
      data[i + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Helper: Convert hex color to RGB
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

