/**
 * Enhanced Procedural Texture Generation
 * Generates textures algorithmically without requiring image files
 * Enhanced version of app/lib/3d/procedural-textures.ts
 */

import * as THREE from 'three';

// Note: ProceduralTextureGenerator exists in app/lib/3d/procedural-textures.ts
// This module provides enhanced procedural texture functions

/**
 * Generate noise mask texture for variation
 */
export function generateNoiseMask(
  width: number = 512,
  height: number = 512,
  seed: number = 0,
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Simple hash-based noise with seed
  const hash = (x: number, y: number, s: number): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + s * 43758.5453) * 43758.5453;
    return n - Math.floor(n);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const noise = hash(x / 10, y / 10, seed);
      const value = Math.floor(noise * 255);

      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

/**
 * Generate rim lighting mask texture
 */
export function generateRimLightMask(width: number = 512, height: number = 512): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normalizedDist = dist / maxDist;

      // Rim mask: stronger at edges
      const rim = Math.pow(1.0 - normalizedDist, 2.0);
      const value = Math.floor(rim * 255);

      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

/**
 * Generate surface detail map
 */
export function generateSurfaceDetail(
  width: number = 512,
  height: number = 512,
  type: 'skin' | 'fabric' | 'metal' = 'skin',
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Hash function for noise
  const hash = (x: number, y: number): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      let value = 128; // Base value

      if (type === 'skin') {
        // Fine-grained noise for skin pores
        const noise = hash(x / 5, y / 5) * 0.1;
        value = 128 + noise * 127;
      } else if (type === 'fabric') {
        // Weave pattern
        const weaveX = Math.floor(x / 8) % 2;
        const weaveY = Math.floor(y / 8) % 2;
        value = weaveX === weaveY ? 140 : 120;
      } else if (type === 'metal') {
        // Scratches and wear
        const noise = hash(x / 20, y / 20) * 0.2;
        value = 128 + noise * 127;
      }

      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

/**
 * Generate decal texture (petals, blossoms, runes)
 */
export function generateDecal(
  pattern: 'petals' | 'blossoms' | 'runes',
  color: THREE.Color | string | number = 0xff69b4,
  size: number = 256,
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const decalColor =
    color instanceof THREE.Color ? color : new THREE.Color(color);

  // Clear canvas
  ctx.fillStyle = `rgba(0, 0, 0, 0)`;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = `rgba(${decalColor.r * 255}, ${decalColor.g * 255}, ${decalColor.b * 255}, 1)`;

  if (pattern === 'petals') {
    // Draw petal shapes
    const centerX = size / 2;
    const centerY = size / 2;
    const petalCount = 5;
    const radius = size * 0.3;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i * Math.PI * 2) / petalCount;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pattern === 'blossoms') {
    // Draw blossom (cherry blossom style)
    const centerX = size / 2;
    const centerY = size / 2;
    const petalCount = 5;
    const radius = size * 0.25;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i * Math.PI * 2) / petalCount;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.ellipse(x, y, radius * 0.5, radius * 0.3, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 200, 100, 1)`;
    ctx.fill();
  } else if (pattern === 'runes') {
    // Draw rune symbols (simple geometric patterns)
    const centerX = size / 2;
    const centerY = size / 2;
    const lineWidth = size * 0.05;

    ctx.strokeStyle = `rgba(${decalColor.r * 255}, ${decalColor.g * 255}, ${decalColor.b * 255}, 1)`;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    // Draw a simple rune pattern
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.3);
    ctx.lineTo(centerX, centerY + size * 0.3);
    ctx.moveTo(centerX - size * 0.2, centerY);
    ctx.lineTo(centerX + size * 0.2, centerY);
    ctx.moveTo(centerX - size * 0.15, centerY - size * 0.15);
    ctx.lineTo(centerX + size * 0.15, centerY + size * 0.15);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

/**
 * Generate palette-based recoloring texture
 */
export function generatePaletteTexture(
  colors: string[],
  width: number = 256,
): THREE.Texture {
  const height = 1;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const colorCount = colors.length;
  const segmentWidth = width / colorCount;

  for (let x = 0; x < width; x++) {
    const segment = Math.floor(x / segmentWidth);
    const segmentIndex = Math.min(segment, colorCount - 1);
    const nextIndex = Math.min(segmentIndex + 1, colorCount - 1);
    const t = (x % segmentWidth) / segmentWidth;

    const color1 = new THREE.Color(colors[segmentIndex]);
    const color2 = new THREE.Color(colors[nextIndex]);
    const color = color1.clone().lerp(color2, t);

    const idx = x * 4;
    data[idx] = color.r * 255;
    data[idx + 1] = color.g * 255;
    data[idx + 2] = color.b * 255;
    data[idx + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

