/**
 * NSFW Layer Material
 * Only used if NSFW_AVATARS_ENABLED = true
 * Separate layer group, decoupled from base body models
 */

import * as THREE from 'three';
import { isNsfwAvatarsEnabled } from '../config/flags';
import { createCelShadedMaterial } from './celShaded';

export interface NsfwLayerMaterialOptions {
  baseColor: THREE.Color | string | number;
  rimColor?: THREE.Color | string | number;
}

/**
 * Create NSFW layer material
 * Only creates material if NSFW_AVATARS_ENABLED = true
 * Uses same procedural pipeline as base materials
 */
export function nsfwLayerMaterial(options: NsfwLayerMaterialOptions): THREE.ShaderMaterial | null {
  // Check flag first
  if (!isNsfwAvatarsEnabled()) {
    return null; // Don't create material if flag is disabled
  }

  const baseColor =
    options.baseColor instanceof THREE.Color
      ? options.baseColor
      : new THREE.Color(options.baseColor);
  const rimColor =
    options.rimColor instanceof THREE.Color
      ? new THREE.Color(options.rimColor)
      : new THREE.Color(options.rimColor || 0xffffff);

  // Use same cel-shaded pipeline as base materials
  return createCelShadedMaterial({
    baseColor,
    rimColor,
    rimPower: 3.0,
    smoothness: 0.1,
    toonSteps: 4,
  });
}

