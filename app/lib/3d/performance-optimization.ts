import * as THREE from 'three';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export interface PerformanceSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  targetFPS: number;
  enableLOD: boolean;
  enableInstancing: boolean;
  enableTextureCompression: boolean;
  enableProgressiveLoading: boolean;
  maxTextureSize: number;
  shadowMapSize: number;
  maxLights: number;
  maxParticles: number;
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
  }

export interface LODLevel {
  distance: number;
  geometry: THREE.BufferGeometry;
  material?: THREE.Material;
  mesh?: THREE.Mesh;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  memoryUsage: number;
  gpuMemory: number;
  }

export class PerformanceOptimizer {
  private settings: PerformanceSettings;
  private metrics: PerformanceMetrics;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsHistory: number[] = [];
  private adaptiveQuality: boolean = true;

  // LOD management
  private lodGroups: Map<string, THREE.LOD> = new Map();
  private instancedMeshes: Map<string, THREE.InstancedMesh> = new Map();

  // Texture optimization
  private textureCache: Map<string, THREE.Texture> = new Map();
  private compressedTextures: Map<string, THREE.CompressedTexture> = new Map();

  // Geometry optimization
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  private simplifiedGeometries: Map<string, THREE.BufferGeometry> = new Map();

  // GPU instancing
  private instancedGroups: Map<string, THREE.InstancedMesh> = new Map();
  private materialBatches: Map<string, THREE.Material[]> = new Map();
  private mergedGeometries: Map<string, THREE.BufferGeometry> = new Map();

  constructor(settings: PerformanceSettings) {
    this.settings = { ...settings };
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      drawCalls: 0,
      triangles: 0,
      textures: 0,
      memoryUsage: 0,
      gpuMemory: 0,
    };

    this.initializeOptimizations();
  }

  private initializeOptimizations() {
    // Set up adaptive quality based on device capabilities
    if (this.adaptiveQuality) {
      this.detectDeviceCapabilities();
    }
  }

  private detectDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      this.settings.quality = 'low';
      return;
    }

    // Check GPU memory (approximate)
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      getLogger().then((logger) => {
        logger.warn('GPU:', undefined, { value: renderer });
      });

      // Adjust settings based on GPU
      if (renderer.includes('Intel')) {
        this.settings.quality = 'medium';
        this.settings.maxTextureSize = Math.min(this.settings.maxTextureSize, 1024);
      } else if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
        this.settings.quality = 'high';
      }
    }

    // Check available extensions
    const extensions = gl.getSupportedExtensions();
    if (!extensions?.includes('WEBGL_compressed_texture_s3tc')) {
      this.settings.enableTextureCompression = false;
    }
  }

  // LOD System
  createLODGroup(id: string, meshes: THREE.Mesh[], distances: number[]): THREE.LOD {
    const lod = new THREE.LOD();

    meshes.forEach((mesh, index) => {
      const distance = distances[index] || index * 10;
      lod.addLevel(mesh, distance);
    });

    this.lodGroups.set(id, lod);
    return lod;
  }

  updateLOD(camera: THREE.Camera) {
    this.lodGroups.forEach((lod) => {
      lod.update(camera);
    });
  }

  // Geometry Optimization
  simplifyGeometry(geometry: THREE.BufferGeometry, targetTriangles: number): THREE.BufferGeometry {
    const originalTriangles = geometry.index
      ? geometry.index.count / 3
      : geometry.attributes.position.count / 3;

    if (originalTriangles <= targetTriangles) {
      return geometry;
    }

    const cacheKey = `${geometry.uuid}_${targetTriangles}`;
    if (this.simplifiedGeometries.has(cacheKey)) {
      return this.simplifiedGeometries.get(cacheKey)!;
    }

    // Simple decimation algorithm
    const simplified = this.decimateGeometry(geometry, targetTriangles);
    this.simplifiedGeometries.set(cacheKey, simplified);

    return simplified;
  }

  private decimateGeometry(
    geometry: THREE.BufferGeometry,
    targetTriangles: number,
  ): THREE.BufferGeometry {
    // This is a simplified decimation - in production, use proper mesh simplification
    const simplified = geometry.clone();

    if (simplified.index) {
      const originalCount = simplified.index.count;
      const targetCount = targetTriangles * 3;
      const ratio = targetCount / originalCount;

      // Simple edge collapse simulation
      if (ratio < 1) {
        const newIndex = new THREE.BufferAttribute(
          new Uint32Array(Math.floor(originalCount * ratio)),
          1,
        );

        for (let i = 0; i < newIndex.count; i++) {
          newIndex.setX(i, simplified.index.getX(Math.floor(i / ratio)));
        }

        simplified.setIndex(newIndex);
      }
    }

    return simplified;
  }

  // Texture Optimization
  async compressTexture(texture: THREE.Texture): Promise<THREE.CompressedTexture> {
    const cacheKey = texture.uuid;
    if (this.compressedTextures.has(cacheKey)) {
      return this.compressedTextures.get(cacheKey)!;
    }

    // In a real implementation, you would use a texture compression library
    // For now, we'll create a compressed version with reduced resolution
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = Math.min(texture.image.width, this.settings.maxTextureSize);
    canvas.height = Math.min(texture.image.height, this.settings.maxTextureSize);

    ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);

    const compressedTexture = new THREE.CanvasTexture(canvas);
    compressedTexture.format = texture.format;
    compressedTexture.type = texture.type;
    compressedTexture.generateMipmaps = texture.generateMipmaps;
    compressedTexture.minFilter = texture.minFilter;
    compressedTexture.magFilter = texture.magFilter;

    this.compressedTextures.set(cacheKey, compressedTexture as unknown as THREE.CompressedTexture);
    return compressedTexture as unknown as THREE.CompressedTexture;
  }

  // Progressive Loading
  async loadModelProgressively(
    url: string,
    onProgress: (progress: number) => void,
    onComplete: (gltf: GLTF) => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      // Load geometry first
      onProgress(0.2);
      const geometry = await this.loadGeometry(url);

      // Load materials
      onProgress(0.5);
      const materials = await this.loadMaterials(url);

      // Load textures
      onProgress(0.8);
      await this.loadTextures(url);

      // Combine into GLTF-like structure
      onProgress(1.0);
      const gltf = this.assembleGLTF(geometry, materials, []);

      onComplete(gltf);
    } catch (error) {
      onError(error as Error);
    }
  }

  private async loadGeometry(_url: string): Promise<THREE.BufferGeometry> {
    // Placeholder for progressive geometry loading
    return new THREE.BoxGeometry(1, 1, 1);
  }

  private async loadMaterials(_url: string): Promise<THREE.Material[]> {
    // Placeholder for progressive material loading
    return [new THREE.MeshStandardMaterial()];
  }

  private async loadTextures(_url: string): Promise<THREE.Texture[]> {
    // Placeholder for progressive texture loading
    return [];
  }

  private assembleGLTF(
    geometry: THREE.BufferGeometry,
    materials: THREE.Material[],
    _textures: THREE.Texture[],
  ): GLTF {
    const mesh = new THREE.Mesh(geometry, materials[0]);
    const group = new THREE.Group();
    group.add(mesh);

    return {
      scene: group as any,
      scenes: [group as any],
      cameras: [],
      animations: [],
      asset: { version: '2.0', generator: 'PerformanceOptimizer' },
      parser: {} as any,
      userData: {},
    };
  }

  // Performance Monitoring
  updateMetrics(renderer: THREE.WebGLRenderer) {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    this.metrics.frameTime = deltaTime;
    this.metrics.fps = 1000 / deltaTime;

    this.fpsHistory.push(this.metrics.fps);
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    // Calculate average FPS
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    this.metrics.fps = avgFPS;

    // Get renderer info
    const info = renderer.info;
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;

    // Estimate memory usage
    this.estimateMemoryUsage();

    // Adaptive quality adjustment
    if (this.adaptiveQuality) {
      this.adjustQualityBasedOnPerformance();
    }

    this.lastFrameTime = currentTime;
  }

  private estimateMemoryUsage() {
    // Rough estimation of memory usage
    let totalMemory = 0;

    // Geometry memory
    this.geometryCache.forEach((geometry) => {
      if (geometry.attributes.position) {
        totalMemory += geometry.attributes.position.array.byteLength;
      }
      if (geometry.index) {
        totalMemory += geometry.index.array.byteLength;
      }
    });

    // Texture memory
    this.textureCache.forEach((texture) => {
      if (texture.image) {
        const width = texture.image.width || 512;
        const height = texture.image.height || 512;
        totalMemory += width * height * 4; // RGBA
      }
    });

    this.metrics.memoryUsage = totalMemory / 1024 / 1024; // MB
  }

  private adjustQualityBasedOnPerformance() {
    const targetFPS = this.settings.targetFPS;
    const currentFPS = this.metrics.fps;

    if (currentFPS < targetFPS * 0.8) {
      // Performance is poor, reduce quality
      this.reduceQuality();
    } else if (currentFPS > targetFPS * 1.2 && this.canIncreaseQuality()) {
      // Performance is good, increase quality
      this.increaseQuality();
    }
  }

  private reduceQuality() {
    switch (this.settings.quality) {
      case 'ultra':
        this.settings.quality = 'high';
        this.settings.maxTextureSize = 2048;
        this.settings.shadowMapSize = 4096;
        break;
      case 'high':
        this.settings.quality = 'medium';
        this.settings.maxTextureSize = 1024;
        this.settings.shadowMapSize = 2048;
        break;
      case 'medium':
        this.settings.quality = 'low';
        this.settings.maxTextureSize = 512;
        this.settings.shadowMapSize = 1024;
        break;
    }

    getLogger().then((logger) => {
      logger.warn(`Quality reduced to ${this.settings.quality} due to performance`);
    });
  }

  private increaseQuality() {
    switch (this.settings.quality) {
      case 'low':
        this.settings.quality = 'medium';
        this.settings.maxTextureSize = 1024;
        this.settings.shadowMapSize = 2048;
        break;
      case 'medium':
        this.settings.quality = 'high';
        this.settings.maxTextureSize = 2048;
        this.settings.shadowMapSize = 4096;
        break;
      case 'high':
        this.settings.quality = 'ultra';
        this.settings.maxTextureSize = 4096;
        this.settings.shadowMapSize = 8192;
        break;
    }

    getLogger().then((logger) => {
      logger.warn(`Quality increased to ${this.settings.quality} due to good performance`);
    });
  }

  private canIncreaseQuality(): boolean {
    return this.settings.quality !== 'ultra';
  }

  // Frustum Culling
  setupFrustumCulling(camera: THREE.Camera, objects: THREE.Object3D[]) {
    if (!this.settings.enableFrustumCulling) return;

    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4();

    objects.forEach((obj) => {
      matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(matrix);

      obj.visible = frustum.intersectsObject(obj);
    });
  }

  // Batch Management
  batchMeshesByMaterial(meshes: THREE.Mesh[]): Map<string, THREE.Mesh[]> {
    const batches = new Map<string, THREE.Mesh[]>();

    meshes.forEach((mesh) => {
      const materialKey = Array.isArray(mesh.material)
        ? mesh.material.map((m) => m.uuid).join(',')
        : mesh.material.uuid;

      if (!batches.has(materialKey)) {
        batches.set(materialKey, []);
      }

      batches.get(materialKey)!.push(mesh);
    });

    return batches;
  }

  // Cleanup
  dispose() {
    // Dispose geometries
    this.geometryCache.forEach((geometry) => geometry.dispose());
    this.geometryCache.clear();

    // Dispose textures
    this.textureCache.forEach((texture) => texture.dispose());
    this.textureCache.clear();

    // Dispose compressed textures
    this.compressedTextures.forEach((texture) => texture.dispose());
    this.compressedTextures.clear();

    // Clear LOD groups
    this.lodGroups.clear();

    // Clear instanced meshes
    this.instancedMeshes.clear();
  }

  // Getters
  getSettings(): PerformanceSettings {
    return { ...this.settings };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  setQuality(quality: 'low' | 'medium' | 'high' | 'ultra') {
    this.settings.quality = quality;

    // Update settings based on quality
    switch (quality) {
      case 'low':
        this.settings.maxTextureSize = 512;
        this.settings.shadowMapSize = 1024;
        this.settings.enableLOD = false;
        break;
      case 'medium':
        this.settings.maxTextureSize = 1024;
        this.settings.shadowMapSize = 2048;
        this.settings.enableLOD = true;
        break;
      case 'high':
        this.settings.maxTextureSize = 2048;
        this.settings.shadowMapSize = 4096;
        this.settings.enableLOD = true;
        break;
      case 'ultra':
        this.settings.maxTextureSize = 4096;
        this.settings.shadowMapSize = 8192;
        this.settings.enableLOD = true;
        break;
    }
  }

  // GPU Instancing Methods
  createInstancedMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    count: number,
    groupId: string,
  ): THREE.InstancedMesh {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    this.instancedGroups.set(groupId, instancedMesh);
    return instancedMesh;
  }

  updateInstancedMeshTransform(groupId: string, index: number, matrix: THREE.Matrix4): void {
    const instancedMesh = this.instancedGroups.get(groupId);
    if (instancedMesh && index < instancedMesh.count) {
      instancedMesh.setMatrixAt(index, matrix);
      instancedMesh.instanceMatrix.needsUpdate = true;
    }
  }

  removeInstancedMesh(groupId: string): void {
    const instancedMesh = this.instancedGroups.get(groupId);
    if (instancedMesh) {
      instancedMesh.geometry.dispose();
      if (Array.isArray(instancedMesh.material)) {
        instancedMesh.material.forEach((mat) => mat.dispose());
      } else {
        instancedMesh.material.dispose();
      }
      this.instancedGroups.delete(groupId);
    }
  }

  // Material Batching Methods
  batchMaterials(materials: THREE.Material[], batchId: string): THREE.Material[] {
    if (!this.settings.enableInstancing) {
      return materials;
    }

    // Group similar materials together
    const materialGroups = new Map<string, THREE.Material[]>();

    materials.forEach((material) => {
      const key = this.getMaterialKey(material);
      if (!materialGroups.has(key)) {
        materialGroups.set(key, []);
      }
      materialGroups.get(key)!.push(material);
    });

    // Create batched materials
    const batchedMaterials: THREE.Material[] = [];
    materialGroups.forEach((group, _key) => {
      if (group.length > 1) {
        // Create a single material for the batch
        const batchedMaterial = this.createBatchedMaterial(group);
        batchedMaterials.push(batchedMaterial);
      } else {
        batchedMaterials.push(...group);
      }
    });

    this.materialBatches.set(batchId, batchedMaterials);
    return batchedMaterials;
  }

  private getMaterialKey(material: THREE.Material): string {
    // Create a key based on material properties for batching
    const props = [
      material.type,
      material.transparent ? 'transparent' : 'opaque',
      material.alphaTest,
      material.side,
      material.blending,
    ];
    return props.join('_');
  }

  private createBatchedMaterial(materials: THREE.Material[]): THREE.Material {
    // Create a material that can handle multiple textures/settings
    // This is a simplified version - in practice, you'd need more sophisticated batching
    const baseMaterial = materials[0].clone();

    // Add texture arrays for batching
    if (baseMaterial instanceof THREE.MeshStandardMaterial) {
      // Add texture arrays for diffuse, normal, roughness, etc.
      // This would require custom shader modifications
    }

    return baseMaterial;
  }

  // Geometry Merging Methods
  mergeGeometries(geometries: THREE.BufferGeometry[], mergeId: string): THREE.BufferGeometry {
    if (!this.settings.enableInstancing) {
      return geometries[0]; // Return first geometry if instancing disabled
    }

    const mergedGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    let vertexOffset = 0;

    geometries.forEach((geometry) => {
      const positionAttribute = geometry.getAttribute('position');
      const normalAttribute = geometry.getAttribute('normal');
      const uvAttribute = geometry.getAttribute('uv');
      const indexAttribute = geometry.getIndex();

      if (positionAttribute) {
        for (let i = 0; i < positionAttribute.count; i++) {
          positions.push(
            positionAttribute.getX(i),
            positionAttribute.getY(i),
            positionAttribute.getZ(i),
          );
        }
      }

      if (normalAttribute) {
        for (let i = 0; i < normalAttribute.count; i++) {
          normals.push(normalAttribute.getX(i), normalAttribute.getY(i), normalAttribute.getZ(i));
        }
      }

      if (uvAttribute) {
        for (let i = 0; i < uvAttribute.count; i++) {
          uvs.push(uvAttribute.getX(i), uvAttribute.getY(i));
        }
      }

      if (indexAttribute) {
        for (let i = 0; i < indexAttribute.count; i++) {
          indices.push(indexAttribute.getX(i) + vertexOffset);
        }
        vertexOffset += positionAttribute.count;
      }
    });

    mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    mergedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    mergedGeometry.setIndex(indices);

    this.mergedGeometries.set(mergeId, mergedGeometry);
    return mergedGeometry;
  }

  // Memory Management
  disposeInstancedGroup(groupId: string): void {
    this.removeInstancedMesh(groupId);
  }

  disposeMaterialBatch(batchId: string): void {
    const materials = this.materialBatches.get(batchId);
    if (materials) {
      materials.forEach((material) => material.dispose());
      this.materialBatches.delete(batchId);
    }
  }

  disposeMergedGeometry(mergeId: string): void {
    const geometry = this.mergedGeometries.get(mergeId);
    if (geometry) {
      geometry.dispose();
      this.mergedGeometries.delete(mergeId);
    }
  }

  // Performance monitoring for instancing
  getInstancingStats(): { groups: number; totalInstances: number; memoryUsage: number } {
    let totalInstances = 0;
    let memoryUsage = 0;

    this.instancedGroups.forEach((mesh) => {
      totalInstances += mesh.count;
      memoryUsage += mesh.geometry.attributes.position?.count * 3 * 4 || 0; // Rough estimate
    });

    return {
      groups: this.instancedGroups.size,
      totalInstances,
      memoryUsage,
    };
  }
}

// Default performance settings
export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
  quality: 'high',
  targetFPS: 60,
  enableLOD: true,
  enableInstancing: true,
  enableTextureCompression: true,
  enableProgressiveLoading: true,
  maxTextureSize: 2048,
  shadowMapSize: 4096,
  maxLights: 8,
  maxParticles: 1000,
  enableFrustumCulling: true,
  enableOcclusionCulling: false,
};

// Singleton performance optimizer
export const performanceOptimizer = new PerformanceOptimizer(DEFAULT_PERFORMANCE_SETTINGS);
