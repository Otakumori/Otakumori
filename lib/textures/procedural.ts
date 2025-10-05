import * as THREE from 'three';

export interface TextureConfig {
  width: number;
  height: number;
  type: 'petal' | 'matcap' | 'toonRamp' | 'background';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  parameters?: {
    noise?: number;
    gradient?: boolean;
    rim?: boolean;
    metallic?: number;
    roughness?: number;
  };
}

export class ProceduralTextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  generatePetalTexture(config: TextureConfig): THREE.Texture {
    const { width, height, colors, parameters = {} } = config;

    this.canvas.width = width;
    this.canvas.height = height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const gradient = this.ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width / 2,
    );
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.7, colors.secondary);
    gradient.addColorStop(1, colors.accent);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Add noise for texture
    if (parameters.noise && parameters.noise > 0) {
      this.addNoise(parameters.noise);
    }

    // Add rim lighting effect
    if (parameters.rim) {
      this.addRimLighting();
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return texture;
  }

  generateMatcapTexture(config: TextureConfig): THREE.Texture {
    const { width, height, colors, parameters = {} } = config;

    this.canvas.width = width;
    this.canvas.height = height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Create spherical gradient for matcap
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          // Calculate spherical coordinates
          const phi = Math.atan2(dy, dx);
          const theta = Math.acos(distance / radius);

          // Create matcap lighting
          const lightX = Math.sin(theta) * Math.cos(phi);
          const lightY = Math.sin(theta) * Math.sin(phi);
          const lightZ = Math.cos(theta);

          // Calculate lighting intensity
          const intensity = Math.max(0, lightZ * 0.5 + 0.5);

          // Interpolate colors based on lighting
          const r = this.interpolateColor(colors.primary, colors.secondary, intensity).r;
          const g = this.interpolateColor(colors.primary, colors.secondary, intensity).g;
          const b = this.interpolateColor(colors.primary, colors.secondary, intensity).b;

          this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          this.ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    const texture = new THREE.CanvasTexture(this.canvas);
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.flipY = false;

    return texture;
  }

  generateToonRampTexture(config: TextureConfig): THREE.Texture {
    const { width, height, colors } = config;

    this.canvas.width = width;
    this.canvas.height = height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Create horizontal gradient for toon ramp
    const gradient = this.ctx.createLinearGradient(0, 0, width, 0);

    // Define toon ramp steps
    const steps = [
      { offset: 0, color: colors.accent }, // Shadow
      { offset: 0.3, color: colors.secondary }, // Mid-tone
      { offset: 0.7, color: colors.primary }, // Light
      { offset: 1, color: colors.primary }, // Highlight
    ];

    steps.forEach((step) => {
      gradient.addColorStop(step.offset, step.color);
    });

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    const texture = new THREE.CanvasTexture(this.canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;

    return texture;
  }

  generateBackgroundTexture(config: TextureConfig): THREE.Texture {
    const { width, height, colors, parameters = {} } = config;

    this.canvas.width = width;
    this.canvas.height = height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Create radial gradient background
    const gradient = this.ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2,
    );
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.accent);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Add noise for texture
    if (parameters.noise && parameters.noise > 0) {
      this.addNoise(parameters.noise * 0.5);
    }

    // Add subtle pattern
    this.addSubtlePattern();

    const texture = new THREE.CanvasTexture(this.canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;

    return texture;
  }

  private addNoise(intensity: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity * 255;
      data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private addRimLighting(): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const distance = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
        const maxDistance = Math.min(width, height) / 2;
        const rim = Math.max(0, 1 - distance / maxDistance);

        if (rim > 0.8) {
          const rimIntensity = (rim - 0.8) * 5; // Scale rim effect
          data[index] = Math.min(255, data[index] + rimIntensity * 100); // R
          data[index + 1] = Math.min(255, data[index + 1] + rimIntensity * 50); // G
          data[index + 2] = Math.min(255, data[index + 2] + rimIntensity * 150); // B
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private addSubtlePattern(): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        // Add subtle wave pattern
        const wave = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 0.1;
        const intensity = 1 + wave;

        data[index] = Math.min(255, data[index] * intensity); // R
        data[index + 1] = Math.min(255, data[index + 1] * intensity); // G
        data[index + 2] = Math.min(255, data[index + 2] * intensity); // B
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private interpolateColor(
    color1: string,
    color2: string,
    factor: number,
  ): { r: number; g: number; b: number } {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    return {
      r: Math.round(c1.r + (c2.r - c1.r) * factor),
      g: Math.round(c1.g + (c2.g - c1.g) * factor),
      b: Math.round(c1.b + (c2.b - c1.b) * factor),
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }
}

// Predefined texture configurations
export const TEXTURE_PRESETS = {
  cherryBlossom: {
    petal: {
      width: 256,
      height: 256,
      type: 'petal' as const,
      colors: {
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#fbbf24',
      },
      parameters: {
        noise: 0.1,
        rim: true,
      },
    },
    matcap: {
      width: 512,
      height: 512,
      type: 'matcap' as const,
      colors: {
        primary: '#ec4899',
        secondary: '#8b5cf6',
        accent: '#fbbf24',
      },
    },
    toonRamp: {
      width: 256,
      height: 64,
      type: 'toonRamp' as const,
      colors: {
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#be185d',
      },
    },
    background: {
      width: 1024,
      height: 1024,
      type: 'background' as const,
      colors: {
        primary: '#1a1320',
        secondary: '#2d1b3d',
        accent: '#4c1d4d',
      },
      parameters: {
        noise: 0.05,
      },
    },
  },

  sakura: {
    petal: {
      width: 256,
      height: 256,
      type: 'petal' as const,
      colors: {
        primary: '#f8fafc',
        secondary: '#f1f5f9',
        accent: '#e2e8f0',
      },
      parameters: {
        noise: 0.05,
        rim: true,
      },
    },
    matcap: {
      width: 512,
      height: 512,
      type: 'matcap' as const,
      colors: {
        primary: '#f8fafc',
        secondary: '#f1f5f9',
        accent: '#e2e8f0',
      },
    },
    toonRamp: {
      width: 256,
      height: 64,
      type: 'toonRamp' as const,
      colors: {
        primary: '#f8fafc',
        secondary: '#f1f5f9',
        accent: '#e2e8f0',
      },
    },
    background: {
      width: 1024,
      height: 1024,
      type: 'background' as const,
      colors: {
        primary: '#f8fafc',
        secondary: '#f1f5f9',
        accent: '#e2e8f0',
      },
      parameters: {
        noise: 0.03,
      },
    },
  },

  autumn: {
    petal: {
      width: 256,
      height: 256,
      type: 'petal' as const,
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#b45309',
      },
      parameters: {
        noise: 0.15,
        rim: true,
      },
    },
    matcap: {
      width: 512,
      height: 512,
      type: 'matcap' as const,
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#b45309',
      },
    },
    toonRamp: {
      width: 256,
      height: 64,
      type: 'toonRamp' as const,
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#b45309',
      },
    },
    background: {
      width: 1024,
      height: 1024,
      type: 'background' as const,
      colors: {
        primary: '#2d1b3d',
        secondary: '#4c1d4d',
        accent: '#6b2c91',
      },
      parameters: {
        noise: 0.08,
      },
    },
  },
};

// Texture cache for performance
const textureCache = new Map<string, THREE.Texture>();

export function getCachedTexture(key: string, generator: () => THREE.Texture): THREE.Texture {
  if (!textureCache.has(key)) {
    textureCache.set(key, generator());
  }
  return textureCache.get(key)!;
}

export function clearTextureCache(): void {
  textureCache.forEach((texture) => texture.dispose());
  textureCache.clear();
}
