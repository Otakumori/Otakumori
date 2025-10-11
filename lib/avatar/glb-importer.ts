'use client';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Types for GLB import system
export interface GLBImportConfig {
  url: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  enablePhysics?: boolean;
  enableMorphTargets?: boolean;
  materialOverrides?: {
    skinTone?: string;
    hairColor?: string;
    eyeColor?: string;
    clothingColor?: string;
  };
}

export interface ImportedCharacter {
  model: THREE.Group;
  animations: THREE.AnimationClip[];
  morphTargets: { [key: string]: number };
  materials: THREE.Material[];
  metadata: {
    name: string;
    author: string;
    version: string;
    description: string;
    tags: string[];
  };
}

// GLB Character Importer
export class GLBCharacterImporter {
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private cache: Map<string, ImportedCharacter> = new Map();

  constructor() {
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  // Load character from GLB file
  async loadCharacter(config: GLBImportConfig): Promise<ImportedCharacter> {
    // Check cache first
    if (this.cache.has(config.url)) {
      return this.cache.get(config.url)!;
    }

    try {
      const gltf = await this.loadGLTF(config.url);
      const character = this.processGLTF(gltf, config);

      // Cache the result
      this.cache.set(config.url, character);

      return character;
    } catch (error) {
      console.error('Failed to load GLB character:', error);
      throw new Error(`Failed to load character from ${config.url}`);
    }
  }

  // Load GLTF file
  private async loadGLTF(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => resolve(gltf),
        (progress) => {
          // Progress tracking - log for debugging 3D model loading
          if (progress.total > 0) {
            const percentComplete = Math.round((progress.loaded / progress.total) * 100);
            console.warn(
              `Loading GLB: ${percentComplete}% (${progress.loaded}/${progress.total} bytes)`,
            );
          }
        },
        (error) => reject(error),
      );
    });
  }

  // Process loaded GLTF
  private processGLTF(gltf: any, config: GLBImportConfig): ImportedCharacter {
    const model = gltf.scene.clone();

    // Apply transformations
    if (config.scale) {
      model.scale.setScalar(config.scale);
    }

    if (config.position) {
      model.position.set(...config.position);
    }

    if (config.rotation) {
      model.rotation.set(...config.rotation);
    }

    // Process animations
    const animations = this.processAnimations(gltf.animations);

    // Process morph targets
    const morphTargets = this.processMorphTargets(model);

    // Process materials
    const materials = this.processMaterials(model, config.materialOverrides);

    // Extract metadata
    const metadata = this.extractMetadata(gltf, config);

    return {
      model,
      animations,
      morphTargets,
      materials,
      metadata,
    };
  }

  // Process animations
  private processAnimations(animations: THREE.AnimationClip[]): THREE.AnimationClip[] {
    return animations.map((clip) => {
      // Ensure animations are compatible with our character system
      const processedClip = clip.clone();

      // Normalize animation timing
      processedClip.duration = Math.max(0.1, processedClip.duration);

      return processedClip;
    });
  }

  // Process morph targets
  private processMorphTargets(model: THREE.Group): { [key: string]: number } {
    const morphTargets: { [key: string]: number } = {};

    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
        Object.keys(child.morphTargetDictionary).forEach((key) => {
          morphTargets[key] = 0; // Initialize all morph targets to 0
        });
      }
    });

    return morphTargets;
  }

  // Process materials with overrides
  private processMaterials(
    model: THREE.Group,
    overrides?: GLBImportConfig['materialOverrides'],
  ): THREE.Material[] {
    const materials: THREE.Material[] = [];

    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.Material;

        // Apply material overrides
        if (overrides) {
          this.applyMaterialOverrides(material, overrides);
        }

        // Convert to anime toon material if needed
        const toonMaterial = this.convertToAnimeToonMaterial(material);
        child.material = toonMaterial;

        materials.push(toonMaterial);
      }
    });

    return materials;
  }

  // Apply material overrides
  private applyMaterialOverrides(
    material: THREE.Material,
    overrides: NonNullable<GLBImportConfig['materialOverrides']>,
  ): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      if (overrides.skinTone && this.isSkinMaterial(material)) {
        material.color.setHex(parseInt(overrides.skinTone.replace('#', ''), 16));
      }

      if (overrides.hairColor && this.isHairMaterial(material)) {
        material.color.setHex(parseInt(overrides.hairColor.replace('#', ''), 16));
      }

      if (overrides.eyeColor && this.isEyeMaterial(material)) {
        material.color.setHex(parseInt(overrides.eyeColor.replace('#', ''), 16));
      }

      if (overrides.clothingColor && this.isClothingMaterial(material)) {
        material.color.setHex(parseInt(overrides.clothingColor.replace('#', ''), 16));
      }
    }
  }

  // Convert material to anime toon style
  private convertToAnimeToonMaterial(originalMaterial: THREE.Material): THREE.Material {
    if (originalMaterial instanceof THREE.MeshStandardMaterial) {
      const toonMaterial = originalMaterial.clone();

      // Apply toon shading
      toonMaterial.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `
          #include <common>
          varying vec3 vNormal;
          varying vec3 vPosition;
          `,
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          `,
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `
          #include <common>
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          // Toon shading function
          float toonShading(vec3 normal, vec3 lightDir) {
            float NdotL = dot(normal, lightDir);
            return smoothstep(0.0, 0.1, NdotL);
          }
          `,
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <lights_physical_fragment>',
          `
          // Custom toon lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float toon = toonShading(vNormal, lightDir);
          
          // Rim lighting
          float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
          rim = pow(rim, 2.0);
          
          vec3 finalColor = diffuseColor.rgb * (toon + rim * 0.3);
          gl_FragColor = vec4(finalColor, diffuseColor.a);
          `,
        );
      };

      return toonMaterial;
    }

    return originalMaterial;
  }

  // Extract metadata from GLTF
  private extractMetadata(gltf: any, config: GLBImportConfig): ImportedCharacter['metadata'] {
    const userData = gltf.scene.userData || {};
    const asset = gltf.asset || {};

    // Extract metadata from GLTF userData and asset
    const metadata = {
      name: userData.name || asset.generator || 'Imported Character',
      author: userData.author || 'Unknown',
      version: asset.version || '1.0.0',
      description: userData.description || 'Imported from GLB file',
      tags: this.buildTags(userData.tags, config),
    };

    return metadata;
  }

  // Build tags based on config and user data
  private buildTags(userTags: string[] | undefined, config: GLBImportConfig): string[] {
    const tags = userTags || ['imported', 'glb'];

    // Add tags based on config features
    if (config.enablePhysics) tags.push('physics-enabled');
    if (config.enableMorphTargets) tags.push('morph-targets');
    if (config.materialOverrides) tags.push('custom-materials');

    return tags;
  }

  // Material type detection helpers
  private isSkinMaterial(material: THREE.Material): boolean {
    const name = material.name.toLowerCase();
    return name.includes('skin') || name.includes('body') || name.includes('face');
  }

  private isHairMaterial(material: THREE.Material): boolean {
    const name = material.name.toLowerCase();
    return name.includes('hair') || name.includes('head');
  }

  private isEyeMaterial(material: THREE.Material): boolean {
    const name = material.name.toLowerCase();
    return name.includes('eye') || name.includes('iris');
  }

  private isClothingMaterial(material: THREE.Material): boolean {
    const name = material.name.toLowerCase();
    return (
      name.includes('cloth') ||
      name.includes('shirt') ||
      name.includes('dress') ||
      name.includes('pants') ||
      name.includes('outfit')
    );
  }

  // Load from file input
  async loadFromFile(
    file: File,
    config: Partial<GLBImportConfig> = {},
  ): Promise<ImportedCharacter> {
    const url = URL.createObjectURL(file);

    try {
      const character = await this.loadCharacter({
        url,
        ...config,
      });

      return character;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // Load from URL
  async loadFromURL(
    url: string,
    config: Partial<GLBImportConfig> = {},
  ): Promise<ImportedCharacter> {
    return this.loadCharacter({
      url,
      ...config,
    });
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }
}

// VRoid-specific importer
export class VRoidImporter extends GLBCharacterImporter {
  constructor() {
    super();
  }

  // Load VRoid character with specific processing
  async loadVRoidCharacter(
    url: string,
    config: Partial<GLBImportConfig> = {},
  ): Promise<ImportedCharacter> {
    const vroidConfig: GLBImportConfig = {
      url,
      scale: 1.0,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      enablePhysics: true,
      enableMorphTargets: true,
      materialOverrides: {
        skinTone: '#fdbcb4',
        hairColor: '#8B4513',
        eyeColor: '#4a90e2',
      },
      ...config,
    };

    const character = await this.loadCharacter(vroidConfig);

    // Apply VRoid-specific processing
    this.processVRoidCharacter(character);

    return character;
  }

  // Process VRoid character
  private processVRoidCharacter(character: ImportedCharacter): void {
    // VRoid characters often need specific adjustments
    character.model.scale.setScalar(1.0);

    // Ensure proper bone structure for animations
    this.ensureBoneStructure(character.model);

    // Apply VRoid material settings
    this.applyVRoidMaterials(character.materials);
  }

  // Ensure proper bone structure
  private ensureBoneStructure(model: THREE.Group): void {
    // VRoid characters should have proper bone structure for animations
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Ensure proper bone weights
        if (child.geometry.attributes.skinIndex && child.geometry.attributes.skinWeight) {
          // Bone weights are already present
          return;
        }

        // Add default bone weights if missing
        this.addDefaultBoneWeights(child.geometry);
      }
    });
  }

  // Add default bone weights
  private addDefaultBoneWeights(geometry: THREE.BufferGeometry): void {
    const positionCount = geometry.attributes.position.count;

    // Create default skin indices (all vertices bound to bone 0)
    const skinIndex = new THREE.BufferAttribute(new Uint16Array(positionCount * 4).fill(0), 4);

    // Create default skin weights (all weight on bone 0)
    const skinWeight = new THREE.BufferAttribute(
      new Float32Array(positionCount * 4).fill(0).map((_, i) => (i % 4 === 0 ? 1 : 0)),
      4,
    );

    geometry.setAttribute('skinIndex', skinIndex);
    geometry.setAttribute('skinWeight', skinWeight);
  }

  // Apply VRoid material settings
  private applyVRoidMaterials(materials: THREE.Material[]): void {
    materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        // VRoid materials often need specific settings
        material.metalness = 0.1;
        material.roughness = 0.8;
        material.transparent = true;
        material.opacity = 0.95;
      }
    });
  }
}

// Export utility functions
export const createGLBImporter = () => new GLBCharacterImporter();
export const createVRoidImporter = () => new VRoidImporter();
