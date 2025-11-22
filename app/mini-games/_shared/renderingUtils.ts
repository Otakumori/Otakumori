/**
 * Enhanced Rendering Utilities
 *
 * Better shadows, lighting, particles, and post-processing effects
 * for improved visual quality across all games.
 */

'use client';

/**
 * Create enhanced shadow with blur and color
 */
export function createEnhancedShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  blur: number = 10,
  color: string = 'rgba(0, 0, 0, 0.3)',
  offsetX: number = 0,
  offsetY: number = 0,
): void {
  ctx.save();
  ctx.shadowBlur = blur;
  ctx.shadowColor = color;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Create soft shadow (multiple layers)
 */
export function createSoftShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  layers: number = 3,
  baseColor: string = 'rgba(0, 0, 0, 0.2)',
): void {
  for (let i = 0; i < layers; i++) {
    const layerRadius = radius * (1 + i * 0.3);
    const layerAlpha = parseFloat(baseColor.split(',')[3]?.replace(')', '') || '0.2') / (i + 1);
    const layerColor = baseColor.replace(/[\d.]+\)$/, `${layerAlpha})`);

    ctx.save();
    ctx.globalAlpha = layerAlpha;
    ctx.fillStyle = layerColor;
    ctx.beginPath();
    ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Create lighting effect (directional light)
 */
export function createDirectionalLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  lightAngle: number = Math.PI / 4,
  lightIntensity: number = 0.5,
  lightColor: string = '#ffffff',
): void {
  const gradient = ctx.createLinearGradient(
    x,
    y,
    x + Math.cos(lightAngle) * width,
    y + Math.sin(lightAngle) * height,
  );

  const rgb = hexToRgb(lightColor);
  gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${lightIntensity})`);
  gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${lightIntensity * 0.5})`);
  gradient.addColorStop(1, 'transparent');

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

/**
 * Create ambient lighting
 */
export function createAmbientLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  intensity: number = 0.3,
  color: string = '#ffffff',
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const rgb = hexToRgb(color);

  gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`);
  gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.5})`);
  gradient.addColorStop(1, 'transparent');

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Create rim light effect
 */
export function createRimLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  intensity: number = 0.6,
  color: string = '#ffd700',
  angle: number = Math.PI,
): void {
  const rimGradient = ctx.createRadialGradient(
    x + Math.cos(angle) * radius * 0.8,
    y + Math.sin(angle) * radius * 0.8,
    0,
    x,
    y,
    radius * 1.2,
  );

  const rgb = hexToRgb(color);
  rimGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`);
  rimGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.5})`);
  rimGradient.addColorStop(1, 'transparent');

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = rimGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Enhanced particle system
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export function createParticleSystem(
  count: number,
  x: number,
  y: number,
  options?: {
    speed?: number;
    spread?: number;
    color?: string;
    size?: number;
    lifetime?: number;
  },
): Particle[] {
  const particles: Particle[] = [];
  const speed = options?.speed || 50;
  const spread = options?.spread || Math.PI * 2;
  const color = options?.color || '#ffffff';
  const size = options?.size || 2;
  const lifetime = options?.lifetime || 1.0;

  for (let i = 0; i < count; i++) {
    const angle = (spread / count) * i + Math.random() * 0.2;
    const particleSpeed = speed * (0.5 + Math.random() * 0.5);

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * particleSpeed,
      vy: Math.sin(angle) * particleSpeed,
      life: lifetime,
      maxLife: lifetime,
      size: size * (0.5 + Math.random() * 0.5),
      color,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 5,
    });
  }

  return particles;
}

export function updateParticleSystem(
  particles: Particle[],
  deltaTime: number,
  gravity: number = 0,
): Particle[] {
  return particles
    .map((particle) => {
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vy += gravity * deltaTime;
      particle.life -= deltaTime;
      particle.rotation += particle.rotationSpeed * deltaTime;

      return particle;
    })
    .filter((particle) => particle.life > 0);
}

export function renderParticleSystem(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const particle of particles) {
    const alpha = particle.life / particle.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Post-processing: Apply bloom to entire canvas
 */
export function applyBloomPostProcess(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  intensity: number = 0.5,
  threshold: number = 0.8,
): void {
  // Simple bloom: draw source with glow
  // Threshold determines brightness cutoff for bloom (higher = only bright areas bloom)
  const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const data = imageData.data;

  // Apply threshold-based bloom (only bright pixels contribute)
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
    if (brightness < threshold) {
      // Dim pixels below threshold
      data[i] *= 0.5;
      data[i + 1] *= 0.5;
      data[i + 2] *= 0.5;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = intensity;
  ctx.filter = 'blur(10px)';
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.restore();

  // Draw original on top
  ctx.drawImage(sourceCanvas, 0, 0);
}

/**
 * Post-processing: Apply color correction
 */
export function applyColorCorrection(
  ctx: CanvasRenderingContext2D,
  brightness: number = 1.0,
  contrast: number = 1.0,
  saturation: number = 1.0,
): void {
  // Apply brightness
  if (brightness !== 1.0) {
    ctx.save();
    ctx.globalCompositeOperation = brightness > 1 ? 'screen' : 'multiply';
    ctx.globalAlpha = Math.abs(brightness - 1.0);
    ctx.fillStyle = brightness > 1 ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  // Apply contrast
  if (contrast !== 1.0) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = Math.abs(contrast - 1.0) * 0.5;
    ctx.fillStyle = contrast > 1 ? '#ffffff' : '#808080';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  // Apply saturation (simplified - desaturate by mixing with grayscale)
  if (saturation !== 1.0 && saturation < 1.0) {
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = 1.0 - saturation;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }
}

/**
 * Create gradient background
 */
export function createGradientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  direction: 'vertical' | 'horizontal' | 'radial' = 'vertical',
): void {
  let gradient: CanvasGradient;

  if (direction === 'radial') {
    gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height),
    );
  } else if (direction === 'horizontal') {
    gradient = ctx.createLinearGradient(0, 0, width, 0);
  } else {
    gradient = ctx.createLinearGradient(0, 0, 0, height);
  }

  const step = 1 / (colors.length - 1);
  colors.forEach((color, i) => {
    gradient.addColorStop(i * step, color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Helper: Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}
