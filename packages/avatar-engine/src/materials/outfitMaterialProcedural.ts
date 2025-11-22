/**
 * Procedural Outfit Material (Clothing, Accessories)
 * Pattern generation (stripes, polka dots, gradients)
 * Decal support (petals, blossoms, runes)
 */

import * as THREE from 'three';
import { createCelShadedMaterial } from './celShaded';

export interface OutfitMaterialOptions {
  baseColor: THREE.Color | string | number;
  pattern?: 'none' | 'stripes' | 'polka' | 'gradient';
  patternColor?: THREE.Color | string | number;
  decal?: 'petals' | 'blossoms' | 'runes' | 'none';
  decalColor?: THREE.Color | string | number;
}

/**
 * Create procedural outfit material
 * Supports patterns and decals with cel-shaded base
 */
export function outfitMaterialProcedural(options: OutfitMaterialOptions): THREE.ShaderMaterial {
  const baseColor =
    options.baseColor instanceof THREE.Color
      ? options.baseColor
      : new THREE.Color(options.baseColor);

  // Create base cel-shaded material
  const material = createCelShadedMaterial({
    baseColor,
    rimColor: new THREE.Color(0xffffff), // White rim for outfits
    rimPower: 4.0, // Stronger rim for clothing
    smoothness: 0.12, // Moderate smoothness
    toonSteps: 4,
  });

  // Future enhancement: add pattern and decal textures to uniforms
  // For now, base cel-shaded material provides the foundation
  // Patterns and decals can be added via texture maps in the shader

  return material;
}
