/**
 * Asset Registry System
 * Maps character configuration to GLB assets (hair, clothing, body parts)
 * Supports both pre-made assets and procedural generation fallbacks
 */

import { modelLoader, ModelUtils } from './model-loader';
import type { OptimizedModel } from './model-loader';

export interface AssetMapping {
  id: string;
  type: 'hair' | 'clothing' | 'body' | 'accessory';
  gender?: 'male' | 'female';
  glbPath?: string;
  procedural?: boolean;
  category?: string;
  tags?: string[];
}

export interface AssetRegistryEntry {
  mapping: AssetMapping;
  model?: OptimizedModel;
  loaded: boolean;
  loading: boolean;
  error?: Error;
}

export class AssetRegistry {
  private registry: Map<string, AssetRegistryEntry> = new Map();
  private assetMappings: AssetMapping[] = [];

  constructor() {
    this.initializeDefaultMappings();
  }

  /**
   * Initialize default asset mappings
   */
  private initializeDefaultMappings(): void {
    // Hair assets
    this.assetMappings = [
      // Male hair
      {
        id: 'male_hair_01',
        type: 'hair',
        gender: 'male',
        glbPath: '/assets/models/hair/male-hair-01.glb',
        category: 'short',
        tags: ['spiky', 'modern'],
      },
      {
        id: 'male_hair_02',
        type: 'hair',
        gender: 'male',
        glbPath: '/assets/models/hair/male-hair-02.glb',
        category: 'medium',
        tags: ['wavy', 'casual'],
      },
      {
        id: 'male_hair_collection',
        type: 'hair',
        gender: 'male',
        glbPath: '/New/free_male_fashion_hair_collection_01_lowpoly.glb',
        category: 'collection',
        tags: ['multiple', 'fashion'],
      },
      // Female hair
      {
        id: 'female_hair_01',
        type: 'hair',
        gender: 'female',
        glbPath: '/assets/models/hair/female-hair-01.glb',
        category: 'long',
        tags: ['straight', 'elegant'],
      },
      {
        id: 'female_hair_collection',
        type: 'hair',
        gender: 'female',
        glbPath: '/New/12_real_time_woman_hairstyles_collection_09.glb',
        category: 'collection',
        tags: ['multiple', 'real-time'],
      },
      // Clothing assets
      {
        id: 'male_shirt_baselayer',
        type: 'clothing',
        gender: 'male',
        glbPath: '/New/baselayer_shirt_men.glb',
        category: 'shirt',
        tags: ['casual', 'baselayer'],
      },
      {
        id: 'female_skirt_pleats',
        type: 'clothing',
        gender: 'female',
        glbPath: '/New/womens_pleats_skirt_obj/Women\'s Pleats Skirt OBJ.obj',
        category: 'skirt',
        tags: ['pleated', 'formal'],
      },
      {
        id: 'underwear_basic',
        type: 'clothing',
        glbPath: '/New/basic_underwear_02_fbx.glb',
        category: 'underwear',
        tags: ['basic'],
      },
      {
        id: 'jeans_denim',
        type: 'clothing',
        glbPath: '/New/denim_mom_jean.glb',
        category: 'pants',
        tags: ['denim', 'casual'],
      },
      // Body assets
      {
        id: 'male_body_base',
        type: 'body',
        gender: 'male',
        glbPath: '/assets/models/avatar-base/male-body.glb',
        procedural: false,
        category: 'base',
      },
      {
        id: 'female_body_base',
        type: 'body',
        gender: 'female',
        glbPath: '/assets/models/avatar-base/female-body.glb',
        procedural: false,
        category: 'base',
      },
    ];
  }

  /**
   * Register an asset mapping
   */
  registerAsset(mapping: AssetMapping): void {
    this.assetMappings.push(mapping);
  }

  /**
   * Find asset by ID
   */
  findAsset(id: string): AssetMapping | undefined {
    return this.assetMappings.find((m) => m.id === id);
  }

  /**
   * Find assets by type and gender
   */
  findAssetsByType(
    type: AssetMapping['type'],
    gender?: 'male' | 'female',
  ): AssetMapping[] {
    return this.assetMappings.filter(
      (m) => m.type === type && (!gender || m.gender === gender || !m.gender),
    );
  }

  /**
   * Load an asset by ID
   */
  async loadAsset(id: string): Promise<OptimizedModel | null> {
    const mapping = this.findAsset(id);
    if (!mapping) {
      console.warn(`[AssetRegistry] Asset not found: ${id}`);
      return null;
    }

    // Check if already loaded
    const entry = this.registry.get(id);
    if (entry?.loaded && entry.model) {
      return entry.model;
    }

    // Check if currently loading
    if (entry?.loading) {
      // Wait for loading to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const currentEntry = this.registry.get(id);
          if (currentEntry?.loaded && currentEntry.model) {
            clearInterval(checkInterval);
            resolve(currentEntry.model);
          } else if (currentEntry?.error) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
      });
    }

    // Start loading
    if (!entry) {
      this.registry.set(id, {
        mapping,
        loaded: false,
        loading: true,
      });
    } else {
      entry.loading = true;
    }

    try {
      let model: OptimizedModel | null = null;

      if (mapping.glbPath && !mapping.procedural) {
        // Load GLB asset
        if (mapping.type === 'body') {
          model = await ModelUtils.loadAvatarBase(
            mapping.gender || 'female',
            {
              useDraco: true,
              generateLOD: true,
              validateBones: true,
            },
          );
        } else if (mapping.type === 'hair') {
          model = await ModelUtils.loadAvatarPart(id, {
            useDraco: true,
            generateLOD: true,
            targetTriangles: 10000,
          });
        } else {
          // Generic model load
          model = await modelLoader.loadModel(mapping.glbPath, {
            useDraco: true,
            generateLOD: true,
            targetTriangles: 15000,
          });
        }
      }

      // Update registry
      const updatedEntry = this.registry.get(id);
      if (updatedEntry) {
        updatedEntry.model = model || undefined;
        updatedEntry.loaded = true;
        updatedEntry.loading = false;
      }

      return model;
    } catch (error) {
      console.error(`[AssetRegistry] Failed to load asset ${id}:`, error);
      const updatedEntry = this.registry.get(id);
      if (updatedEntry) {
        updatedEntry.error = error instanceof Error ? error : new Error(String(error));
        updatedEntry.loaded = false;
        updatedEntry.loading = false;
      }
      return null;
    }
  }

  /**
   * Get asset entry
   */
  getAssetEntry(id: string): AssetRegistryEntry | undefined {
    return this.registry.get(id);
  }

  /**
   * Preload assets by type
   */
  async preloadAssets(
    type: AssetMapping['type'],
    gender?: 'male' | 'female',
  ): Promise<void> {
    const assets = this.findAssetsByType(type, gender);
    await Promise.all(assets.map((asset) => this.loadAsset(asset.id)));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.registry.clear();
  }
}

// Singleton instance
export const assetRegistry = new AssetRegistry();

