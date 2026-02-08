/**
 * AnimeRenderer - Cel-shaded PBR renderer for console-level visual quality
 * Uses Three.js with toon shading and rim lighting for anime-style rendering
 * Falls back to 2D canvas rendering for low-power devices
 */

import * as THREE from 'three';

export interface RendererConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  quality?: 'low' | 'medium' | 'high';
  enableShadows?: boolean;
  enableRimLight?: boolean;
}

export interface ModelConfig {
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: number;
}

export class AnimeRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private width: number;
  private height: number;
  private quality: 'low' | 'medium' | 'high';
  private enableShadows: boolean;
  private enableRimLight: boolean;
  private rimLight: THREE.DirectionalLight | null = null;
  private mainLight: THREE.DirectionalLight | null = null;
  private fillLight: THREE.DirectionalLight | null = null;
  private models: Map<string, THREE.Mesh> = new Map();
  private animationFrameId: number | null = null;
  private isDisposed = false;

  constructor(config: RendererConfig) {
    this.canvas = config.canvas;
    this.width = config.width;
    this.height = config.height;
    this.quality = config.quality || this.detectQuality();
    this.enableShadows = config.enableShadows ?? this.quality !== 'low';
    this.enableRimLight = config.enableRimLight ?? this.quality !== 'low';

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    // Initialize renderer with high DPI support
    const dpr = Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 2 : 1.5);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.quality !== 'low',
      alpha: false,
      powerPreference: this.quality === 'high' ? 'high-performance' : 'default',
    });
    this.renderer.setSize(this.width * dpr, this.height * dpr, false);
    this.renderer.setPixelRatio(dpr);
    this.renderer.shadowMap.enabled = this.enableShadows;
    this.renderer.shadowMap.type = this.quality === 'high' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;

    // Set CSS size to match design dimensions
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.setupLighting();
    this.setupBackground();
  }

  private detectQuality(): 'low' | 'medium' | 'high' {
    if (typeof window === 'undefined') return 'medium';

    // Detect GPU capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'low';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Detect low-power devices
      if (
        renderer.includes('Intel HD') ||
        renderer.includes('Mali') ||
        renderer.includes('Adreno 3') ||
        renderer.includes('PowerVR')
      ) {
        return 'low';
      }
    }

    // Check for high-end features
    const hasHighEndFeatures =
      gl.getExtension('OES_texture_float') &&
      gl.getExtension('WEBGL_draw_buffers') &&
      gl.getExtension('OES_standard_derivatives');

    return hasHighEndFeatures ? 'high' : 'medium';
  }

  private setupLighting(): void {
    // Main directional light (key light)
    this.mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.mainLight.position.set(5, 5, 5);
    this.mainLight.castShadow = this.enableShadows;
    if (this.enableShadows) {
      this.mainLight.shadow.mapSize.width = this.quality === 'high' ? 2048 : 1024;
      this.mainLight.shadow.mapSize.height = this.quality === 'high' ? 2048 : 1024;
      this.mainLight.shadow.camera.near = 0.5;
      this.mainLight.shadow.camera.far = 50;
      this.mainLight.shadow.camera.left = -10;
      this.mainLight.shadow.camera.right = 10;
      this.mainLight.shadow.camera.top = 10;
      this.mainLight.shadow.camera.bottom = -10;
    }
    this.scene.add(this.mainLight);

    // Fill light (softer, from opposite side)
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    this.fillLight.position.set(-5, 3, -5);
    this.scene.add(this.fillLight);

    // Rim light for anime-style edge highlighting
    if (this.enableRimLight) {
      this.rimLight = new THREE.DirectionalLight(0xec4899, 0.6); // Pink rim light
      this.rimLight.position.set(-3, 2, -8);
      this.scene.add(this.rimLight);
    }

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
  }

  private setupBackground(): void {
    // Use CSS variable for background color
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--om-bg-root')
      .trim() || '#1a1816';
    
    this.scene.background = new THREE.Color(bgColor);
  }

  /**
   * Create a cel-shaded material with toon shading
   */
  createToonMaterial(color: string | number, options?: {
    emissive?: string | number;
    roughness?: number;
    metalness?: number;
  }): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color: typeof color === 'string' ? new THREE.Color(color) : color,
      emissive: options?.emissive ? (typeof options.emissive === 'string' ? new THREE.Color(options.emissive) : options.emissive) : 0x000000,
      roughness: options?.roughness ?? 0.8,
      metalness: options?.metalness ?? 0.1,
      flatShading: this.quality === 'high' ? false : true, // Smooth shading for high quality
    });

    // Apply toon shading via custom shader chunks (simplified approach)
    // For true cel-shading, you'd need custom shader material
    material.onBeforeCompile = (shader) => {
      // Add toon shading effect by modifying the shader
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_pars_fragment>',
        `#include <color_pars_fragment>
        // Toon shading: quantize lighting
        float toonSteps = 4.0;
        float toonFactor = floor(dotColor.rgb * toonSteps) / toonSteps;
        dotColor.rgb = mix(dotColor.rgb, dotColor.rgb * toonFactor, 0.5);`,
      );
    };

    return material;
  }

  /**
   * Add a model to the scene
   */
  addModel(id: string, config: ModelConfig): THREE.Mesh | null {
    if (this.isDisposed) return null;

    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    if (config.geometry) {
      geometry = config.geometry;
    } else {
      // Default geometry (box)
      geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    if (config.material) {
      material = config.material;
    } else {
      // Default toon material
      material = this.createToonMaterial('#ec4899'); // Pink default
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      config.position?.x ?? 0,
      config.position?.y ?? 0,
      config.position?.z ?? 0,
    );
    mesh.rotation.set(
      config.rotation?.x ?? 0,
      config.rotation?.y ?? 0,
      config.rotation?.z ?? 0,
    );
    mesh.scale.set(
      config.scale ?? 1,
      config.scale ?? 1,
      config.scale ?? 1,
    );
    mesh.castShadow = this.enableShadows;
    mesh.receiveShadow = this.enableShadows;

    this.scene.add(mesh);
    this.models.set(id, mesh);
    return mesh;
  }

  /**
   * Update model position/rotation
   */
  updateModel(id: string, updates: {
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    scale?: number;
  }): void {
    const mesh = this.models.get(id);
    if (!mesh) return;

    if (updates.position) {
      if (updates.position.x !== undefined) mesh.position.x = updates.position.x;
      if (updates.position.y !== undefined) mesh.position.y = updates.position.y;
      if (updates.position.z !== undefined) mesh.position.z = updates.position.z;
    }

    if (updates.rotation) {
      if (updates.rotation.x !== undefined) mesh.rotation.x = updates.rotation.x;
      if (updates.rotation.y !== undefined) mesh.rotation.y = updates.rotation.y;
      if (updates.rotation.z !== undefined) mesh.rotation.z = updates.rotation.z;
    }

    if (updates.scale !== undefined) {
      mesh.scale.set(updates.scale, updates.scale, updates.scale);
    }
  }

  /**
   * Remove a model from the scene
   */
  removeModel(id: string): void {
    const mesh = this.models.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
      this.models.delete(id);
    }
  }

  /**
   * Update camera position
   */
  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Render a frame
   */
  render(): void {
    if (this.isDisposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start animation loop
   */
  startAnimationLoop(onFrame?: () => void): void {
    if (this.isDisposed || this.animationFrameId !== null) return;

    const animate = () => {
      if (this.isDisposed) return;
      onFrame?.();
      this.render();
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop animation loop
   */
  stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resize renderer
   */
  resize(width: number, height: number): void {
    if (this.isDisposed) return;
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    const dpr = Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 2 : 1.5);
    this.renderer.setSize(width * dpr, height * dpr, false);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    if (this.isDisposed) return;

    this.stopAnimationLoop();

    // Dispose all models
    this.models.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    this.models.clear();

    // Dispose lights
    if (this.mainLight) this.scene.remove(this.mainLight);
    if (this.fillLight) this.scene.remove(this.fillLight);
    if (this.rimLight) this.scene.remove(this.rimLight);

    // Dispose renderer
    this.renderer.dispose();

    this.isDisposed = true;
  }

  /**
   * Get renderer quality level
   */
  getQuality(): 'low' | 'medium' | 'high' {
    return this.quality;
  }

  /**
   * Check if renderer is disposed
   */
  get disposed(): boolean {
    return this.isDisposed;
  }
}

/**
 * Fallback 2D renderer for low-power devices
 */
export class Fallback2DRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  dispose(): void {
    // 2D context doesn't need explicit disposal
  }
}

