import type * as THREE from 'three';
import {
  collectAvatarResources,
  type AvatarDisposableResource,
} from './collectResources';
import { AvatarResourceRegistry } from './ResourceRegistry';

export interface AvatarLoadedAsset {
  root: THREE.Object3D;
  /**
   * Manifest-derived runtime estimate. The browser cannot reliably report
   * total physical VRAM, so the repository enforces an application budget.
   */
  estimatedGpuBytes: number;
}

export type AvatarAssetLoader = () => Promise<AvatarLoadedAsset>;

export interface AvatarAssetRecord extends AvatarLoadedAsset {
  key: string;
  refCount: number;
  pinned: boolean;
  lastUsed: number;
  warmed: boolean;
  resources: Set<AvatarDisposableResource>;
}

export type AvatarRepositoryEvent =
  | { type: 'loaded'; key: string; bytes: number }
  | { type: 'acquired'; key: string; refCount: number }
  | { type: 'released'; key: string; refCount: number }
  | { type: 'evicted'; key: string; bytes: number };

export interface AvatarAssetRepositoryOptions {
  budgetBytes: number;
  resourceRegistry?: AvatarResourceRegistry;
  now?: () => number;
  onEvent?: (event: AvatarRepositoryEvent) => void;
}

/**
 * Owns the lifecycle of modular avatar scene objects. This repository assumes
 * one scene-object instance per key per repository. Multiple independent
 * canvases/avatars should use separate repositories or a future explicit
 * instance-cloning layer; a Three Object3D cannot have two parents.
 */
export class AvatarAssetRepository {
  private readonly records = new Map<string, AvatarAssetRecord>();
  private readonly inflight = new Map<string, Promise<AvatarAssetRecord>>();
  private readonly resources: AvatarResourceRegistry;
  private readonly now: () => number;
  private readonly onEvent?: (event: AvatarRepositoryEvent) => void;
  private budgetBytes: number;
  private residentBytesValue = 0;

  constructor(options: AvatarAssetRepositoryOptions) {
    if (!Number.isFinite(options.budgetBytes) || options.budgetBytes < 0) {
      throw new Error('AvatarAssetRepository budgetBytes must be a non-negative finite number');
    }

    this.budgetBytes = options.budgetBytes;
    this.resources = options.resourceRegistry ?? new AvatarResourceRegistry();
    this.now = options.now ?? (() => performance.now());
    this.onEvent = options.onEvent;
  }

  async acquire(
    key: string,
    loader: AvatarAssetLoader,
    options: { pinned?: boolean } = {},
  ): Promise<AvatarAssetRecord> {
    const cached = this.records.get(key);

    if (cached) {
      cached.refCount += 1;
      cached.lastUsed = this.now();
      if (options.pinned) cached.pinned = true;
      this.onEvent?.({ type: 'acquired', key, refCount: cached.refCount });
      return cached;
    }

    let pending = this.inflight.get(key);

    if (!pending) {
      pending = this.loadRecord(key, loader, options.pinned ?? false);
      this.inflight.set(key, pending);
    }

    try {
      const record = await pending;

      record.refCount += 1;
      record.lastUsed = this.now();
      if (options.pinned) record.pinned = true;

      this.onEvent?.({
        type: 'acquired',
        key,
        refCount: record.refCount,
      });

      return record;
    } finally {
      if (this.inflight.get(key) === pending) {
        this.inflight.delete(key);
      }
    }
  }

  release(key: string): void {
    const record = this.records.get(key);
    if (!record) return;

    record.refCount = Math.max(0, record.refCount - 1);
    record.lastUsed = this.now();

    this.onEvent?.({
      type: 'released',
      key,
      refCount: record.refCount,
    });

    this.enforceBudget();
  }

  pin(key: string): void {
    const record = this.records.get(key);
    if (record) record.pinned = true;
  }

  unpin(key: string): void {
    const record = this.records.get(key);
    if (record) {
      record.pinned = false;
      this.enforceBudget();
    }
  }

  markWarmed(key: string): void {
    const record = this.records.get(key);
    if (record) record.warmed = true;
  }

  has(key: string): boolean {
    return this.records.has(key);
  }

  get(key: string): AvatarAssetRecord | undefined {
    return this.records.get(key);
  }

  setBudgetBytes(nextBudget: number): void {
    if (!Number.isFinite(nextBudget) || nextBudget < 0) {
      throw new Error('AvatarAssetRepository budgetBytes must be a non-negative finite number');
    }

    this.budgetBytes = nextBudget;
    this.enforceBudget();
  }

  get residentBytes(): number {
    return this.residentBytesValue;
  }

  get size(): number {
    return this.records.size;
  }

  get resourceRegistry(): AvatarResourceRegistry {
    return this.resources;
  }

  snapshot(): Array<{
    key: string;
    refCount: number;
    pinned: boolean;
    warmed: boolean;
    estimatedGpuBytes: number;
    lastUsed: number;
  }> {
    return [...this.records.values()].map((record) => ({
      key: record.key,
      refCount: record.refCount,
      pinned: record.pinned,
      warmed: record.warmed,
      estimatedGpuBytes: record.estimatedGpuBytes,
      lastUsed: record.lastUsed,
    }));
  }

  evict(key: string): boolean {
    const record = this.records.get(key);

    if (!record || record.refCount > 0 || record.pinned) {
      return false;
    }

    record.root.removeFromParent();

    for (const resource of record.resources) {
      this.resources.release(resource);
    }

    this.records.delete(key);
    this.residentBytesValue = Math.max(
      0,
      this.residentBytesValue - record.estimatedGpuBytes,
    );

    this.onEvent?.({
      type: 'evicted',
      key,
      bytes: record.estimatedGpuBytes,
    });

    return true;
  }

  evictAllUnused(): void {
    const candidates = [...this.records.values()]
      .filter((record) => record.refCount === 0 && !record.pinned)
      .sort((a, b) => a.lastUsed - b.lastUsed);

    for (const candidate of candidates) {
      this.evict(candidate.key);
    }
  }

  dispose(options: { includePinned?: boolean } = {}): void {
    const includePinned = options.includePinned ?? true;

    for (const record of [...this.records.values()]) {
      if (record.refCount > 0) {
        throw new Error(
          `Cannot dispose AvatarAssetRepository while ${record.key} has ${record.refCount} active references`,
        );
      }

      if (!includePinned && record.pinned) continue;

      record.pinned = false;
      this.evict(record.key);
    }
  }

  private async loadRecord(
    key: string,
    loader: AvatarAssetLoader,
    pinned: boolean,
  ): Promise<AvatarAssetRecord> {
    const loaded = await loader();

    if (!loaded.root) {
      throw new Error(`Avatar asset loader for ${key} returned no root object`);
    }

    if (
      !Number.isFinite(loaded.estimatedGpuBytes) ||
      loaded.estimatedGpuBytes < 0
    ) {
      throw new Error(
        `Avatar asset loader for ${key} returned an invalid estimatedGpuBytes value`,
      );
    }

    const resources = collectAvatarResources(loaded.root);

    for (const resource of resources) {
      this.resources.retain(resource);
    }

    const record: AvatarAssetRecord = {
      key,
      root: loaded.root,
      estimatedGpuBytes: loaded.estimatedGpuBytes,
      refCount: 0,
      pinned,
      lastUsed: this.now(),
      warmed: false,
      resources,
    };

    this.records.set(key, record);
    this.residentBytesValue += record.estimatedGpuBytes;

    this.onEvent?.({
      type: 'loaded',
      key,
      bytes: record.estimatedGpuBytes,
    });

    this.enforceBudget();

    return record;
  }

  private enforceBudget(): void {
    if (this.residentBytesValue <= this.budgetBytes) return;

    const candidates = [...this.records.values()]
      .filter((record) => record.refCount === 0 && !record.pinned)
      .sort((a, b) => a.lastUsed - b.lastUsed);

    for (const candidate of candidates) {
      if (this.residentBytesValue <= this.budgetBytes) break;
      this.evict(candidate.key);
    }
  }
}
