import { describe, expect, it } from 'vitest';

import {
  HOME_SCENE_ASSETS,
  HOME_SCENE_MANIFEST,
  HOME_SCENE_VIEWPORT_MATRIX,
  resolveBrowserTimeZone,
  resolveHomeScene,
  resolveHomeSceneBucket,
  resolveHomeSceneImageSrc,
  resolveHomeSceneProjection,
  resolveHomeSceneSurfaceFamily,
  resolveNextHomeSceneBucket,
} from '@/app/components/hero/homeScene';

function localDate(hour: number, day = 2) {
  return new Date(2026, 0, day, hour, 0, 0);
}

describe('homepage combined world scene mapping', () => {
  it('maps local hours to deterministic scene buckets', () => {
    expect(resolveHomeSceneBucket(localDate(5))).toBe('earlyMorning');
    expect(resolveHomeSceneBucket(localDate(8))).toBe('morning');
    expect(resolveHomeSceneBucket(localDate(12))).toBe('afternoon');
    expect(resolveHomeSceneBucket(localDate(17))).toBe('lateAfternoon');
    expect(resolveHomeSceneBucket(localDate(21))).toBe('night');
    expect(resolveHomeSceneBucket(localDate(3))).toBe('night');
  });

  it('keeps special twilight isolated to the documented conservative window', () => {
    expect(resolveHomeSceneBucket(localDate(20, 1))).toBe('specialTwilight');
    expect(resolveHomeSceneBucket(localDate(20, 2))).toBe('night');
    expect(resolveHomeSceneBucket(localDate(19, 1))).toBe('lateAfternoon');
    expect(resolveHomeSceneBucket(localDate(21, 1))).toBe('night');
  });

  it('falls back to afternoon for invalid dates rather than throwing', () => {
    expect(resolveHomeSceneBucket(new Date(Number.NaN))).toBe('afternoon');

    const scene = resolveHomeScene(new Date(Number.NaN));

    expect(scene.bucket).toBe('afternoon');
    expect(scene.asset.src).toBe(HOME_SCENE_ASSETS.afternoon.src);
  });

  it('uses one approved combined world master per time bucket', () => {
    expect(HOME_SCENE_ASSETS.earlyMorning.src).toBe(
      '/assets/home/world/combined/om-home-world-01-early-morning-wide.png',
    );
    expect(HOME_SCENE_ASSETS.morning.src).toBe(
      '/assets/home/world/combined/om-home-world-02-morning-wide.png',
    );
    expect(HOME_SCENE_ASSETS.afternoon.src).toBe(
      '/assets/home/world/combined/om-home-world-03-afternoon-wide.png',
    );
    expect(HOME_SCENE_ASSETS.lateAfternoon.src).toBe(
      '/assets/home/world/combined/om-home-world-04-late-afternoon-wide.png',
    );
    expect(HOME_SCENE_ASSETS.night.src).toBe(
      '/assets/home/world/combined/om-home-world-05-night-wide.png',
    );
    expect(HOME_SCENE_ASSETS.specialTwilight.src).toBe(
      '/assets/home/world/combined/om-home-world-06-special-twilight-wide.png',
    );
  });

  it('represents the approved masters as one stable precomposed artboard', () => {
    expect(HOME_SCENE_MANIFEST.world.sourceDirectory).toBe(
      'docs/design/references/home-world-wide-approved',
    );
    expect(HOME_SCENE_MANIFEST.world.runtimeDirectory).toBe('/assets/home/world/combined');
    expect(HOME_SCENE_MANIFEST.world.artboard.width).toBe(1325);
    expect(HOME_SCENE_MANIFEST.world.artboard.height).toBe(1187);
    expect(HOME_SCENE_MANIFEST.world.precomposedSurfaceAndUnderground).toBe(true);
    expect(HOME_SCENE_MANIFEST.world.portraitMasterAvailable).toBe(false);
    expect('root' in HOME_SCENE_MANIFEST).toBe(false);
  });

  it('selects a combined scene image without changing the time bucket', () => {
    const scene = resolveHomeScene(localDate(12), false);

    expect(resolveHomeSceneImageSrc(scene.asset)).toEqual({
      src: '/assets/home/world/combined/om-home-world-03-afternoon-wide.png',
      fallback: '/assets/home/world/combined/om-home-world-04-late-afternoon-wide.png',
    });
    expect(resolveHomeSceneSurfaceFamily()).toBe('combined');
  });

  it('keeps the combined world tall enough for natural homepage scroll progression', () => {
    for (const viewport of HOME_SCENE_VIEWPORT_MATRIX) {
      const projection = resolveHomeSceneProjection(viewport);

      expect(projection.family).toBe('combined');
      expect(projection.width).toBeGreaterThanOrEqual(viewport.width - 0.01);
      expect(projection.height).toBeGreaterThan(viewport.height);
      expect(projection.scale).toBeCloseTo(projection.height / projection.artboard.height, 5);
      expect(projection.footerContentTop).toBeGreaterThan(viewport.height * 0.6);
    }
  });

  it('preloads only the next chronological scene candidate', () => {
    expect(resolveNextHomeSceneBucket('earlyMorning')).toBe('morning');
    expect(resolveNextHomeSceneBucket('morning')).toBe('afternoon');
    expect(resolveNextHomeSceneBucket('afternoon')).toBe('lateAfternoon');
    expect(resolveNextHomeSceneBucket('lateAfternoon')).toBe('night');
    expect(resolveNextHomeSceneBucket('night')).toBe('earlyMorning');
    expect(resolveNextHomeSceneBucket('specialTwilight')).toBe('night');
  });

  it('reduces petal density and gust motion for reduced-motion users', () => {
    const normal = resolveHomeScene(localDate(12), false);
    const reduced = resolveHomeScene(localDate(12), true);

    expect(normal.motion.petalDensity).toBeGreaterThan(4);
    expect(reduced.motion.petalDensity).toBeLessThanOrEqual(4);
    expect(reduced.motion.gustStrength).toBe(0);
    expect(reduced.motion.windStrength).toBeLessThan(normal.motion.windStrength);
  });

  it('returns a bounded timezone fallback when Intl timezone resolution is unavailable', () => {
    const original = Intl.DateTimeFormat;
    const throwingDateTimeFormat = (() => {
      throw new Error('timezone unavailable');
    }) as unknown as typeof Intl.DateTimeFormat;

    Object.defineProperty(Intl, 'DateTimeFormat', {
      configurable: true,
      value: throwingDateTimeFormat,
    });

    expect(resolveBrowserTimeZone()).toBe('local');

    Object.defineProperty(Intl, 'DateTimeFormat', {
      configurable: true,
      value: original,
    });
  });
});
