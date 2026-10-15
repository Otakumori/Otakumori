import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  applyRadialDeadzone,
  ControllerService,
  getCommonControllerActions,
  type ControllerEnvironment,
  type ControllerSnapshot,
} from '@/app/mini-games/_input/gamepad.safe';
import { GAME_CONTROLLER_CAPABILITIES } from '@/app/mini-games/_shared/useGameController';

function gamepad({
  index = 0,
  buttons = [],
  axes = [0, 0, 0, 0],
}: {
  index?: number;
  buttons?: boolean[];
  axes?: number[];
}) {
  return {
    axes,
    buttons: buttons.map((pressed) => ({ pressed, touched: pressed, value: pressed ? 1 : 0 })),
    connected: true,
    hapticActuators: [],
    id: `Controller ${index}`,
    index,
    mapping: 'standard',
    timestamp: 1,
    vibrationActuator: null,
  } as unknown as Gamepad;
}

function controllerHarness() {
  let pads: readonly (Gamepad | null)[] = [];
  let frame: FrameRequestCallback | null = null;
  const cancelFrame = vi.fn();
  const addWindowListener = vi.fn();
  const removeWindowListener = vi.fn();
  const environment: ControllerEnvironment = {
    getGamepads: () => pads,
    requestFrame: vi.fn((callback) => {
      frame = callback;
      return 7;
    }),
    cancelFrame,
    addWindowListener,
    removeWindowListener,
  };
  const service = new ControllerService(environment);

  return {
    service,
    setPads(next: readonly (Gamepad | null)[]) {
      pads = next;
    },
    tick() {
      const callback = frame;
      if (!callback) throw new Error('Controller polling was not started');
      callback(0);
    },
    cancelFrame,
    addWindowListener,
    removeWindowListener,
  };
}

describe('shared controller foundation', () => {
  it('normalizes radial deadzones without adding a response curve', () => {
    expect(applyRadialDeadzone(0.05, 0.05)).toEqual([0, 0]);
    const [x, y] = applyRadialDeadzone(0.5, 0, 0.2);
    expect(x).toBeCloseTo(0.375);
    expect(y).toBe(0);
  });

  it('emits deterministic button edges from one scoped polling authority', () => {
    const harness = controllerHarness();
    const snapshots: Array<ControllerSnapshot | null> = [];
    harness.setPads([gamepad({ buttons: [false] })]);
    const unsubscribe = harness.service.subscribeFrames((snapshot) => snapshots.push(snapshot));

    harness.tick();
    harness.setPads([gamepad({ buttons: [true] })]);
    harness.tick();
    harness.tick();
    harness.setPads([gamepad({ buttons: [false] })]);
    harness.tick();

    expect(snapshots[1]?.buttons[0]).toMatchObject({ held: true, pressed: true });
    expect(snapshots[2]?.buttons[0]).toMatchObject({ held: true, pressed: false });
    expect(snapshots[3]?.buttons[0]).toMatchObject({ held: false, released: true });
    expect(getCommonControllerActions(snapshots[1]!)).toEqual(['confirm']);

    unsubscribe();
    expect(harness.cancelFrame).toHaveBeenCalledWith(7);
    expect(harness.removeWindowListener).toHaveBeenCalledWith(
      'gamepadconnected',
      expect.any(Function),
    );
  });

  it('emits one shared pause action for a held Start button', () => {
    const harness = controllerHarness();
    const actions: string[] = [];
    const heldStart = Array.from({ length: 10 }, (_, index) => index === 9);
    harness.setPads([gamepad({ buttons: heldStart })]);
    const unsubscribe = harness.service.subscribeFrames((snapshot) => {
      if (snapshot) actions.push(...getCommonControllerActions(snapshot));
    });

    harness.tick();
    harness.tick();

    expect(actions).toEqual(['pause']);
    unsubscribe();
  });

  it('selects the most recently active controller and clears disconnected state', () => {
    const harness = controllerHarness();
    const snapshots: Array<ControllerSnapshot | null> = [];
    harness.setPads([
      gamepad({ index: 0, buttons: [false] }),
      gamepad({ index: 1, axes: [0.8, 0] }),
    ]);
    const unsubscribe = harness.service.subscribeFrames((snapshot) => snapshots.push(snapshot));

    harness.tick();
    expect(snapshots.at(-1)?.index).toBe(1);
    expect(harness.service.getStatus()).toMatchObject({
      activeDevice: 'controller',
      connected: true,
      controllerIndex: 1,
    });

    harness.setPads([]);
    harness.tick();
    expect(snapshots.at(-1)).toBeNull();
    expect(harness.service.getStatus().connected).toBe(false);
    unsubscribe();
  });

  it('keeps representative gameplay mapping local and capability claims truthful', () => {
    const beatRuntime = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/otaku-beat-em-up/BeatEmUpGame.tsx'),
      'utf8',
    );
    const rhythmRuntime = readFileSync(
      join(process.cwd(), 'app/mini-games/(games)/petal-storm-rhythm/page.tsx'),
      'utf8',
    );
    const session = readFileSync(
      join(process.cwd(), 'app/mini-games/_shared/GameSession.tsx'),
      'utf8',
    );

    expect(beatRuntime).toContain("performAttack('light')");
    expect(beatRuntime).toContain("keysRef.current.has('controllerleft')");
    expect(rhythmRuntime).toContain('controller.buttons[lane]?.pressed');
    expect(rhythmRuntime).toContain('hitNote(lane)');
    expect(session).toContain("includes('pause')");
    expect(session).toContain("includes('exit')");

    expect(GAME_CONTROLLER_CAPABILITIES).toEqual({
      'otaku-beat-em-up': 'FULL_GAMEPLAY',
      'petal-storm-rhythm': 'GAMEPLAY_PARTIAL',
      'bubble-ragdoll': 'MENUS_ONLY',
      blossomware: 'MENUS_ONLY',
    });
  });
});
