/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useEffect } from 'react';
import { useAchievements } from '../components/achievements/AchievementProvider';

export function useLoreAchievements() {
  const { unlockAchievement } = useAchievements();

  // Track hidden link clicks
  const trackHiddenLinkClick = () => {
    unlockAchievement('hidden_link_clicks');
  };

  // Track 404 visits
  const track404Visit = () => {
    unlockAchievement('404_visits');
  };

  // Track lore message deciphering
  const trackLoreMessageDeciphered = () => {
    unlockAchievement('lore_messages_deciphered');
  };

  // Track secret page visits
  const trackSecretPageVisit = () => {
    unlockAchievement('secret_page_visits');
  };

  // Track easter egg discoveries
  const trackEasterEggDiscovery = () => {
    unlockAchievement('easter_egg_discoveries');
  };

  // Track lore item collection
  const trackLoreItemCollection = () => {
    unlockAchievement('lore_items_collected');
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
