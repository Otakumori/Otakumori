import { describe, expect, it } from 'vitest';

import {
  HOME_SCENE_ASSETS,
  resolveHomeSceneImageSrc,
  resolveNextHomeSceneBucket,
  resolveBrowserTimeZone,
  resolveHomeScene,
  resolveHomeSceneBucket,
} from '@/app/components/hero/homeScene';

function localDate(hour: number, day = 2) {
  return new Date(2026, 0, day, hour, 0, 0);
}

describe('homepage adaptive world scene mapping', () => {
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

  it('uses the approved production asset paths', () => {
    expect(HOME_SCENE_ASSETS.earlyMorning.src).toBe(
      '/assets/home/world/mori-world-early-morning.png',
    );
    expect(HOME_SCENE_ASSETS.earlyMorning.wideSrc).toBe(
      '/assets/home/world/wide/mori-world-early-morning-wide.png',
    );
    expect(HOME_SCENE_ASSETS.morning.src).toBe('/assets/home/world/mori-world-morning.png');
    expect(HOME_SCENE_ASSETS.morning.wideSrc).toBe(
      '/assets/home/world/wide/mori-world-morning-wide.png',
    );
    expect(HOME_SCENE_ASSETS.afternoon.src).toBe('/assets/home/world/mori-world-afternoon.png');
    expect(HOME_SCENE_ASSETS.afternoon.wideSrc).toBe(
      '/assets/home/world/wide/mori-world-afternoon-wide.png',
    );
    expect(HOME_SCENE_ASSETS.lateAfternoon.src).toBe('/assets/home/world/mori-world-sunset.png');
    expect(HOME_SCENE_ASSETS.lateAfternoon.wideSrc).toBe(
      '/assets/home/world/wide/mori-world-sunset-wide.png',
    );
    expect(HOME_SCENE_ASSETS.night.src).toBe('/assets/home/world/mori-world-night.png');
    expect(HOME_SCENE_ASSETS.night.wideSrc).toBe(
      '/assets/home/world/wide/mori-world-night-wide.png',
    );
    expect(HOME_SCENE_ASSETS.specialTwilight.src).toBe(
      '/assets/home/world/mori-world-twilight.png',
    );
    expect(HOME_SCENE_ASSETS.specialTwilight.wideSrc).toBe(
      '/assets/home/world/wide/mori-world-twilight-wide.png',
    );
  });

  it('selects wide or canonical scene assets without changing the time bucket', () => {
    const scene = resolveHomeScene(localDate(12), false);

    expect(resolveHomeSceneImageSrc(scene.asset, 'canonical')).toEqual({
      src: '/assets/home/world/mori-world-afternoon.png',
      fallback: '/assets/home/world/mori-world-sunset.png',
    });
    expect(resolveHomeSceneImageSrc(scene.asset, 'wide')).toEqual({
      src: '/assets/home/world/wide/mori-world-afternoon-wide.png',
      fallback: '/assets/home/world/wide/mori-world-sunset-wide.png',
    });
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
