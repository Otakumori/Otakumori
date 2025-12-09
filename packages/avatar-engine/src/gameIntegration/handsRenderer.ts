/**
 * Hands-Only Renderer
 * Renders avatar's hands and forearms for card interaction games
 */

import * as THREE from 'three';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

export type HandsAnimationState = 'idle' | 'hover' | 'flip' | 'match';

export interface HandsRenderConfig {
  avatarConfig: AvatarConfiguration;
  cameraFOV?: number;
  enableHandTracking?: boolean;
}

export interface HandPosition {
  left: { x: number; y: number; z: number };
  right: { x: number; y: number; z: number };
}

/**
 * Hands Renderer Component
 * Renders only hands and forearms from top-down view
 * Hands appear to reach into frame to interact with cards
 */
export class HandsRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private avatarConfig: AvatarConfiguration;
  private animationState: HandsAnimationState = 'idle';
  private handPositions: HandPosition = {
    left: { x: -0.3, y: 0, z: 0.5 },
    right: { x: 0.3, y: 0, z: 0.5 },
  };
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(config: HandsRenderConfig) {
    this.avatarConfig = config.avatarConfig;

    // Create scene
    this.scene = new THREE.Scene();

    // Create top-down camera for hands view
    this.camera = new THREE.PerspectiveCamera(
      config.cameraFOV || 60,
      16 / 9,
      0.1,
      1000,
    );
    // Top-down view, looking down at hands
    this.camera.position.set(0, 0.3, 1.5);
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(800, 600);

    // Set up mouse tracking if enabled
    if (config.enableHandTracking) {
      this.setupMouseTracking();
    }
  }

  /**
   * Set up mouse tracking for hand following
   */
  private setupMouseTracking(): void {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      // Convert mouse position to normalized coordinates
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mousePosition = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: 1 - ((e.clientY - rect.top) / rect.height) * 2,
      };

      // Update hand positions to follow mouse (with some offset for natural look)
      this.handPositions.left.x = this.mousePosition.x - 0.2;
      this.handPositions.left.y = this.mousePosition.y;
      this.handPositions.right.x = this.mousePosition.x + 0.2;
      this.handPositions.right.y = this.mousePosition.y;
    };

    window.addEventListener('mousemove', handleMouseMove);
  }

  /**
   * Set animation state
   */
  setAnimationState(state: HandsAnimationState): void {
    this.animationState = state;
    // In full implementation, would trigger hand animation transitions
  }

  /**
   * Animate hand for card flip
   */
  animateCardFlip(cardPosition: { x: number; y: number }): void {
    this.setAnimationState('flip');
    // In full implementation, would animate hand to card position and perform flip gesture
    setTimeout(() => {
      this.setAnimationState('idle');
    }, 500);
  }

  /**
   * Animate hand for card match
   */
  animateCardMatch(cardPosition: { x: number; y: number }): void {
    this.setAnimationState('match');
    // In full implementation, would animate hand to card position and perform match gesture
    setTimeout(() => {
      this.setAnimationState('idle');
    }, 800);
  }

  /**
   * Animate hand hover over card
   */
  animateCardHover(cardPosition: { x: number; y: number }): void {
    this.setAnimationState('hover');
    // In full implementation, would animate hand to hover position
  }

  /**
   * Render frame
   */
  render(): void {
    // In full implementation, would:
    // 1. Render only hands and forearms
    // 2. Apply current animation state
    // 3. Position hands based on mouse/interaction
    // 4. Apply hand gestures

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
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
 * Fallback: Simple card outline on hover
 * Used when hands rendering is not feasible
 */
export function createCardOutlineFallback(): {
  style: React.CSSProperties;
  className: string;
} {
  return {
    style: {
      outline: '2px solid rgba(236, 72, 153, 0.8)',
      outlineOffset: '2px',
      transition: 'outline 0.2s ease-in-out',
    },
    className: 'card-hover-outline',
  };
}

