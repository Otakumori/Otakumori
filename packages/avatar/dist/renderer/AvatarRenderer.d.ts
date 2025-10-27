/**
 * React Three Fiber Avatar Renderer Component
 * Policy-agnostic renderer that receives pre-resolved equipment URLs
 */
import type { AvatarSpecV15Type, EquipmentSlotType } from '../spec';
export interface ResolvedEquipment {
    id: string;
    url: string;
}
export interface AvatarRendererProps {
    spec: AvatarSpecV15Type;
    resolved: Partial<Record<EquipmentSlotType, ResolvedEquipment | null>>;
    reducedMotion?: boolean;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}
/**
 * AvatarRenderer - Loads and renders avatar with resolved equipment
 * NO POLICY LOGIC - equipment is already resolved by server
 */
export declare function AvatarRenderer({ spec, resolved, reducedMotion, onLoad, onError, }: AvatarRendererProps): import("react/jsx-runtime").JSX.Element;
export declare function preloadAvatar(baseMeshUrl: string): void;
//# sourceMappingURL=AvatarRenderer.d.ts.map