export { AvatarRenderer, preloadAvatar } from './AvatarRenderer.js';
export type { AvatarRendererProps, ResolvedEquipment } from './AvatarRenderer.js';
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
export declare function createRenderer(_props: RendererProps): AvatarRendererLegacy;
//# sourceMappingURL=index.d.ts.map
