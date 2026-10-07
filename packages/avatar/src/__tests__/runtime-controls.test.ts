import { describe, expect, it } from 'vitest';
import {
  AvatarFrameActivityController,
  AvatarSelectionController,
  projectedDiameterPx,
  resolveProjectedLodWithHysteresis,
} from '../runtime/index';

describe('Avatar runtime control primitives', () => {
  it('uses hysteresis around projected LOD thresholds', () => {
    expect(resolveProjectedLodWithHysteresis(710, 0)).toBe(0);
    expect(resolveProjectedLodWithHysteresis(650, 0)).toBe(1);

    expect(resolveProjectedLodWithHysteresis(710, 1)).toBe(1);
    expect(resolveProjectedLodWithHysteresis(750, 1)).toBe(0);

    expect(resolveProjectedLodWithHysteresis(280, 2)).toBe(2);
    expect(resolveProjectedLodWithHysteresis(300, 2)).toBe(1);
  });

  it('computes a positive projected character diameter', () => {
    const px = projectedDiameterPx(0.9, 3, 844, 45);
    expect(px).toBeGreaterThan(0);
  });

  it('switches to demand mode after all active work completes', () => {
    const controller = new AvatarFrameActivityController();

    expect(controller.mode).toBe('demand');

    const endCamera = controller.begin('camera');
    const endPhysics = controller.begin('physics');

    expect(controller.mode).toBe('always');
    endCamera();
    expect(controller.mode).toBe('always');
    endPhysics();
    expect(controller.mode).toBe('demand');
  });

  it('does not commit stale selection results', async () => {
    const controller = new AvatarSelectionController<string>();
    const commits: string[] = [];

    let resolveA!: (value: string) => void;
    const a = controller.select(
      {
        key: 'a',
        load: async () =>
          new Promise<string>((resolve) => {
            resolveA = resolve;
          }),
      },
      async (value) => {
        commits.push(value);
      },
    );

    const b = controller.select(
      {
        key: 'b',
        load: async () => 'B',
      },
      async (value) => {
        commits.push(value);
      },
    );

    const bResult = await b;
    resolveA('A');
    const aResult = await a;

    expect(bResult.committed).toBe(true);
    expect(aResult.committed).toBe(false);
    expect(commits).toEqual(['B']);
  });
});
