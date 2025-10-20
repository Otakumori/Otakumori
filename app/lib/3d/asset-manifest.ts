import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export interface AssetManifest {
  version: string;
  lastUpdated: string;
  assets: AssetEntry[];
  categories: AssetCategory[];
  metadata: AssetMetadata;
}

export interface AssetEntry {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'animation' | 'audio' | 'environment';
  category: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  format: string;
  compression: 'none' | 'draco' | 'ktx2' | 'gzip';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  dependencies: string[];
  tags: string[];
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    triangles?: number;
    materials?: number;
    animations?: number;
  };
  validation: AssetValidation;
  loading: AssetLoadingState;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parent?: string;
  assets: string[];
}

export interface AssetMetadata {
  totalAssets: number;
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  supportedFormats: string[];
  qualityLevels: string[];
}

export interface AssetValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checksum: string;
  lastValidated: string;
}

export interface AssetLoadingState {
  isLoaded: boolean;
  isLoading: boolean;
  progress: number;
  error?: string;
  loadedAt?: string;
  loadTime?: number;
}

export interface AssetLoaderOptions {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  enableCompression: boolean;
  enableCaching: boolean;
  maxConcurrent: number;
  timeout: number;
  retryAttempts: number;
}

export class AssetManifestManager {
  private manifest: AssetManifest;
  private loadingStates: Map<string, AssetLoadingState> = new Map();
  private loadedAssets: Map<string, any> = new Map();
  private loadingQueue: string[] = [];
  private activeLoads: Set<string> = new Set();
  private options: AssetLoaderOptions;

  constructor(manifest: AssetManifest, options: AssetLoaderOptions = {
    quality: 'high',
    enableCompression: true,
    enableCaching: true,
    maxConcurrent: 3,
    timeout: 30000,
    retryAttempts: 3,
  }) {
    this.manifest = manifest;
    this.options = options;
    this.initializeLoadingStates();
  }

  private initializeLoadingStates() {
    this.manifest.assets.forEach(asset => {
      this.loadingStates.set(asset.id, {
        isLoaded: false,
        isLoading: false,
        progress: 0,
      });
    });
  }

  // Get asset by ID
  getAsset(id: string): AssetEntry | undefined {
    return this.manifest.assets.find(asset => asset.id === id);
  }

  // Get assets by category
  getAssetsByCategory(categoryId: string): AssetEntry[] {
    return this.manifest.assets.filter(asset => asset.category === categoryId);
  }

  // Get assets by type
  getAssetsByType(type: AssetEntry['type']): AssetEntry[] {
    return this.manifest.assets.filter(asset => asset.type === type);
  }

  // Get assets by quality
  getAssetsByQuality(quality: AssetEntry['quality']): AssetEntry[] {
    return this.manifest.assets.filter(asset => asset.quality === quality);
  }

  // Search assets
  searchAssets(query: string, filters?: {
    type?: AssetEntry['type'];
    category?: string;
    quality?: AssetEntry['quality'];
    tags?: string[];
  }): AssetEntry[] {
    return this.manifest.assets.filter(asset => {
      const matchesQuery = query === '' || 
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesType = !filters?.type || asset.type === filters.type;
      const matchesCategory = !filters?.category || asset.category === filters.category;
      const matchesQuality = !filters?.quality || asset.quality === filters.quality;
      const matchesTags = !filters?.tags || 
        filters.tags.some(filterTag => asset.tags.includes(filterTag));

      return matchesQuery && matchesType && matchesCategory && matchesQuality && matchesTags;
    });
  }

  // Load asset
  async loadAsset(id: string): Promise<any> {
    const asset = this.getAsset(id);
    if (!asset) {
      throw new Error(`Asset with ID ${id} not found`);
    }

    // Return cached asset if available
    if (this.loadedAssets.has(id)) {
      return this.loadedAssets.get(id);
    }

    // Check if already loading
    if (this.activeLoads.has(id)) {
      return this.waitForAsset(id);
    }

    // Add to loading queue
    this.loadingQueue.push(id);
    this.processLoadingQueue();

    return this.waitForAsset(id);
  }

  private async processLoadingQueue() {
    while (this.loadingQueue.length > 0 && this.activeLoads.size < this.options.maxConcurrent) {
      const assetId = this.loadingQueue.shift();
      if (assetId) {
        this.loadAssetInternal(assetId);
      }
    }
  }

  private async loadAssetInternal(id: string) {
    const asset = this.getAsset(id);
    if (!asset) return;

    this.activeLoads.add(id);
    this.updateLoadingState(id, { isLoading: true, progress: 0 });

    try {
      const startTime = performance.now();
      let loadedAsset: any;

      // Load based on asset type
      switch (asset.type) {
        case 'model':
          loadedAsset = await this.loadModel(asset);
          break;
        case 'texture':
          loadedAsset = await this.loadTexture(asset);
          break;
        case 'animation':
          loadedAsset = await this.loadAnimation(asset);
          break;
        case 'audio':
          loadedAsset = await this.loadAudio(asset);
          break;
        case 'environment':
          loadedAsset = await this.loadEnvironment(asset);
          break;
        default:
          throw new Error(`Unsupported asset type: ${asset.type}`);
      }

      const loadTime = performance.now() - startTime;
      
      // Cache the loaded asset
      this.loadedAssets.set(id, loadedAsset);
      
      // Update loading state
      this.updateLoadingState(id, {
        isLoaded: true,
        isLoading: false,
        progress: 100,
        loadedAt: new Date().toISOString(),
        loadTime,
      });

    } catch (error) {
      this.updateLoadingState(id, {
        isLoaded: false,
        isLoading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.activeLoads.delete(id);
      this.processLoadingQueue();
    }
  }

  private async loadModel(_asset: AssetEntry): Promise<GLTF> {
    // This would integrate with the ModelLoader
    console.warn('Model loading would be implemented here');
    return {} as GLTF;
  }

  private async loadTexture(asset: AssetEntry): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        asset.url,
        (_texture) => {
          _texture.name = asset.name;
          resolve(_texture);
        },
        undefined,
        reject
      );
    });
  }

  private async loadAnimation(_asset: AssetEntry): Promise<THREE.AnimationClip> {
    // Animation loading would be implemented here
    console.warn('Animation loading would be implemented here');
    return {} as THREE.AnimationClip;
  }

  private async loadAudio(_asset: AssetEntry): Promise<AudioBuffer> {
    // Audio loading would be implemented here
    console.warn('Audio loading would be implemented here');
    return {} as AudioBuffer;
  }

  private async loadEnvironment(_asset: AssetEntry): Promise<THREE.CubeTexture> {
    // Environment loading would be implemented here
    console.warn('Environment loading would be implemented here');
    return {} as THREE.CubeTexture;
  }

  private async waitForAsset(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkAsset = () => {
        const state = this.loadingStates.get(id);
        if (!state) {
          reject(new Error(`Asset ${id} not found`));
          return;
        }

        if (state.isLoaded) {
          resolve(this.loadedAssets.get(id));
        } else if (state.error) {
          reject(new Error(state.error));
        } else {
          setTimeout(checkAsset, 100);
        }
      };
      checkAsset();
    });
  }

  private updateLoadingState(id: string, updates: Partial<AssetLoadingState>) {
    const currentState = this.loadingStates.get(id) || {
      isLoaded: false,
      isLoading: false,
      progress: 0,
    };
    this.loadingStates.set(id, { ...currentState, ...updates });
  }

  // Get loading progress for all assets
  getLoadingProgress(): { loaded: number; total: number; progress: number } {
    const total = this.manifest.assets.length;
    const loaded = Array.from(this.loadingStates.values()).filter(state => state.isLoaded).length;
    const progress = total > 0 ? (loaded / total) * 100 : 0;
    
    return { loaded, total, progress };
  }

  // Get loading state for specific asset
  getAssetLoadingState(id: string): AssetLoadingState | undefined {
    return this.loadingStates.get(id);
  }

  // Preload assets by category
  async preloadCategory(categoryId: string): Promise<void> {
    const assets = this.getAssetsByCategory(categoryId);
    const loadPromises = assets.map(asset => this.loadAsset(asset.id));
    await Promise.all(loadPromises);
  }

  // Preload assets by quality
  async preloadQuality(quality: AssetEntry['quality']): Promise<void> {
    const assets = this.getAssetsByQuality(quality);
    const loadPromises = assets.map(asset => this.loadAsset(asset.id));
    await Promise.all(loadPromises);
  }

  // Clear cache
  clearCache(): void {
    this.loadedAssets.clear();
    this.loadingStates.forEach((state, id) => {
      this.loadingStates.set(id, {
        isLoaded: false,
        isLoading: false,
        progress: 0,
      });
    });
  }

  // Dispose of loaded assets
  dispose(): void {
    this.loadedAssets.forEach(asset => {
      if (asset && typeof asset.dispose === 'function') {
        asset.dispose();
      }
    });
    this.loadedAssets.clear();
    this.loadingStates.clear();
    this.loadingQueue = [];
    this.activeLoads.clear();
  }
}

// Default asset manifest
export const DEFAULT_ASSET_MANIFEST: AssetManifest = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  assets: [],
  categories: [
    {
      id: 'heads',
      name: 'Heads',
      description: 'Character head models',
      icon: '👤',
      color: '#ec4899',
      assets: [],
    },
    {
      id: 'bodies',
      name: 'Bodies',
      description: 'Character body models',
      icon: '👗',
      color: '#8b5cf6',
      assets: [],
    },
    {
      id: 'clothing',
      name: 'Clothing',
      description: 'Clothing and accessories',
      icon: '👕',
      color: '#06b6d4',
      assets: [],
    },
    {
      id: 'textures',
      name: 'Textures',
      description: 'Material textures',
      icon: '🎨',
      color: '#10b981',
      assets: [],
    },
    {
      id: 'animations',
      name: 'Animations',
      description: 'Character animations',
      icon: '🎬',
      color: '#f59e0b',
      assets: [],
    },
    {
      id: 'environments',
      name: 'Environments',
      description: 'Background environments',
      icon: '🌍',
      color: '#84cc16',
      assets: [],
    },
  ],
  metadata: {
    totalAssets: 0,
    totalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    supportedFormats: ['glb', 'gltf', 'png', 'jpg', 'webp', 'ktx2', 'mp3', 'wav'],
    qualityLevels: ['low', 'medium', 'high', 'ultra'],
  },
};

export const assetManifestManager = new AssetManifestManager(DEFAULT_ASSET_MANIFEST);
