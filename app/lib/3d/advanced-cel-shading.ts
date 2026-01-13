/**
 * Advanced Cel-Shading System
 * Exceeds Code Vein quality with extensive customization options
 * Comprehensive error handling and validation
 */

import * as THREE from 'three';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export interface AdvancedCelShadingConfig {
  // Base colors
  baseColor: THREE.Color | string | number;
  shadowColor?: THREE.Color | string | number;
  highlightColor?: THREE.Color | string | number;
  rimColor?: THREE.Color | string | number;

  // Toon shading
  toonSteps?: number; // 2-8, higher = more bands
  toonSmoothness?: number; // 0.0-1.0, transition smoothness
  shadowThreshold?: number; // 0.0-1.0, where shadow starts
  highlightThreshold?: number; // 0.0-1.0, where highlight starts

  // Rim lighting (anime edge glow)
  rimIntensity?: number; // 0.0-2.0
  rimPower?: number; // 1.0-10.0, higher = sharper rim
  rimFresnel?: boolean; // Use Fresnel effect for rim
  rimColorMultiplier?: number; // Brightness multiplier

  // Outline (silhouette)
  outlineWidth?: number; // 0.0-0.05, width in world units
  outlineColor?: THREE.Color | string | number;
  outlineEnabled?: boolean;

  // Specular highlights
  specularEnabled?: boolean;
  specularIntensity?: number; // 0.0-1.0
  specularPower?: number; // 10.0-200.0
  specularColor?: THREE.Color | string | number;

  // Subsurface scattering (for skin)
  subsurfaceScattering?: boolean;
  sssIntensity?: number; // 0.0-1.0
  sssColor?: THREE.Color | string | number;

  // Matcap (sphere mapping for reflections)
  matcapTexture?: THREE.Texture | null;
  matcapIntensity?: number; // 0.0-1.0

  // Additional effects
  bloomIntensity?: number; // 0.0-1.0
  colorGrading?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
}

export interface CelShadingPreset {
  name: string;
  config: AdvancedCelShadingConfig;
  description: string;
}

/**
 * Code Vein style preset (high quality anime cel-shading)
 */
export const CODE_VEIN_PRESET: CelShadingPreset = {
  name: 'code-vein',
  description: 'Code Vein style - High quality anime cel-shading with strong rim lighting',
  config: {
    baseColor: '#fdbcb4',
    shadowColor: '#d4a574',
    highlightColor: '#ffffff',
    rimColor: '#ffe0cc',
    toonSteps: 4,
    toonSmoothness: 0.15,
    shadowThreshold: 0.3,
    highlightThreshold: 0.7,
    rimIntensity: 0.8,
    rimPower: 3.0,
    rimFresnel: true,
    rimColorMultiplier: 1.2,
    outlineWidth: 0.015,
    outlineColor: '#000000',
    outlineEnabled: true,
    specularEnabled: true,
    specularIntensity: 0.4,
    specularPower: 120.0,
    specularColor: '#ffffff',
    subsurfaceScattering: true,
    sssIntensity: 0.3,
    sssColor: '#ffdbac',
    matcapIntensity: 0.2,
    bloomIntensity: 0.5,
  },
};

/**
 * Nikke style preset (softer, more polished)
 */
export const NIKKE_PRESET: CelShadingPreset = {
  name: 'nikke',
  description: 'Nikke style - Softer cel-shading with higher polish',
  config: {
    baseColor: '#ffdbac',
    shadowColor: '#c9a982',
    highlightColor: '#ffffff',
    rimColor: '#ffd700',
    toonSteps: 5,
    toonSmoothness: 0.2,
    shadowThreshold: 0.25,
    highlightThreshold: 0.75,
    rimIntensity: 0.6,
    rimPower: 2.5,
    rimFresnel: true,
    rimColorMultiplier: 1.0,
    outlineWidth: 0.012,
    outlineColor: '#000000',
    outlineEnabled: true,
    specularEnabled: true,
    specularIntensity: 0.5,
    specularPower: 100.0,
    specularColor: '#ffffff',
    subsurfaceScattering: true,
    sssIntensity: 0.4,
    sssColor: '#ffdbac',
    matcapIntensity: 0.3,
    bloomIntensity: 0.6,
  },
};

/**
 * Ultra quality preset (maximum visual fidelity)
 */
export const ULTRA_PRESET: CelShadingPreset = {
  name: 'ultra',
  description: 'Ultra quality - Maximum visual fidelity exceeding Code Vein',
  config: {
    baseColor: '#fdbcb4',
    shadowColor: '#d4a574',
    highlightColor: '#ffffff',
    rimColor: '#ffe0cc',
    toonSteps: 6,
    toonSmoothness: 0.12,
    shadowThreshold: 0.25,
    highlightThreshold: 0.75,
    rimIntensity: 1.0,
    rimPower: 3.5,
    rimFresnel: true,
    rimColorMultiplier: 1.3,
    outlineWidth: 0.015,
    outlineColor: '#000000',
    outlineEnabled: true,
    specularEnabled: true,
    specularIntensity: 0.5,
    specularPower: 150.0,
    specularColor: '#ffffff',
    subsurfaceScattering: true,
    sssIntensity: 0.4,
    sssColor: '#ffdbac',
    matcapIntensity: 0.4,
    bloomIntensity: 0.7,
    colorGrading: {
      brightness: 1.05,
      contrast: 1.1,
      saturation: 1.15,
    },
  },
};

/**
 * Generate toon ramp texture for cel-shading
 * Higher quality than basic implementations
 */
function generateToonRamp(
  steps: number = 4,
  smoothness: number = 0.1,
  shadowThreshold: number = 0.3,
  highlightThreshold: number = 0.7
): THREE.Texture {
  try {
    const width = 512; // Higher resolution for better quality
    const height = 1;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Enhanced smoothstep function
    const smoothstep = (edge0: number, edge1: number, x: number): number => {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };

    for (let x = 0; x < width; x++) {
      const t = x / width;
      const idx = x * 4;

      // Create stepped ramp with smooth transitions
      const step = Math.floor(t * steps) / steps;
      
      // Apply smoothstep for smooth band transitions
      const smoothStep = smoothstep(
        step - smoothness,
        step + smoothness,
        t
      );

      // Apply shadow and highlight thresholds
      let value = smoothStep;
      if (t < shadowThreshold) {
        value *= 0.5; // Darker in shadow areas
      } else if (t > highlightThreshold) {
        value = 0.5 + (value - 0.5) * 1.5; // Brighter in highlight areas
        value = Math.min(1.0, value);
      }

      const intValue = Math.floor(value * 255);

      data[idx] = intValue;
      data[idx + 1] = intValue;
      data[idx + 2] = intValue;
      data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false; // Disable mipmaps for crisp toon ramps

    return texture;
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to generate toon ramp:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    // Return a fallback texture
    return new THREE.Texture();
  }
}

/**
 * Create advanced cel-shaded material
 * Exceeds Code Vein quality with extensive options
 */
export function createAdvancedCelShadedMaterial(
  config: AdvancedCelShadingConfig | CelShadingPreset
): THREE.ShaderMaterial {
  try {
    // Handle preset
    let finalConfig: AdvancedCelShadingConfig;
    if ('config' in config) {
      finalConfig = (config as CelShadingPreset).config;
    } else {
      finalConfig = config as AdvancedCelShadingConfig;
    }

    // Normalize colors
    const baseColor =
      finalConfig.baseColor instanceof THREE.Color
        ? finalConfig.baseColor
        : new THREE.Color(finalConfig.baseColor);
    
    const shadowColor =
      finalConfig.shadowColor instanceof THREE.Color
        ? new THREE.Color(finalConfig.shadowColor)
        : new THREE.Color(finalConfig.shadowColor || baseColor.clone().multiplyScalar(0.6));
    
    const highlightColor =
      finalConfig.highlightColor instanceof THREE.Color
        ? new THREE.Color(finalConfig.highlightColor)
        : new THREE.Color(finalConfig.highlightColor || '#ffffff');
    
    const rimColor =
      finalConfig.rimColor instanceof THREE.Color
        ? new THREE.Color(finalConfig.rimColor)
        : new THREE.Color(finalConfig.rimColor || '#ffffff');

    // Generate toon ramp
    const toonRamp = generateToonRamp(
      finalConfig.toonSteps ?? 4,
      finalConfig.toonSmoothness ?? 0.15,
      finalConfig.shadowThreshold ?? 0.3,
      finalConfig.highlightThreshold ?? 0.7
    );

    // Vertex shader with enhanced features
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vTangent;
      varying vec3 vBitangent;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Calculate tangent space if available
        #ifdef USE_TANGENT
          vTangent = normalize(normalMatrix * tangent.xyz);
          vBitangent = normalize(cross(vNormal, vTangent) * tangent.w);
        #endif
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    // Fragment shader with advanced features
    const fragmentShader = `
      uniform vec3 uBaseColor;
      uniform vec3 uShadowColor;
      uniform vec3 uHighlightColor;
      uniform vec3 uRimColor;
      uniform float uRimIntensity;
      uniform float uRimPower;
      uniform bool uRimFresnel;
      uniform float uRimColorMultiplier;
      uniform float uToonSteps;
      uniform float uToonSmoothness;
      uniform float uShadowThreshold;
      uniform float uHighlightThreshold;
      uniform sampler2D uToonRamp;
      uniform bool uSpecularEnabled;
      uniform float uSpecularIntensity;
      uniform float uSpecularPower;
      uniform vec3 uSpecularColor;
      uniform bool uSubsurfaceScattering;
      uniform float uSssIntensity;
      uniform vec3 uSssColor;
      uniform sampler2D uMatcapTexture;
      uniform float uMatcapIntensity;
      uniform float uBloomIntensity;
      uniform vec3 uColorGrading;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vTangent;
      varying vec3 vBitangent;

      // Enhanced smoothstep
      float smoothstep2(float edge0, float edge1, float x) {
        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
      }

      // Fresnel effect
      float fresnel(vec3 normal, vec3 viewDir, float power) {
        return pow(1.0 - max(dot(normal, viewDir), 0.0), power);
      }

      // Subsurface scattering approximation
      vec3 subsurface(vec3 normal, vec3 lightDir, vec3 viewDir, vec3 baseColor, float intensity) {
        float backLight = max(0.0, dot(normal, -lightDir));
        float VdotL = max(0.0, dot(viewDir, -lightDir));
        float subsurface = pow(max(0.0, VdotL), 2.0) * intensity * backLight;
        return baseColor * uSssColor * subsurface;
      }

      void main() {
        // Normalize vectors
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        
        // Main light direction (top-right, typical anime lighting)
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
        
        // Calculate NdotL
        float NdotL = max(dot(normal, lightDir), 0.0);
        
        // Advanced toon shading with thresholds
        float toonValue = NdotL;
        
        // Apply shadow threshold
        if (toonValue < uShadowThreshold) {
          toonValue *= (0.3 / uShadowThreshold); // Darken shadow areas
        }
        
        // Apply highlight threshold
        if (toonValue > uHighlightThreshold) {
          float highlightFactor = (toonValue - uHighlightThreshold) / (1.0 - uHighlightThreshold);
          toonValue = uHighlightThreshold + highlightFactor * (1.0 - uHighlightThreshold) * 1.2;
          toonValue = min(1.0, toonValue);
        }
        
        // Sample toon ramp
        vec3 toonRampColor = texture2D(uToonRamp, vec2(toonValue, 0.5)).rgb;
        
        // Mix shadow and highlight colors
        vec3 shadowArea = mix(uShadowColor, uBaseColor, toonValue);
        vec3 highlightArea = mix(uBaseColor, uHighlightColor, smoothstep(uHighlightThreshold, 1.0, NdotL));
        vec3 toonColor = mix(shadowArea, highlightArea, toonValue);
        
        // Rim lighting (anime edge glow)
        float rim = 1.0 - max(dot(viewDir, normal), 0.0);
        rim = pow(rim, uRimPower);
        
        if (uRimFresnel) {
          rim *= fresnel(normal, viewDir, 2.0);
        }
        
        vec3 rimLight = uRimColor * rim * uRimIntensity * uRimColorMultiplier;
        
        // Specular highlights
        vec3 specular = vec3(0.0);
        if (uSpecularEnabled) {
          vec3 halfDir = normalize(lightDir + viewDir);
          float NdotH = max(dot(normal, halfDir), 0.0);
          specular = uSpecularColor * pow(NdotH, uSpecularPower) * uSpecularIntensity;
          // Hard edge for anime style
          specular = step(0.8, specular.r) * specular;
        }
        
        // Subsurface scattering (for skin)
        vec3 sss = vec3(0.0);
        if (uSubsurfaceScattering) {
          sss = subsurface(normal, lightDir, viewDir, uBaseColor, uSssIntensity);
        }
        
        // Matcap (sphere mapping)
        vec3 matcapColor = vec3(0.0);
        if (uMatcapIntensity > 0.0) {
          vec2 matcapUV = normal.xy * 0.5 + 0.5;
          matcapColor = texture2D(uMatcapTexture, matcapUV).rgb * uMatcapIntensity;
        }
        
        // Combine all lighting
        vec3 finalColor = toonColor;
        finalColor += rimLight;
        finalColor += specular;
        finalColor += sss;
        finalColor += matcapColor;
        
        // Color grading
        if (uColorGrading.x > 0.0 || uColorGrading.y > 0.0 || uColorGrading.z > 0.0) {
          // Brightness
          finalColor *= uColorGrading.x;
          // Contrast
          finalColor = (finalColor - 0.5) * uColorGrading.y + 0.5;
          // Saturation
          float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
          finalColor = mix(vec3(gray), finalColor, uColorGrading.z);
        }
        
        // Bloom contribution (for post-processing)
        float bloomContribution = dot(finalColor, vec3(0.299, 0.587, 0.114)) * uBloomIntensity;
        
        // Ambient occlusion approximation
        float ao = 0.4 + 0.6 * normal.y;
        finalColor *= ao;
        
        gl_FragColor = vec4(finalColor, 1.0);
        
        // Store bloom in alpha channel for post-processing
        gl_FragColor.a = bloomContribution;
      }
    `;

    // Set up uniforms
    const uniforms: { [key: string]: THREE.IUniform } = {
      uBaseColor: { value: baseColor },
      uShadowColor: { value: shadowColor },
      uHighlightColor: { value: highlightColor },
      uRimColor: { value: rimColor },
      uRimIntensity: { value: finalConfig.rimIntensity ?? 0.8 },
      uRimPower: { value: finalConfig.rimPower ?? 3.0 },
      uRimFresnel: { value: finalConfig.rimFresnel ?? true },
      uRimColorMultiplier: { value: finalConfig.rimColorMultiplier ?? 1.0 },
      uToonSteps: { value: finalConfig.toonSteps ?? 4 },
      uToonSmoothness: { value: finalConfig.toonSmoothness ?? 0.15 },
      uShadowThreshold: { value: finalConfig.shadowThreshold ?? 0.3 },
      uHighlightThreshold: { value: finalConfig.highlightThreshold ?? 0.7 },
      uToonRamp: { value: toonRamp },
      uSpecularEnabled: { value: finalConfig.specularEnabled ?? true },
      uSpecularIntensity: { value: finalConfig.specularIntensity ?? 0.4 },
      uSpecularPower: { value: finalConfig.specularPower ?? 120.0 },
      uSpecularColor: {
        value:
          finalConfig.specularColor instanceof THREE.Color
            ? finalConfig.specularColor
            : new THREE.Color(finalConfig.specularColor || '#ffffff'),
      },
      uSubsurfaceScattering: { value: finalConfig.subsurfaceScattering ?? false },
      uSssIntensity: { value: finalConfig.sssIntensity ?? 0.3 },
      uSssColor: {
        value:
          finalConfig.sssColor instanceof THREE.Color
            ? new THREE.Color(finalConfig.sssColor)
            : new THREE.Color(finalConfig.sssColor || baseColor),
      },
      uMatcapTexture: { value: finalConfig.matcapTexture || null },
      uMatcapIntensity: { value: finalConfig.matcapIntensity ?? 0.2 },
      uBloomIntensity: { value: finalConfig.bloomIntensity ?? 0.5 },
      uColorGrading: {
        value: new THREE.Vector3(
          finalConfig.colorGrading?.brightness ?? 1.0,
          finalConfig.colorGrading?.contrast ?? 1.0,
          finalConfig.colorGrading?.saturation ?? 1.0
        ),
      },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      lights: false, // We handle all lighting in the shader
      transparent: false,
    });

    return material;
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to create cel-shaded material:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    // Return fallback shader material (simplified)
    const fallbackBaseColor = typeof config === 'object' && 'config' in config 
      ? (config as CelShadingPreset).config.baseColor 
      : (config as AdvancedCelShadingConfig).baseColor;
    const baseColorValue = fallbackBaseColor instanceof THREE.Color 
      ? fallbackBaseColor 
      : new THREE.Color(fallbackBaseColor);
    
    // Return a basic shader material as fallback
    return new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: baseColorValue },
      },
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        void main() {
          gl_FragColor = vec4(uBaseColor, 1.0);
        }
      `,
    });
  }
}

/**
 * Apply outline to mesh using scaled geometry technique
 */
export function applyOutlineToMesh(
  mesh: THREE.Mesh,
  outlineWidth: number,
  outlineColor: THREE.Color | string | number
): THREE.Group {
  try {
    const group = new THREE.Group();
    group.add(mesh);

    if (outlineWidth <= 0) {
      return group;
    }

    // Create outline mesh by scaling geometry slightly larger
    const outlineGeometry = mesh.geometry.clone();
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: outlineColor instanceof THREE.Color ? outlineColor : new THREE.Color(outlineColor),
      side: THREE.BackSide,
    });

    const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
    outlineMesh.scale.multiplyScalar(1 + outlineWidth);
    outlineMesh.name = `${mesh.name}_outline`;
    
    group.add(outlineMesh);

    return group;
  } catch (error) {
    getLogger().then((logger) => {
      logger.error('Failed to apply outline:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
    // Return original mesh if outline fails
    const group = new THREE.Group();
    group.add(mesh);
    return group;
  }
}

/**
 * Get preset by name
 */
export function getCelShadingPreset(name: string): CelShadingPreset | null {
  const presets: Record<string, CelShadingPreset> = {
    'code-vein': CODE_VEIN_PRESET,
    'nikke': NIKKE_PRESET,
    'ultra': ULTRA_PRESET,
  };

  return presets[name] || null;
}

