/**
 * Morph Target System
 * Generates and applies morph targets for facial expressions and body customization
 * Code Vein / Nikke quality morph target support
 */

import * as THREE from 'three';

export interface MorphTargetDefinition {
  name: string;
  category: 'face' | 'body' | 'expression' | 'anatomy';
  min: number;
  max: number;
  defaultValue: number;
  apply: (geometry: THREE.BufferGeometry, value: number, config?: any) => void;
}

// Custom morph target type for our system
interface CustomMorphTarget {
  name: string;
  positions: Float32Array;
}

export interface MorphTargetConfig {
  // Face morphs
  eyeSize?: number; // 0.5 to 1.5
  eyeSpacing?: number; // 0.0 to 1.0
  eyeHeight?: number; // 0.0 to 1.0
  jawline?: number; // 0.0 to 1.0
  cheekbones?: number; // 0.0 to 1.0
  chin?: number; // 0.0 to 1.0
  noseSize?: number; // 0.5 to 1.5
  mouthSize?: number; // 0.5 to 1.5
  lipThickness?: number; // 0.0 to 1.0

  // Expressions
  smile?: number; // 0.0 to 1.0
  frown?: number; // 0.0 to 1.0
  surprise?: number; // 0.0 to 1.0
  wink?: number; // 0.0 to 1.0
  eyeBlink?: number; // 0.0 to 1.0

  // Body morphs
  height?: number; // 0.7 to 1.3
  muscleMass?: number; // 0.0 to 1.0
  bodyFat?: number; // 0.0 to 1.0
  shoulderWidth?: number; // 0.7 to 1.4
  chestSize?: number; // 0.6 to 1.8
  waistSize?: number; // 0.6 to 1.3
  hipWidth?: number; // 0.7 to 1.4
  thighThickness?: number; // 0.7 to 1.5
  armThickness?: number; // 0.7 to 1.3
  legThickness?: number; // 0.7 to 1.3

  // Gender-specific
  breastSize?: number; // 0.5 to 2.5
  breastSeparation?: number; // -0.5 to 0.5
  thighGap?: number; // 0.0 to 1.0
}

export class MorphTargetSystem {
  /**
   * Create morph targets for a geometry
   */
  static createMorphTargets(
    geometry: THREE.BufferGeometry,
    config: MorphTargetConfig,
    partType: 'head' | 'torso' | 'limb' = 'head',
  ): CustomMorphTarget[] {
    const morphTargets: CustomMorphTarget[] = [];

    if (partType === 'head') {
      // Face shape morphs
      if (config.eyeSize !== undefined) {
        morphTargets.push(
          this.createEyeSizeMorph(geometry, config.eyeSize),
        );
      }
      if (config.eyeSpacing !== undefined) {
        morphTargets.push(
          this.createEyeSpacingMorph(geometry, config.eyeSpacing),
        );
      }
      if (config.jawline !== undefined) {
        morphTargets.push(
          this.createJawlineMorph(geometry, config.jawline),
        );
      }
      if (config.cheekbones !== undefined) {
        morphTargets.push(
          this.createCheekbonesMorph(geometry, config.cheekbones),
        );
      }
      if (config.chin !== undefined) {
        morphTargets.push(
          this.createChinMorph(geometry, config.chin),
        );
      }
      if (config.noseSize !== undefined) {
        morphTargets.push(
          this.createNoseSizeMorph(geometry, config.noseSize),
        );
      }
      if (config.mouthSize !== undefined) {
        morphTargets.push(
          this.createMouthSizeMorph(geometry, config.mouthSize),
        );
      }
      if (config.lipThickness !== undefined) {
        morphTargets.push(
          this.createLipThicknessMorph(geometry, config.lipThickness),
        );
      }

      // Expression morphs
      if (config.smile !== undefined) {
        morphTargets.push(
          this.createSmileMorph(geometry, config.smile),
        );
      }
      if (config.frown !== undefined) {
        morphTargets.push(
          this.createFrownMorph(geometry, config.frown),
        );
      }
      if (config.surprise !== undefined) {
        morphTargets.push(
          this.createSurpriseMorph(geometry, config.surprise),
        );
      }
      if (config.wink !== undefined) {
        morphTargets.push(
          this.createWinkMorph(geometry, config.wink),
        );
      }
      if (config.eyeBlink !== undefined) {
        morphTargets.push(
          this.createEyeBlinkMorph(geometry, config.eyeBlink),
        );
      }
    } else if (partType === 'torso') {
      // Body shape morphs
      if (config.muscleMass !== undefined) {
        morphTargets.push(
          this.createMuscleMassMorph(geometry, config.muscleMass),
        );
      }
      if (config.bodyFat !== undefined) {
        morphTargets.push(
          this.createBodyFatMorph(geometry, config.bodyFat),
        );
      }
      if (config.shoulderWidth !== undefined) {
        morphTargets.push(
          this.createShoulderWidthMorph(geometry, config.shoulderWidth),
        );
      }
      if (config.chestSize !== undefined) {
        morphTargets.push(
          this.createChestSizeMorph(geometry, config.chestSize),
        );
      }
      if (config.waistSize !== undefined) {
        morphTargets.push(
          this.createWaistSizeMorph(geometry, config.waistSize),
        );
      }
      if (config.hipWidth !== undefined) {
        morphTargets.push(
          this.createHipWidthMorph(geometry, config.hipWidth),
        );
      }
      if (config.breastSize !== undefined) {
        morphTargets.push(
          this.createBreastSizeMorph(geometry, config.breastSize, config.breastSeparation || 0),
        );
      }
    } else if (partType === 'limb') {
      // Limb morphs
      if (config.armThickness !== undefined) {
        morphTargets.push(
          this.createArmThicknessMorph(geometry, config.armThickness),
        );
      }
      if (config.legThickness !== undefined) {
        morphTargets.push(
          this.createLegThicknessMorph(geometry, config.legThickness),
        );
      }
      if (config.thighThickness !== undefined) {
        morphTargets.push(
          this.createThighThicknessMorph(geometry, config.thighThickness),
        );
      }
    }

    return morphTargets;
  }

  /**
   * Apply morph targets to a mesh
   */
  static applyMorphTargets(
    mesh: THREE.Mesh,
    morphTargets: CustomMorphTarget[],
    config: MorphTargetConfig,
  ): void {
    if (morphTargets.length === 0) {
      return;
    }

    // Initialize morph attributes if they don't exist
    if (!mesh.geometry.morphAttributes) {
      mesh.geometry.morphAttributes = {};
    }
    if (!mesh.geometry.morphAttributes.position) {
      mesh.geometry.morphAttributes.position = [];
    }

    // Add morph targets to geometry
    morphTargets.forEach((morphTarget) => {
      // Use the pre-calculated positions from the morph target
      const morphAttribute = new THREE.BufferAttribute(morphTarget.positions, 3);
      mesh.geometry.morphAttributes.position!.push(morphAttribute);
    });

    // Update morph target dictionary
    if (!mesh.geometry.morphTargetsRelative) {
      mesh.geometry.morphTargetsRelative = false;
    }

    // Update mesh
    mesh.updateMorphTargets();
  }

  // Face morph target creators
  private static createEyeSizeMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Eye region (approximate)
      const eyeY = y - 1.4;
      const eyeZ = Math.abs(z) - 0.05;
      if (Math.abs(eyeY) < 0.15 && eyeZ < 0.1) {
        // Scale eyes horizontally and vertically
        const scale = (value - 1.0) * 0.3;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y * (1 + scale * 0.5);
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'eyeSize',
      positions: morphPositions,
    };
  }

  private static createEyeSpacingMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Eye region
      const eyeY = y - 1.4;
      const eyeZ = Math.abs(z) - 0.05;
      if (Math.abs(eyeY) < 0.15 && eyeZ < 0.1) {
        // Move eyes horizontally
        const offset = (value - 0.5) * 0.1;
        morphPositions[i * 3] = x + (x > 0 ? offset : -offset);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'eyeSpacing',
      positions: morphPositions,
    };
  }

  private static createJawlineMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Jaw region
      const jawY = y - 1.2;
      if (jawY < 0 && jawY > -0.2) {
        // Sharpen or soften jawline
        const scale = (value - 0.5) * 0.2;
        morphPositions[i * 3] = x * (1 + scale * Math.abs(x));
        morphPositions[i * 3 + 1] = y + scale * 0.05;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'jawline',
      positions: morphPositions,
    };
  }

  private static createCheekbonesMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Cheekbone region
      const cheekY = y - 1.3;
      const cheekX = Math.abs(x) - 0.08;
      if (Math.abs(cheekY) < 0.1 && cheekX < 0.05) {
        // Raise or lower cheekbones
        const offset = (value - 0.5) * 0.1;
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y + offset;
        morphPositions[i * 3 + 2] = z + offset * 0.5;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'cheekbones',
      positions: morphPositions,
    };
  }

  private static createChinMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Chin region
      const chinY = y - 1.15;
      if (chinY < 0 && Math.abs(x) < 0.1) {
        // Extend or retract chin
        const offset = (value - 0.5) * 0.15;
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y + offset;
        morphPositions[i * 3 + 2] = z + offset * 0.3;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'chin',
      positions: morphPositions,
    };
  }

  private static createNoseSizeMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Nose region
      const noseY = y - 1.35;
      const noseZ = z - 0.08;
      if (Math.abs(noseY) < 0.1 && Math.abs(x) < 0.05 && noseZ > 0) {
        // Scale nose
        const scale = (value - 1.0) * 0.3;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y * (1 + scale);
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'noseSize',
      positions: morphPositions,
    };
  }

  private static createMouthSizeMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Mouth region
      const mouthY = y - 1.25;
      if (Math.abs(mouthY) < 0.05 && Math.abs(x) < 0.1) {
        // Scale mouth horizontally
        const scale = (value - 1.0) * 0.4;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'mouthSize',
      positions: morphPositions,
    };
  }

  private static createLipThicknessMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Lip region
      const lipY = y - 1.25;
      if (Math.abs(lipY) < 0.03 && Math.abs(x) < 0.1) {
        // Extend lips forward
        const offset = value * 0.05;
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z + offset;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'lipThickness',
      positions: morphPositions,
    };
  }

  // Expression morphs
  private static createSmileMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Mouth region
      const mouthY = y - 1.25;
      if (Math.abs(mouthY) < 0.05 && Math.abs(x) < 0.1) {
        // Curve mouth upward
        const curve = value * 0.1 * (1 - Math.abs(x) * 5);
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y + curve;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'smile',
      positions: morphPositions,
    };
  }

  private static createFrownMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Mouth region
      const mouthY = y - 1.25;
      if (Math.abs(mouthY) < 0.05 && Math.abs(x) < 0.1) {
        // Curve mouth downward
        const curve = -value * 0.1 * (1 - Math.abs(x) * 5);
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y + curve;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'frown',
      positions: morphPositions,
    };
  }

  private static createSurpriseMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Eye and mouth region
      const eyeY = y - 1.4;
      const mouthY = y - 1.25;
      if ((Math.abs(eyeY) < 0.15 && Math.abs(x) < 0.1) || (Math.abs(mouthY) < 0.05 && Math.abs(x) < 0.1)) {
        // Widen eyes and open mouth
        const eyeScale = value * 0.2;
        const mouthOffset = value * 0.1;
        morphPositions[i * 3] = x * (1 + eyeScale);
        morphPositions[i * 3 + 1] = y + (Math.abs(mouthY) < 0.05 ? mouthOffset : 0);
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'surprise',
      positions: morphPositions,
    };
  }

  private static createWinkMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Right eye region (wink right eye)
      const eyeY = y - 1.4;
      const eyeZ = Math.abs(z) - 0.05;
      if (Math.abs(eyeY) < 0.15 && eyeZ < 0.1 && x > 0) {
        // Close right eye
        const close = value * 0.15;
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y - close;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'wink',
      positions: morphPositions,
    };
  }

  private static createEyeBlinkMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Eye region
      const eyeY = y - 1.4;
      const eyeZ = Math.abs(z) - 0.05;
      if (Math.abs(eyeY) < 0.15 && eyeZ < 0.1) {
        // Close eyes
        const close = value * 0.15;
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y - close;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'eyeBlink',
      positions: morphPositions,
    };
  }

  // Body morph target creators
  private static createMuscleMassMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Torso region
      const torsoY = y - 1.0;
      if (torsoY > -0.5 && torsoY < 0.5) {
        // Increase muscle definition
        const scale = value * 0.15;
        morphPositions[i * 3] = x * (1 + scale * Math.abs(x));
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'muscleMass',
      positions: morphPositions,
    };
  }

  private static createBodyFatMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Body region
      const bodyY = y - 0.5;
      if (bodyY > -1.0 && bodyY < 0.5) {
        // Increase body fat
        const scale = value * 0.2;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'bodyFat',
      positions: morphPositions,
    };
  }

  private static createShoulderWidthMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Shoulder region
      const shoulderY = y - 1.2;
      if (Math.abs(shoulderY) < 0.2 && Math.abs(x) > 0.15) {
        // Scale shoulders horizontally
        const scale = (value - 1.0) * 0.3;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'shoulderWidth',
      positions: morphPositions,
    };
  }

  private static createChestSizeMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Chest region
      const chestY = y - 1.1;
      if (Math.abs(chestY) < 0.2 && Math.abs(x) < 0.2) {
        // Scale chest forward
        const scale = (value - 1.0) * 0.4;
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'chestSize',
      positions: morphPositions,
    };
  }

  private static createWaistSizeMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Waist region
      const waistY = y - 0.9;
      if (Math.abs(waistY) < 0.15) {
        // Scale waist
        const scale = (value - 1.0) * 0.3;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'waistSize',
      positions: morphPositions,
    };
  }

  private static createHipWidthMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Hip region
      const hipY = y - 0.75;
      if (Math.abs(hipY) < 0.15 && Math.abs(x) > 0.1) {
        // Scale hips horizontally
        const scale = (value - 1.0) * 0.3;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'hipWidth',
      positions: morphPositions,
    };
  }

  private static createBreastSizeMorph(
    geometry: THREE.BufferGeometry,
    value: number,
    separation: number = 0,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Chest region (breast area)
      const chestY = y - 1.0;
      const chestX = Math.abs(x) - 0.1;
      if (Math.abs(chestY) < 0.2 && chestX < 0.15 && z > 0) {
        // Scale breasts forward and adjust separation
        const scale = (value - 1.0) * 0.5;
        const sepOffset = separation * 0.1;
        morphPositions[i * 3] = x + (x > 0 ? sepOffset : -sepOffset);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'breastSize',
      positions: morphPositions,
    };
  }

  private static createArmThicknessMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Arm region
      const armDist = Math.sqrt(x * x + z * z);
      if (armDist > 0.05 && armDist < 0.15) {
        // Scale arm thickness
        const scale = (value - 1.0) * 0.3;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'armThickness',
      positions: morphPositions,
    };
  }

  private static createLegThicknessMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Leg region
      const legY = y + 0.5;
      const legDist = Math.sqrt(x * x + z * z);
      if (legY < 0 && legDist > 0.05 && legDist < 0.15) {
        // Scale leg thickness
        const scale = (value - 1.0) * 0.3;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'legThickness',
      positions: morphPositions,
    };
  }

  private static createThighThicknessMorph(
    geometry: THREE.BufferGeometry,
    value: number,
  ): CustomMorphTarget {
    const positions = geometry.attributes.position;
    const morphPositions = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Thigh region
      const thighY = y + 0.2;
      const thighDist = Math.sqrt(x * x + z * z);
      if (thighY < 0.3 && thighDist > 0.06 && thighDist < 0.18) {
        // Scale thigh thickness
        const scale = (value - 1.0) * 0.4;
        morphPositions[i * 3] = x * (1 + scale);
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z * (1 + scale);
      } else {
        morphPositions[i * 3] = x;
        morphPositions[i * 3 + 1] = y;
        morphPositions[i * 3 + 2] = z;
      }
    }

    return {
      name: 'thighThickness',
      positions: morphPositions,
    };
  }

}

