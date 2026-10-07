export type AvatarFrameActivity =
  | 'camera'
  | 'morph'
  | 'animation'
  | 'physics'
  | 'shader';

export type AvatarFrameloopMode = 'always' | 'demand';

/**
 * Pure reference-counted activity tracker. React/R3F integration should map a
 * zero-active state to frameloop='demand' and any active state to 'always'.
 */
export class AvatarFrameActivityController {
  private readonly counts = new Map<AvatarFrameActivity, number>();

  begin(activity: AvatarFrameActivity): () => void {
    this.counts.set(activity, (this.counts.get(activity) ?? 0) + 1);
    let ended = false;

    return () => {
      if (ended) return;
      ended = true;
      this.end(activity);
    };
  }

  end(activity: AvatarFrameActivity): void {
    const current = this.counts.get(activity) ?? 0;

    if (current <= 1) {
      this.counts.delete(activity);
      return;
    }

    this.counts.set(activity, current - 1);
  }

  isActive(activity?: AvatarFrameActivity): boolean {
    if (activity) return (this.counts.get(activity) ?? 0) > 0;
    return this.counts.size > 0;
  }

  get mode(): AvatarFrameloopMode {
    return this.counts.size > 0 ? 'always' : 'demand';
  }

  snapshot(): Partial<Record<AvatarFrameActivity, number>> {
    return Object.fromEntries(this.counts);
  }

  clear(): void {
    this.counts.clear();
  }
}
