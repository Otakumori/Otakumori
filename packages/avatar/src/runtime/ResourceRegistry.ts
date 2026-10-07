import type { AvatarDisposableResource } from './collectResources';
import { disposeAvatarResource } from './collectResources';

interface ResourceEntry {
  resource: AvatarDisposableResource;
  references: number;
}

/**
 * Tracks Three resources independently from scene objects. Shared textures,
 * materials, geometries and skeletons are disposed only after the final owner
 * releases them.
 */
export class AvatarResourceRegistry {
  private readonly entries = new Map<string, ResourceEntry>();

  retain(resource: AvatarDisposableResource): void {
    const current = this.entries.get(resource.uuid);

    if (current) {
      current.references += 1;
      return;
    }

    this.entries.set(resource.uuid, {
      resource,
      references: 1,
    });
  }

  release(resource: AvatarDisposableResource): boolean {
    const current = this.entries.get(resource.uuid);
    if (!current) return false;

    current.references -= 1;

    if (current.references > 0) {
      return false;
    }

    disposeAvatarResource(current.resource);
    this.entries.delete(resource.uuid);
    return true;
  }

  references(resource: AvatarDisposableResource): number {
    return this.entries.get(resource.uuid)?.references ?? 0;
  }

  get size(): number {
    return this.entries.size;
  }

  snapshot(): Array<{ uuid: string; references: number; type: string }> {
    return [...this.entries.entries()].map(([uuid, entry]) => ({
      uuid,
      references: entry.references,
      type: entry.resource.constructor.name,
    }));
  }

  /**
   * Development/test emergency cleanup. Production callers should normally
   * release through AssetRepository so shared ownership is respected.
   */
  disposeAll(): void {
    for (const entry of this.entries.values()) {
      disposeAvatarResource(entry.resource);
    }

    this.entries.clear();
  }
}
