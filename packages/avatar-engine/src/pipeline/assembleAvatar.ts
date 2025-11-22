/**
 * Runtime Avatar Assembly Pipeline
 * Loads modular components, applies materials, assembles avatar
 */

import * as THREE from 'three';
import type { AvatarProfile, AssetRegistry } from '../types/avatar';
import { createNSFWLayers } from '../layers/nsfw';
import { generateFallbackAvatar } from './generateFallback';
import { getAsset } from '../registry/loader';

export interface AssembledAvatar {
  group: THREE.Group;
  materialAssignments: Map<string, THREE.Material>;
  colorPaletteApplied: boolean;
  nsfwLayerGroup: THREE.Group | null;
}

/**
 * Assemble avatar from profile and registry
 */
export async function assembleAvatar(
  profile: AvatarProfile,
  registry: AssetRegistry,
  options: {
    loadAssets?: boolean;
  } = {},
): Promise<AssembledAvatar> {
  const { loadAssets = true } = options;
  const assembled = new THREE.Group();
  assembled.name = `Avatar_${profile.id}`;

  const materialAssignments = new Map<string, THREE.Material>();
  let colorPaletteApplied = false;
  let nsfwLayerGroup: THREE.Group | null = null;

  // 1. Load modular components (head, torso, legs, accessories)
  const parts: Record<string, THREE.Object3D | null> = {
    head: null,
    torso: null,
    legs: null,
    accessory: null,
  };

  if (loadAssets) {
    // Try to load from registry
    // In full implementation, would load GLTF files here
    // For now, we use procedural fallback
    void getAsset(registry, profile.head);
    void getAsset(registry, profile.torso);
    void getAsset(registry, profile.legs);
    if (profile.accessory) {
      void getAsset(registry, profile.accessory);
    }
  }

  // If any parts are missing, generate procedural fallback
  const hasAllParts = Object.values(parts).every((part) => part !== null);
  if (!hasAllParts) {
    // Generate complete procedural avatar
    const fallbackBody = generateFallbackAvatar(profile);
    assembled.add(fallbackBody);
    colorPaletteApplied = true; // Fallback already applies palette
  } else {
    // Assemble from loaded parts
    // This would involve:
    // - Attaching parts to skeleton/rig
    // - Applying morph targets if present
    // - Positioning parts correctly
    // For now, we use fallback
    const fallbackBody = generateFallbackAvatar(profile);
    assembled.add(fallbackBody);
    colorPaletteApplied = true;
  }

  // 2. Apply procedural materials (already done in fallback, but would apply here for loaded assets)
  // Skin → skinMaterialProcedural()
  // Hair → hairGlowMaterial()
  // Outfit → outfitMaterialProcedural()

  // 3. Apply color palette
  // Recolor materials using palette texture
  // Adjust hue/saturation per component
  // (Already done in fallback generator)

  // 4. Assemble mesh hierarchy
  // Attach parts to skeleton/rig
  // Apply morph targets if present
  // (Handled in fallback generator)

  // 5. NSFW overlays (if enabled)
  nsfwLayerGroup = createNSFWLayers(profile, registry);
  if (nsfwLayerGroup) {
    assembled.add(nsfwLayerGroup);
  }

  return {
    group: assembled,
    materialAssignments,
    colorPaletteApplied,
    nsfwLayerGroup,
  };
}
