/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useAchievementTracking } from './useAchievementTracking';
import { useShoppingAchievements } from './useShoppingAchievements';
import { useProfileAchievements } from './useProfileAchievements';
import { useCommunityAchievements } from './useCommunityAchievements';
import { useLoreAchievements } from './useLoreAchievements';
import { useSeasonalAchievements } from './useSeasonalAchievements';
import { useSpecialAchievements } from './useSpecialAchievements';

export function useAllAchievements() {
  const achievementTracking = useAchievementTracking();
  const shoppingAchievements = useShoppingAchievements();
  const profileAchievements = useProfileAchievements();
  const communityAchievements = useCommunityAchievements();
  const loreAchievements = useLoreAchievements();
  const seasonalAchievements = useSeasonalAchievements();
  const specialAchievements = useSpecialAchievements();

  return {
    ...achievementTracking,
    ...shoppingAchievements,
    ...profileAchievements,
    ...communityAchievements,
    ...loreAchievements,
    ...seasonalAchievements,
    ...specialAchievements,
  };
}
