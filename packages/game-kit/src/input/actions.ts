/**
 * Game input actions and default mappings
 */

export enum GameAction {
  MoveX = 'MoveX',
  MoveY = 'MoveY',
  Jump = 'Jump',
  Attack = 'Attack',
  Dash = 'Dash',
  Pause = 'Pause',
}

export interface KeyboardMapping {
  [GameAction.MoveX]: string[]; // Left/Right keys
  [GameAction.MoveY]: string[]; // Up/Down keys
  [GameAction.Jump]: string[];
  [GameAction.Attack]: string[];
  [GameAction.Dash]: string[];
  [GameAction.Pause]: string[];
}

export interface GamepadAxisMapping {
  axis: number;
  deadzone: number;
  invert?: boolean;
}

export interface GamepadButtonMapping {
  button: number;
}

export interface GamepadMapping {
  [GameAction.MoveX]: GamepadAxisMapping;
  [GameAction.MoveY]: GamepadAxisMapping;
  [GameAction.Jump]: GamepadButtonMapping;
  [GameAction.Attack]: GamepadButtonMapping;
  [GameAction.Dash]: GamepadButtonMapping;
  [GameAction.Pause]: GamepadButtonMapping;
}

export interface TouchControl {
  type: 'button' | 'joystick';
  position: 'left' | 'right' | 'center';
  size: number;
}

export interface TouchMapping {
  [GameAction.MoveX]: TouchControl;
  [GameAction.MoveY]: TouchControl;
  [GameAction.Jump]: TouchControl;
  [GameAction.Attack]: TouchControl;
  [GameAction.Dash]: TouchControl;
  [GameAction.Pause]: TouchControl;
}

export interface InputMapping {
  keyboard: KeyboardMapping;
  gamepad: GamepadMapping;
  touch: TouchMapping;
}

/**
 * Default input mapping
 */
export const DEFAULT_INPUT_MAP: InputMapping = {
  keyboard: {
    [GameAction.MoveX]: ['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight'],
    [GameAction.MoveY]: ['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'],
    [GameAction.Jump]: ['Space'],
    [GameAction.Attack]: ['KeyJ'],
    [GameAction.Dash]: ['KeyK'],
    [GameAction.Pause]: ['Escape'],
  },
  gamepad: {
    [GameAction.MoveX]: { axis: 0, deadzone: 0.15 },
    [GameAction.MoveY]: { axis: 1, deadzone: 0.15, invert: true },
    [GameAction.Jump]: { button: 0 }, // A button
    [GameAction.Attack]: { button: 2 }, // X button
    [GameAction.Dash]: { button: 1 }, // B button
    [GameAction.Pause]: { button: 9 }, // Start button
  },
  touch: {
    [GameAction.MoveX]: { type: 'joystick', position: 'left', size: 100 },
    [GameAction.MoveY]: { type: 'joystick', position: 'left', size: 100 },
    [GameAction.Jump]: { type: 'button', position: 'right', size: 60 },
    [GameAction.Attack]: { type: 'button', position: 'right', size: 60 },
    [GameAction.Dash]: { type: 'button', position: 'right', size: 60 },
    [GameAction.Pause]: { type: 'button', position: 'center', size: 40 },
  },
};

/**
 * Action state for a single frame
 */
export interface ActionState {
  [GameAction.MoveX]: number; // -1 to 1
  [GameAction.MoveY]: number; // -1 to 1
  [GameAction.Jump]: boolean;
  [GameAction.Attack]: boolean;
  [GameAction.Dash]: boolean;
  [GameAction.Pause]: boolean;
}

/**
 * Create empty action state
 */
export function createActionState(): ActionState {
  return {
    [GameAction.MoveX]: 0,
    [GameAction.MoveY]: 0,
    [GameAction.Jump]: false,
    [GameAction.Attack]: false,
    [GameAction.Dash]: false,
    [GameAction.Pause]: false,
  };
}
