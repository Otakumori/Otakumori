import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';

import Engine from '@/components/arcade/Engine';
import type { EngineGame, GameProps } from '@/components/arcade/types';

const earnPetals = vi.fn(async () => ({ success: true, status: 'awarded' }));
const disposed: string[] = [];

vi.mock('@/components/arcade/useProgress', () => ({
  useProgress: () => ({
    addPetalsEarned: vi.fn(),
    getBestScore: vi.fn(() => 0),
    progress: { dailyStreak: 0 },
    updateBestScore: vi.fn(),
    updateDailyStreak: vi.fn(),
  }),
}));

vi.mock('@/components/arcade/useRewards', () => ({
  useRewards: () => ({ attemptReward: vi.fn(), isSignedIn: true }),
}));

vi.mock('@/app/mini-games/_shared/usePetalEarn', () => ({
  usePetalEarn: () => ({ earnPetals }),
}));

function Microgame({ id, onComplete, paused }: GameProps & { id: string }) {
  useEffect(() => () => void disposed.push(id), [id]);
  return (
    <button disabled={paused} onClick={() => onComplete(id === 'a' ? 40 : 60, 10)}>
      {id}:{paused ? 'paused' : 'running'}
    </button>
  );
}

const playlist: EngineGame[] = [
  {
    id: 'a',
    label: 'Microgame A',
    durationSec: 10,
    component: (props) => <Microgame {...props} id="a" />,
  },
  {
    id: 'b',
    label: 'Microgame B',
    durationSec: 10,
    component: (props) => <Microgame {...props} id="b" />,
  },
];

describe('Blossomware orchestration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    earnPetals.mockClear();
    disposed.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mounts one microgame at a time, disposes transitions, and completes once', async () => {
    const onRunComplete = vi.fn();
    render(<Engine playlist={playlist} autoplay onRunComplete={onRunComplete} />);

    await act(async () => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole('button', { name: 'a:running' }));
    fireEvent.click(screen.getByRole('button', { name: 'a:running' }));

    await act(async () => vi.advanceTimersByTime(1500));
    expect(screen.queryByRole('button', { name: 'a:running' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'b:running' })).toBeInTheDocument();
    expect(disposed).toContain('a');

    await act(async () => vi.advanceTimersByTime(1000));

    fireEvent.click(screen.getByRole('button', { name: 'b:running' }));
    fireEvent.click(screen.getByRole('button', { name: 'b:running' }));

    expect(onRunComplete).toHaveBeenCalledTimes(1);
    expect(onRunComplete).toHaveBeenCalledWith({
      failures: 0,
      roundsCompleted: 2,
      score: 100,
      successes: 2,
      totalRounds: 2,
    });
    expect(earnPetals).toHaveBeenCalledTimes(2);
  });

  it('forwards pause state and holds a completion until resume', async () => {
    const onRunComplete = vi.fn();
    const view = render(
      <Engine playlist={playlist.slice(0, 1)} autoplay paused onRunComplete={onRunComplete} />,
    );

    await act(async () => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: 'a:paused' })).toBeDisabled();

    view.rerender(
      <Engine playlist={playlist.slice(0, 1)} autoplay paused={false} onRunComplete={onRunComplete} />,
    );
    await act(async () => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('button', { name: 'a:running' })).toBeEnabled();

    view.rerender(
      <Engine playlist={playlist.slice(0, 1)} autoplay paused onRunComplete={onRunComplete} />,
    );
    expect(screen.getByRole('button', { name: 'a:paused' })).toBeDisabled();
    expect(onRunComplete).not.toHaveBeenCalled();
  });
});
