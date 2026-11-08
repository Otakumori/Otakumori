import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildPetalStormChart,
  validatePetalStormChart,
} from '@/app/mini-games/(games)/petal-storm-rhythm/petalStormCharts';

const track = { id: 'neon-pulse', bpm: 140, duration: 165, difficulty: 'hard' as const };
const options = { laneCount: 5, preparationDelay: 2000 };

describe('Petal Storm chart contract', () => {
  it('builds the same ordered chart for the same canonical track identity', () => {
    expect(buildPetalStormChart(track, options)).toEqual(buildPetalStormChart(track, options));
  });

  it('keeps every generated note inside the five-lane timing contract', () => {
    const chart = buildPetalStormChart(track, options);
    expect(chart.length).toBeGreaterThan(0);
    expect(validatePetalStormChart(chart, options.laneCount)).toEqual([]);
  });

  it('reports malformed chart data instead of accepting it silently', () => {
    const invalid = [
      { id: 'same', lane: 0, time: 2000, type: 'normal' as const },
      { id: 'same', lane: 8, time: 1000, type: 'normal' as const },
    ];
    expect(validatePetalStormChart(invalid, 5)).toEqual([
      'Duplicate note ID: same',
      'Invalid note time: same',
      'Invalid lane: same',
    ]);
  });

  it('uses the reward-free result path and five touch-accessible lanes', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/petal-storm-rhythm/page.tsx'),
      'utf8',
    );

    expect(source).toContain('resultKey: `${selectedTrack.id}:${selectedTrack.difficulty}`');
    expect(source).not.toContain('/api/v1/leaderboards/petal-storm-rhythm');
    expect(source).toContain("event.key === ' '");
    expect(source).toContain('or tap a lane');
    expect(source).toContain("touchAction: 'none'");
  });
});
