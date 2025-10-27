// Export React Three Fiber component
export { AvatarRenderer, preloadAvatar } from './AvatarRenderer.js';
/**
 * @deprecated Use AvatarRenderer component instead
 */
export function createRenderer(_props) {
    return {
        mount: (_el) => {
            console.warn('Legacy createRenderer is deprecated. Use AvatarRenderer component instead.');
        },
        dispose: () => {
            // No-op
        },
    };
}
