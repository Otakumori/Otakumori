import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  reduceGameSession,
  useGameActionBindings,
  useGameSession,
  type GameSessionState,
} from '@/app/mini-games/_shared/GameSession';

vi.mock('@/app/mini-games/_shared/audio-bus', () => ({
  pauseGameAudio: vi.fn().mockResolvedValue(undefined),
  resumeGameAudio: vi.fn().mockResolvedValue(undefined),
  stopGameAudio: vi.fn(),
}));

const initialState: GameSessionState = { phase: 'idle', result: null, error: null };

describe('shared game platform', () => {
  it('keeps session transitions typed and rejects invalid phase changes', () => {
    const running = reduceGameSession(initialState, { type: 'start' });
    expect(running.phase).toBe('running');
    expect(reduceGameSession(initialState, { type: 'pause' })).toEqual(initialState);
    expect(reduceGameSession(running, { type: 'pause' }).phase).toBe('paused');
  });

  it('coordinates pause, resume, exit cleanup, and focus restoration', () => {
    const pause = vi.fn();
    const resume = vi.fn();
    const cleanup = vi.fn();
    const onExit = vi.fn();

    function Harness() {
      const session = useGameSession({ initialPhase: 'idle', onExit });

      return (
        <>
          <output aria-label="Session phase">{session.phase}</output>
          <button type="button" onClick={session.start}>Start</button>
          <button type="button" onClick={session.pause}>Pause</button>
          <button type="button" onClick={session.resume}>Resume</button>
          <button type="button" onClick={session.exit}>Exit</button>
          <button
            type="button"
            onClick={() => session.registerLifecycle({ pause, resume, cleanup })}
          >
            Register lifecycle
          </button>
        </>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Register lifecycle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('status', { name: 'Session phase' })).toHaveTextContent('paused');
    expect(pause).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(screen.getByRole('status', { name: 'Session phase' })).toHaveTextContent('running');
    expect(resume).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
    expect(cleanup).toHaveBeenCalledOnce();
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('maps shared actions without capturing editable controls', () => {
    const onAction = vi.fn();

    function InputHarness() {
      useGameActionBindings({ bindings: { Enter: 'confirm' }, onAction });
      return <input aria-label="Player name" />;
    }

    render(<InputHarness />);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onAction).toHaveBeenCalledWith('confirm', expect.any(KeyboardEvent));

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Player name' }), { key: 'Enter' });
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
