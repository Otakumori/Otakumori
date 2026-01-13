'use client';

import { useCallback, memo } from 'react';
import FallingPetals from './FallingPetals';
import AchievementNotification from './AchievementNotification';
import PetalCounter from './PetalCounter';
import { usePetalCollectionContext } from '@/app/contexts/PetalCollectionContext';

/**
 * Main orchestrator for the petal collection system
 * Manages falling petals, counter, and achievement notifications
 * Optimized for performance with memoization and singleton context
 */
function PetalSystemComponent() {
  const {
    sessionTotal,
    showAchievement,
    collectPetal,
    dismissAchievement,
    hasCollectedAny,
    lastCollectedValue,
  } = usePetalCollectionContext();

  const handlePetalCollect = useCallback(
    (petalId: number, value: number, x: number, y: number) => {
      collectPetal(petalId, value, x, y);
    },
    [collectPetal],
  );

  return (
    <>
      {/* Falling petals canvas - z-index: 5 */}
      <FallingPetals onPetalCollect={handlePetalCollect} />

      {/* Achievement notification - only shows on first collection */}
      {showAchievement && (
        <AchievementNotification show={showAchievement} onDismiss={dismissAchievement} />
      )}

      {/* Persistent counter - only shows after first collection */}
      {hasCollectedAny && <PetalCounter count={sessionTotal} lastValue={lastCollectedValue} />}
    </>
  );
}

// Memoize to prevent re-renders when parent updates
export default memo(PetalSystemComponent);
