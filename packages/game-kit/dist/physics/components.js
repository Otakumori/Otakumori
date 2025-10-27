/**
 * Physics-related ECS components
 */
/**
 * Create a default transform
 */
export function createTransform(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
    return {
        position: { x: position[0], y: position[1], z: position[2] },
        rotation: { x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3] },
        scale: { x: scale[0], y: scale[1], z: scale[2] },
    };
}
/**
 * Create a default velocity
 */
export function createVelocity() {
    return {
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
    };
}
/**
 * Rigid body types
 */
export var RigidBodyType;
(function (RigidBodyType) {
    RigidBodyType["Dynamic"] = "dynamic";
    RigidBodyType["Fixed"] = "fixed";
    RigidBodyType["Kinematic"] = "kinematic";
})(RigidBodyType || (RigidBodyType = {}));
/**
 * Create a default character controller
 */
export function createCharacterController(options = {}) {
    return {
        velocity: options.velocity || { x: 0, y: 0, z: 0 },
        onGround: options.onGround ?? false,
        coyoteTime: options.coyoteTime ?? 0,
        jumpBuffer: options.jumpBuffer ?? 0,
        slopeLimit: options.slopeLimit ?? Math.PI / 4, // 45 degrees
        stepOffset: options.stepOffset ?? 0.3,
        speed: options.speed ?? 5.0,
        jumpForce: options.jumpForce ?? 10.0,
        grounded: options.grounded ?? false,
        groundedFrames: options.groundedFrames ?? 0,
    };
}
/**
 * Helper: Vec3 operations
 */
export const Vec3Math = {
    add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    },
    sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    },
    scale(v, s) {
        return { x: v.x * s, y: v.y * s, z: v.z * s };
    },
    length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    },
    normalize(v) {
        const len = Vec3Math.length(v);
        if (len === 0)
            return { x: 0, y: 0, z: 0 };
        return Vec3Math.scale(v, 1 / len);
    },
    zero() {
        return { x: 0, y: 0, z: 0 };
    },
};
