import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ControllerSnapshot } from '@/app/mini-games/_input/gamepad.safe';
import { useGameSession } from '@/app/mini-games/_shared/GameSession';

const controller = vi.hoisted(() => ({
  onFrame: null as ((snapshot: ControllerSnapshot | null) => void) | null,
}));

vi.mock('@/app/mini-games/_shared/useGameController', () => ({
  useControllerFrames: ({
    onFrame,
  }: {
    onFrame: (snapshot: ControllerSnapshot | null) => void;
  }) => {
    controller.onFrame = onFrame;
  },
}));

vi.mock('@/app/mini-games/_shared/audio-bus', () => ({
  pauseGameAudio: vi.fn().mockResolvedValue(undefined),
  resumeGameAudio: vi.fn().mockResolvedValue(undefined),
  stopGameAudio: vi.fn(),
}));

function snapshot(buttonIndex: number, pressed: boolean): ControllerSnapshot {
  const buttons = Array.from({ length: 16 }, (_, index) => ({
    held: index === buttonIndex,
    pressed: index === buttonIndex && pressed,
    released: false,
    value: index === buttonIndex ? 1 : 0,
  }));
  return { axes: [0, 0, 0, 0], buttons, id: 'Test pad', index: 0, mapping: 'standard', timestamp: 1 };
}

describe('controller session integration', () => {
  it('routes pause and exit through the single shared session authority', () => {
    const onExit = vi.fn();

    function Harness() {
      const session = useGameSession({ initialPhase: 'idle', onExit });
      return (
        <>
          <output aria-label="Phase">{session.phase}</output>
          <button type="button" onClick={session.start}>Start</button>
        </>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    act(() => controller.onFrame?.(snapshot(9, true)));
    expect(screen.getByRole('status', { name: 'Phase' })).toHaveTextContent('paused');

    act(() => controller.onFrame?.(snapshot(9, false)));
    expect(screen.getByRole('status', { name: 'Phase' })).toHaveTextContent('paused');

    act(() => controller.onFrame?.(snapshot(9, true)));
    expect(screen.getByRole('status', { name: 'Phase' })).toHaveTextContent('running');

    act(() => controller.onFrame?.(snapshot(8, true)));
    expect(onExit).toHaveBeenCalledOnce();
    expect(screen.getByRole('status', { name: 'Phase' })).toHaveTextContent('exiting');
  });
});
