/**
 * NSFW Layer System
 * Only loads when NSFW_AVATARS_ENABLED = true
 * Separate layer group, decoupled from base body models
 */

import * as THREE from 'three';
import type { AvatarProfile, AssetRegistry } from '../types/avatar';
import { isNsfwAvatarsEnabled } from '../config/flags';
import { nsfwLayerMaterial } from '../materials/nsfwLayerMaterial';
import { getAsset } from '../registry/loader';

/**
 * Create NSFW layers for avatar
 * Only runs if NSFW_AVATARS_ENABLED = true
 * Returns null if flag disabled
 */
export function createNSFWLayers(
  profile: AvatarProfile,
  registry: AssetRegistry,
): THREE.Group | null {
  // Check flag first
  if (!isNsfwAvatarsEnabled()) {
    return null; // Don't create layers if flag is disabled
  }

  // Check if profile has NSFW layers
  if (!profile.nsfwLayers || profile.nsfwLayers.length === 0) {
    return null; // No NSFW layers requested
  }

  // Create separate group for NSFW content
  const nsfwGroup = new THREE.Group();
  nsfwGroup.name = 'NSFWLayers';

  // Load NSFW layer assets
  for (const layerId of profile.nsfwLayers) {
    const layerAsset = getAsset(registry, layerId);
    if (!layerAsset) {
      // Asset not found, skip
      if (process.env.NODE_ENV === 'development') {
        console.warn(`NSFW layer asset not found: ${layerId}`);
      }
      continue;
    }

    // Create mesh for NSFW layer
    // In full implementation, we would load GLTF and attach to bones
    // For now, create placeholder mesh
    const nsfwMat = nsfwLayerMaterial({
      baseColor: profile.colorPalette.accent,
    });

    if (!nsfwMat) {
      // Material creation failed (flag disabled), skip
      continue;
    }

    const layerMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), nsfwMat);

    layerMesh.name = `NSFWLayer_${layerId}`;
    layerMesh.renderOrder = 1; // Render after base body
    nsfwGroup.add(layerMesh);
  }

  // Return group if it has children, otherwise null
  return nsfwGroup.children.length > 0 ? nsfwGroup : null;
}
