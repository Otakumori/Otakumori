import { describe, expect, it } from 'vitest';
import {
  defaultSeasonalHomeTheme,
  getOtakumoriSeason,
  getSeasonalHomeTheme,
  seasonalHomeThemes,
} from '@/lib/seasonal/otakumoriTheme';

describe('seasonal Otakumori home theme', () => {
  it.each([
    ['2026-01-15T12:00:00.000Z', 'winter'],
    ['2026-04-15T12:00:00.000Z', 'spring'],
    ['2026-07-15T12:00:00.000Z', 'summer'],
    ['2026-10-15T12:00:00.000Z', 'fall'],
    ['2026-12-15T12:00:00.000Z', 'winter'],
  ] as const)('resolves %s to %s', (isoDate, season) => {
    expect(getOtakumoriSeason(new Date(isoDate))).toBe(season);
    expect(getSeasonalHomeTheme(new Date(isoDate)).season).toBe(season);
  });

  it('keeps every seasonal theme renderable without client-only state', () => {
    for (const theme of Object.values(seasonalHomeThemes)) {
      expect(theme.label).toBeTruthy();
      expect(theme.invocation).toBeTruthy();
      expect(theme.promise).toBeTruthy();
      expect(theme.palette.root).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.palette.petal).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.motion.petalCount).toBeGreaterThan(0);
    }
  });

  it('uses spring as the stable server-safe default', () => {
    expect(defaultSeasonalHomeTheme).toBe(seasonalHomeThemes.spring);
  });
});
