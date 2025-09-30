/**
 * PIXI Application Manager
 *
 * Singleton pattern for managing PIXI applications to prevent
 * multiple instances and memory leaks.
 */

import * as PIXI from 'pixi.js';

export interface PIXIApplicationConfig extends PIXI.ApplicationOptions {
  id: string;
  maxInstances?: number;
}

export class PIXIApplicationManager {
  private static instance: PIXIApplicationManager;
  private applications: Map<string, PIXI.Application> = new Map();
  private maxInstances: number = 5; // Limit to prevent memory issues

  static getInstance(): PIXIApplicationManager {
    if (!PIXIApplicationManager.instance) {
      PIXIApplicationManager.instance = new PIXIApplicationManager();
    }
    return PIXIApplicationManager.instance;
  }

  /**
   * Get or create a PIXI application
   */
  getApplication(config: PIXIApplicationConfig): PIXI.Application {
    const { id, maxInstances, ...pixiConfig } = config;

    if (this.applications.has(id)) {
      return this.applications.get(id)!;
    }

    // Check instance limit
    if (this.applications.size >= (maxInstances || this.maxInstances)) {
      // Dispose oldest application
      const oldestId = this.applications.keys().next().value;
      if (oldestId) {
        this.destroyApplication(oldestId);
      }
    }

    // Create new application with optimized settings
    const app = new PIXI.Application({
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      powerPreference: 'high-performance',
      antialias: true,
      ...pixiConfig,
    });

    this.applications.set(id, app);
    return app;
  }

  /**
   * Destroy a specific application
   */
  destroyApplication(id: string): void {
    const app = this.applications.get(id);
    if (!app) return;

    // Destroy all children
    app.stage.destroy({ children: true });

    // Destroy the application
    app.destroy(true);

    this.applications.delete(id);
  }

  /**
   * Destroy all applications
   */
  destroyAll(): void {
    for (const id of this.applications.keys()) {
      this.destroyApplication(id);
    }
  }

  /**
   * Get application by ID
   */
  getApplicationById(id: string): PIXI.Application | undefined {
    return this.applications.get(id);
  }

  /**
   * Check if application exists
   */
  hasApplication(id: string): boolean {
    return this.applications.has(id);
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    totalApplications: number;
    totalTextures: number;
    totalSprites: number;
    memoryUsage: number;
  } {
    let totalTextures = 0;
    let totalSprites = 0;
    let memoryUsage = 0;

    for (const app of this.applications.values()) {
      // Count textures
      totalTextures += app.renderer.texture.managedTextures.length;

      // Count sprites
      totalSprites += app.stage.children.length;

      // Estimate memory usage
      memoryUsage += app.renderer.texture.managedTextures.length * 1024 * 1024; // Rough estimate
    }

    return {
      totalApplications: this.applications.size,
      totalTextures,
      totalSprites,
      memoryUsage,
    };
  }

  /**
   * Clean up unused resources
   */
  cleanup(): void {
    for (const app of this.applications.values()) {
      // Force garbage collection of unused textures
      app.renderer.texture.destroy();
    }
  }
}

// Export singleton instance
export const pixiManager = PIXIApplicationManager.getInstance();
