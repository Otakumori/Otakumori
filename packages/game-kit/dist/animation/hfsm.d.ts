/**
 * Hierarchical Finite State Machine for animations
 */
import { AnimState } from './states';
export interface HFSM {
  current: AnimState;
  previous: AnimState;
  transitionProgress: number;
  transitionDuration: number;
  blendWeights: Map<AnimState, number>;
  stateTime: number;
}
export interface Transition {
  from: AnimState;
  to: AnimState;
  condition: (data: TransitionData) => boolean;
  duration: number;
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
export declare function createHFSM(initialState?: AnimState): HFSM;
/**
 * Default transitions
 */
export declare const DEFAULT_TRANSITIONS: Transition[];
/**
 * Update HFSM
 */
export declare function updateHFSM(
  hfsm: HFSM,
  data: TransitionData,
  dt: number,
  transitions?: Transition[],
): void;
/**
 * Transition to a new state
 */
export declare function transitionTo(hfsm: HFSM, newState: AnimState, duration?: number): void;
/**
 * Get current animation clip name
 */
export declare function getCurrentClip(hfsm: HFSM): string;
/**
 * Get blend weight for a state
 */
export declare function getBlendWeight(hfsm: HFSM, state: AnimState): number;
//# sourceMappingURL=hfsm.d.ts.map
