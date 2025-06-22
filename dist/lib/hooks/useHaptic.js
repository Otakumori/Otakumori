'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useHaptic = void 0;
const react_1 = require('react');
const useHaptic = () => {
  const vibrate = (0, react_1.useCallback)(pattern => {
    if (!navigator.vibrate) return;
    const patterns = {
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
exports.useHaptic = useHaptic;
