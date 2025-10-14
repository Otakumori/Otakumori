'use client';

import { useCallback } from 'react';
import FallingPetals from './FallingPetals';
import AchievementNotification from './AchievementNotification';
import PetalCounter from './PetalCounter';
import { usePetalCollection } from '@/app/hooks/usePetalCollection';

/**
 * Main orchestrator for the petal collection system
 * Manages falling petals, counter, and achievement notifications
 */
export default function PetalSystem() {
  const { sessionTotal, showAchievement, collectPetal, dismissAchievement, hasCollectedAny } =
    usePetalCollection();

  const handlePetalCollect = useCallback(
    (petalId: number, value: number, x: number, y: number) => {
      collectPetal(petalId, value, x, y);
    },
    [collectPetal],
  );

  return (
    <>
      {/* Falling petals canvas - z-index: 0 (behind main content at z-index: 10+) */}
      <FallingPetals onPetalCollect={handlePetalCollect} />

      {/* Achievement notification - only shows on first collection */}
      {showAchievement && (
        <AchievementNotification show={showAchievement} onDismiss={dismissAchievement} />
      )}

      {/* Persistent counter - only shows after first collection */}
      {hasCollectedAny && <PetalCounter count={sessionTotal} />}
    </>
  );
}
