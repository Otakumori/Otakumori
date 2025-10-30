/**
 * React hook for input system
 */
import { useEffect, useRef, useState } from 'react';
import { createInputSystem, pollInput } from './system';
import { createActionState, DEFAULT_INPUT_MAP } from './actions';
/**
 * React hook for input polling
 */
export function useInput(options = {}) {
    const { mapping = DEFAULT_INPUT_MAP, enabled: initialEnabled = true } = options;
    const systemRef = useRef(null);
    const [state, setState] = useState(createActionState());
    const [enabled, setEnabled] = useState(initialEnabled);
    // Initialize input system
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        systemRef.current = createInputSystem(mapping);
        return () => {
            // Cleanup
            systemRef.current = null;
        };
    }, [mapping]);
    // Poll input each frame
    useEffect(() => {
        if (!systemRef.current || !enabled) {
            return;
        }
        let rafId;
        const poll = () => {
            if (systemRef.current) {
                const newState = pollInput(systemRef.current);
                setState(newState);
            }
            rafId = requestAnimationFrame(poll);
        };
        rafId = requestAnimationFrame(poll);
        return () => {
            cancelAnimationFrame(rafId);
        };
    }, [enabled]);
    return {
        state,
        system: systemRef.current,
        enabled,
        setEnabled,
    };
}
