import * as THREE from 'three';
import { ShaderMaterial } from 'three';

// Import shader source code
import { animePbrVert } from '../shaders/anime-pbr.vert';
import { animePbrFrag } from '../shaders/anime-pbr.frag';
import { outlineVert } from '../shaders/outline.vert';
import { outlineFrag } from '../shaders/outline.frag';
import { hairAnisotropicFrag } from '../shaders/hair-anisotropic.frag';

export interface AnimeMaterialOptions {
  // Base material properties
  albedo?: THREE.Color;
  metallic?: number;
  roughness?: number;
  normalScale?: number;
  emission?: THREE.Color;
  alpha?: number;

  // Anime/toon shading parameters
  toonSteps?: number;
  toonSmoothness?: number;
  rimPower?: number;
  rimIntensity?: number;
  rimColor?: THREE.Color;

  // Skin-specific parameters
  skinTone?: THREE.Color;
  subsurfaceStrength?: number;
  subsurfaceColor?: THREE.Color;
  skinRoughness?: number;

  // Hair-specific parameters
  hairColor?: THREE.Color;
  hairHighlight?: THREE.Color;
  hairRoughness?: number;
  anisotropy?: number;
  flowScale?: number;

  // Content filtering
  showNsfwContent?: boolean;
  ageVerified?: boolean;
  contentOpacity?: number;

  // Textures
  diffuseMap?: THREE.Texture;
  normalMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  metallicMap?: THREE.Texture;
  emissionMap?: THREE.Texture;
  alphaMap?: THREE.Texture;

  // Hair textures
  hairFlowMap?: THREE.Texture;
  hairMaskMap?: THREE.Texture;
}

export class AnimePBRMaterial extends ShaderMaterial {
  constructor(options: AnimeMaterialOptions = {}) {
    super({
      vertexShader: animePbrVert,
      fragmentShader: animePbrFrag,
      uniforms: {
        // Time and camera
        uTime: { value: 0 },
        uCameraPosition: { value: new THREE.Vector3() },

        // Material textures
        uDiffuseMap: { value: options.diffuseMap || null },
        uNormalMap: { value: options.normalMap || null },
        uRoughnessMap: { value: options.roughnessMap || null },
        uMetallicMap: { value: options.metallicMap || null },
        uEmissionMap: { value: options.emissionMap || null },
        uAlphaMap: { value: options.alphaMap || null },

        // Material properties
        uAlbedo: { value: options.albedo || new THREE.Color(0.8, 0.8, 0.8) },
        uMetallic: { value: options.metallic || 0.0 },
        uRoughness: { value: options.roughness || 0.5 },
        uNormalScale: { value: options.normalScale || 1.0 },
        uEmission: { value: options.emission || new THREE.Color(0, 0, 0) },
        uAlpha: { value: options.alpha || 1.0 },

        // Lighting
        uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        uLightColor: { value: new THREE.Color(1, 1, 1) },
        uLightIntensity: { value: 1.0 },
        uAmbientLight: { value: new THREE.Color(0.3, 0.3, 0.3) },

        // Anime/toon shading
        uToonSteps: { value: options.toonSteps || 4.0 },
        uToonSmoothness: { value: options.toonSmoothness || 0.5 },
        uRimPower: { value: options.rimPower || 2.0 },
        uRimIntensity: { value: options.rimIntensity || 0.5 },
        uRimColor: { value: options.rimColor || new THREE.Color(0.8, 0.9, 1.0) },

        // Skin shading
        uSkinTone: { value: options.skinTone || new THREE.Color(1.0, 0.8, 0.7) },
        uSubsurfaceStrength: { value: options.subsurfaceStrength || 0.3 },
        uSubsurfaceColor: { value: options.subsurfaceColor || new THREE.Color(1.0, 0.4, 0.4) },
        uSkinRoughness: { value: options.skinRoughness || 0.7 },

        // Content filtering
        uShowNsfwContent: { value: options.showNsfwContent || false },
        uAgeVerified: { value: options.ageVerified || false },
        uContentOpacity: { value: options.contentOpacity || 1.0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  // Update time uniform for animations
  updateTime(time: number) {
    this.uniforms.uTime.value = time;
  }

  // Update camera position
  updateCameraPosition(position: THREE.Vector3) {
    this.uniforms.uCameraPosition.value.copy(position);
  }

  // Update lighting
  updateLighting(light: THREE.DirectionalLight, ambient: THREE.AmbientLight) {
    this.uniforms.uLightDirection.value.copy(light.position).normalize();
    this.uniforms.uLightColor.value.copy(light.color);
    this.uniforms.uLightIntensity.value = light.intensity;
    this.uniforms.uAmbientLight.value.copy(ambient.color);
  }

  // Update content filtering
  updateContentFiltering(showNsfw: boolean, ageVerified: boolean, opacity: number = 1.0) {
    this.uniforms.uShowNsfwContent.value = showNsfw;
    this.uniforms.uAgeVerified.value = ageVerified;
    this.uniforms.uContentOpacity.value = opacity;
  }

  // Set skin tone
  setSkinTone(color: THREE.Color) {
    this.uniforms.uSkinTone.value.copy(color);
  }

  // Set hair properties
  setHairProperties(color: THREE.Color, highlight: THREE.Color, roughness: number) {
    this.uniforms.uAlbedo.value.copy(color);
    this.uniforms.uEmission.value.copy(highlight.multiplyScalar(0.2));
    this.uniforms.uRoughness.value = roughness;
  }
}

export class OutlineMaterial extends ShaderMaterial {
  constructor(
    color: THREE.Color = new THREE.Color(0, 0, 0),
    width: number = 0.01,
    opacity: number = 1.0,
  ) {
    super({
      vertexShader: outlineVert,
      fragmentShader: outlineFrag,
      uniforms: {
        uOutlineColor: { value: color },
        uOutlineWidth: { value: width },
        uOutlineOpacity: { value: opacity },
      },
      side: THREE.BackSide,
      transparent: true,
    });
  }

  setOutlineColor(color: THREE.Color) {
    this.uniforms.uOutlineColor.value.copy(color);
  }

  setOutlineWidth(width: number) {
    this.uniforms.uOutlineWidth.value = width;
  }

  setOutlineOpacity(opacity: number) {
    this.uniforms.uOutlineOpacity.value = opacity;
  }
}

export class HairAnisotropicMaterial extends ShaderMaterial {
  constructor(options: AnimeMaterialOptions = {}) {
    super({
      vertexShader: animePbrVert, // Reuse the same vertex shader
      fragmentShader: hairAnisotropicFrag,
      uniforms: {
        // Time and camera
        uTime: { value: 0 },
        uCameraPosition: { value: new THREE.Vector3() },

        // Hair textures
        uHairDiffuse: { value: options.diffuseMap || null },
        uHairNormal: { value: options.normalMap || null },
        uHairFlow: { value: options.hairFlowMap || null },
        uHairMask: { value: options.hairMaskMap || null },

        // Hair properties
        uHairColor: { value: options.hairColor || new THREE.Color(0.4, 0.2, 0.1) },
        uHairHighlight: { value: options.hairHighlight || new THREE.Color(0.8, 0.6, 0.4) },
        uHairRoughness: { value: options.hairRoughness || 0.3 },
        uHairMetallic: { value: 0.0 },
        uAnisotropy: { value: options.anisotropy || 0.8 },
        uFlowScale: { value: options.flowScale || 1.0 },

        // Lighting
        uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        uLightColor: { value: new THREE.Color(1, 1, 1) },
        uLightIntensity: { value: 1.0 },
        uAmbientLight: { value: new THREE.Color(0.3, 0.3, 0.3) },

        // Animation
        uWindStrength: { value: 0.1 },
        uWindDirection: { value: new THREE.Vector2(1, 0) },
        uHairMovement: { value: 0.02 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  // Update time for hair animation
  updateTime(time: number) {
    this.uniforms.uTime.value = time;
  }

  // Update wind parameters
  updateWind(strength: number, direction: THREE.Vector2) {
    this.uniforms.uWindStrength.value = strength;
    this.uniforms.uWindDirection.value.copy(direction);
  }

  // Update lighting
  updateLighting(light: THREE.DirectionalLight, ambient: THREE.AmbientLight) {
    this.uniforms.uLightDirection.value.copy(light.position).normalize();
    this.uniforms.uLightColor.value.copy(light.color);
    this.uniforms.uLightIntensity.value = light.intensity;
    this.uniforms.uAmbientLight.value.copy(ambient.color);
  }
}

// Material factory for creating different types of anime materials
export class AnimeMaterialFactory {
  static createSkinMaterial(options: AnimeMaterialOptions = {}): AnimePBRMaterial {
    const material = new AnimePBRMaterial({
      ...options,
      roughness: options.roughness || 0.7,
      metallic: options.metallic || 0.0,
      skinTone: options.skinTone || new THREE.Color(1.0, 0.8, 0.7),
      subsurfaceStrength: options.subsurfaceStrength || 0.3,
      subsurfaceColor: options.subsurfaceColor || new THREE.Color(1.0, 0.4, 0.4),
      skinRoughness: options.skinRoughness || 0.7,
      toonSteps: options.toonSteps || 6.0,
      toonSmoothness: options.toonSmoothness || 0.3,
    });

    material.name = 'AnimeSkinMaterial';
    return material;
  }

  static createHairMaterial(options: AnimeMaterialOptions = {}): HairAnisotropicMaterial {
    const material = new HairAnisotropicMaterial({
      ...options,
      hairColor: options.hairColor || new THREE.Color(0.4, 0.2, 0.1),
      hairHighlight: options.hairHighlight || new THREE.Color(0.8, 0.6, 0.4),
      hairRoughness: options.hairRoughness || 0.3,
      anisotropy: options.anisotropy || 0.8,
      flowScale: options.flowScale || 1.0,
    });

    material.name = 'AnimeHairMaterial';
    return material;
  }

  static createClothingMaterial(options: AnimeMaterialOptions = {}): AnimePBRMaterial {
    const material = new AnimePBRMaterial({
      ...options,
      roughness: options.roughness || 0.5,
      metallic: options.metallic || 0.0,
      toonSteps: options.toonSteps || 4.0,
      toonSmoothness: options.toonSmoothness || 0.5,
    });

    material.name = 'AnimeClothingMaterial';
    return material;
  }

  static createMetalMaterial(options: AnimeMaterialOptions = {}): AnimePBRMaterial {
    const material = new AnimePBRMaterial({
      ...options,
      roughness: options.roughness || 0.1,
      metallic: options.metallic || 1.0,
      toonSteps: options.toonSteps || 8.0,
      toonSmoothness: options.toonSmoothness || 0.2,
    });

    material.name = 'AnimeMetalMaterial';
    return material;
  }

  static createOutlineMaterial(
    color: THREE.Color,
    width: number,
    opacity: number,
  ): OutlineMaterial {
    const material = new OutlineMaterial(color, width, opacity);
    material.name = 'AnimeOutlineMaterial';
    return material;
  }

  // Create material with NSFW content support
  static createNsfwMaterial(
    baseType: 'skin' | 'clothing' | 'metal',
    options: AnimeMaterialOptions = {},
  ): AnimePBRMaterial {
    const material = this.createMaterialByType(baseType, {
      ...options,
      showNsfwContent: true,
      ageVerified: options.ageVerified || false,
      contentOpacity: options.contentOpacity || 1.0,
    });

    material.name = `Anime${baseType.charAt(0).toUpperCase() + baseType.slice(1)}NsfwMaterial`;
    return material;
  }

  private static createMaterialByType(
    type: string,
    options: AnimeMaterialOptions,
  ): AnimePBRMaterial {
    switch (type) {
      case 'skin':
        return this.createSkinMaterial(options);
      case 'clothing':
        return this.createClothingMaterial(options);
      case 'metal':
        return this.createMetalMaterial(options);
      default:
        return new AnimePBRMaterial(options);
    }
  }
}

// Material preset system for quick material creation
export const MATERIAL_PRESETS = {
  // Skin presets
  skin: {
    fair: {
      skinTone: new THREE.Color(1.0, 0.9, 0.8),
      subsurfaceColor: new THREE.Color(1.0, 0.4, 0.4),
    },
    medium: {
      skinTone: new THREE.Color(1.0, 0.8, 0.7),
      subsurfaceColor: new THREE.Color(1.0, 0.5, 0.4),
    },
    tan: {
      skinTone: new THREE.Color(0.9, 0.7, 0.5),
      subsurfaceColor: new THREE.Color(1.0, 0.6, 0.5),
    },
    dark: {
      skinTone: new THREE.Color(0.6, 0.4, 0.3),
      subsurfaceColor: new THREE.Color(0.8, 0.4, 0.3),
    },
  },

  // Hair presets
  hair: {
    black: {
      hairColor: new THREE.Color(0.1, 0.1, 0.1),
      hairHighlight: new THREE.Color(0.3, 0.3, 0.3),
    },
    brown: {
      hairColor: new THREE.Color(0.4, 0.2, 0.1),
      hairHighlight: new THREE.Color(0.8, 0.6, 0.4),
    },
    blonde: {
      hairColor: new THREE.Color(0.8, 0.6, 0.3),
      hairHighlight: new THREE.Color(1.0, 0.9, 0.7),
    },
    red: {
      hairColor: new THREE.Color(0.6, 0.2, 0.1),
      hairHighlight: new THREE.Color(1.0, 0.6, 0.3),
    },
    blue: {
      hairColor: new THREE.Color(0.1, 0.3, 0.8),
      hairHighlight: new THREE.Color(0.4, 0.6, 1.0),
    },
    pink: {
      hairColor: new THREE.Color(0.9, 0.4, 0.7),
      hairHighlight: new THREE.Color(1.0, 0.7, 0.9),
    },
  },

  // Clothing presets
  clothing: {
    cotton: { roughness: 0.7, metallic: 0.0 },
    silk: { roughness: 0.3, metallic: 0.0 },
    leather: { roughness: 0.5, metallic: 0.1 },
    metal: { roughness: 0.1, metallic: 1.0 },
    lace: { roughness: 0.4, metallic: 0.0, alpha: 0.8 },
  },
} as const;
