/**
 * React hook for input system
 */
import { type InputSystem } from './system';
import type { InputMapping, ActionState } from './actions';
export interface UseInputOptions {
    mapping?: InputMapping;
    enabled?: boolean;
}
export interface UseInputResult {
    state: ActionState;
    system: InputSystem | null;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}
/**
 * React hook for input polling
 */
export declare function useInput(options?: UseInputOptions): UseInputResult;
//# sourceMappingURL=useInput.d.ts.map