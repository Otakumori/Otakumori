import * as THREE from 'three';

export interface LightingPreset {
  name: string;
  description: string;

  // Environment settings
  environmentMap?: string; // HDR texture URL
  environmentIntensity?: number;
  environmentRotation?: number;

  // Three-point lighting
  keyLight: LightConfig;
  fillLight: LightConfig;
  rimLight: LightConfig;

  // Ambient lighting
  ambientColor: THREE.Color;
  ambientIntensity: number;

  // Post-processing
  bloom?: BloomConfig;
  toneMapping?: ToneMappingConfig;
  colorGrading?: ColorGradingConfig;

  // Shadows
  shadowMapSize?: number;
  shadowBias?: number;
  shadowRadius?: number;
}

export interface LightConfig {
  type: 'directional' | 'point' | 'spot' | 'area';
  color: THREE.Color;
  intensity: number;
  position: THREE.Vector3;
  target?: THREE.Vector3;

  // Directional light specific
  castShadow?: boolean;
  shadowMapSize?: number;
  shadowBias?: number;
  shadowRadius?: number;

  // Point/Spot light specific
  distance?: number;
  decay?: number;

  // Spot light specific
  angle?: number;
  penumbra?: number;

  // Area light specific
  width?: number;
  height?: number;
}

export interface BloomConfig {
  enabled: boolean;
  intensity: number;
  radius: number;
  threshold: number;
}

export interface ToneMappingConfig {
  mode: 'linear' | 'reinhard' | 'cineon' | 'aces';
  exposure: number;
}

export interface ColorGradingConfig {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  gamma: number;
}

export class AnimeLightingSystem {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;

  // Lighting components
  private environmentMap?: THREE.CubeTexture;
  private keyLight?: THREE.Light;
  private fillLight?: THREE.Light;
  private rimLight?: THREE.Light;
  private ambientLight?: THREE.AmbientLight;

  // Current preset
  private currentPreset?: LightingPreset;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;

    // Setup default lighting
    this.setupDefaultLighting();
  }

  // Setup default lighting
  private setupDefaultLighting() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(this.ambientLight);

    // Key light (main directional light)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.keyLight.position.set(5, 5, 5);
    this.keyLight.castShadow = true;
    if (this.keyLight.shadow) {
      this.keyLight.shadow.mapSize.width = 2048;
      this.keyLight.shadow.mapSize.height = 2048;
      if (this.keyLight.shadow.camera instanceof THREE.OrthographicCamera) {
        this.keyLight.shadow.camera.near = 0.1;
        this.keyLight.shadow.camera.far = 50;
        this.keyLight.shadow.camera.left = -10;
        this.keyLight.shadow.camera.right = 10;
        this.keyLight.shadow.camera.top = 10;
        this.keyLight.shadow.camera.bottom = -10;
      }
      this.keyLight.shadow.bias = -0.0001;
    }
    this.scene.add(this.keyLight);

    // Fill light (softer directional light)
    this.fillLight = new THREE.DirectionalLight(0x4080ff, 0.3);
    this.fillLight.position.set(-5, 3, 5);
    this.scene.add(this.fillLight);

    // Rim light (back light for edge definition)
    this.rimLight = new THREE.DirectionalLight(0xff8040, 0.2);
    this.rimLight.position.set(0, 5, -5);
    this.scene.add(this.rimLight);
  }

  // Apply lighting preset
  async applyPreset(preset: LightingPreset) {
    this.currentPreset = preset;

    // Load environment map if specified
    if (preset.environmentMap) {
      await this.loadEnvironmentMap(preset.environmentMap);
    }

    // Update three-point lighting
    this.updateThreePointLighting(preset);

    // Update ambient lighting
    this.updateAmbientLighting(preset);

    // Update shadow settings
    this.updateShadowSettings(preset);
  }

  // Load HDR environment map
  private async loadEnvironmentMap(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.CubeTextureLoader();
      loader.setPath(url.replace(/[^/]*$/, ''));

      const filename = url.split('/').pop()?.replace('.hdr', '') || 'environment';
      const urls = [
        `${filename}_px.hdr`,
        `${filename}_nx.hdr`,
        `${filename}_py.hdr`,
        `${filename}_ny.hdr`,
        `${filename}_pz.hdr`,
        `${filename}_nz.hdr`,
      ];

      this.environmentMap = loader.load(
        urls,
        () => {
          if (this.environmentMap) {
            this.environmentMap.colorSpace = THREE.SRGBColorSpace;
            this.scene.environment = this.environmentMap;
            this.scene.background = this.environmentMap;
          }
          resolve();
        },
        undefined,
        reject,
      );
    });
  }

  // Update three-point lighting system
  private updateThreePointLighting(preset: LightingPreset) {
    // Update key light
    if (this.keyLight && preset.keyLight) {
      this.updateLight(this.keyLight, preset.keyLight);
    }

    // Update fill light
    if (this.fillLight && preset.fillLight) {
      this.updateLight(this.fillLight, preset.fillLight);
    }

    // Update rim light
    if (this.rimLight && preset.rimLight) {
      this.updateLight(this.rimLight, preset.rimLight);
    }
  }

  // Update individual light
  private updateLight(light: THREE.Light, config: LightConfig) {
    light.color.copy(config.color);
    light.intensity = config.intensity;

    if (light instanceof THREE.DirectionalLight) {
      light.position.copy(config.position);

      if (config.castShadow !== undefined) {
        light.castShadow = config.castShadow;
      }

      if (config.shadowMapSize && light.shadow) {
        light.shadow.mapSize.width = config.shadowMapSize;
        light.shadow.mapSize.height = config.shadowMapSize;
      }

      if (config.shadowBias !== undefined && light.shadow) {
        light.shadow.bias = config.shadowBias;
      }

      if (config.shadowRadius !== undefined && light.shadow) {
        light.shadow.radius = config.shadowRadius;
      }
    } else if (light instanceof THREE.PointLight) {
      light.position.copy(config.position);

      if (config.distance !== undefined) {
        light.distance = config.distance;
      }

      if (config.decay !== undefined) {
        light.decay = config.decay;
      }
    } else if (light instanceof THREE.SpotLight) {
      light.position.copy(config.position);

      if (config.target) {
        light.target.position.copy(config.target);
      }

      if (config.distance !== undefined) {
        light.distance = config.distance;
      }

      if (config.decay !== undefined) {
        light.decay = config.decay;
      }

      if (config.angle !== undefined) {
        light.angle = config.angle;
      }

      if (config.penumbra !== undefined) {
        light.penumbra = config.penumbra;
      }
    }
  }

  // Update ambient lighting
  private updateAmbientLighting(preset: LightingPreset) {
    if (this.ambientLight) {
      this.ambientLight.color.copy(preset.ambientColor);
      this.ambientLight.intensity = preset.ambientIntensity;
    }
  }

  // Update shadow settings
  private updateShadowSettings(preset: LightingPreset) {
    const shadowMapSize = preset.shadowMapSize || 2048;
    const shadowBias = preset.shadowBias || -0.0001;
    const shadowRadius = preset.shadowRadius || 4;

    // Update all shadow-casting lights
    this.scene.traverse((child) => {
      if (child instanceof THREE.Light && child.castShadow && child.shadow) {
        child.shadow.mapSize.width = shadowMapSize;
        child.shadow.mapSize.height = shadowMapSize;
        child.shadow.bias = shadowBias;
        child.shadow.radius = shadowRadius;
      }
    });
  }

  // Render with basic rendering
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // Resize renderer
  resize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  // Dispose of resources
  dispose() {
    if (this.environmentMap) {
      this.environmentMap.dispose();
    }
  }
}

// Predefined lighting presets for different scenarios
export const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  // Studio lighting for character showcase
  studio: {
    name: 'Studio',
    description: 'Professional studio lighting for character presentation',
    environmentMap: '/assets/environments/studio.hdr',
    environmentIntensity: 0.5,
    keyLight: {
      type: 'directional',
      color: new THREE.Color(0xffffff),
      intensity: 1.2,
      position: new THREE.Vector3(5, 5, 5),
      castShadow: true,
      shadowMapSize: 2048,
      shadowBias: -0.0001,
      shadowRadius: 4,
    },
    fillLight: {
      type: 'directional',
      color: new THREE.Color(0x4080ff),
      intensity: 0.4,
      position: new THREE.Vector3(-3, 2, 4),
    },
    rimLight: {
      type: 'directional',
      color: new THREE.Color(0xff8040),
      intensity: 0.3,
      position: new THREE.Vector3(0, 3, -5),
    },
    ambientColor: new THREE.Color(0x404040),
    ambientIntensity: 0.2,
    bloom: {
      enabled: true,
      intensity: 0.3,
      radius: 0.4,
      threshold: 0.9,
    },
    toneMapping: {
      mode: 'aces',
      exposure: 1.0,
    },
  },

  // Dramatic lighting for action scenes
  dramatic: {
    name: 'Dramatic',
    description: 'High-contrast dramatic lighting for action and intensity',
    environmentMap: '/assets/environments/dramatic.hdr',
    environmentIntensity: 0.3,
    keyLight: {
      type: 'directional',
      color: new THREE.Color(0xffdd88),
      intensity: 1.5,
      position: new THREE.Vector3(8, 8, 3),
      castShadow: true,
      shadowMapSize: 4096,
      shadowBias: -0.0005,
      shadowRadius: 8,
    },
    fillLight: {
      type: 'directional',
      color: new THREE.Color(0x4080ff),
      intensity: 0.2,
      position: new THREE.Vector3(-5, 1, 3),
    },
    rimLight: {
      type: 'directional',
      color: new THREE.Color(0xff4080),
      intensity: 0.8,
      position: new THREE.Vector3(0, 2, -8),
    },
    ambientColor: new THREE.Color(0x202040),
    ambientIntensity: 0.1,
    bloom: {
      enabled: true,
      intensity: 0.8,
      radius: 0.6,
      threshold: 0.7,
    },
    toneMapping: {
      mode: 'aces',
      exposure: 1.2,
    },
  },

  // Soft lighting for romantic/intimate scenes
  soft: {
    name: 'Soft',
    description: 'Soft, flattering lighting for intimate and romantic scenes',
    environmentMap: '/assets/environments/soft.hdr',
    environmentIntensity: 0.7,
    keyLight: {
      type: 'directional',
      color: new THREE.Color(0xfff8e1),
      intensity: 0.8,
      position: new THREE.Vector3(3, 4, 4),
      castShadow: true,
      shadowMapSize: 1024,
      shadowBias: -0.0001,
      shadowRadius: 2,
    },
    fillLight: {
      type: 'directional',
      color: new THREE.Color(0xe1f5fe),
      intensity: 0.6,
      position: new THREE.Vector3(-2, 2, 3),
    },
    rimLight: {
      type: 'directional',
      color: new THREE.Color(0xfce4ec),
      intensity: 0.2,
      position: new THREE.Vector3(0, 1, -3),
    },
    ambientColor: new THREE.Color(0x606080),
    ambientIntensity: 0.4,
    bloom: {
      enabled: true,
      intensity: 0.2,
      radius: 0.3,
      threshold: 0.95,
    },
    toneMapping: {
      mode: 'reinhard',
      exposure: 0.8,
    },
  },

  // Anime-style lighting with strong rim lighting
  anime: {
    name: 'Anime',
    description: 'Anime-style lighting with strong rim lighting and toon shading',
    environmentMap: '/assets/environments/anime.hdr',
    environmentIntensity: 0.4,
    keyLight: {
      type: 'directional',
      color: new THREE.Color(0xffffff),
      intensity: 1.0,
      position: new THREE.Vector3(4, 6, 4),
      castShadow: false, // Anime style often doesn't use shadows
    },
    fillLight: {
      type: 'directional',
      color: new THREE.Color(0x80c0ff),
      intensity: 0.5,
      position: new THREE.Vector3(-2, 3, 2),
    },
    rimLight: {
      type: 'directional',
      color: new THREE.Color(0xff80c0),
      intensity: 1.2,
      position: new THREE.Vector3(0, 2, -6),
    },
    ambientColor: new THREE.Color(0x8080a0),
    ambientIntensity: 0.6,
    bloom: {
      enabled: true,
      intensity: 0.4,
      radius: 0.5,
      threshold: 0.8,
    },
    toneMapping: {
      mode: 'aces',
      exposure: 1.1,
    },
  },

  // NSFW intimate lighting
  intimate: {
    name: 'Intimate',
    description: 'Soft, warm lighting for intimate and NSFW content',
    environmentMap: '/assets/environments/intimate.hdr',
    environmentIntensity: 0.3,
    keyLight: {
      type: 'directional',
      color: new THREE.Color(0xffe0b3),
      intensity: 0.9,
      position: new THREE.Vector3(2, 3, 3),
      castShadow: true,
      shadowMapSize: 2048,
      shadowBias: -0.0001,
      shadowRadius: 3,
    },
    fillLight: {
      type: 'directional',
      color: new THREE.Color(0xf0e6ff),
      intensity: 0.7,
      position: new THREE.Vector3(-1, 2, 2),
    },
    rimLight: {
      type: 'directional',
      color: new THREE.Color(0xffb3e6),
      intensity: 0.4,
      position: new THREE.Vector3(0, 1, -2),
    },
    ambientColor: new THREE.Color(0x404060),
    ambientIntensity: 0.5,
    bloom: {
      enabled: true,
      intensity: 0.3,
      radius: 0.4,
      threshold: 0.9,
    },
    toneMapping: {
      mode: 'reinhard',
      exposure: 0.9,
    },
  },
};

// Utility functions for lighting management
export const LightingUtils = {
  // Create custom lighting preset
  createPreset(
    name: string,
    description: string,
    keyLight: LightConfig,
    fillLight: LightConfig,
    rimLight: LightConfig,
    options: Partial<LightingPreset> = {},
  ): LightingPreset {
    return {
      name,
      description,
      keyLight,
      fillLight,
      rimLight,
      ambientColor: new THREE.Color(0x404040),
      ambientIntensity: 0.3,
      ...options,
    };
  },

  // Animate lighting transition
  animateLightingTransition(
    fromPreset: LightingPreset,
    toPreset: LightingPreset,
    duration: number = 2000,
    onUpdate: (progress: number) => void,
  ) {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out curve
      const easedProgress =
        progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      onUpdate(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  // Generate random lighting for variety
  generateRandomLighting(): LightingPreset {
    const hue = Math.random() * 360;
    const keyColor = new THREE.Color().setHSL(hue / 360, 0.3, 0.8);
    const fillColor = new THREE.Color().setHSL((hue + 60) / 360, 0.2, 0.6);
    const rimColor = new THREE.Color().setHSL((hue + 120) / 360, 0.4, 0.7);

    return {
      name: 'Random',
      description: 'Generated random lighting setup',
      keyLight: {
        type: 'directional',
        color: keyColor,
        intensity: 0.8 + Math.random() * 0.8,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          3 + Math.random() * 5,
          (Math.random() - 0.5) * 10,
        ),
        castShadow: Math.random() > 0.5,
      },
      fillLight: {
        type: 'directional',
        color: fillColor,
        intensity: 0.3 + Math.random() * 0.4,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          2 + Math.random() * 3,
          (Math.random() - 0.5) * 8,
        ),
      },
      rimLight: {
        type: 'directional',
        color: rimColor,
        intensity: 0.2 + Math.random() * 0.6,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          1 + Math.random() * 2,
          -3 - Math.random() * 4,
        ),
      },
      ambientColor: new THREE.Color(0x404040),
      ambientIntensity: 0.2 + Math.random() * 0.3,
    };
  },
};
