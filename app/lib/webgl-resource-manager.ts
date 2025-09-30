/**
 * WebGL Resource Manager
 *
 * Manages Three.js scene graphs and WebGL resources to prevent memory leaks.
 * Ensures proper disposal of geometries, materials, and renderers.
 */

import * as THREE from 'three';

export class WebGLResourceManager {
  private static instance: WebGLResourceManager;
  private scenes: Map<string, THREE.Scene> = new Map();
  private renderers: Map<string, THREE.WebGLRenderer> = new Map();
  private cameras: Map<string, THREE.Camera> = new Map();
  private materials: Map<string, THREE.Material> = new Map();
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();

  static getInstance(): WebGLResourceManager {
    if (!WebGLResourceManager.instance) {
      WebGLResourceManager.instance = new WebGLResourceManager();
    }
    return WebGLResourceManager.instance;
  }

  /**
   * Create a new scene with proper resource tracking
   */
  createScene(id: string): THREE.Scene {
    if (this.scenes.has(id)) {
      console.warn(`Scene ${id} already exists, disposing old scene`);
      this.disposeScene(id);
    }

    const scene = new THREE.Scene();
    this.scenes.set(id, scene);
    return scene;
  }

  /**
   * Create a new renderer with proper resource tracking
   */
  createRenderer(id: string, options: THREE.WebGLRendererParameters = {}): THREE.WebGLRenderer {
    if (this.renderers.has(id)) {
      console.warn(`Renderer ${id} already exists, disposing old renderer`);
      this.disposeRenderer(id);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      ...options,
    });

    this.renderers.set(id, renderer);
    return renderer;
  }

  /**
   * Create a new camera with proper resource tracking
   */
  createCamera(id: string, type: 'perspective' | 'orthographic', options: any = {}): THREE.Camera {
    if (this.cameras.has(id)) {
      console.warn(`Camera ${id} already exists, disposing old camera`);
      this.disposeCamera(id);
    }

    let camera: THREE.Camera;
    if (type === 'perspective') {
      camera = new THREE.PerspectiveCamera(
        options.fov || 45,
        options.aspect || 16 / 9,
        options.near || 0.1,
        options.far || 1000,
      );
    } else {
      camera = new THREE.OrthographicCamera(
        options.left || -1,
        options.right || 1,
        options.top || 1,
        options.bottom || -1,
        options.near || 0.1,
        options.far || 1000,
      );
    }

    this.cameras.set(id, camera);
    return camera;
  }

  /**
   * Register a material for tracking
   */
  registerMaterial(id: string, material: THREE.Material): void {
    if (this.materials.has(id)) {
      this.disposeMaterial(id);
    }
    this.materials.set(id, material);
  }

  /**
   * Register a geometry for tracking
   */
  registerGeometry(id: string, geometry: THREE.BufferGeometry): void {
    if (this.geometries.has(id)) {
      this.disposeGeometry(id);
    }
    this.geometries.set(id, geometry);
  }

  /**
   * Register a texture for tracking
   */
  registerTexture(id: string, texture: THREE.Texture): void {
    if (this.textures.has(id)) {
      this.disposeTexture(id);
    }
    this.textures.set(id, texture);
  }

  /**
   * Get a scene by ID
   */
  getScene(id: string): THREE.Scene | undefined {
    return this.scenes.get(id);
  }

  /**
   * Get a renderer by ID
   */
  getRenderer(id: string): THREE.WebGLRenderer | undefined {
    return this.renderers.get(id);
  }

  /**
   * Get a camera by ID
   */
  getCamera(id: string): THREE.Camera | undefined {
    return this.cameras.get(id);
  }

  /**
   * Dispose of a specific scene and all its resources
   */
  disposeScene(id: string): void {
    const scene = this.scenes.get(id);
    if (!scene) return;

    // Traverse scene graph and dispose of all resources
    scene.traverse((object) => {
      const mesh = object as any; // Cast to access geometry and material
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material: any) => {
            if ('map' in material && material.map) (material as any).map.dispose();
            if ('normalMap' in material && material.normalMap)
              (material as any).normalMap.dispose();
            if ('bumpMap' in material && material.bumpMap) (material as any).bumpMap.dispose();
            if ('specularMap' in material && material.specularMap)
              (material as any).specularMap.dispose();
            if ('envMap' in material && material.envMap) (material as any).envMap.dispose();
            material.dispose();
          });
        } else {
          const material = mesh.material as any;
          if ('map' in material && material.map) (material as any).map.dispose();
          if ('normalMap' in material && material.normalMap) (material as any).normalMap.dispose();
          if ('bumpMap' in material && material.bumpMap) (material as any).bumpMap.dispose();
          if ('specularMap' in material && material.specularMap)
            (material as any).specularMap.dispose();
          if ('envMap' in material && material.envMap) (material as any).envMap.dispose();
          material.dispose();
        }
      }
    });

    scene.clear();
    this.scenes.delete(id);
  }

  /**
   * Dispose of a specific renderer
   */
  disposeRenderer(id: string): void {
    const renderer = this.renderers.get(id);
    if (!renderer) return;

    renderer.dispose();
    renderer.forceContextLoss();
    this.renderers.delete(id);
  }

  /**
   * Dispose of a specific camera
   */
  disposeCamera(id: string): void {
    this.cameras.delete(id);
  }

  /**
   * Dispose of a specific material
   */
  disposeMaterial(id: string): void {
    const material = this.materials.get(id);
    if (!material) return;

    if ('map' in material && material.map) (material as any).map.dispose();
    if ('normalMap' in material && material.normalMap) (material as any).normalMap.dispose();
    if ('bumpMap' in material && material.bumpMap) (material as any).bumpMap.dispose();
    if ('specularMap' in material && material.specularMap) (material as any).specularMap.dispose();
    if ('envMap' in material && material.envMap) (material as any).envMap.dispose();
    material.dispose();
    this.materials.delete(id);
  }

  /**
   * Dispose of a specific geometry
   */
  disposeGeometry(id: string): void {
    const geometry = this.geometries.get(id);
    if (!geometry) return;

    geometry.dispose();
    this.geometries.delete(id);
  }

  /**
   * Dispose of a specific texture
   */
  disposeTexture(id: string): void {
    const texture = this.textures.get(id);
    if (!texture) return;

    texture.dispose();
    this.textures.delete(id);
  }

  /**
   * Dispose of all resources
   */
  disposeAll(): void {
    // Dispose all scenes
    for (const id of this.scenes.keys()) {
      this.disposeScene(id);
    }

    // Dispose all renderers
    for (const id of this.renderers.keys()) {
      this.disposeRenderer(id);
    }

    // Dispose all cameras
    for (const id of this.cameras.keys()) {
      this.disposeCamera(id);
    }

    // Dispose all materials
    for (const id of this.materials.keys()) {
      this.disposeMaterial(id);
    }

    // Dispose all geometries
    for (const id of this.geometries.keys()) {
      this.disposeGeometry(id);
    }

    // Dispose all textures
    for (const id of this.textures.keys()) {
      this.disposeTexture(id);
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    scenes: number;
    renderers: number;
    cameras: number;
    materials: number;
    geometries: number;
    textures: number;
  } {
    return {
      scenes: this.scenes.size,
      renderers: this.renderers.size,
      cameras: this.cameras.size,
      materials: this.materials.size,
      geometries: this.geometries.size,
      textures: this.textures.size,
    };
  }
}

// Export singleton instance
export const webglManager = WebGLResourceManager.getInstance();
