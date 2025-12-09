/**
 * First Person Arms/Weapon Renderer
 * Renders avatar's arms and weapon from first person perspective
 */

import * as THREE from 'three';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

export type WeaponType = 'sword' | 'gun' | 'fist' | 'staff' | 'bow';
export type FirstPersonAnimationState = 'idle' | 'attack' | 'reload' | 'block' | 'dodge' | 'hurt' | 'victory';

export interface WeaponConfig {
  type: WeaponType;
  modelUrl?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface FirstPersonRenderConfig {
  avatarConfig: AvatarConfiguration;
  weapon?: WeaponConfig;
  cameraFOV?: number;
  armPosition?: [number, number, number];
  enableWeaponBob?: boolean;
  enableScreenShake?: boolean;
}

/**
 * First Person Renderer Component
 * This is a placeholder - full implementation would:
 * 1. Render only arms and weapon from first person view
 * 2. Handle weapon animations (swing, reload, etc.)
 * 3. Handle arm animations (idle, attack, block, dodge)
 * 4. Apply weapon bobbing/sway effects
 * 5. Handle screen shake on damage
 */
export class FirstPersonRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private avatarConfig: AvatarConfiguration;
  private weapon?: WeaponConfig;
  private animationState: FirstPersonAnimationState = 'idle';
  private weaponBobOffset: THREE.Vector3 = new THREE.Vector3();
  private screenShakeOffset: THREE.Vector3 = new THREE.Vector3();

  constructor(config: FirstPersonRenderConfig) {
    this.avatarConfig = config.avatarConfig;
    this.weapon = config.weapon;

    // Create scene
    this.scene = new THREE.Scene();

    // Create first person camera
    this.camera = new THREE.PerspectiveCamera(
      config.cameraFOV || 90,
      16 / 9, // Aspect ratio
      0.1,
      1000,
    );
    this.camera.position.set(0, 1.6, 0); // Eye level

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(800, 600);
  }

  /**
   * Set animation state
   */
  setAnimationState(state: FirstPersonAnimationState): void {
    this.animationState = state;
    // In full implementation, would trigger animation transitions
  }

  /**
   * Apply weapon bobbing effect
   */
  applyWeaponBob(deltaTime: number, isMoving: boolean): void {
    if (!isMoving) {
      this.weaponBobOffset.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      return;
    }

    const bobSpeed = 10;
    const bobAmount = 0.02;
    const time = Date.now() * 0.001 * bobSpeed;

    this.weaponBobOffset.set(
      Math.sin(time) * bobAmount,
      Math.abs(Math.sin(time * 2)) * bobAmount * 2,
      Math.cos(time) * bobAmount,
    );
  }

  /**
   * Apply screen shake effect
   */
  applyScreenShake(intensity: number, duration: number): void {
    // In full implementation, would apply shake over time
    this.screenShakeOffset.set(
      (Math.random() - 0.5) * intensity,
      (Math.random() - 0.5) * intensity,
      (Math.random() - 0.5) * intensity * 0.5,
    );

    // Decay over time
    setTimeout(() => {
      this.screenShakeOffset.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }, duration);
  }

  /**
   * Render frame
   */
  render(): void {
    // In full implementation, would:
    // 1. Update camera with shake offset
    // 2. Render arms with current animation state
    // 3. Render weapon with bobbing offset
    // 4. Apply post-processing effects

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.renderer.dispose();
    // Dispose of geometries, materials, etc.
  }
}

/**
 * Get default weapon config for weapon type
 */
export function getDefaultWeaponConfig(type: WeaponType): WeaponConfig {
  const configs: Record<WeaponType, WeaponConfig> = {
    sword: {
      type: 'sword',
      position: [0.3, -0.2, -0.5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    gun: {
      type: 'gun',
      position: [0.4, -0.3, -0.6],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    fist: {
      type: 'fist',
      position: [0.3, -0.2, -0.5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    staff: {
      type: 'staff',
      position: [0.3, -0.2, -0.5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    bow: {
      type: 'bow',
      position: [0.3, -0.2, -0.5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
  };

  return configs[type];
}

