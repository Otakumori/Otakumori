/**
 * Animation state definitions
 */
export declare enum AnimState {
    Idle = "Idle",
    Walk = "Walk",
    Run = "Run",
    Jump = "Jump",
    Fall = "Fall",
    Land = "Land",
    Attack = "Attack"
}
/**
 * Animation clip data
 */
export interface AnimationClip {
    name: string;
    duration: number;
    loop: boolean;
}
/**
 * Default animation clips
 */
export declare const DEFAULT_CLIPS: Record<AnimState, AnimationClip>;
/**
 * State transition thresholds
 */
export declare const ANIM_THRESHOLDS: {
    IDLE_SPEED: number;
    WALK_SPEED: number;
    FALL_VELOCITY: number;
    JUMP_VELOCITY: number;
};
//# sourceMappingURL=states.d.ts.map