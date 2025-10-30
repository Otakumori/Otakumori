/**
 * Input polling system for keyboard, gamepad, and touch
 */
import { GameAction, createActionState, DEFAULT_INPUT_MAP } from './actions';
/**
 * Create an input system
 */
export function createInputSystem(mapping = DEFAULT_INPUT_MAP) {
  const system = {
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
export function pollInput(system) {
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
function pollKeyboard(system, state) {
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
function pollGamepad(system, state) {
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
 * Poll touch input (stub for now - can be extended with virtual controls)
 */
function pollTouch(_system, _state) {
  // Touch input would be handled by virtual on-screen controls
  // This is a placeholder for future implementation
}
/**
 * Check if an action was just pressed this frame
 */
export function justPressed(system, action) {
  const mapping = system.mapping.keyboard[action];
  return mapping.some((key) => system.keyPressed.has(key) && !system.prevKeyPressed.has(key));
}
/**
 * Check if an action was just released this frame
 */
export function justReleased(system, action) {
  const mapping = system.mapping.keyboard[action];
  return mapping.some((key) => !system.keyPressed.has(key) && system.prevKeyPressed.has(key));
}
/**
 * Remap an action
 */
export function remapAction(system, action, keys) {
  system.mapping.keyboard[action] = keys;
}
/**
 * Enable/disable input system
 */
export function setInputEnabled(system, enabled) {
  system.enabled = enabled;
  if (!enabled) {
    system.keyPressed.clear();
  }
}
