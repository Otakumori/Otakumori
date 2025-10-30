// Export React Three Fiber component
export { AvatarRenderer, preloadAvatar } from './AvatarRenderer.js';
export type { AvatarRendererProps, ResolvedEquipment } from './AvatarRenderer.js';

// Legacy imperative renderer interface (deprecated)
import type { AvatarSpecV15Type } from '../spec.js';

export interface RendererProps {
  spec: AvatarSpecV15Type;
  reducedMotion?: boolean;
}

export interface AvatarRendererLegacy {
  mount: (el: HTMLElement) => void;
  dispose: () => void;
}

/**
 * @deprecated Use AvatarRenderer component instead
 */
export function createRenderer(_props: RendererProps): AvatarRendererLegacy {
  return {
    mount: (_el: HTMLElement) => {
      console.warn('Legacy createRenderer is deprecated. Use AvatarRenderer component instead.');
    },
    dispose: () => {
      // No-op
    },
  };
}
