import { useState, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface PetalCollection {
  total: number;
  collected: number;
  lastCollected?: Date;
}

export const usePetalCollection = () => {
  const [collection, setCollection] = useState<PetalCollection>({
    total: 0,
    collected: 0,
  });
  const { showToast } = useToast();

  const collectPetal = useCallback(
    (amount: number = 1) => {
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

  const resetCollection = useCallback(() => {
    setCollection({
      total: 0,
      collected: 0,
    });
  }, []);

  const getCollectionProgress = useCallback(() => {
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
