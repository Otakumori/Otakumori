/**
 * Game input actions and default mappings
 */
export declare enum GameAction {
  MoveX = 'MoveX',
  MoveY = 'MoveY',
  Jump = 'Jump',
  Attack = 'Attack',
  Dash = 'Dash',
  Pause = 'Pause',
}
export interface KeyboardMapping {
  [GameAction.MoveX]: string[];
  [GameAction.MoveY]: string[];
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
export declare const DEFAULT_INPUT_MAP: InputMapping;
/**
 * Action state for a single frame
 */
export interface ActionState {
  [GameAction.MoveX]: number;
  [GameAction.MoveY]: number;
  [GameAction.Jump]: boolean;
  [GameAction.Attack]: boolean;
  [GameAction.Dash]: boolean;
  [GameAction.Pause]: boolean;
}
/**
 * Create empty action state
 */
export declare function createActionState(): ActionState;
//# sourceMappingURL=actions.d.ts.map
