'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useAllAchievements = useAllAchievements;
const useAchievementTracking_1 = require('./useAchievementTracking');
const useShoppingAchievements_1 = require('./useShoppingAchievements');
const useProfileAchievements_1 = require('./useProfileAchievements');
const useCommunityAchievements_1 = require('./useCommunityAchievements');
const useLoreAchievements_1 = require('./useLoreAchievements');
const useSeasonalAchievements_1 = require('./useSeasonalAchievements');
const useSpecialAchievements_1 = require('./useSpecialAchievements');
function useAllAchievements() {
  const achievementTracking = (0, useAchievementTracking_1.useAchievementTracking)();
  const shoppingAchievements = (0, useShoppingAchievements_1.useShoppingAchievements)();
  const profileAchievements = (0, useProfileAchievements_1.useProfileAchievements)();
  const communityAchievements = (0, useCommunityAchievements_1.useCommunityAchievements)();
  const loreAchievements = (0, useLoreAchievements_1.useLoreAchievements)();
  const seasonalAchievements = (0, useSeasonalAchievements_1.useSeasonalAchievements)();
  const specialAchievements = (0, useSpecialAchievements_1.useSpecialAchievements)();
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
