'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useLoreAchievements = useLoreAchievements;
const AchievementContext_1 = require('../contexts/AchievementContext');
function useLoreAchievements() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  // Track hidden link clicks
  const trackHiddenLinkClick = () => {
    checkAchievement('hidden_link_clicks', 1);
  };
  // Track 404 visits
  const track404Visit = () => {
    checkAchievement('404_visits', 1);
  };
  // Track lore message deciphering
  const trackLoreMessageDeciphered = () => {
    checkAchievement('lore_messages_deciphered', 1);
  };
  // Track secret page visits
  const trackSecretPageVisit = () => {
    checkAchievement('secret_page_visits', 1);
  };
  // Track easter egg discoveries
  const trackEasterEggDiscovery = () => {
    checkAchievement('easter_egg_discoveries', 1);
  };
  // Track lore item collection
  const trackLoreItemCollection = () => {
    checkAchievement('lore_items_collected', 1);
  };
  return {
    trackHiddenLinkClick,
    track404Visit,
    trackLoreMessageDeciphered,
    trackSecretPageVisit,
    trackEasterEggDiscovery,
    trackLoreItemCollection,
  };
}
