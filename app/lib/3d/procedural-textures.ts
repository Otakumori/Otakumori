/**
 * Procedural Texture Generation
 * Generates textures algorithmically without requiring image files
 */

import * as THREE from 'three';

export class ProceduralTextureGenerator {
  /**
   * Generate procedural skin texture with natural variation
   */
  static generateSkinTexture(
    width: number = 1024,
    height: number = 1024,
    baseColor: THREE.Color | string | number = 0xffdbac,
    variation: number = 0.1,
  ): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const color = baseColor instanceof THREE.Color ? baseColor : new THREE.Color(baseColor);

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Generate Perlin-like noise for skin variation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Multi-octave noise for natural skin variation
        const noise =
          this.perlinNoise(x / 100, y / 100) * 0.5 +
          this.perlinNoise(x / 50, y / 50) * 0.3 +
          this.perlinNoise(x / 25, y / 25) * 0.2;

        const colorVariation = 1.0 + (noise - 0.5) * variation;

        data[idx] = color.r * 255 * colorVariation;
        data[idx + 1] = color.g * 255 * colorVariation;
        data[idx + 2] = color.b * 255 * colorVariation;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
  }

  /**
   * Generate toon ramp texture for cel shading
   */
  static generateToonRamp(steps: number = 4, smoothness: number = 0.1): THREE.Texture {
    const width = 256;
    const height = 1;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let x = 0; x < width; x++) {
      const t = x / width;
      const idx = x * 4;

      // Create stepped ramp
      const step = Math.floor(t * steps) / steps;
      const smoothStep = this.smoothstep(step - smoothness, step + smoothness, t);

      const value = Math.floor(smoothStep * 255);

      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
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

  /**
   * Generate normal map for subtle surface detail
   */
  static generateNormalMap(
    width: number = 512,
    height: number = 512,
    strength: number = 1.0,
  ): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Calculate normal from height gradients
        const heightL = this.perlinNoise((x - 1) / 50, y / 50);
        const heightR = this.perlinNoise((x + 1) / 50, y / 50);
        const heightD = this.perlinNoise(x / 50, (y - 1) / 50);
        const heightU = this.perlinNoise(x / 50, (y + 1) / 50);

        const dx = (heightL - heightR) * strength;
        const dy = (heightD - heightU) * strength;

        const normal = new THREE.Vector3(dx, dy, 1).normalize();

        // Convert normal to RGB (0-1 range to 0-255)
        data[idx] = ((normal.x + 1) / 2) * 255;
        data[idx + 1] = ((normal.y + 1) / 2) * 255;
        data[idx + 2] = ((normal.z + 1) / 2) * 255;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
  }

  /**
   * Generate fabric texture for clothing
   */
  static generateFabricTexture(
    width: number = 512,
    height: number = 512,
    baseColor: THREE.Color | string | number = 0x666666,
    weaveSize: number = 8,
  ): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const color = baseColor instanceof THREE.Color ? baseColor : new THREE.Color(baseColor);

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Weave pattern
        const weaveX = Math.floor(x / weaveSize) % 2;
        const weaveY = Math.floor(y / weaveSize) % 2;
        const weave = weaveX === weaveY ? 1.0 : 0.95;

        // Add noise
        const noise = this.perlinNoise(x / 30, y / 30) * 0.1;

        const brightness = weave + noise;

        data[idx] = color.r * 255 * brightness;
        data[idx + 1] = color.g * 255 * brightness;
        data[idx + 2] = color.b * 255 * brightness;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return texture;
  }

  /**
   * Simplified Perlin noise implementation
   * For production, consider using simplex-noise library
   */
  private static perlinNoise(x: number, y: number): number {
    // Simple value noise approximation
    const X = Math.floor(x);
    const Y = Math.floor(y);

    const sx = x - X;
    const sy = y - Y;

    const n00 = this.hash2D(X, Y);
    const n01 = this.hash2D(X, Y + 1);
    const n10 = this.hash2D(X + 1, Y);
    const n11 = this.hash2D(X + 1, Y + 1);

    const nx0 = this.lerp(n00, n10, this.fade(sx));
    const nx1 = this.lerp(n01, n11, this.fade(sx));

    return this.lerp(nx0, nx1, this.fade(sy));
  }

  /**
   * Hash function for 2D coordinates
   */
  private static hash2D(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * Linear interpolation
   */
  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Smoothstep function
   */
  private static smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /**
   * Fade function for Perlin noise
   */
  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
}
