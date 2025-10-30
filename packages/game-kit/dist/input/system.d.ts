/**
 * Input polling system for keyboard, gamepad, and touch
 */
import { GameAction, type InputMapping, type ActionState } from './actions';
export interface InputSystem {
  mapping: InputMapping;
  keyPressed: Set<string>;
  prevKeyPressed: Set<string>;
  gamepadIndex: number | null;
  touchActive: boolean;
  touchState: Map<
    string,
    {
      x: number;
      y: number;
    }
  >;
  enabled: boolean;
}
/**
 * Create an input system
 */
export declare function createInputSystem(mapping?: InputMapping): InputSystem;
/**
 * Poll input and return current action state
 */
export declare function pollInput(system: InputSystem): ActionState;
/**
 * Check if an action was just pressed this frame
 */
export declare function justPressed(system: InputSystem, action: GameAction): boolean;
/**
 * Check if an action was just released this frame
 */
export declare function justReleased(system: InputSystem, action: GameAction): boolean;
/**
 * Remap an action
 */
export declare function remapAction(system: InputSystem, action: GameAction, keys: string[]): void;
/**
 * Enable/disable input system
 */
export declare function setInputEnabled(system: InputSystem, enabled: boolean): void;
//# sourceMappingURL=system.d.ts.map
