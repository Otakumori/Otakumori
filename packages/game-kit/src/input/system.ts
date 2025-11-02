/**
 * Input polling system for keyboard, gamepad, and touch
 */

import {
  GameAction,
  type InputMapping,
  type ActionState,
  createActionState,
  DEFAULT_INPUT_MAP,
} from './actions';

export interface InputSystem {
  mapping: InputMapping;
  keyPressed: Set<string>;
  prevKeyPressed: Set<string>;
  gamepadIndex: number | null;
  touchActive: boolean;
  touchState: Map<string, { x: number; y: number }>;
  enabled: boolean;
}

/**
 * Create an input system
 */
export function createInputSystem(mapping: InputMapping = DEFAULT_INPUT_MAP): InputSystem {
  const system: InputSystem = {
    mapping,
    keyPressed: new Set(),
    prevKeyPressed: new Set(),
    gamepadIndex: null,
    touchActive: false,
    touchState: new Map(),
    enabled: true,
  };

  // Set up keyboard listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (system.enabled) {
        system.keyPressed.add(e.code);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (system.enabled) {
        system.keyPressed.delete(e.code);
      }
    });

    // Gamepad connection
    window.addEventListener('gamepadconnected', (e) => {
      if (system.enabled && system.gamepadIndex === null) {
        system.gamepadIndex = e.gamepad.index;
      }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (system.gamepadIndex === e.gamepad.index) {
        system.gamepadIndex = null;
      }
    });

    // Touch detection
    window.addEventListener('touchstart', () => {
      system.touchActive = true;
    });
  }

  return system;
}

/**
 * Poll input and return current action state
 */
export function pollInput(system: InputSystem): ActionState {
  if (!system.enabled) {
    return createActionState();
  }

  const state = createActionState();

  // Poll keyboard
  pollKeyboard(system, state);

  // Poll gamepad
  if (system.gamepadIndex !== null) {
    pollGamepad(system, state);
  }

  // Poll touch (if active)
  if (system.touchActive) {
    pollTouch(system, state);
  }

  // Update previous key state
  system.prevKeyPressed = new Set(system.keyPressed);

  return state;
}

/**
 * Poll keyboard input
 */
function pollKeyboard(system: InputSystem, state: ActionState): void {
  const { keyboard } = system.mapping;

  // MoveX: A/Left = -1, D/Right = +1
  let moveX = 0;
  if (system.keyPressed.has('KeyA') || system.keyPressed.has('ArrowLeft')) {
    moveX -= 1;
  }
  if (system.keyPressed.has('KeyD') || system.keyPressed.has('ArrowRight')) {
    moveX += 1;
  }
  state[GameAction.MoveX] = moveX;

  // MoveY: W/Up = +1, S/Down = -1
  let moveY = 0;
  if (system.keyPressed.has('KeyW') || system.keyPressed.has('ArrowUp')) {
    moveY += 1;
  }
  if (system.keyPressed.has('KeyS') || system.keyPressed.has('ArrowDown')) {
    moveY -= 1;
  }
  state[GameAction.MoveY] = moveY;

  // Jump
  state[GameAction.Jump] = keyboard[GameAction.Jump].some((key) => system.keyPressed.has(key));

  // Attack
  state[GameAction.Attack] = keyboard[GameAction.Attack].some((key) => system.keyPressed.has(key));

  // Dash
  state[GameAction.Dash] = keyboard[GameAction.Dash].some((key) => system.keyPressed.has(key));

  // Pause
  state[GameAction.Pause] = keyboard[GameAction.Pause].some((key) => system.keyPressed.has(key));
}

/**
 * Poll gamepad input
 */
function pollGamepad(system: InputSystem, state: ActionState): void {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) {
    return;
  }

  const gamepads = navigator.getGamepads();
  const gamepad = system.gamepadIndex !== null ? gamepads[system.gamepadIndex] : null;

  if (!gamepad) {
    return;
  }

  const { gamepad: mapping } = system.mapping;

  // MoveX axis
  const moveXMapping = mapping[GameAction.MoveX];
  let moveX = gamepad.axes[moveXMapping.axis] || 0;
  if (Math.abs(moveX) < moveXMapping.deadzone) {
    moveX = 0;
  }
  if (moveXMapping.invert) {
    moveX = -moveX;
  }
  state[GameAction.MoveX] = Math.max(state[GameAction.MoveX], moveX);

  // MoveY axis
  const moveYMapping = mapping[GameAction.MoveY];
  let moveY = gamepad.axes[moveYMapping.axis] || 0;
  if (Math.abs(moveY) < moveYMapping.deadzone) {
    moveY = 0;
  }
  if (moveYMapping.invert) {
    moveY = -moveY;
  }
  state[GameAction.MoveY] = Math.max(state[GameAction.MoveY], moveY);

  // Jump button
  const jumpButton = mapping[GameAction.Jump].button;
  state[GameAction.Jump] =
    state[GameAction.Jump] || (gamepad.buttons[jumpButton]?.pressed ?? false);

  // Attack button
  const attackButton = mapping[GameAction.Attack].button;
  state[GameAction.Attack] =
    state[GameAction.Attack] || (gamepad.buttons[attackButton]?.pressed ?? false);

  // Dash button
  const dashButton = mapping[GameAction.Dash].button;
  state[GameAction.Dash] =
    state[GameAction.Dash] || (gamepad.buttons[dashButton]?.pressed ?? false);

  // Pause button
  const pauseButton = mapping[GameAction.Pause].button;
  state[GameAction.Pause] =
    state[GameAction.Pause] || (gamepad.buttons[pauseButton]?.pressed ?? false);
}

/**
 * Poll touch input and translate it into simple movement vectors.
 * Consumers can provide normalized touch coordinates via `system.touchState`.
 */
function pollTouch(system: InputSystem, state: ActionState): void {
  if (system.touchState.size === 0) {
    system.touchActive = false;
    return;
  }

  let avgX = 0;
  let avgY = 0;

  system.touchState.forEach(({ x, y }) => {
    avgX += x;
    avgY += y;
  });

  avgX /= system.touchState.size;
  avgY /= system.touchState.size;

  // Expect touch coordinates to be normalized between 0 and 1.
  const moveX = Math.max(-1, Math.min(1, (avgX - 0.5) * 2));
  const moveY = Math.max(-1, Math.min(1, (0.5 - avgY) * 2));

  state[GameAction.MoveX] = Math.abs(state[GameAction.MoveX]) > Math.abs(moveX)
    ? state[GameAction.MoveX]
    : moveX;
  state[GameAction.MoveY] = Math.abs(state[GameAction.MoveY]) > Math.abs(moveY)
    ? state[GameAction.MoveY]
    : moveY;
}

/**
 * Check if an action was just pressed this frame
 */
export function justPressed(system: InputSystem, action: GameAction): boolean {
  const mapping = system.mapping.keyboard[action];
  return mapping.some((key) => system.keyPressed.has(key) && !system.prevKeyPressed.has(key));
}

/**
 * Check if an action was just released this frame
 */
export function justReleased(system: InputSystem, action: GameAction): boolean {
  const mapping = system.mapping.keyboard[action];
  return mapping.some((key) => !system.keyPressed.has(key) && system.prevKeyPressed.has(key));
}

/**
 * Remap an action
 */
export function remapAction(system: InputSystem, action: GameAction, keys: string[]): void {
  system.mapping.keyboard[action] = keys;
}

/**
 * Enable/disable input system
 */
export function setInputEnabled(system: InputSystem, enabled: boolean): void {
  system.enabled = enabled;
  if (!enabled) {
    system.keyPressed.clear();
  }
}
