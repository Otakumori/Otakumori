/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
export function useHaptic() {
  const vibrate = (pattern: number | number[] | string = 200) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      if (typeof pattern === 'string') {
        // Convert string patterns to vibration patterns
        switch (pattern) {
          case 'success':
            navigator.vibrate([100, 50, 100]);
            break;
          case 'error':
            navigator.vibrate([200, 100, 200]);
            break;
          default:
            navigator.vibrate(200);
        }
      } else {
        navigator.vibrate(pattern);
      }
    }
  };
  return { vibrate };
}
