/**
 * Canvas Rendering Optimizer
 * 
 * Implements dirty rectangle optimization to minimize canvas redraws
 * and improve rendering performance.
 */

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DirtyRegion {
  rect: Rectangle;
  priority: number; // Higher priority = redraw first
  timestamp: number;
}

export class CanvasRenderingOptimizer {
  private dirtyRegions: Set<Rectangle> = new Set();
  private lastFrameRegions: Set<Rectangle> = new Set();
  private regionPriorities: Map<string, number> = new Map();
  private lastCleanup: number = 0;
  private cleanupInterval: number = 1000; // 1 second

  /**
   * Mark a region as dirty (needs redraw)
   */
  markDirty(rect: Rectangle, priority: number = 1): void {
    // Merge with existing dirty regions if they overlap
    const mergedRect = this.mergeWithExisting(rect);
    this.dirtyRegions.add(mergedRect);
    
    // Store priority for this region
    const key = this.rectToKey(mergedRect);
    this.regionPriorities.set(key, Math.max(this.regionPriorities.get(key) || 0, priority));
  }

  /**
   * Mark multiple regions as dirty
   */
  markDirtyMultiple(rects: Rectangle[], priority: number = 1): void {
    rects.forEach(rect => this.markDirty(rect, priority));
  }

  /**
   * Get all dirty regions sorted by priority
   */
  getDirtyRegions(): Rectangle[] {
    const regions = Array.from(this.dirtyRegions);
    
    // Sort by priority (higher first)
    regions.sort((a, b) => {
      const priorityA = this.regionPriorities.get(this.rectToKey(a)) || 0;
      const priorityB = this.regionPriorities.get(this.rectToKey(b)) || 0;
      return priorityB - priorityA;
    });

    return regions;
  }

  /**
   * Clear all dirty regions
   */
  clearDirty(): void {
    this.lastFrameRegions = new Set(this.dirtyRegions);
    this.dirtyRegions.clear();
    this.regionPriorities.clear();
  }

  /**
   * Check if a region is dirty
   */
  isDirty(rect: Rectangle): boolean {
    for (const dirtyRect of this.dirtyRegions) {
      if (this.rectsOverlap(rect, dirtyRect)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the union of all dirty regions
   */
  getDirtyBounds(): Rectangle | null {
    if (this.dirtyRegions.size === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const rect of this.dirtyRegions) {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Optimize dirty regions by merging overlapping ones
   */
  optimize(): void {
    const optimized = new Set<Rectangle>();
    const regions = Array.from(this.dirtyRegions);

    for (const rect of regions) {
      let merged = false;
      
      for (const existing of optimized) {
        if (this.rectsOverlap(rect, existing)) {
          // Merge with existing region
          const mergedRect = this.mergeRects(rect, existing);
          optimized.delete(existing);
          optimized.add(mergedRect);
          merged = true;
          break;
        }
      }
      
      if (!merged) {
        optimized.add(rect);
      }
    }

    this.dirtyRegions = optimized;
  }

  /**
   * Check if two rectangles overlap
   */
  private rectsOverlap(a: Rectangle, b: Rectangle): boolean {
    return !(a.x + a.width < b.x || b.x + b.width < a.x || 
             a.y + a.height < b.y || b.y + b.height < a.y);
  }

  /**
   * Merge two overlapping rectangles
   */
  private mergeRects(a: Rectangle, b: Rectangle): Rectangle {
    const minX = Math.min(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxX = Math.max(a.x + a.width, b.x + b.width);
    const maxY = Math.max(a.y + a.height, b.y + b.height);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Merge a rectangle with existing dirty regions
   */
  private mergeWithExisting(rect: Rectangle): Rectangle {
    let merged = rect;
    
    for (const existing of this.dirtyRegions) {
      if (this.rectsOverlap(merged, existing)) {
        merged = this.mergeRects(merged, existing);
        this.dirtyRegions.delete(existing);
      }
    }
    
    return merged;
  }

  /**
   * Convert rectangle to string key
   */
  private rectToKey(rect: Rectangle): string {
    return `${rect.x},${rect.y},${rect.width},${rect.height}`;
  }

  /**
   * Clean up old data periodically
   */
  cleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.lastFrameRegions.clear();
      this.lastCleanup = now;
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    dirtyRegions: number;
    lastFrameRegions: number;
    totalArea: number;
  } {
    let totalArea = 0;
    for (const rect of this.dirtyRegions) {
      totalArea += rect.width * rect.height;
    }

    return {
      dirtyRegions: this.dirtyRegions.size,
      lastFrameRegions: this.lastFrameRegions.size,
      totalArea,
    };
  }
}

// Export singleton instance
export const canvasOptimizer = new CanvasRenderingOptimizer();
