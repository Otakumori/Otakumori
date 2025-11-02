// Export React Three Fiber component
export { AvatarRenderer, preloadAvatar } from './AvatarRenderer';
export type { AvatarRendererProps, ResolvedEquipment } from './AvatarRenderer';

// Legacy imperative renderer interface (deprecated)
import type { AvatarSpecV15Type } from '../spec';

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
export function createRenderer({ spec, reducedMotion }: RendererProps): AvatarRendererLegacy {
  return {
    mount: (el: HTMLElement) => {
      console.warn('Legacy createRenderer is deprecated. Use AvatarRenderer component instead.', {
        target: el.tagName,
        reducedMotion: Boolean(reducedMotion),
        specKeys: Object.keys(spec ?? {}),
      });
    },
    dispose: () => {
      console.warn('Legacy renderer dispose() called. Nothing to clean up.', {
        specKeys: Object.keys(spec ?? {}),
      });
    },
  };
}
