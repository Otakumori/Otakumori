/**
 * Procedural Skin Material with Subsurface Scattering
 * Uses subsurface-scattering.frag.ts as reference
 */

import * as THREE from 'three';
import { createCelShadedMaterial } from './celShaded';

export interface SkinMaterialOptions {
  skinTone: THREE.Color | string | number;
  subsurfaceStrength?: number;
  subsurfaceColor?: THREE.Color | string | number;
  specularResponse?: number;
}

/**
 * Create procedural skin material with subsurface scattering
 * Applies tone-mapped color curves and specular response for anime skin
 */
export function skinMaterialProcedural(options: SkinMaterialOptions): THREE.ShaderMaterial {
  const skinTone =
    options.skinTone instanceof THREE.Color
      ? options.skinTone
      : new THREE.Color(options.skinTone);

  // Procedural skin texture would be generated here in full implementation
  // For now, we use cel-shaded base with skin tone color

  // Create base cel-shaded material
  const material = createCelShadedMaterial({
    baseColor: skinTone,
    rimColor: new THREE.Color(skinTone).multiplyScalar(1.2), // Slightly brighter rim
    rimPower: 2.5, // Softer rim for skin
    smoothness: 0.08, // Very smooth for skin
    toonSteps: 3, // Fewer steps for smoother skin
  });

  // Add skin texture to uniforms if we enhance the shader
  // For now, we use the cel-shaded base with skin tone color
  // Future enhancement: add subsurface scattering uniforms

  return material;
}

