/**
 * Anime-style Toon + PBR Hybrid Shader
 * Combines cel-shaded toon lighting with PBR material properties
 */

import * as THREE from 'three';
import { ProceduralTextureGenerator } from '../procedural-textures';

export interface AnimeShaderUniforms {
  uBaseColor: THREE.Color;
  uRimColor: THREE.Color;
  uRimPower: number;
  uToonRamp: THREE.Texture;
  uSmoothness: number;
  uTime: number;
}

/**
 * Vertex Shader for Anime Material
 */
const animeVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment Shader for Anime Material
 */
const animeFragmentShader = `
  uniform vec3 uBaseColor;
  uniform vec3 uRimColor;
  uniform float uRimPower;
  uniform sampler2D uToonRamp;
  uniform float uSmoothness;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    // Normalize vectors
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Main light direction (from top-right)
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    
    // Toon shading with smoothstep
    float NdotL = max(dot(normal, lightDir), 0.0);
    float toonLight = smoothstep(0.0, uSmoothness, NdotL);
    
    // Sample toon ramp texture
    vec3 toonColor = texture2D(uToonRamp, vec2(toonLight, 0.5)).rgb;
    
    // Rim lighting (anime highlight)
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = smoothstep(0.6, 1.0, rim);
    vec3 rimLight = uRimColor * pow(rim, uRimPower);
    
    // Ambient occlusion approximation
    float ao = 0.3 + 0.7 * normal.y;
    
    // Combine
    vec3 ambient = uBaseColor * 0.3;
    vec3 diffuse = uBaseColor * toonColor * ao;
    vec3 finalColor = ambient + diffuse + rimLight;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/**
 * Create anime-style shader material
 */
export function createAnimeShaderMaterial(
  baseColor: THREE.Color | string | number = 0xffdbac,
  options: Partial<{
    rimColor: THREE.Color | string | number;
    rimPower: number;
    smoothness: number;
    toonSteps: number;
  }> = {}
): THREE.ShaderMaterial {
  const color =
    baseColor instanceof THREE.Color ? baseColor : new THREE.Color(baseColor);

  const rimColor =
    options.rimColor instanceof THREE.Color
      ? options.rimColor
      : new THREE.Color(options.rimColor || 0xffffff);

  // Generate toon ramp texture
  const toonRamp = ProceduralTextureGenerator.generateToonRamp(
    options.toonSteps || 4,
    options.smoothness || 0.1
  );

  const uniforms: { [key: string]: THREE.IUniform } = {
    uBaseColor: { value: color },
    uRimColor: { value: rimColor },
    uRimPower: { value: options.rimPower || 3.0 },
    uToonRamp: { value: toonRamp },
    uSmoothness: { value: options.smoothness || 0.1 },
    uTime: { value: 0.0 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: animeVertexShader,
    fragmentShader: animeFragmentShader,
    lights: false, // We handle lighting in the shader
  });
}

/**
 * Anime Material Factory - provides various preset materials
 */
export class AnimeMaterialFactory {
  /**
   * Create skin material with toon shading
   */
  static createSkinMaterial(
    skinTone: THREE.Color | string | number = 0xffdbac
  ): THREE.Material {
    return createAnimeShaderMaterial(skinTone, {
      rimColor: new THREE.Color(0xffe0cc),
      rimPower: 2.5,
      smoothness: 0.08,
      toonSteps: 3,
    });
  }

  /**
   * Create hair material with specular highlights
   */
  static createHairMaterial(
    hairColor: THREE.Color | string | number = 0x3d2817
  ): THREE.Material {
    const color =
      hairColor instanceof THREE.Color
        ? hairColor
        : new THREE.Color(hairColor);

    // Hair uses standard material with anisotropic-like settings
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.3,
      metalness: 0.1,
      flatShading: false,
    });
  }

  /**
   * Create clothing material
   */
  static createClothingMaterial(
    clothColor: THREE.Color | string | number = 0x666666,
    _type: 'casual' | 'formal' | 'fabric' = 'casual'
  ): THREE.Material {
    // Note: type parameter reserved for future shader customization
    return createAnimeShaderMaterial(clothColor, {
      rimColor: new THREE.Color(0xffffff),
      rimPower: 4.0,
      smoothness: 0.12,
      toonSteps: 4,
    });
  }

  /**
   * Create metal/accessory material
   */
  static createMetalMaterial(
    metalColor: THREE.Color | string | number = 0xc0c0c0
  ): THREE.Material {
    const color =
      metalColor instanceof THREE.Color
        ? metalColor
        : new THREE.Color(metalColor);

    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.2,
      metalness: 0.9,
    });
  }

  /**
   * Create outline material for cel-shading effect
   */
  static createOutlineMaterial(
    outlineColor: THREE.Color | string | number = 0x000000,
    thickness: number = 0.02,
    opacity: number = 1.0
  ): THREE.ShaderMaterial {
    const color =
      outlineColor instanceof THREE.Color
        ? outlineColor
        : new THREE.Color(outlineColor);

    const outlineVertexShader = `
      uniform float uThickness;
      
      void main() {
        vec3 newPosition = position + normal * uThickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const outlineFragmentShader = `
      uniform vec3 uColor;
      uniform float uOpacity;
      
      void main() {
        gl_FragColor = vec4(uColor, uOpacity);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        uThickness: { value: thickness },
        uColor: { value: color },
        uOpacity: { value: opacity },
      },
      vertexShader: outlineVertexShader,
      fragmentShader: outlineFragmentShader,
      side: THREE.BackSide,
      transparent: opacity < 1.0,
    });
  }

  /**
   * Create emission/glow material for special effects
   */
  static createGlowMaterial(
    glowColor: THREE.Color | string | number = 0xff69b4,
    intensity: number = 1.0
  ): THREE.Material {
    const color =
      glowColor instanceof THREE.Color ? glowColor : new THREE.Color(glowColor);

    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6 * intensity,
      blending: THREE.AdditiveBlending,
    });
  }
}

