/**
 * Hierarchical Finite State Machine for animations
 */

import { AnimState, ANIM_THRESHOLDS } from './states';

export interface HFSM {
  current: AnimState;
  previous: AnimState;
  transitionProgress: number; // 0-1 for cross-fade
  transitionDuration: number; // Total duration in seconds
  blendWeights: Map<AnimState, number>;
  stateTime: number; // Time in current state
}

export interface Transition {
  from: AnimState;
  to: AnimState;
  condition: (data: TransitionData) => boolean;
  duration: number; // Cross-fade duration in seconds
}

export interface TransitionData {
  horizontalSpeed: number;
  verticalVelocity: number;
  isGrounded: boolean;
  coyoteTimeRemaining: number;
  attackRequested: boolean;
}

/**
 * Create a new HFSM
 */
export function createHFSM(initialState: AnimState = AnimState.Idle): HFSM {
  return {
    current: initialState,
    previous: initialState,
    transitionProgress: 1.0,
    transitionDuration: 0.2,
    blendWeights: new Map([[initialState, 1.0]]),
    stateTime: 0,
  };
}

/**
 * Default transitions
 */
export const DEFAULT_TRANSITIONS: Transition[] = [
  // Idle <-> Walk
  {
    from: AnimState.Idle,
    to: AnimState.Walk,
    condition: (data) =>
      data.horizontalSpeed > ANIM_THRESHOLDS.IDLE_SPEED &&
      data.horizontalSpeed < ANIM_THRESHOLDS.WALK_SPEED &&
      data.isGrounded,
    duration: 0.2,
  },
  {
    from: AnimState.Walk,
    to: AnimState.Idle,
    condition: (data) => data.horizontalSpeed <= ANIM_THRESHOLDS.IDLE_SPEED && data.isGrounded,
    duration: 0.2,
  },

  // Walk <-> Run
  {
    from: AnimState.Walk,
    to: AnimState.Run,
    condition: (data) => data.horizontalSpeed >= ANIM_THRESHOLDS.WALK_SPEED && data.isGrounded,
    duration: 0.15,
  },
  {
    from: AnimState.Run,
    to: AnimState.Walk,
    condition: (data) =>
      data.horizontalSpeed < ANIM_THRESHOLDS.WALK_SPEED &&
      data.horizontalSpeed > ANIM_THRESHOLDS.IDLE_SPEED &&
      data.isGrounded,
    duration: 0.15,
  },

  // Any ground -> Jump (with coyote time)
  {
    from: AnimState.Idle,
    to: AnimState.Jump,
    condition: (data) =>
      data.verticalVelocity > ANIM_THRESHOLDS.JUMP_VELOCITY || data.coyoteTimeRemaining > 0,
    duration: 0.1,
  },
  {
    from: AnimState.Walk,
    to: AnimState.Jump,
    condition: (data) =>
      data.verticalVelocity > ANIM_THRESHOLDS.JUMP_VELOCITY || data.coyoteTimeRemaining > 0,
    duration: 0.1,
  },
  {
    from: AnimState.Run,
    to: AnimState.Jump,
    condition: (data) =>
      data.verticalVelocity > ANIM_THRESHOLDS.JUMP_VELOCITY || data.coyoteTimeRemaining > 0,
    duration: 0.1,
  },

  // Jump -> Fall
  {
    from: AnimState.Jump,
    to: AnimState.Fall,
    condition: (data) => data.verticalVelocity < ANIM_THRESHOLDS.FALL_VELOCITY,
    duration: 0.15,
  },

  // Fall -> Land
  {
    from: AnimState.Fall,
    to: AnimState.Land,
    condition: (data) => data.isGrounded,
    duration: 0.1,
  },

  // Land -> Idle/Walk/Run
  {
    from: AnimState.Land,
    to: AnimState.Idle,
    condition: (data) => data.isGrounded && data.horizontalSpeed <= ANIM_THRESHOLDS.IDLE_SPEED,
    duration: 0.2,
  },
  {
    from: AnimState.Land,
    to: AnimState.Walk,
    condition: (data) =>
      data.isGrounded &&
      data.horizontalSpeed > ANIM_THRESHOLDS.IDLE_SPEED &&
      data.horizontalSpeed < ANIM_THRESHOLDS.WALK_SPEED,
    duration: 0.2,
  },
  {
    from: AnimState.Land,
    to: AnimState.Run,
    condition: (data) => data.isGrounded && data.horizontalSpeed >= ANIM_THRESHOLDS.WALK_SPEED,
    duration: 0.2,
  },

  // Attack transitions (can attack from any grounded state)
  {
    from: AnimState.Idle,
    to: AnimState.Attack,
    condition: (data) => data.attackRequested && data.isGrounded,
    duration: 0.1,
  },
  {
    from: AnimState.Walk,
    to: AnimState.Attack,
    condition: (data) => data.attackRequested && data.isGrounded,
    duration: 0.1,
  },
  {
    from: AnimState.Run,
    to: AnimState.Attack,
    condition: (data) => data.attackRequested && data.isGrounded,
    duration: 0.1,
  },

  // Attack -> back to movement
  {
    from: AnimState.Attack,
    to: AnimState.Idle,
    condition: (data) =>
      !data.attackRequested && data.horizontalSpeed <= ANIM_THRESHOLDS.IDLE_SPEED,
    duration: 0.2,
  },
  {
    from: AnimState.Attack,
    to: AnimState.Walk,
    condition: (data) =>
      !data.attackRequested &&
      data.horizontalSpeed > ANIM_THRESHOLDS.IDLE_SPEED &&
      data.horizontalSpeed < ANIM_THRESHOLDS.WALK_SPEED,
    duration: 0.2,
  },
  {
    from: AnimState.Attack,
    to: AnimState.Run,
    condition: (data) =>
      !data.attackRequested && data.horizontalSpeed >= ANIM_THRESHOLDS.WALK_SPEED,
    duration: 0.2,
  },
];

/**
 * Update HFSM
 */
export function updateHFSM(
  hfsm: HFSM,
  data: TransitionData,
  dt: number,
  transitions: Transition[] = DEFAULT_TRANSITIONS,
): void {
  // Update state time
  hfsm.stateTime += dt;

  // Update transition progress
  if (hfsm.transitionProgress < 1.0) {
    hfsm.transitionProgress = Math.min(1.0, hfsm.transitionProgress + dt / hfsm.transitionDuration);
  }

  // Check for state transitions
  for (const transition of transitions) {
    if (transition.from === hfsm.current && transition.condition(data)) {
      transitionTo(hfsm, transition.to, transition.duration);
      break;
    }
  }

  // Update blend weights
  updateBlendWeights(hfsm, data);
}

/**
 * Transition to a new state
 */
export function transitionTo(hfsm: HFSM, newState: AnimState, duration: number = 0.2): void {
  if (hfsm.current === newState) {
    return;
  }

  hfsm.previous = hfsm.current;
  hfsm.current = newState;
  hfsm.transitionProgress = 0;
  hfsm.transitionDuration = duration;
  hfsm.stateTime = 0;
}

/**
 * Update blend weights for smooth transitions
 */
function updateBlendWeights(hfsm: HFSM, data: TransitionData): void {
  hfsm.blendWeights.clear();

  if (hfsm.transitionProgress < 1.0) {
    // Blend between previous and current
    const t = hfsm.transitionProgress;
    hfsm.blendWeights.set(hfsm.previous, 1 - t);
    hfsm.blendWeights.set(hfsm.current, t);
  } else {
    // Fully in current state
    // Apply speed-based blending for idle/walk/run
    if (
      hfsm.current === AnimState.Idle ||
      hfsm.current === AnimState.Walk ||
      hfsm.current === AnimState.Run
    ) {
      applySpeedBlending(hfsm, data.horizontalSpeed);
    } else {
      hfsm.blendWeights.set(hfsm.current, 1.0);
    }
  }
}

/**
 * Apply speed-based blending for locomotion
 */
function applySpeedBlending(hfsm: HFSM, speed: number): void {
  const { IDLE_SPEED, WALK_SPEED } = ANIM_THRESHOLDS;

  if (speed <= IDLE_SPEED) {
    // Pure idle
    hfsm.blendWeights.set(AnimState.Idle, 1.0);
  } else if (speed < WALK_SPEED) {
    // Blend idle -> walk
    const t = (speed - IDLE_SPEED) / (WALK_SPEED - IDLE_SPEED);
    hfsm.blendWeights.set(AnimState.Idle, 1 - t);
    hfsm.blendWeights.set(AnimState.Walk, t);
  } else {
    // Blend walk -> run
    const t = Math.min(1.0, (speed - WALK_SPEED) / WALK_SPEED);
    hfsm.blendWeights.set(AnimState.Walk, 1 - t);
    hfsm.blendWeights.set(AnimState.Run, t);
  }
}

/**
 * Get current animation clip name
 */
export function getCurrentClip(hfsm: HFSM): string {
  return hfsm.current;
}

/**
 * Get blend weight for a state
 */
export function getBlendWeight(hfsm: HFSM, state: AnimState): number {
  return hfsm.blendWeights.get(state) || 0;
}
