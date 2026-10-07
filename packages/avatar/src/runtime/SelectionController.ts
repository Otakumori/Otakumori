export interface AvatarSelectionRequest<T> {
  key: string;
  load: (signal: AbortSignal) => Promise<T>;
}

/**
 * Prevents rapid creator selection (A -> B -> C) from revealing B when its
 * slower request completes after C. Network loaders may ignore AbortSignal;
 * the generation check still prevents stale commit.
 */
export class AvatarSelectionController<T> {
  private generation = 0;
  private abortController: AbortController | null = null;

  async select(
    request: AvatarSelectionRequest<T>,
    commit: (value: T, key: string) => void | Promise<void>,
  ): Promise<{ committed: boolean; value?: T }> {
    this.generation += 1;
    const generation = this.generation;

    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;

    const value = await request.load(controller.signal);

    if (controller.signal.aborted || generation !== this.generation) {
      return { committed: false, value };
    }

    await commit(value, request.key);
    return { committed: true, value };
  }

  cancel(): void {
    this.generation += 1;
    this.abortController?.abort();
    this.abortController = null;
  }
}
