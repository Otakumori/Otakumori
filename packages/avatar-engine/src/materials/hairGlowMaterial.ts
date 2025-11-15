/**
 * Hair Material with Thin-Film Highlight Simulation
 * Uses hair-anisotropic.frag.ts as reference
 */

import * as THREE from 'three';
import { createCelShadedMaterial } from './celShaded';

export interface HairGlowMaterialOptions {
  hairColor: THREE.Color | string | number;
  highlightColor?: THREE.Color | string | number;
  anisotropy?: number;
}

/**
 * Create hair material with thin-film highlight simulation
 * Anisotropic highlights for hair strands with color palette support
 */
export function hairGlowMaterial(options: HairGlowMaterialOptions): THREE.ShaderMaterial {
  const hairColor =
    options.hairColor instanceof THREE.Color
      ? options.hairColor
      : new THREE.Color(options.hairColor);
  const highlightColor =
    options.highlightColor instanceof THREE.Color
      ? new THREE.Color(options.highlightColor)
      : new THREE.Color(options.highlightColor || hairColor.clone().multiplyScalar(1.3));

  // Hair uses cel-shaded base with enhanced rim for highlights
  const material = createCelShadedMaterial({
    baseColor: hairColor,
    rimColor: highlightColor, // Thin-film highlight via rim
    rimPower: 2.0, // Stronger rim for hair highlights
    smoothness: 0.15, // Moderate smoothness
    toonSteps: 4,
  });

  // Future enhancement: add anisotropic shader uniforms for true thin-film simulation
  // For now, rim lighting provides the highlight effect

  return material;
}

