/**
 * Procedural Body Generation System
 * Generates 3D humanoid bodies from parametric inputs without requiring asset files
 */

import * as THREE from 'three';

export interface BodyParameters {
  // Base proportions
  height: number; // 0.7 to 1.3
  build: 'slim' | 'athletic' | 'curvy' | 'muscular';

  // Detailed sliders
  neckLength: number; // 0.7 to 1.3
  shoulderWidth: number; // 0.7 to 1.4
  chestSize: number; // 0.6 to 1.8
  waistSize: number; // 0.6 to 1.3
  hipWidth: number; // 0.7 to 1.4
  armLength: number; // 0.8 to 1.2
  legLength: number; // 0.8 to 1.3
  thighThickness: number; // 0.7 to 1.5
  muscleDefinition: number; // 0 to 2

  // NSFW anatomy (age-gated)
  breastSize?: number; // 0.5 to 2.5
  breastSeparation?: number; // -0.5 to 0.5
  breastShape?: number; // 0 to 1 (round to teardrop)
  buttockSize?: number; // 0.5 to 2.0
  buttockShape?: number; // -0.5 to 0.5
  anatomyDetail?: 'basic' | 'detailed' | 'explicit';
}

export const DEFAULT_BODY_PARAMS: BodyParameters = {
  height: 1.0,
  build: 'athletic',
  neckLength: 1.0,
  shoulderWidth: 1.0,
  chestSize: 1.0,
  waistSize: 0.8,
  hipWidth: 1.0,
  armLength: 1.0,
  legLength: 1.0,
  thighThickness: 1.0,
  muscleDefinition: 1.0,
  anatomyDetail: 'basic',
};

export class ProceduralBodyGenerator {
  /**
   * Generate a complete humanoid body from parameters
   */
  static generateBody(params: BodyParameters): THREE.Group {
    const body = new THREE.Group();
    body.name = 'ProceduralBody';

    // Generate body parts using primitives
    const torso = this.createTorso(params);
    const head = this.createHead(params);
    const neck = this.createNeck(params);
    const arms = this.createArms(params);
    const legs = this.createLegs(params);
    const hands = this.createHands(params);
    const feet = this.createFeet(params);

    // Position parts
    head.position.y = 0.5 * params.height + 0.1 * params.neckLength;
    neck.position.y = 0.45 * params.height;
    torso.position.y = 0.15 * params.height;
    arms.position.y = 0.35 * params.height;
    legs.position.y = -0.15 * params.height;
    hands.position.y = 0.05 * params.height;
    feet.position.y = -0.48 * params.height;

    body.add(torso, head, neck, arms, legs, hands, feet);

    return body;
  }

  /**
   * Create head geometry
   */
  private static createHead(params: BodyParameters): THREE.Mesh {
    const headSize = 0.12 * params.height;

    // Create head from sphere
    const geometry = new THREE.SphereGeometry(headSize, 32, 32);

    // Slightly elongate for anime proportions
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      positions.setY(i, y * 1.1); // Slightly taller
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = this.createSkinMaterial();
    const head = new THREE.Mesh(geometry, material);
    head.name = 'Head';

    return head;
  }

  /**
   * Create neck geometry
   */
  private static createNeck(params: BodyParameters): THREE.Mesh {
    const neckRadius = 0.04 * params.height;
    const neckHeight = 0.08 * params.neckLength * params.height;

    const geometry = new THREE.CylinderGeometry(
      neckRadius * 0.9,
      neckRadius * 1.1,
      neckHeight,
      16,
      8
    );

    const material = this.createSkinMaterial();
    const neck = new THREE.Mesh(geometry, material);
    neck.name = 'Neck';

    return neck;
  }

  /**
   * Create torso geometry with parametric deformation
   */
  private static createTorso(params: BodyParameters): THREE.Mesh {
    const baseHeight = 0.5 * params.height;
    const topRadius = params.chestSize * 0.16;
    const bottomRadius = params.waistSize * 0.12;

    // Create torso from modified cylinder
    const geometry = new THREE.CylinderGeometry(
      topRadius,
      bottomRadius,
      baseHeight,
      32,
      16,
      true
    );

    // Apply build-specific deformations
    this.applyBuildDeformation(geometry, params);

    // Deform vertices for breast shape if NSFW enabled
    if (
      params.breastSize &&
      params.breastSize > 0.5 &&
      params.anatomyDetail !== 'basic'
    ) {
      this.deformForBreasts(
        geometry,
        params.breastSize,
        params.breastSeparation || 0,
        params.breastShape || 0.5
      );
    }

    // Apply buttock deformation if NSFW enabled
    if (
      params.buttockSize &&
      params.buttockSize > 0.5 &&
      params.anatomyDetail !== 'basic'
    ) {
      this.deformForButtocks(
        geometry,
        params.buttockSize,
        params.buttockShape || 0
      );
    }

    // Apply muscle definition
    if (params.muscleDefinition > 0) {
      this.applyMuscleDefinition(geometry, params.muscleDefinition);
    }

    const material = this.createSkinMaterial();
    const torso = new THREE.Mesh(geometry, material);
    torso.name = 'Torso';

    return torso;
  }

  /**
   * Apply build-specific deformations (slim, athletic, curvy, muscular)
   */
  private static applyBuildDeformation(
    geometry: THREE.BufferGeometry,
    params: BodyParameters
  ): void {
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      let scale = 1.0;

      switch (params.build) {
        case 'slim':
          scale = 0.85;
          break;
        case 'athletic':
          scale = y > 0 ? 1.1 : 0.95; // Broader shoulders, narrower waist
          break;
        case 'curvy':
          scale = Math.abs(y) < 0.1 ? 0.8 : 1.15; // Narrow waist, wider top/bottom
          break;
        case 'muscular':
          scale = 1.2;
          break;
      }

      positions.setX(i, x * scale);
      positions.setZ(i, z * scale);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  /**
   * Deform geometry for breast anatomy
   */
  private static deformForBreasts(
    geometry: THREE.BufferGeometry,
    size: number,
    separation: number,
    shape: number
  ): void {
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Only affect upper torso front vertices
      if (y > 0 && z > 0) {
        // Apply breast deformation using displacement
        const leftBreast = this.breastDisplacement(
          x + separation,
          y,
          size,
          shape
        );
        const rightBreast = this.breastDisplacement(
          x - separation,
          y,
          size,
          shape
        );
        const totalDisplacement = Math.max(leftBreast, rightBreast);

        positions.setZ(i, z + totalDisplacement);
      }
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  /**
   * Calculate breast displacement for a given position
   */
  private static breastDisplacement(
    x: number,
    y: number,
    size: number,
    shape: number
  ): number {
    // Gaussian-like curve for natural breast shape
    const horizontalFalloff = Math.exp(-(x * x) / (0.05 * size));
    const verticalCenter = 0.15 - shape * 0.05; // Shape affects vertical position
    const verticalFalloff = Math.exp(-((y - verticalCenter) ** 2) / 0.08);

    return 0.12 * size * horizontalFalloff * verticalFalloff;
  }

  /**
   * Deform geometry for buttock anatomy
   */
  private static deformForButtocks(
    geometry: THREE.BufferGeometry,
    size: number,
    shape: number
  ): void {
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Only affect lower torso back vertices
      if (y < -0.1 && z < 0) {
        const displacement = this.buttockDisplacement(x, y, size, shape);
        positions.setZ(i, z - displacement);
      }
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  /**
   * Calculate buttock displacement
   */
  private static buttockDisplacement(
    x: number,
    y: number,
    size: number,
    shape: number
  ): number {
    const horizontalFalloff = Math.exp(-(x * x) / 0.04);
    const verticalCenter = -0.2 + shape * 0.05;
    const verticalFalloff = Math.exp(-((y - verticalCenter) ** 2) / 0.06);

    return 0.1 * size * horizontalFalloff * verticalFalloff;
  }

  /**
   * Apply muscle definition
   */
  private static applyMuscleDefinition(
    geometry: THREE.BufferGeometry,
    definition: number
  ): void {
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Add slight irregularity for muscle appearance
      const noise = Math.sin(x * 20 + y * 20) * 0.005 * definition;
      const radius = Math.sqrt(x * x + z * z);
      const newRadius = radius + noise;
      const angle = Math.atan2(z, x);

      positions.setX(i, Math.cos(angle) * newRadius);
      positions.setZ(i, Math.sin(angle) * newRadius);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  /**
   * Create arms
   */
  private static createArms(params: BodyParameters): THREE.Group {
    const arms = new THREE.Group();
    arms.name = 'Arms';

    const armLength = 0.3 * params.armLength * params.height;
    const armRadius = 0.025 * params.height;

    // Left arm
    const leftArmGeom = new THREE.CylinderGeometry(
      armRadius,
      armRadius * 0.8,
      armLength,
      16,
      8
    );
    const leftArm = new THREE.Mesh(leftArmGeom, this.createSkinMaterial());
    leftArm.position.x = -0.18 * params.shoulderWidth;
    leftArm.rotation.z = Math.PI / 8;

    // Right arm
    const rightArmGeom = new THREE.CylinderGeometry(
      armRadius,
      armRadius * 0.8,
      armLength,
      16,
      8
    );
    const rightArm = new THREE.Mesh(rightArmGeom, this.createSkinMaterial());
    rightArm.position.x = 0.18 * params.shoulderWidth;
    rightArm.rotation.z = -Math.PI / 8;

    arms.add(leftArm, rightArm);
    return arms;
  }

  /**
   * Create legs
   */
  private static createLegs(params: BodyParameters): THREE.Group {
    const legs = new THREE.Group();
    legs.name = 'Legs';

    const legLength = 0.4 * params.legLength * params.height;
    const thighRadius = 0.06 * params.thighThickness;
    const calfRadius = 0.04;

    // Left leg
    const leftLegGeom = new THREE.CylinderGeometry(
      thighRadius,
      calfRadius,
      legLength,
      16,
      8
    );
    const leftLeg = new THREE.Mesh(leftLegGeom, this.createSkinMaterial());
    leftLeg.position.x = -0.08 * params.hipWidth;

    // Right leg
    const rightLegGeom = new THREE.CylinderGeometry(
      thighRadius,
      calfRadius,
      legLength,
      16,
      8
    );
    const rightLeg = new THREE.Mesh(rightLegGeom, this.createSkinMaterial());
    rightLeg.position.x = 0.08 * params.hipWidth;

    legs.add(leftLeg, rightLeg);
    return legs;
  }

  /**
   * Create hands
   */
  private static createHands(params: BodyParameters): THREE.Group {
    const hands = new THREE.Group();
    hands.name = 'Hands';

    const handSize = 0.04 * params.height;

    const leftHand = new THREE.Mesh(
      new THREE.SphereGeometry(handSize, 12, 12),
      this.createSkinMaterial()
    );
    leftHand.position.x = -0.2 * params.shoulderWidth;
    leftHand.scale.set(0.6, 1, 0.4); // Flatten to hand shape

    const rightHand = new THREE.Mesh(
      new THREE.SphereGeometry(handSize, 12, 12),
      this.createSkinMaterial()
    );
    rightHand.position.x = 0.2 * params.shoulderWidth;
    rightHand.scale.set(0.6, 1, 0.4);

    hands.add(leftHand, rightHand);
    return hands;
  }

  /**
   * Create feet
   */
  private static createFeet(params: BodyParameters): THREE.Group {
    const feet = new THREE.Group();
    feet.name = 'Feet';

    const footSize = 0.05 * params.height;

    const leftFoot = new THREE.Mesh(
      new THREE.BoxGeometry(footSize * 0.6, footSize * 0.4, footSize * 1.2),
      this.createSkinMaterial()
    );
    leftFoot.position.set(-0.08 * params.hipWidth, 0, footSize * 0.3);

    const rightFoot = new THREE.Mesh(
      new THREE.BoxGeometry(footSize * 0.6, footSize * 0.4, footSize * 1.2),
      this.createSkinMaterial()
    );
    rightFoot.position.set(0.08 * params.hipWidth, 0, footSize * 0.3);

    feet.add(leftFoot, rightFoot);
    return feet;
  }

  /**
   * Create basic skin material (will be enhanced with shaders later)
   */
  private static createSkinMaterial(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      roughness: 0.7,
      metalness: 0.0,
      flatShading: false,
    });
  }
}

