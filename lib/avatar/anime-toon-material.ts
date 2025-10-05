'use client';

import * as THREE from 'three';

// Types for AnimeToonMaterial
export interface AnimeToonMaterialConfig {
  // Base colors
  baseColor: string;
  shadowColor: string;
  highlightColor: string;
  rimColor: string;

  // Material properties
  metallic: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;

  // Toon shading
  toonSteps: number;
  toonSmoothness: number;
  shadowThreshold: number;
  highlightThreshold: number;

  // Rim lighting
  rimIntensity: number;
  rimPower: number;
  rimFresnel: boolean;

  // Matcap
  matcapTexture?: THREE.Texture;
  matcapIntensity: number;

  // Additional effects
  outlineWidth: number;
  outlineColor: string;
  subsurfaceScattering: boolean;
  sssIntensity: number;
}

// Default configuration
export const DEFAULT_ANIME_TOON_CONFIG: AnimeToonMaterialConfig = {
  baseColor: '#fdbcb4',
  shadowColor: '#d4a574',
  highlightColor: '#ffffff',
  rimColor: '#ffd700',
  metallic: 0.1,
  roughness: 0.8,
  emissive: '#000000',
  emissiveIntensity: 0.0,
  toonSteps: 3,
  toonSmoothness: 0.1,
  shadowThreshold: 0.3,
  highlightThreshold: 0.7,
  rimIntensity: 0.5,
  rimPower: 2.0,
  rimFresnel: true,
  matcapIntensity: 0.3,
  outlineWidth: 0.02,
  outlineColor: '#000000',
  subsurfaceScattering: true,
  sssIntensity: 0.2,
};

// AnimeToonMaterial class
export class AnimeToonMaterial extends THREE.ShaderMaterial {
  public uniforms: { [key: string]: THREE.IUniform };

  constructor(config: Partial<AnimeToonMaterialConfig> = {}) {
    const finalConfig = { ...DEFAULT_ANIME_TOON_CONFIG, ...config };

    const uniforms = {
      // Base colors
      uBaseColor: { value: new THREE.Color(finalConfig.baseColor) },
      uShadowColor: { value: new THREE.Color(finalConfig.shadowColor) },
      uHighlightColor: { value: new THREE.Color(finalConfig.highlightColor) },
      uRimColor: { value: new THREE.Color(finalConfig.rimColor) },

      // Material properties
      uMetallic: { value: finalConfig.metallic },
      uRoughness: { value: finalConfig.roughness },
      uEmissive: { value: new THREE.Color(finalConfig.emissive) },
      uEmissiveIntensity: { value: finalConfig.emissiveIntensity },

      // Toon shading
      uToonSteps: { value: finalConfig.toonSteps },
      uToonSmoothness: { value: finalConfig.toonSmoothness },
      uShadowThreshold: { value: finalConfig.shadowThreshold },
      uHighlightThreshold: { value: finalConfig.highlightThreshold },

      // Rim lighting
      uRimIntensity: { value: finalConfig.rimIntensity },
      uRimPower: { value: finalConfig.rimPower },
      uRimFresnel: { value: finalConfig.rimFresnel },

      // Matcap
      uMatcapTexture: { value: null },
      uMatcapIntensity: { value: finalConfig.matcapIntensity },

      // Additional effects
      uOutlineWidth: { value: finalConfig.outlineWidth },
      uOutlineColor: { value: new THREE.Color(finalConfig.outlineColor) },
      uSubsurfaceScattering: { value: finalConfig.subsurfaceScattering },
      uSssIntensity: { value: finalConfig.sssIntensity },

      // Time for animations
      uTime: { value: 0.0 },

      // Textures
      uDiffuseTexture: { value: null },
      uNormalTexture: { value: null },
      uRoughnessTexture: { value: null },
      uMetallicTexture: { value: null },
      uOcclusionTexture: { value: null },
      uEmissionTexture: { value: null },
    };

    super({
      uniforms,
      vertexShader: AnimeToonMaterial.vertexShader,
      fragmentShader: AnimeToonMaterial.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.uniforms = uniforms;
  }

  // Update configuration
  updateConfig(config: Partial<AnimeToonMaterialConfig>): void {
    if (config.baseColor) {
      this.uniforms.uBaseColor.value.setHex(parseInt(config.baseColor.replace('#', ''), 16));
    }
    if (config.shadowColor) {
      this.uniforms.uShadowColor.value.setHex(parseInt(config.shadowColor.replace('#', ''), 16));
    }
    if (config.highlightColor) {
      this.uniforms.uHighlightColor.value.setHex(
        parseInt(config.highlightColor.replace('#', ''), 16),
      );
    }
    if (config.rimColor) {
      this.uniforms.uRimColor.value.setHex(parseInt(config.rimColor.replace('#', ''), 16));
    }
    if (config.metallic !== undefined) {
      this.uniforms.uMetallic.value = config.metallic;
    }
    if (config.roughness !== undefined) {
      this.uniforms.uRoughness.value = config.roughness;
    }
    if (config.emissive) {
      this.uniforms.uEmissive.value.setHex(parseInt(config.emissive.replace('#', ''), 16));
    }
    if (config.emissiveIntensity !== undefined) {
      this.uniforms.uEmissiveIntensity.value = config.emissiveIntensity;
    }
    if (config.toonSteps !== undefined) {
      this.uniforms.uToonSteps.value = config.toonSteps;
    }
    if (config.toonSmoothness !== undefined) {
      this.uniforms.uToonSmoothness.value = config.toonSmoothness;
    }
    if (config.shadowThreshold !== undefined) {
      this.uniforms.uShadowThreshold.value = config.shadowThreshold;
    }
    if (config.highlightThreshold !== undefined) {
      this.uniforms.uHighlightThreshold.value = config.highlightThreshold;
    }
    if (config.rimIntensity !== undefined) {
      this.uniforms.uRimIntensity.value = config.rimIntensity;
    }
    if (config.rimPower !== undefined) {
      this.uniforms.uRimPower.value = config.rimPower;
    }
    if (config.rimFresnel !== undefined) {
      this.uniforms.uRimFresnel.value = config.rimFresnel;
    }
    if (config.matcapTexture) {
      this.uniforms.uMatcapTexture.value = config.matcapTexture;
    }
    if (config.matcapIntensity !== undefined) {
      this.uniforms.uMatcapIntensity.value = config.matcapIntensity;
    }
    if (config.outlineWidth !== undefined) {
      this.uniforms.uOutlineWidth.value = config.outlineWidth;
    }
    if (config.outlineColor) {
      this.uniforms.uOutlineColor.value.setHex(parseInt(config.outlineColor.replace('#', ''), 16));
    }
    if (config.subsurfaceScattering !== undefined) {
      this.uniforms.uSubsurfaceScattering.value = config.subsurfaceScattering;
    }
    if (config.sssIntensity !== undefined) {
      this.uniforms.uSssIntensity.value = config.sssIntensity;
    }
  }

  // Set texture
  setTexture(type: string, texture: THREE.Texture): void {
    const uniformName = `u${type.charAt(0).toUpperCase()}${type.slice(1)}Texture`;
    if (this.uniforms[uniformName]) {
      this.uniforms[uniformName].value = texture;
    }
  }

  // Update time for animations
  updateTime(time: number): void {
    this.uniforms.uTime.value = time;
  }

  // Vertex shader
  static vertexShader = `
    #include <common>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <normal_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    
    void main() {
      #include <uv_vertex>
      #include <beginnormal_vertex>
      #include <morphnormal_vertex>
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      #include <defaultnormal_vertex>
      #include <normal_vertex>
      
      #include <begin_vertex>
      #include <morphtarget_vertex>
      #include <skinning_vertex>
      #include <displacementmap_vertex>
      #include <project_vertex>
      #include <logdepthbuf_vertex>
      #include <clipping_planes_vertex>
      
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    }
  `;

  // Fragment shader
  static fragmentShader = `
    #include <common>
    #include <uv_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <alphatest_pars_fragment>
    #include <clipping_planes_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <fog_pars_fragment>
    
    uniform vec3 uBaseColor;
    uniform vec3 uShadowColor;
    uniform vec3 uHighlightColor;
    uniform vec3 uRimColor;
    uniform float uMetallic;
    uniform float uRoughness;
    uniform vec3 uEmissive;
    uniform float uEmissiveIntensity;
    uniform float uToonSteps;
    uniform float uToonSmoothness;
    uniform float uShadowThreshold;
    uniform float uHighlightThreshold;
    uniform float uRimIntensity;
    uniform float uRimPower;
    uniform bool uRimFresnel;
    uniform sampler2D uMatcapTexture;
    uniform float uMatcapIntensity;
    uniform float uOutlineWidth;
    uniform vec3 uOutlineColor;
    uniform bool uSubsurfaceScattering;
    uniform float uSssIntensity;
    uniform float uTime;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    
    // Toon shading function
    float toonShading(vec3 normal, vec3 lightDir, float steps, float smoothness) {
      float NdotL = dot(normal, lightDir);
      float toon = floor(NdotL * steps) / steps;
      return smoothstep(0.0, smoothness, toon);
    }
    
    // Rim lighting function
    float rimLighting(vec3 normal, vec3 viewDir, float intensity, float power) {
      float rim = 1.0 - max(0.0, dot(normal, viewDir));
      return pow(rim, power) * intensity;
    }
    
    // Fresnel effect
    float fresnel(vec3 normal, vec3 viewDir, float power) {
      return pow(1.0 - max(0.0, dot(normal, viewDir)), power);
    }
    
    // Subsurface scattering
    vec3 subsurfaceScattering(vec3 normal, vec3 lightDir, vec3 baseColor, float intensity) {
      float backLight = max(0.0, dot(normal, -lightDir));
      return baseColor * backLight * intensity;
    }
    
    void main() {
      #include <clipping_planes_fragment>
      
      // Basic lighting setup
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(-vViewPosition);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      
      // Sample textures
      vec4 diffuseColor = texture2D(map, vUv);
      if (diffuseColor.a < 0.5) discard;
      
      // Apply base color
      diffuseColor.rgb *= uBaseColor;
      
      // Toon shading
      float toon = toonShading(normal, lightDir, uToonSteps, uToonSmoothness);
      
      // Determine shadow/highlight areas
      float NdotL = dot(normal, lightDir);
      vec3 shadowColor = mix(uShadowColor, uBaseColor, toon);
      vec3 highlightColor = mix(uBaseColor, uHighlightColor, smoothstep(uHighlightThreshold, 1.0, NdotL));
      
      // Combine shadow and highlight
      vec3 toonColor = mix(shadowColor, highlightColor, toon);
      
      // Rim lighting
      float rim = rimLighting(normal, viewDir, uRimIntensity, uRimPower);
      if (uRimFresnel) {
        rim *= fresnel(normal, viewDir, 2.0);
      }
      
      // Matcap
      vec3 matcapColor = vec3(0.0);
      if (uMatcapTexture != null) {
        vec2 matcapUV = normal.xy * 0.5 + 0.5;
        matcapColor = texture2D(uMatcapTexture, matcapUV).rgb * uMatcapIntensity;
      }
      
      // Subsurface scattering
      vec3 sss = vec3(0.0);
      if (uSubsurfaceScattering) {
        sss = subsurfaceScattering(normal, lightDir, uBaseColor, uSssIntensity);
      }
      
      // Combine all effects
      vec3 finalColor = toonColor + (uRimColor * rim) + matcapColor + sss;
      
      // Add emissive
      finalColor += uEmissive * uEmissiveIntensity;
      
      // Apply diffuse texture
      finalColor *= diffuseColor.rgb;
      
      // Output
      gl_FragColor = vec4(finalColor, diffuseColor.a);
      
      #include <logdepthbuf_fragment>
      #include <alphatest_fragment>
      #include <fog_fragment>
    }
  `;
}

// Material presets for different character types
export const ANIME_TOON_PRESETS: { [key: string]: Partial<AnimeToonMaterialConfig> } = {
  // Skin presets
  skin: {
    baseColor: '#fdbcb4',
    shadowColor: '#d4a574',
    highlightColor: '#ffffff',
    rimColor: '#ffd700',
    metallic: 0.05,
    roughness: 0.9,
    toonSteps: 3,
    toonSmoothness: 0.1,
    rimIntensity: 0.3,
    subsurfaceScattering: true,
    sssIntensity: 0.2,
  },

  // Hair presets
  hair: {
    baseColor: '#8B4513',
    shadowColor: '#654321',
    highlightColor: '#D2691E',
    rimColor: '#FFD700',
    metallic: 0.1,
    roughness: 0.8,
    toonSteps: 4,
    toonSmoothness: 0.05,
    rimIntensity: 0.4,
    subsurfaceScattering: false,
  },

  // Clothing presets
  clothing: {
    baseColor: '#FF6B9D',
    shadowColor: '#CC4A7C',
    highlightColor: '#FFB3D1',
    rimColor: '#FFD700',
    metallic: 0.2,
    roughness: 0.7,
    toonSteps: 3,
    toonSmoothness: 0.1,
    rimIntensity: 0.2,
    subsurfaceScattering: false,
  },

  // Metal presets
  metal: {
    baseColor: '#C0C0C0',
    shadowColor: '#808080',
    highlightColor: '#FFFFFF',
    rimColor: '#FFD700',
    metallic: 0.9,
    roughness: 0.3,
    toonSteps: 5,
    toonSmoothness: 0.02,
    rimIntensity: 0.6,
    subsurfaceScattering: false,
  },

  // Eye presets
  eye: {
    baseColor: '#4A90E2',
    shadowColor: '#2E5BBA',
    highlightColor: '#87CEEB',
    rimColor: '#FFFFFF',
    metallic: 0.0,
    roughness: 0.1,
    toonSteps: 2,
    toonSmoothness: 0.2,
    rimIntensity: 0.8,
    subsurfaceScattering: false,
  },
};

// Utility function to create material from preset
export function createAnimeToonMaterialFromPreset(
  presetName: string,
  overrides: Partial<AnimeToonMaterialConfig> = {},
): AnimeToonMaterial {
  const preset = ANIME_TOON_PRESETS[presetName] || ANIME_TOON_PRESETS.skin;
  const config = { ...preset, ...overrides };
  return new AnimeToonMaterial(config);
}

// Utility function to create material for character part
export function createCharacterPartMaterial(
  partType: 'skin' | 'hair' | 'clothing' | 'metal' | 'eye',
  color: string,
  overrides: Partial<AnimeToonMaterialConfig> = {},
): AnimeToonMaterial {
  const preset = ANIME_TOON_PRESETS[partType] || ANIME_TOON_PRESETS.skin;
  const config = { ...preset, baseColor: color, ...overrides };
  return new AnimeToonMaterial(config);
}
