/**
 * Animation state definitions
 */
export var AnimState;
(function (AnimState) {
  AnimState['Idle'] = 'Idle';
  AnimState['Walk'] = 'Walk';
  AnimState['Run'] = 'Run';
  AnimState['Jump'] = 'Jump';
  AnimState['Fall'] = 'Fall';
  AnimState['Land'] = 'Land';
  AnimState['Attack'] = 'Attack';
})(AnimState || (AnimState = {}));
/**
 * Default animation clips
 */
export const DEFAULT_CLIPS = {
  [AnimState.Idle]: { name: 'idle', duration: 1.0, loop: true },
  [AnimState.Walk]: { name: 'walk', duration: 0.8, loop: true },
  [AnimState.Run]: { name: 'run', duration: 0.6, loop: true },
  [AnimState.Jump]: { name: 'jump', duration: 0.4, loop: false },
  [AnimState.Fall]: { name: 'fall', duration: 0.5, loop: true },
  [AnimState.Land]: { name: 'land', duration: 0.3, loop: false },
  [AnimState.Attack]: { name: 'attack', duration: 0.5, loop: false },
};
/**
 * State transition thresholds
 */
export const ANIM_THRESHOLDS = {
  IDLE_SPEED: 0.1, // Below this = idle
  WALK_SPEED: 2.0, // Below this = walk, above = run
  FALL_VELOCITY: -0.5, // Below this = falling
  JUMP_VELOCITY: 0.1, // Above this = jumping
};
