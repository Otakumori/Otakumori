/**
 * Game input actions and default mappings
 */
export var GameAction;
(function (GameAction) {
    GameAction["MoveX"] = "MoveX";
    GameAction["MoveY"] = "MoveY";
    GameAction["Jump"] = "Jump";
    GameAction["Attack"] = "Attack";
    GameAction["Dash"] = "Dash";
    GameAction["Pause"] = "Pause";
})(GameAction || (GameAction = {}));
/**
 * Default input mapping
 */
export const DEFAULT_INPUT_MAP = {
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
 * Create empty action state
 */
export function createActionState() {
    return {
        [GameAction.MoveX]: 0,
        [GameAction.MoveY]: 0,
        [GameAction.Jump]: false,
        [GameAction.Attack]: false,
        [GameAction.Dash]: false,
        [GameAction.Pause]: false,
    };
}
