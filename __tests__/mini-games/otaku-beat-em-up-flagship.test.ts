import { describe, expect, it } from 'vitest';

import {
  getBeatEmUpRunGrade,
  getWaveEncounterPlan,
  isStoryClimaxWave,
  shouldCompleteStoryRun,
} from '@/app/mini-games/(games)/otaku-beat-em-up/beatEmUpProduct';

describe('Otaku Beat-em-up flagship completion', () => {
  it('keeps ordinary wave generation on the existing composition rules', () => {
    const randomValues = [0.2, 0.5, 0.1, 0.8, 0.9, 0.2, 0.7, 0.8, 0.9, 0.2, 0.7, 0.8, 0.9, 0.9];
    let index = 0;
    const plan = getWaveEncounterPlan('story', 6, () => randomValues[index++] ?? 0.9);

    expect(plan).toHaveLength(8);
    expect(plan.map(({ type }) => type)).toEqual([
      'brute',
      'ninja',
      'grunt',
      'brute',
      'grunt',
      'ninja',
      'grunt',
      'grunt',
    ]);
    expect(plan.map(({ delayMs }) => delayMs)).toEqual([0, 300, 600, 900, 1200, 1500, 1800, 2100]);
  });

  it('authors Story wave ten from only the established enemy vocabulary', () => {
    const plan = getWaveEncounterPlan('story', 10);

    expect(isStoryClimaxWave('story', 10)).toBe(true);
    expect(plan.map(({ type }) => type)).toEqual([
      'ninja',
      'brute',
      'ninja',
      'boss',
      'grunt',
      'brute',
    ]);
    expect(plan.find(({ movement }) => movement === 'boss-reveal')?.delayMs).toBe(2600);
    expect(new Set(plan.map(({ type }) => type))).toEqual(
      new Set(['grunt', 'ninja', 'brute', 'boss']),
    );
  });

  it('keeps Story completion and non-Story mode semantics isolated', () => {
    expect(shouldCompleteStoryRun('story', 9)).toBe(false);
    expect(shouldCompleteStoryRun('story', 10)).toBe(true);
    expect(shouldCompleteStoryRun('arcade', 10)).toBe(false);
    expect(shouldCompleteStoryRun('survival', 10)).toBe(false);
    expect(isStoryClimaxWave('arcade', 10)).toBe(false);
    expect(isStoryClimaxWave('survival', 10)).toBe(false);
    expect(getWaveEncounterPlan('arcade', 10, () => 0.9)).toHaveLength(8);
    expect(getWaveEncounterPlan('survival', 10, () => 0.9)).toHaveLength(8);
  });

  it('grades each mode deterministically without claiming a persisted rank', () => {
    expect(getBeatEmUpRunGrade('story', 9_999)).toBe('C');
    expect(getBeatEmUpRunGrade('story', 10_000)).toBe('B');
    expect(getBeatEmUpRunGrade('story', 25_000)).toBe('A');
    expect(getBeatEmUpRunGrade('story', 45_000)).toBe('S');
    expect(getBeatEmUpRunGrade('arcade', 20_000)).toBe('A');
    expect(getBeatEmUpRunGrade('survival', 30_000)).toBe('A');
  });
});
