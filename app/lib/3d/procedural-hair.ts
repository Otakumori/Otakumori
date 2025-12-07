/**
 * Procedural Hair Generation System
 * Generates 3D hair from parametric curves without requiring asset files
 */

import * as THREE from 'three';

export interface HairParameters {
  style: 'short' | 'medium' | 'long' | 'twintails' | 'ponytail' | 'bob' | 'pixie';
  color: THREE.Color | string;
  length: number; // 0.1 to 1.5
  volume: number; // 0.5 to 2.0
  waviness: number; // 0 (straight) to 1 (curly)
  bangs: boolean;
  highlights?: THREE.Color | string;
  highlightIntensity?: number; // 0 to 1

export const DEFAULT_HAIR_PARAMS: HairParameters = {
  style: 'medium',
  color: new THREE.Color(0x3d2817), // Brown
  length: 0.4,
  volume: 1.0,
  waviness: 0.2,
  bangs: true,
};

export class ProceduralHairGenerator {
  /**
   * Generate procedural hair based on parameters
   */
  static generateHair(params: HairParameters): THREE.Group {
    const hair = new THREE.Group();
    hair.name = 'ProceduralHair';

    // Normalize color inputs
    const baseColor =
      params.color instanceof THREE.Color ? params.color : new THREE.Color(params.color);

    // Generate hair strands based on style
    switch (params.style) {
      case 'short':
        this.generateShortHair(hair, params, baseColor);
        break;
      case 'medium':
        this.generateMediumHair(hair, params, baseColor);
        break;
      case 'long':
        this.generateLongHair(hair, params, baseColor);
        break;
      case 'twintails':
        this.generateTwintails(hair, params, baseColor);
        break;
      case 'ponytail':
        this.generatePonytail(hair, params, baseColor);
        break;
      case 'bob':
        this.generateBobCut(hair, params, baseColor);
        break;
      case 'pixie':
        this.generatePixieCut(hair, params, baseColor);
        break;
      default:
        this.generateMediumHair(hair, params, baseColor);
    }

    // Add bangs if enabled
    if (params.bangs) {
      const bangs = this.generateBangs(params, baseColor);
      hair.add(bangs);
    }

    return hair;
  }

  /**
   * Generate short hair
   */
  private static generateShortHair(
    group: THREE.Group,
    params: HairParameters,
    color: THREE.Color,
  ): void {
    const strandCount = Math.floor(300 * params.volume);
    const maxLength = 0.15 * params.length;

    for (let i = 0; i < strandCount; i++) {
      const strand = this.createHairStrand(params, color, i, strandCount, maxLength);
      group.add(strand);
    }
  }

  /**
   * Generate medium-length hair
   */
  private static generateMediumHair(
    group: THREE.Group,
    params: HairParameters,
    color: THREE.Color,
  ): void {
    const strandCount = Math.floor(500 * params.volume);
    const maxLength = 0.4 * params.length;

    for (let i = 0; i < strandCount; i++) {
      const strand = this.createHairStrand(params, color, i, strandCount, maxLength);
      group.add(strand);
    }
  }

  /**
   * Generate long hair
   */
  private static generateLongHair(
    group: THREE.Group,
    params: HairParameters,
    color: THREE.Color,
  ): void {
    const strandCount = Math.floor(800 * params.volume);
    const maxLength = 0.8 * params.length;

    for (let i = 0; i < strandCount; i++) {
      const strand = this.createHairStrand(params, color, i, strandCount, maxLength);
      group.add(strand);
    }
  }

  /**
   * Generate twin tails
   */
  private static generateTwintails(
    group: THREE.Group,
    params: HairParameters,
    color: THREE.Color,
  ): void {
    // Base scalp coverage
    this.generateShortHair(group, { ...params, length: 0.3 }, color);

    // Left tail
    const leftTail = this.createTail(params, color, new THREE.Vector3(-0.1, 0.85, -0.05));
    group.add(leftTail);

    // Right tail
    const rightTail = this.createTail(params, color, new THREE.Vector3(0.1, 0.85, -0.05));
    group.add(rightTail);
  }

  /**
   * Generate ponytail
   */
  private static generatePonytail(
    group: THREE.Group,
    params: HairParameters,
    color: THREE.Color,
  ): void {
    // Base scalp coverage
    this.generateShortHair(group, { ...params, length: 0.3 }, color);

    // Ponytail
    const ponytail = this.createTail(params, color, new THREE.Vector3(0, 0.85, -0.12));
    group.add(ponytail);
  }

  /**
   * Generate bob cut
   */
  private static generateBobCut(
    group: THREE.Group,
    params: HairParameters,
    color: THREE.Color,
  ): void {
    const strandCount = Math.floor(600 * params.volume);

    for (let i = 0; i < strandCount; i++) {
      // Bob cut has uniform length around head
      const theta = (i / strandCount) * Math.PI * 2;
      const phi = Math.PI / 3 + Math.random() * (Math.PI / 6);

      const startX = Math.sin(phi) * Math.cos(theta) * 0.12;
      const startY = 0.9 + Math.cos(phi) * 0.05;
      const startZ = Math.sin(phi) * Math.sin(theta) * 0.12;

      const strand = this.createStrandFromPoint(
        new THREE.Vector3(startX, startY, startZ),
        params,
        color,
        0.2 * params.length,
        i,
      );
      group.add(strand);
    }
  }

  /**
   * Generate pixie cut
   */
  private static generatePixieCut(
    group: THREE.Group,
    params: HairParameters,
    color: THREE.Color,
  ): void {
    const strandCount = Math.floor(250 * params.volume);
    const maxLength = 0.08 * params.length;

    for (let i = 0; i < strandCount; i++) {
      const strand = this.createHairStrand(params, color, i, strandCount, maxLength);
      group.add(strand);
    }
  }

  /**
   * Create a single hair tail (for ponytail/twintails)
   */
  private static createTail(
    params: HairParameters,
    color: THREE.Color,
    origin: THREE.Vector3,
  ): THREE.Group {
    const tail = new THREE.Group();
    const strandCount = Math.floor(200 * params.volume);
    const tailLength = 0.6 * params.length;

    for (let i = 0; i < strandCount; i++) {
      const spread = 0.03 * Math.sqrt(i / strandCount);
      const angle = (i / strandCount) * Math.PI * 2;

      const startPoint = new THREE.Vector3(
        origin.x + Math.cos(angle) * spread,
        origin.y,
        origin.z + Math.sin(angle) * spread,
      );

      const strand = this.createStrandFromPoint(startPoint, params, color, tailLength, i);
      tail.add(strand);
    }

    return tail;
  }

  /**
   * Generate bangs
   */
  private static generateBangs(params: HairParameters, color: THREE.Color): THREE.Group {
    const bangs = new THREE.Group();
    bangs.name = 'Bangs';

    const bangCount = Math.floor(100 * params.volume);
    const bangLength = 0.12 * params.length;

    for (let i = 0; i < bangCount; i++) {
      const t = i / bangCount;
      const angle = Math.PI * 0.4 + t * Math.PI * 0.2; // Front arc

      const startX = Math.cos(angle) * 0.11;
      const startY = 0.95;
      const startZ = Math.sin(angle) * 0.11;

      const strand = this.createStrandFromPoint(
        new THREE.Vector3(startX, startY, startZ),
        params,
        color,
        bangLength,
        i,
      );
      bangs.add(strand);
    }

    return bangs;
  }

  /**
   * Create individual hair strand
   */
  private static createHairStrand(
    params: HairParameters,
    color: THREE.Color,
    index: number,
    totalStrands: number,
    maxLength: number,
  ): THREE.Mesh {
    // Start point on scalp
    const theta = (index / totalStrands) * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.6 + Math.PI * 0.2;
    const startX = Math.sin(phi) * Math.cos(theta) * 0.12;
    const startY = 0.9 + Math.cos(phi) * 0.1;
    const startZ = Math.sin(phi) * Math.sin(theta) * 0.12;

    const startPoint = new THREE.Vector3(startX, startY, startZ);

    return this.createStrandFromPoint(startPoint, params, color, maxLength, index);
  }

  /**
   * Create strand from a specific starting point
   */
  private static createStrandFromPoint(
    startPoint: THREE.Vector3,
    params: HairParameters,
    color: THREE.Color,
    maxLength: number,
    seed: number,
  ): THREE.Mesh {
    const points: THREE.Vector3[] = [];
    const segments = 10;

    points.push(startPoint.clone());

    // Generate curve points with gravity and waviness
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;

      // Gravity effect
      const gravity = -0.3 * t * t * maxLength;

      // Waviness effect (using seed for variation)
      const waveX = Math.sin(t * Math.PI * 4 * params.waviness + seed) * 0.02;
      const waveZ = Math.cos(t * Math.PI * 4 * params.waviness + seed) * 0.02;

      // Wind/flow direction (slight outward)
      const outward = t * 0.05;

      points.push(
        new THREE.Vector3(
          startPoint.x + waveX + Math.sign(startPoint.x) * outward,
          startPoint.y + gravity - maxLength * t,
          startPoint.z + waveZ + Math.sign(startPoint.z) * outward,
        ),
      );
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, segments, 0.001, 4, false);

    // Apply highlights if specified
    let material: THREE.Material;
    if (params.highlights && params.highlightIntensity && params.highlightIntensity > 0) {
      const highlightColor =
        params.highlights instanceof THREE.Color
          ? params.highlights
          : new THREE.Color(params.highlights);

      const mixedColor = color.clone().lerp(highlightColor, params.highlightIntensity * 0.3);
      material = new THREE.MeshStandardMaterial({
        color: mixedColor,
        roughness: 0.4,
        metalness: 0.1,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.1,
      });
    }

    return new THREE.Mesh(geometry, material);
  }
}
