/**
 * Anime-style Toon Material Builder
 * Uses existing anime-shader.ts as base with rim lighting and bloom support
 */

import * as THREE from 'three';
import { createCelShadedMaterial } from './celShaded';

export interface AnimeToonMaterialOptions {
  baseColor: THREE.Color | string | number;
  rimColor?: THREE.Color | string | number;
  rimPower?: number;
  smoothness?: number;
  toonSteps?: number;
}

/**
 * Create anime-style toon shader material
 * Enhanced version of app/lib/3d/shaders/anime-shader.ts
 */
export function animeToonMaterial(options: AnimeToonMaterialOptions): THREE.ShaderMaterial {
  return createCelShadedMaterial({
    baseColor: options.baseColor,
    rimColor: options.rimColor ?? 0xffffff,
    rimPower: options.rimPower ?? 3.0,
    smoothness: options.smoothness ?? 0.1,
    toonSteps: options.toonSteps ?? 4,
  });
}
