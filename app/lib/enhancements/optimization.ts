/**
 * Optimization Utilities
 *
 * Utilities for performance optimization (object pooling, LOD, etc.)
 */

/**
 * Object Pool for reusing objects
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(createFn: () => T, resetFn?: (obj: T) => void, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * Get an object from the pool
   */
  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      if (this.resetFn) {
        this.resetFn(obj);
      }
      return obj;
    }
    return this.createFn();
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * Get pool size
   */
  size(): number {
    return this.pool.length;
  }
}

/**
 * Level of Detail (LOD) system
 */
export interface LODLevel {
  distance: number;
  quality: number; // 0-1
  enabled: boolean;
}

export class LODSystem {
  private levels: LODLevel[] = [];
  private cameraPosition: [number, number, number] = [0, 0, 0];

  constructor(levels: LODLevel[]) {
    this.levels = levels.sort((a, b) => b.distance - a.distance); // Sort by distance descending
  }

  /**
   * Get LOD level for a position
   */
  getLODLevel(position: [number, number, number]): LODLevel {
    const dx = position[0] - this.cameraPosition[0];
    const dy = position[1] - this.cameraPosition[1];
    const dz = position[2] - this.cameraPosition[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    for (const level of this.levels) {
      if (distance <= level.distance) {
        return level;
      }
    }

    // Return lowest quality if beyond all levels
    return this.levels[this.levels.length - 1] || { distance: Infinity, quality: 0, enabled: false };
  }

  /**
   * Update camera position
   */
  setCameraPosition(position: [number, number, number]): void {
    this.cameraPosition = position;
  }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Batch updates for better performance
 */
export class BatchUpdater<T> {
  private queue: T[] = [];
  private batchSize: number;
  private batchDelay: number;
  private processFn: (items: T[]) => void;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(processFn: (items: T[]) => void, batchSize = 10, batchDelay = 16) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  /**
   * Add item to batch
   */
  add(item: T): void {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  /**
   * Schedule a flush
   */
  private scheduleFlush(): void {
    if (this.timeoutId) {
      return;
    }

    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  /**
   * Flush the queue
   */
  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.queue.length > 0) {
      const items = this.queue.splice(0, this.batchSize);
      this.processFn(items);
    }
  }

  /**
   * Clear the queue
   */
  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.queue = [];
  }
}

