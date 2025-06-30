import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useLoreAchievements() {
  const { unlock } = useAchievements();

  // Track hidden link clicks
  const trackHiddenLinkClick = () => {
    unlock('hidden_link_clicks');
  };

  // Track 404 visits
  const track404Visit = () => {
    unlock('404_visits');
  };

  // Track lore message deciphering
  const trackLoreMessageDeciphered = () => {
    unlock('lore_messages_deciphered');
  };

  // Track secret page visits
  const trackSecretPageVisit = () => {
    unlock('secret_page_visits');
  };

  // Track easter egg discoveries
  const trackEasterEggDiscovery = () => {
    unlock('easter_egg_discoveries');
  };

  // Track lore item collection
  const trackLoreItemCollection = () => {
    unlock('lore_items_collected');
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
