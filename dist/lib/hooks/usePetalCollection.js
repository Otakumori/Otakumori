'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.usePetalCollection = void 0;
const react_1 = require('react');
const Toast_1 = require('@/components/Toast');
const usePetalCollection = () => {
  const [collection, setCollection] = (0, react_1.useState)({
    total: 0,
    collected: 0,
  });
  const { showToast } = (0, Toast_1.useToast)();
  const collectPetal = (0, react_1.useCallback)(
    (amount = 1) => {
      setCollection(prev => {
        const newCollection = {
          ...prev,
          collected: prev.collected + amount,
          lastCollected: new Date(),
        };
        showToast(`Collected ${amount} petal${amount > 1 ? 's' : ''}! 🌸`, 'success', '🌸');
        return newCollection;
      });
    },
    [showToast]
  );
  const resetCollection = (0, react_1.useCallback)(() => {
    setCollection({
      total: 0,
      collected: 0,
    });
  }, []);
  const getCollectionProgress = (0, react_1.useCallback)(() => {
    if (collection.total === 0) return 0;
    return (collection.collected / collection.total) * 100;
  }, [collection]);
  return {
    collection,
    collectPetal,
    resetCollection,
    getCollectionProgress,
  };
};
exports.usePetalCollection = usePetalCollection;
