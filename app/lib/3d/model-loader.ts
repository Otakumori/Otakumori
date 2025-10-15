import * as THREE from 'three';
import { type GLTF, GLTFLoader } from 'three-stdlib';
import { DRACOLoader } from 'three-stdlib';

export interface ModelLoadOptions {
  // Loading options
  useDraco?: boolean;
  dracoPath?: string;
  useKTX2?: boolean;
  ktx2Path?: string;

  // Optimization options
  generateLOD?: boolean;
  lodLevels?: number[];
  simplifyGeometry?: boolean;
  targetTriangles?: number;

  // Texture options
  textureFormat?: 'webp' | 'ktx2' | 'png' | 'jpg';
  maxTextureSize?: number;
  generateMipmaps?: boolean;

  // Animation options
  loadAnimations?: boolean;
  animationScale?: number;

  // Validation options
  validateBones?: boolean;
  validateMaterials?: boolean;
  maxBoneCount?: number;
  maxMaterialCount?: number;

  // Content filtering
  allowNsfwContent?: boolean;
  ageVerified?: boolean;
}

export interface ModelValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    vertexCount: number;
    triangleCount: number;
    boneCount: number;
    materialCount: number;
    textureCount: number;
    animationCount: number;
    fileSize: number;
  };
}

export interface OptimizedModel {
  gltf: GLTF;
  lods?: GLTF[];
  validation: ModelValidationResult;
  metadata: {
    originalUrl: string;
    optimizedUrl?: string;
    loadTime: number;
    compressionRatio?: number;
  };
}

export class ModelLoader {
  private loader: GLTFLoader;
  private dracoLoader?: DRACOLoader;
  private cache: Map<string, OptimizedModel> = new Map();

  constructor() {
    this.loader = new GLTFLoader();

    // Setup Draco loader for geometry compression
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  // Load and optimize a GLTF/GLB model
  async loadModel(url: string, options: ModelLoadOptions = {}): Promise<OptimizedModel> {
    const startTime = performance.now();

    // Check cache first
    const cacheKey = this.getCacheKey(url, options);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Load the model
      const gltf = await this.loadGLTF(url, options);

      // Validate the model
      const validation = await this.validateModel(gltf, options);

      if (!validation.valid) {
        throw new Error(`Model validation failed: ${validation.errors.join(', ')}`);
      }

      // Optimize the model
      const optimizedGltf = await this.optimizeModel(gltf, options);

      // Generate LOD levels if requested
      let lods: GLTF[] | undefined;
      if (options.generateLOD) {
        lods = await this.generateLODs(optimizedGltf, options.lodLevels || [0.5, 0.25, 0.1]);
      }

      const loadTime = performance.now() - startTime;

      const result: OptimizedModel = {
        gltf: optimizedGltf,
        lods,
        validation,
        metadata: {
          originalUrl: url,
          loadTime,
          compressionRatio: this.calculateCompressionRatio(gltf, optimizedGltf),
        },
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  // Load GLTF file with options
  private async loadGLTF(url: string, options: ModelLoadOptions): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => resolve(gltf),
        (progress) => {
          console.warn('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
        },
        (error) => reject(error),
      );
    });
  }

  // Validate model structure and content
  private async validateModel(
    gltf: GLTF,
    options: ModelLoadOptions,
  ): Promise<ModelValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    let vertexCount = 0;
    let triangleCount = 0;
    let boneCount = 0;
    let materialCount = 0;
    let textureCount = 0;
    let animationCount = gltf.animations?.length || 0;

    // Validate scenes
    if (!gltf.scene) {
      errors.push('Model has no scene');
    }

    // Traverse and analyze the model
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geometry = child.geometry;
        const material = child.material;

        // Count vertices and triangles
        if (geometry.index) {
          vertexCount += geometry.attributes.position?.count || 0;
          triangleCount += geometry.index.count / 3;
        } else {
          vertexCount += geometry.attributes.position?.count || 0;
          triangleCount += vertexCount / 3;
        }

        // Validate materials
        if (material) {
          materialCount++;

          if (Array.isArray(material)) {
            materialCount += material.length - 1;
          }
        }

        // Check for required attributes
        if (!geometry.attributes.position) {
          errors.push('Mesh missing position attribute');
        }

        if (!geometry.attributes.normal) {
          warnings.push('Mesh missing normal attribute - will be generated');
        }

        if (!geometry.attributes.uv) {
          warnings.push('Mesh missing UV coordinates - texturing may be limited');
        }
      }

      // Count bones
      if (child instanceof THREE.SkinnedMesh) {
        boneCount += child.skeleton?.bones?.length || 0;
      }
    });

    // Count textures
    if (gltf.parser?.json?.textures) {
      textureCount = gltf.parser.json.textures.length;
    }

    // Validation checks
    if (options.maxBoneCount && boneCount > options.maxBoneCount) {
      errors.push(`Bone count (${boneCount}) exceeds maximum (${options.maxBoneCount})`);
    }

    if (options.maxMaterialCount && materialCount > options.maxMaterialCount) {
      errors.push(
        `Material count (${materialCount}) exceeds maximum (${options.maxMaterialCount})`,
      );
    }

    if (triangleCount > 100000) {
      warnings.push(`High triangle count (${triangleCount}) may impact performance`);
    }

    // Check for NSFW content if filtering is enabled
    if (!options.allowNsfwContent || !options.ageVerified) {
      const hasNsfwContent = this.detectNsfwContent(gltf);
      if (hasNsfwContent) {
        if (!options.allowNsfwContent) {
          errors.push('Model contains NSFW content but NSFW content is not allowed');
        } else if (!options.ageVerified) {
          errors.push('Model contains NSFW content but age verification is required');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        vertexCount,
        triangleCount,
        boneCount,
        materialCount,
        textureCount,
        animationCount,
        fileSize: 0, // Would need to calculate from original file
      },
    };
  }

  // Detect NSFW content in model
  private detectNsfwContent(gltf: GLTF): boolean {
    let hasNsfwContent = false;

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Check mesh name for NSFW indicators
        const name = child.name.toLowerCase();
        if (
          name.includes('breast') ||
          name.includes('penis') ||
          name.includes('vagina') ||
          name.includes('intimate') ||
          name.includes('nsfw') ||
          name.includes('adult')
        ) {
          hasNsfwContent = true;
        }

        // Check material names
        if (child.material) {
          const materialName = child.material.name.toLowerCase();
          if (materialName.includes('skin') || materialName.includes('intimate')) {
            // Additional checks for anatomical materials
            hasNsfwContent = true;
          }
        }
      }
    });

    return hasNsfwContent;
  }

  // Optimize model for performance
  private async optimizeModel(gltf: GLTF, options: ModelLoadOptions): Promise<GLTF> {
    const optimized = { ...gltf };

    // Optimize geometries
    optimized.scene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        // Merge vertices
        if (child.geometry.index) {
          child.geometry = child.geometry.toNonIndexed();
        }

        // Optimize materials
        if (child.material) {
          child.material = this.optimizeMaterial(child.material, options);
        }

        // Simplify geometry if requested
        if (options.simplifyGeometry && options.targetTriangles) {
          child.geometry = this.simplifyGeometry(child.geometry, options.targetTriangles);
        }
      }
    });

    return optimized;
  }

  // Optimize material for performance
  private optimizeMaterial(material: THREE.Material, options: ModelLoadOptions): THREE.Material {
    if (material instanceof THREE.MeshStandardMaterial) {
      const optimized = material.clone();

      // Reduce texture sizes
      if (options.maxTextureSize) {
        if (optimized.map) {
          optimized.map = this.resizeTexture(optimized.map, options.maxTextureSize);
        }
        if (optimized.normalMap) {
          optimized.normalMap = this.resizeTexture(optimized.normalMap, options.maxTextureSize);
        }
        if (optimized.roughnessMap) {
          optimized.roughnessMap = this.resizeTexture(
            optimized.roughnessMap,
            options.maxTextureSize,
          );
        }
        if (optimized.metalnessMap) {
          optimized.metalnessMap = this.resizeTexture(
            optimized.metalnessMap,
            options.maxTextureSize,
          );
        }
      }

      // Generate mipmaps if requested
      if (options.generateMipmaps) {
        if (optimized.map) optimized.map.generateMipmaps = true;
        if (optimized.normalMap) optimized.normalMap.generateMipmaps = true;
      }

      return optimized;
    }

    return material;
  }

  // Resize texture to target size
  private resizeTexture(texture: THREE.Texture, maxSize: number): THREE.Texture {
    // This is a simplified version - in production, you'd use canvas or WebGL to resize
    if (texture.image && texture.image.width > maxSize) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = maxSize;
        canvas.height = maxSize;
        ctx.drawImage(texture.image, 0, 0, maxSize, maxSize);

        const resizedTexture = new THREE.CanvasTexture(canvas);
        resizedTexture.wrapS = texture.wrapS;
        resizedTexture.wrapT = texture.wrapT;
        resizedTexture.minFilter = texture.minFilter;
        resizedTexture.magFilter = texture.magFilter;

        return resizedTexture;
      }
    }

    return texture;
  }

  // Simplify geometry to target triangle count
  private simplifyGeometry(
    geometry: THREE.BufferGeometry,
    targetTriangles: number,
  ): THREE.BufferGeometry {
    // This is a placeholder - you'd use a library like three-mesh-bvh or similar
    // for actual geometry simplification
    console.warn('Geometry simplification not implemented - returning original geometry');
    return geometry;
  }

  // Generate LOD levels
  private async generateLODs(gltf: GLTF, lodLevels: number[]): Promise<GLTF[]> {
    const lods: GLTF[] = [];

    for (const _lodLevel of lodLevels) {
      const lodGltf = { ...gltf };

      lodGltf.scene.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          // Simplify geometry for this LOD level
          // This is a placeholder - actual LOD generation would be more complex
          child.geometry = child.geometry.clone();
        }
      });

      lods.push(lodGltf);
    }

    return lods;
  }

  // Calculate compression ratio
  private calculateCompressionRatio(_original: GLTF, _optimized: GLTF): number {
    // This would calculate the actual compression ratio
    // For now, return a placeholder value
    return 0.7;
  }

  // Generate cache key
  private getCacheKey(url: string, options: ModelLoadOptions): string {
    return `${url}_${JSON.stringify(options)}`;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Preload models
  async preloadModels(urls: string[], options: ModelLoadOptions = {}): Promise<OptimizedModel[]> {
    const loadPromises = urls.map((url) => this.loadModel(url, options));
    return Promise.all(loadPromises);
  }

  // Get model statistics
  getModelStats(model: OptimizedModel): ModelValidationResult['stats'] {
    return model.validation.stats;
  }

  // Dispose of loader resources
  dispose(): void {
    // GLTFLoader doesn't have dispose method
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
    }
    this.clearCache();
  }
}

// Singleton instance
export const modelLoader = new ModelLoader();

// Utility functions for common model loading tasks
export const ModelUtils = {
  // Load avatar base model
  async loadAvatarBase(
    gender: 'male' | 'female',
    options: ModelLoadOptions = {},
  ): Promise<OptimizedModel> {
    const url = `/assets/models/avatar-base/${gender}-body.glb`;
    return modelLoader.loadModel(url, {
      ...options,
      useDraco: true,
      generateLOD: true,
      validateBones: true,
      maxBoneCount: 100,
      allowNsfwContent: true,
    });
  },

  // Load avatar part
  async loadAvatarPart(partId: string, options: ModelLoadOptions = {}): Promise<OptimizedModel> {
    const url = `/assets/models/parts/${partId}.glb`;
    return modelLoader.loadModel(url, {
      ...options,
      useDraco: true,
      generateLOD: true,
      targetTriangles: 10000,
      allowNsfwContent: true,
    });
  },

  // Load default game character
  async loadGameCharacter(
    characterId: string,
    options: ModelLoadOptions = {},
  ): Promise<OptimizedModel> {
    const url = `/assets/models/defaults/${characterId}.glb`;
    return modelLoader.loadModel(url, {
      ...options,
      useDraco: true,
      generateLOD: true,
      targetTriangles: 50000,
      allowNsfwContent: false,
    });
  },

  // Validate custom model upload
  async validateCustomModel(
    file: File,
    options: ModelLoadOptions = {},
  ): Promise<ModelValidationResult> {
    const url = URL.createObjectURL(file);

    try {
      const model = await modelLoader.loadModel(url, options);
      return model.validation;
    } finally {
      URL.revokeObjectURL(url);
    }
  },
};
