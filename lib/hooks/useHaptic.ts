import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

export const useHaptic = () => {
  const vibrate = useCallback((pattern: HapticPattern) => {
    if (!navigator.vibrate) return;

    const patterns: Record<HapticPattern, number | number[]> = {
      light: 10,
      medium: 30,
      heavy: 50,
      success: [30, 50, 30],
      error: [50, 30, 50],
      warning: [30, 30, 30],
    };

    navigator.vibrate(patterns[pattern]);
  }, []);

  return { vibrate };
};
