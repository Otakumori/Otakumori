/**
 * WebGL Performance Tier Detection
 * Auto-detects device capabilities and sets appropriate quality settings
 */

export type PerformanceTier = 'high' | 'medium' | 'low' | 'unsupported';

export interface PerformanceCapabilities {
  tier: PerformanceTier;
  webglVersion: 1 | 2 | 0;
  maxTextureSize: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  extensions: string[];
  gpuInfo: {
    vendor: string;
    renderer: string;
  };
  deviceMemory?: number; // GB
  hardwareConcurrency?: number; // CPU cores
  estimatedFPS: number;
}

export interface QualitySettings {
  textureSize: number; // Max texture resolution
  modelPolyCount: number; // Max polygons
  shadowQuality: 'high' | 'medium' | 'low' | 'none';
  postProcessing: boolean;
  particleCount: number;
  antiAliasing: boolean;
  bloomEffect: boolean;
  targetFPS: number;
  useDracoCompression: boolean;
  useKTX2Textures: boolean;
}

const QUALITY_PRESETS: Record<PerformanceTier, QualitySettings> = {
  high: {
    textureSize: 2048,
    modelPolyCount: 25000,
    shadowQuality: 'high',
    postProcessing: true,
    particleCount: 500,
    antiAliasing: true,
    bloomEffect: true,
    targetFPS: 60,
    useDracoCompression: true,
    useKTX2Textures: true,
  },
  medium: {
    textureSize: 1024,
    modelPolyCount: 15000,
    shadowQuality: 'medium',
    postProcessing: true,
    particleCount: 250,
    antiAliasing: false,
    bloomEffect: false,
    targetFPS: 30,
    useDracoCompression: true,
    useKTX2Textures: false,
  },
  low: {
    textureSize: 512,
    modelPolyCount: 5000,
    shadowQuality: 'none',
    postProcessing: false,
    particleCount: 50,
    antiAliasing: false,
    bloomEffect: false,
    targetFPS: 30,
    useDracoCompression: true,
    useKTX2Textures: false,
  },
  unsupported: {
    textureSize: 256,
    modelPolyCount: 1000,
    shadowQuality: 'none',
    postProcessing: false,
    particleCount: 0,
    antiAliasing: false,
    bloomEffect: false,
    targetFPS: 30,
    useDracoCompression: false,
    useKTX2Textures: false,
  },
};

/**
 * Detects WebGL capabilities and determines performance tier
 */
export function detectPerformanceTier(): PerformanceCapabilities {
  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      tier: 'medium',
      webglVersion: 2,
      maxTextureSize: 2048,
      maxVertexUniforms: 1024,
      maxFragmentUniforms: 1024,
      extensions: [],
      gpuInfo: { vendor: 'unknown', renderer: 'unknown' },
      estimatedFPS: 30,
    };
  }

  const canvas = document.createElement('canvas');
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let webglVersion: 1 | 2 | 0 = 0;

  // Try WebGL2 first
  gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
  if (gl) {
    webglVersion = 2;
  } else {
    // Fallback to WebGL1
    gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (gl) {
      webglVersion = 1;
    }
  }

  if (!gl) {
    return {
      tier: 'unsupported',
      webglVersion: 0,
      maxTextureSize: 256,
      maxVertexUniforms: 0,
      maxFragmentUniforms: 0,
      extensions: [],
      gpuInfo: { vendor: 'none', renderer: 'none' },
      estimatedFPS: 0,
    };
  }

  // Get GPU info
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    : gl.getParameter(gl.VENDOR);
  const renderer = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : gl.getParameter(gl.RENDERER);

  // Get WebGL capabilities
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) as number;
  const maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) as number;

  // Get supported extensions
  const extensions = gl.getSupportedExtensions() || [];

  // Get device info
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const deviceMemory = nav.deviceMemory;
  const hardwareConcurrency = nav.hardwareConcurrency;

  // Determine performance tier
  let tier: PerformanceTier = 'medium';
  let estimatedFPS = 30;

  // High-end devices
  if (
    (webglVersion === 2 &&
      maxTextureSize >= 4096 &&
      (deviceMemory === undefined || deviceMemory >= 4) &&
      (hardwareConcurrency === undefined || hardwareConcurrency >= 4) &&
      renderer.toLowerCase().includes('nvidia')) ||
    renderer.toLowerCase().includes('radeon') ||
    renderer.toLowerCase().includes('apple')
  ) {
    tier = 'high';
    estimatedFPS = 60;
  }
  // Low-end devices
  else if (
    webglVersion === 1 ||
    maxTextureSize < 2048 ||
    (deviceMemory !== undefined && deviceMemory < 2) ||
    renderer.toLowerCase().includes('mali') ||
    renderer.toLowerCase().includes('adreno 3') ||
    renderer.toLowerCase().includes('powervr')
  ) {
    tier = 'low';
    estimatedFPS = 30;
  }
  // Mobile detection
  else if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  ) {
    // Check if it's a high-end mobile device
    if (
      renderer.toLowerCase().includes('apple') ||
      renderer.toLowerCase().includes('adreno 6') ||
      renderer.toLowerCase().includes('adreno 7')
    ) {
      tier = 'medium';
      estimatedFPS = 60;
    } else {
      tier = 'low';
      estimatedFPS = 30;
    }
  }

  return {
    tier,
    webglVersion,
    maxTextureSize,
    maxVertexUniforms,
    maxFragmentUniforms,
    extensions,
    gpuInfo: {
      vendor: String(vendor),
      renderer: String(renderer),
    },
    deviceMemory,
    hardwareConcurrency,
    estimatedFPS,
  };
}

/**
 * Get quality settings for current device
 */
export function getQualitySettings(tier?: PerformanceTier): QualitySettings {
  if (!tier) {
    const capabilities = detectPerformanceTier();
    tier = capabilities.tier;
  }

  return QUALITY_PRESETS[tier];
}

/**
 * Check if device supports specific WebGL features
 */
export function checkWebGLFeatureSupport(): {
  webgl2: boolean;
  instancing: boolean;
  vao: boolean;
  depthTexture: boolean;
  floatTextures: boolean;
  dracoCompression: boolean;
  ktx2Compression: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      webgl2: false,
      instancing: false,
      vao: false,
      depthTexture: false,
      floatTextures: false,
      dracoCompression: false,
      ktx2Compression: false,
    };
  }

  const capabilities = detectPerformanceTier();
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    return {
      webgl2: false,
      instancing: false,
      vao: false,
      depthTexture: false,
      floatTextures: false,
      dracoCompression: false,
      ktx2Compression: false,
    };
  }

  const extensions = capabilities.extensions;

  return {
    webgl2: capabilities.webglVersion === 2,
    instancing: capabilities.webglVersion === 2 || extensions.includes('ANGLE_instanced_arrays'),
    vao: capabilities.webglVersion === 2 || extensions.includes('OES_vertex_array_object'),
    depthTexture: capabilities.webglVersion === 2 || extensions.includes('WEBGL_depth_texture'),
    floatTextures: extensions.includes('OES_texture_float') || capabilities.webglVersion === 2,
    dracoCompression: true, // Handled by library, not WebGL extension
    ktx2Compression: true, // Handled by library, not WebGL extension
  };
}

/**
 * Performance monitor - tracks actual FPS and adjusts quality if needed
 */
export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime: number = 0;
  private currentTier: PerformanceTier;
  private targetFPS: number;
  private onTierChange?: (newTier: PerformanceTier) => void;

  constructor(initialTier: PerformanceTier, onTierChange?: (newTier: PerformanceTier) => void) {
    this.currentTier = initialTier;
    this.targetFPS = QUALITY_PRESETS[initialTier].targetFPS;
    this.onTierChange = onTierChange;
  }

  recordFrame(timestamp: number): void {
    if (this.lastFrameTime > 0) {
      const frameTime = timestamp - this.lastFrameTime;
      this.frameTimes.push(frameTime);

      // Keep last 60 frames
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift();
      }
    }
    this.lastFrameTime = timestamp;
  }

  getAverageFPS(): number {
    if (this.frameTimes.length === 0) return 0;

    const averageFrameTime =
      this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    return 1000 / averageFrameTime;
  }

  checkAndAdjustQuality(): void {
    const currentFPS = this.getAverageFPS();

    // If FPS drops below 80% of target, downgrade tier
    if (currentFPS < this.targetFPS * 0.8) {
      const newTier = this.downgradeTier();
      if (newTier !== this.currentTier) {
        this.currentTier = newTier;
        this.targetFPS = QUALITY_PRESETS[newTier].targetFPS;
        this.onTierChange?.(newTier);
      }
    }
    // If FPS is consistently above target, try upgrading
    else if (currentFPS > this.targetFPS * 1.2 && this.frameTimes.length >= 60) {
      const newTier = this.upgradeTier();
      if (newTier !== this.currentTier) {
        this.currentTier = newTier;
        this.targetFPS = QUALITY_PRESETS[newTier].targetFPS;
        this.onTierChange?.(newTier);
      }
    }
  }

  private downgradeTier(): PerformanceTier {
    if (this.currentTier === 'high') return 'medium';
    if (this.currentTier === 'medium') return 'low';
    return 'low';
  }

  private upgradeTier(): PerformanceTier {
    if (this.currentTier === 'low') return 'medium';
    if (this.currentTier === 'medium') return 'high';
    return 'high';
  }

  reset(): void {
    this.frameTimes = [];
    this.lastFrameTime = 0;
  }
}

/**
 * Log device capabilities for debugging
 */
export function logDeviceCapabilities(): void {
  const capabilities = detectPerformanceTier();
  const features = checkWebGLFeatureSupport();
  const settings = getQualitySettings(capabilities.tier);

  console.warn('🎮 WebGL Performance Capabilities');
  console.warn('Performance Tier:', capabilities.tier.toUpperCase());
  console.warn('WebGL Version:', capabilities.webglVersion);
  console.warn('GPU:', `${capabilities.gpuInfo.vendor} - ${capabilities.gpuInfo.renderer}`);
  console.warn('Max Texture Size:', capabilities.maxTextureSize);
  console.warn(
    'Device Memory:',
    capabilities.deviceMemory ? `${capabilities.deviceMemory}GB` : 'unknown',
  );
  console.warn('CPU Cores:', capabilities.hardwareConcurrency || 'unknown');
  console.warn('Estimated FPS:', capabilities.estimatedFPS);
  console.warn('---');

  console.warn('✨ Quality Settings');
  console.warn('Texture Size:', settings.textureSize);
  console.warn('Model Poly Count:', settings.modelPolyCount);
  console.warn('Shadow Quality:', settings.shadowQuality);
  console.warn('Post-Processing:', settings.postProcessing);
  console.warn('Particle Count:', settings.particleCount);
  console.warn('Target FPS:', settings.targetFPS);
  console.warn('---');

  console.warn('🔧 Feature Support');
  console.warn('WebGL 2.0:', features.webgl2);
  console.warn('Instanced Rendering:', features.instancing);
  console.warn('Vertex Array Objects:', features.vao);
  console.warn('Float Textures:', features.floatTextures);
  console.warn('---');
}
