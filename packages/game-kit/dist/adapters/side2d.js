/**
 * Side-scroller adapter for 2.5D games
 * Constrains movement to X/Y plane (Z=0) with orthographic camera
 */
/**
 * Create a side-scroller adapter
 */
export function createSide2DAdapter(orthoSize = 10, followDamping = 0.1) {
    return {
        clampZ: true,
        orthoSize,
        followTarget: null,
        followDamping,
        cameraPosition: { x: 0, y: 5, z: 10 },
        cameraOffset: { x: 0, y: 2, z: 0 },
    };
}
/**
 * Create an orthographic camera rig
 */
export function createOrthoCamera(size, aspect, near = 0.1, far = 1000) {
    return {
        position: { x: 0, y: 5, z: 10 },
        target: { x: 0, y: 0, z: 0 },
        size,
        aspect,
        near,
        far,
    };
}
/**
 * Constrain movement to 2D plane (clamp Z to 0)
 */
export function constrainMovement(velocity) {
    return {
        x: velocity.x,
        y: velocity.y,
        z: 0, // Always clamp Z
    };
}
/**
 * Constrain position to 2D plane
 */
export function constrainPosition(position) {
    return {
        x: position.x,
        y: position.y,
        z: 0,
    };
}
/**
 * Update camera to follow target with damping
 */
export function followTarget(camera, targetPos, offset, damping, dt) {
    const desiredPos = {
        x: targetPos.x + offset.x,
        y: targetPos.y + offset.y,
        z: camera.position.z, // Keep Z fixed
    };
    // Smooth follow with damping
    const lerpFactor = 1 - Math.exp(-damping * dt * 60); // Frame-rate independent
    camera.position.x += (desiredPos.x - camera.position.x) * lerpFactor;
    camera.position.y += (desiredPos.y - camera.position.y) * lerpFactor;
    // Update target
    camera.target.x = camera.position.x;
    camera.target.y = camera.position.y;
    camera.target.z = 0;
}
/**
 * Convert world position to screen coordinates
 */
export function worldToScreen(pos, camera, screenWidth, screenHeight) {
    // Calculate visible world space
    const halfHeight = camera.size / 2;
    const halfWidth = (camera.size * camera.aspect) / 2;
    // Calculate relative position from camera
    const relX = pos.x - (camera.position.x - halfWidth);
    const relY = pos.y - (camera.position.y - halfHeight);
    // Convert to screen space
    const screenX = (relX / (halfWidth * 2)) * screenWidth;
    const screenY = screenHeight - (relY / (halfHeight * 2)) * screenHeight;
    return [screenX, screenY];
}
/**
 * Convert screen coordinates to world position
 */
export function screenToWorld(x, y, camera, screenWidth, screenHeight) {
    // Calculate visible world space
    const halfHeight = camera.size / 2;
    const halfWidth = (camera.size * camera.aspect) / 2;
    // Convert screen to normalized coordinates
    const normX = x / screenWidth;
    const normY = 1 - y / screenHeight;
    // Convert to world space
    const worldX = camera.position.x - halfWidth + normX * halfWidth * 2;
    const worldY = camera.position.y - halfHeight + normY * halfHeight * 2;
    return { x: worldX, y: worldY, z: 0 };
}
/**
 * Get camera bounds in world space
 */
export function getCameraBounds(camera) {
    const halfHeight = camera.size / 2;
    const halfWidth = (camera.size * camera.aspect) / 2;
    return {
        left: camera.position.x - halfWidth,
        right: camera.position.x + halfWidth,
        top: camera.position.y + halfHeight,
        bottom: camera.position.y - halfHeight,
    };
}
/**
 * Check if a position is visible in camera
 */
export function isVisible(pos, camera) {
    const bounds = getCameraBounds(camera);
    return (pos.x >= bounds.left && pos.x <= bounds.right && pos.y >= bounds.bottom && pos.y <= bounds.top);
}
