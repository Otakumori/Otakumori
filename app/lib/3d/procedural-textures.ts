import * as THREE from 'three';

export interface TextureGenerationOptions {
  width: number;
  height: number;
  format: 'rgba' | 'rgb' | 'luminance';
  type: 'unsigned_byte' | 'float' | 'half_float';
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  minFilter?: THREE.TextureFilter;
  magFilter?: THREE.TextureFilter;
  generateMipmaps?: boolean;
  anisotropy?: number;
}

export interface SkinTextureOptions {
  skinTone: THREE.Color;
  variation: number; // 0-1, amount of color variation
  detail: number; // 0-1, amount of skin detail
  smoothness: number; // 0-1, how smooth the skin appears
  age: number; // 0-1, affects wrinkles and age spots
}

export interface HairTextureOptions {
  baseColor: THREE.Color;
  highlightColor: THREE.Color;
  variation: number; // 0-1, color variation along strands
  thickness: number; // 0-1, affects strand thickness
  flow: number; // 0-1, affects hair flow pattern
  shine: number; // 0-1, affects highlight intensity
}

export interface MaterialTextureOptions {
  baseColor: THREE.Color;
  pattern: 'solid' | 'stripes' | 'dots' | 'gradient' | 'noise' | 'custom';
  patternColor?: THREE.Color;
  scale: number; // Pattern scale
  rotation: number; // Pattern rotation in radians
  intensity: number; // 0-1, pattern intensity
  roughness: number; // 0-1, surface roughness
  metallic: number; // 0-1, metallic properties
}

export class ProceduralTextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Generate anime-style skin texture
  generateSkinTexture(
    options: SkinTextureOptions,
    textureOptions: TextureGenerationOptions,
  ): THREE.Texture {
    const { width, height } = textureOptions;
    this.canvas.width = width;
    this.canvas.height = height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Base skin color
    this.ctx.fillStyle = options.skinTone.getStyle();
    this.ctx.fillRect(0, 0, width, height);

    // Add subtle color variation
    if (options.variation > 0) {
      this.addColorVariation(options.skinTone, options.variation);
    }

    // Add skin detail (pores, subtle bumps)
    if (options.detail > 0) {
      this.addSkinDetail(options.detail, options.smoothness);
    }

    // Add age-related features
    if (options.age > 0) {
      this.addAgeFeatures(options.age);
    }

    // Create texture
    const texture = new THREE.CanvasTexture(this.canvas);
    this.applyTextureSettings(texture, textureOptions);

    return texture;
  }

  // Generate hair texture with anisotropic properties
  generateHairTexture(
    options: HairTextureOptions,
    textureOptions: TextureGenerationOptions,
  ): THREE.Texture {
    const { width, height } = textureOptions;
    this.canvas.width = width;
    this.canvas.height = height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Base hair color
    this.ctx.fillStyle = options.baseColor.getStyle();
    this.ctx.fillRect(0, 0, width, height);

    // Add hair strands
    this.addHairStrands(options);

    // Add highlights
    if (options.shine > 0) {
      this.addHairHighlights(options);
    }

    // Add flow patterns
    if (options.flow > 0) {
      this.addHairFlow(options.flow);
    }

    const texture = new THREE.CanvasTexture(this.canvas);
    this.applyTextureSettings(texture, textureOptions);

    return texture;
  }

  // Generate material texture with patterns
  generateMaterialTexture(
    options: MaterialTextureOptions,
    textureOptions: TextureGenerationOptions,
  ): THREE.Texture {
    const { width, height } = textureOptions;
    this.canvas.width = width;
    this.canvas.height = height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Base color
    this.ctx.fillStyle = options.baseColor.getStyle();
    this.ctx.fillRect(0, 0, width, height);

    // Add pattern
    switch (options.pattern) {
      case 'solid':
        // Already filled with base color
        break;
      case 'stripes':
        this.addStripes(options);
        break;
      case 'dots':
        this.addDots(options);
        break;
      case 'gradient':
        this.addGradient(options);
        break;
      case 'noise':
        this.addNoise(options);
        break;
    }

    const texture = new THREE.CanvasTexture(this.canvas);
    this.applyTextureSettings(texture, textureOptions);

    return texture;
  }

  // Generate normal map for enhanced detail
  generateNormalMap(sourceTexture: THREE.Texture, strength: number = 1.0): THREE.Texture {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = sourceTexture.image.width;
    canvas.height = sourceTexture.image.height;

    // Draw source texture to canvas
    ctx.drawImage(sourceTexture.image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to normal map
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Convert to grayscale
      const gray = (r + g + b) / 3;

      // Generate normal map colors
      // This is a simplified normal map generation
      const x = ((gray - 128) / 128) * strength;
      const y = ((gray - 128) / 128) * strength;
      const z = Math.sqrt(1 - x * x - y * y);

      data[i] = (x + 1) * 128; // Red channel (X)
      data[i + 1] = (y + 1) * 128; // Green channel (Y)
      data[i + 2] = (z + 1) * 128; // Blue channel (Z)
      data[i + 3] = 255; // Alpha channel
    }

    ctx.putImageData(imageData, 0, 0);

    const normalTexture = new THREE.CanvasTexture(canvas);
    normalTexture.format = THREE.RGBAFormat;
    normalTexture.generateMipmaps = true;

    return normalTexture;
  }

  // Generate roughness map
  generateRoughnessMap(
    options: { smoothness: number; variation: number },
    textureOptions: TextureGenerationOptions,
  ): THREE.Texture {
    const { width, height } = textureOptions;
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.clearRect(0, 0, width, height);

    // Base roughness
    const baseRoughness = 1 - options.smoothness;
    const gray = Math.floor(baseRoughness * 255);

    this.ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
    this.ctx.fillRect(0, 0, width, height);

    // Add variation
    if (options.variation > 0) {
      this.addRoughnessVariation(options.variation);
    }

    const texture = new THREE.CanvasTexture(this.canvas);
    this.applyTextureSettings(texture, textureOptions);

    return texture;
  }

  // Generate metallic map
  generateMetallicMap(
    options: { metallic: number; variation: number },
    textureOptions: TextureGenerationOptions,
  ): THREE.Texture {
    const { width, height } = textureOptions;
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.clearRect(0, 0, width, height);

    // Base metallic value
    const gray = Math.floor(options.metallic * 255);

    this.ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
    this.ctx.fillRect(0, 0, width, height);

    // Add variation
    if (options.variation > 0) {
      this.addMetallicVariation(options.variation);
    }

    const texture = new THREE.CanvasTexture(this.canvas);
    this.applyTextureSettings(texture, textureOptions);

    return texture;
  }

  // Private helper methods

  private addColorVariation(baseColor: THREE.Color, variation: number) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Add subtle color variation
      const noise = (Math.random() - 0.5) * variation * 50;

      data[i] = Math.max(0, Math.min(255, data[i] + noise)); // Red
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private addSkinDetail(detail: number, smoothness: number) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % this.canvas.width;
      const y = Math.floor(i / 4 / this.canvas.width);

      // Generate subtle skin detail using noise
      const noise = this.perlinNoise(x * 0.1, y * 0.1) * detail * 20;
      const smoothNoise = noise * smoothness;

      data[i] = Math.max(0, Math.min(255, data[i] + smoothNoise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + smoothNoise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + smoothNoise));
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private addAgeFeatures(age: number) {
    if (age < 0.3) return; // No age features for young skin

    // Add subtle age spots and fine lines
    const spots = Math.floor(age * 10);

    for (let i = 0; i < spots; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 3 + 1;
      const opacity = (age - 0.3) * 0.5;

      this.ctx.fillStyle = `rgba(139, 69, 19, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private addHairStrands(options: HairTextureOptions) {
    const strandCount = Math.floor(options.thickness * 100 + 20);

    for (let i = 0; i < strandCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const length = Math.random() * 50 + 20;
      const thickness = Math.random() * 2 + 1;

      // Hair strand color with variation
      const variation = (Math.random() - 0.5) * options.variation;
      const strandColor = new THREE.Color(options.baseColor);
      strandColor.offsetHSL(variation * 0.1, variation * 0.2, variation * 0.1);

      this.ctx.strokeStyle = strandColor.getStyle();
      this.ctx.lineWidth = thickness;
      this.ctx.lineCap = 'round';

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);

      // Draw strand with slight curve
      for (let j = 1; j <= length; j++) {
        const curveX = x + j * 0.5 + Math.sin(j * 0.1) * 2;
        const curveY = y + j + Math.cos(j * 0.1) * 1;
        this.ctx.lineTo(curveX, curveY);
      }

      this.ctx.stroke();
    }
  }

  private addHairHighlights(options: HairTextureOptions) {
    const highlightCount = Math.floor(options.shine * 20 + 5);

    for (let i = 0; i < highlightCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const length = Math.random() * 30 + 10;

      // Create gradient highlight
      const gradient = this.ctx.createLinearGradient(x, y, x + length, y);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, options.highlightColor.getStyle());
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, length, 2);
    }
  }

  private addHairFlow(flow: number) {
    // Add subtle flow patterns using curves
    const flowLines = Math.floor(flow * 10 + 3);

    for (let i = 0; i < flowLines; i++) {
      const startX = Math.random() * this.canvas.width;
      const startY = Math.random() * this.canvas.height;

      this.ctx.strokeStyle = `rgba(255, 255, 255, ${flow * 0.1})`;
      this.ctx.lineWidth = 1;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);

      // Draw flowing curve
      for (let j = 0; j < 50; j++) {
        const x = startX + j * 2;
        const y = startY + Math.sin(j * 0.2) * flow * 10;
        this.ctx.lineTo(x, y);
      }

      this.ctx.stroke();
    }
  }

  private addStripes(options: MaterialTextureOptions) {
    if (!options.patternColor) return;

    const stripeWidth = 10 / options.scale;
    const stripeSpacing = stripeWidth * 2;

    this.ctx.fillStyle = options.patternColor.getStyle();
    this.ctx.globalAlpha = options.intensity;

    for (let x = 0; x < this.canvas.width; x += stripeSpacing) {
      this.ctx.fillRect(x, 0, stripeWidth, this.canvas.height);
    }

    this.ctx.globalAlpha = 1;
  }

  private addDots(options: MaterialTextureOptions) {
    if (!options.patternColor) return;

    const dotSize = 5 / options.scale;
    const spacing = dotSize * 3;

    this.ctx.fillStyle = options.patternColor.getStyle();
    this.ctx.globalAlpha = options.intensity;

    for (let x = 0; x < this.canvas.width; x += spacing) {
      for (let y = 0; y < this.canvas.height; y += spacing) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.globalAlpha = 1;
  }

  private addGradient(options: MaterialTextureOptions) {
    if (!options.patternColor) return;

    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, options.baseColor.getStyle());
    gradient.addColorStop(1, options.patternColor.getStyle());

    this.ctx.globalAlpha = options.intensity;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
  }

  private addNoise(options: MaterialTextureOptions) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * options.intensity * 100;

      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private addRoughnessVariation(variation: number) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * variation * 50;
      const newValue = Math.max(0, Math.min(255, data[i] + noise));

      data[i] = newValue;
      data[i + 1] = newValue;
      data[i + 2] = newValue;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private addMetallicVariation(variation: number) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * variation * 30;
      const newValue = Math.max(0, Math.min(255, data[i] + noise));

      data[i] = newValue;
      data[i + 1] = newValue;
      data[i + 2] = newValue;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private applyTextureSettings(texture: THREE.Texture, options: TextureGenerationOptions) {
    texture.format =
      options.format === 'rgba'
        ? THREE.RGBAFormat
        : options.format === 'rgb'
          ? THREE.RGBAFormat
          : THREE.RedFormat;

    texture.type =
      options.type === 'float'
        ? THREE.FloatType
        : options.type === 'half_float'
          ? THREE.HalfFloatType
          : THREE.UnsignedByteType;

    if (options.wrapS) texture.wrapS = options.wrapS;
    if (options.wrapT) texture.wrapT = options.wrapT;
    if (options.minFilter) texture.minFilter = options.minFilter;
    if (options.magFilter && typeof options.magFilter === 'number')
      texture.magFilter = options.magFilter as THREE.MagnificationTextureFilter;

    texture.generateMipmaps = options.generateMipmaps ?? true;

    if (options.anisotropy) {
      texture.anisotropy = options.anisotropy;
    }
  }

  // Simple Perlin noise implementation
  private perlinNoise(x: number, y: number): number {
    // Simplified Perlin noise - in production, use a proper noise library
    const n = Math.sin(x) * Math.cos(y) + Math.sin(x * 2.1) * Math.cos(y * 2.1) * 0.5;
    return n * 0.5 + 0.5; // Normalize to 0-1
  }
}

// Preset texture generators for common materials
export const TexturePresets = {
  // Skin presets
  skin: {
    fair: {
      skinTone: new THREE.Color(1.0, 0.9, 0.8),
      variation: 0.1,
      detail: 0.3,
      smoothness: 0.8,
      age: 0.1,
    },
    medium: {
      skinTone: new THREE.Color(1.0, 0.8, 0.7),
      variation: 0.15,
      detail: 0.4,
      smoothness: 0.7,
      age: 0.2,
    },
    tan: {
      skinTone: new THREE.Color(0.9, 0.7, 0.5),
      variation: 0.2,
      detail: 0.5,
      smoothness: 0.6,
      age: 0.3,
    },
    dark: {
      skinTone: new THREE.Color(0.6, 0.4, 0.3),
      variation: 0.1,
      detail: 0.6,
      smoothness: 0.8,
      age: 0.2,
    },
  },

  // Hair presets
  hair: {
    black: {
      baseColor: new THREE.Color(0.1, 0.1, 0.1),
      highlightColor: new THREE.Color(0.3, 0.3, 0.3),
      variation: 0.05,
      thickness: 0.7,
      flow: 0.8,
      shine: 0.6,
    },
    brown: {
      baseColor: new THREE.Color(0.4, 0.2, 0.1),
      highlightColor: new THREE.Color(0.8, 0.6, 0.4),
      variation: 0.15,
      thickness: 0.6,
      flow: 0.7,
      shine: 0.7,
    },
    blonde: {
      baseColor: new THREE.Color(0.8, 0.6, 0.3),
      highlightColor: new THREE.Color(1.0, 0.9, 0.7),
      variation: 0.2,
      thickness: 0.5,
      flow: 0.6,
      shine: 0.9,
    },
    red: {
      baseColor: new THREE.Color(0.6, 0.2, 0.1),
      highlightColor: new THREE.Color(1.0, 0.6, 0.3),
      variation: 0.25,
      thickness: 0.6,
      flow: 0.8,
      shine: 0.8,
    },
  },

  // Material presets
  materials: {
    cotton: {
      baseColor: new THREE.Color(0.9, 0.9, 0.9),
      pattern: 'solid' as const,
      scale: 1,
      rotation: 0,
      intensity: 0,
      roughness: 0.7,
      metallic: 0,
    },
    silk: {
      baseColor: new THREE.Color(0.95, 0.95, 0.98),
      pattern: 'noise' as const,
      scale: 2,
      rotation: 0,
      intensity: 0.1,
      roughness: 0.3,
      metallic: 0,
    },
    leather: {
      baseColor: new THREE.Color(0.4, 0.2, 0.1),
      pattern: 'noise' as const,
      scale: 1,
      rotation: 0,
      intensity: 0.3,
      roughness: 0.5,
      metallic: 0.1,
    },
    metal: {
      baseColor: new THREE.Color(0.7, 0.7, 0.8),
      pattern: 'solid' as const,
      scale: 1,
      rotation: 0,
      intensity: 0,
      roughness: 0.1,
      metallic: 1.0,
    },
    lace: {
      baseColor: new THREE.Color(1.0, 1.0, 1.0),
      pattern: 'dots' as const,
      patternColor: new THREE.Color(0.8, 0.8, 0.8),
      scale: 0.5,
      rotation: 0,
      intensity: 0.6,
      roughness: 0.4,
      metallic: 0,
    },
  },
};

// Singleton instance
export const textureGenerator = new ProceduralTextureGenerator();
