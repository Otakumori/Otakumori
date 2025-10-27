/**
 * React hook for input system
 */

import { useEffect, useRef, useState } from 'react';
import { createInputSystem, pollInput, type InputSystem } from './system';
import type { InputMapping, ActionState } from './actions';
import { createActionState, DEFAULT_INPUT_MAP } from './actions';

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
export function useInput(options: UseInputOptions = {}): UseInputResult {
  const { mapping = DEFAULT_INPUT_MAP, enabled: initialEnabled = true } = options;

  const systemRef = useRef<InputSystem | null>(null);
  const [state, setState] = useState<ActionState>(createActionState());
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

    let rafId: number;

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
