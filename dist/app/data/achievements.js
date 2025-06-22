'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.achievements = void 0;
exports.achievements = [
  // Site Interaction Achievements
  {
    id: 'first_visit',
    name: 'First Steps',
    description: 'Visit the site for the first time',
    category: 'Site Interaction',
    icon: '/assets/achievements/first_visit.png',
    petals: 10,
    progress: {
      current: 0,
      target: 1,
    },
  },
  {
    id: 'daily_visitor',
    name: 'Daily Visitor',
    description: 'Visit the site for 7 consecutive days',
    category: 'Site Interaction',
    icon: '/assets/achievements/daily_visitor.png',
    petals: 50,
    progress: {
      current: 0,
      target: 7,
    },
  },
  // Profile Growth Achievements
  {
    id: 'profile_complete',
    name: 'Profile Perfection',
    description: 'Complete your profile with all required information',
    category: 'Profile Growth',
    icon: '/assets/achievements/profile_complete.png',
    petals: 30,
    progress: {
      current: 0,
      target: 1,
    },
  },
  {
    id: 'avatar_upload',
    name: 'Face Reveal',
    description: 'Upload a profile picture',
    category: 'Profile Growth',
    icon: '/assets/achievements/avatar_upload.png',
    petals: 20,
    progress: {
      current: 0,
      target: 1,
    },
  },
  // Shopping Engagement Achievements
  {
    id: 'first_purchase',
    name: 'First Purchase',
    description: 'Make your first purchase',
    category: 'Shopping Engagement',
    icon: '/assets/achievements/first_purchase.png',
    petals: 40,
    progress: {
      current: 0,
      target: 1,
    },
  },
  {
    id: 'shopping_spree',
    name: 'Shopping Spree',
    description: 'Make 5 purchases',
    category: 'Shopping Engagement',
    icon: '/assets/achievements/shopping_spree.png',
    petals: 100,
    progress: {
      current: 0,
      target: 5,
    },
  },
  // Community and Commenting Achievements
  {
    id: 'first_comment',
    name: 'First Comment',
    description: 'Leave your first comment',
    category: 'Community and Commenting',
    icon: '/assets/achievements/first_comment.png',
    petals: 15,
    progress: {
      current: 0,
      target: 1,
    },
  },
  {
    id: 'comment_master',
    name: 'Comment Master',
    description: 'Leave 50 comments',
    category: 'Community and Commenting',
    icon: '/assets/achievements/comment_master.png',
    petals: 75,
    progress: {
      current: 0,
      target: 50,
    },
  },
  // Lore Discovery Achievements
  {
    id: 'lore_explorer',
    name: 'Lore Explorer',
    description: 'Read 10 lore entries',
    category: 'Lore Discovery',
    icon: '/assets/achievements/lore_explorer.png',
    petals: 60,
    progress: {
      current: 0,
      target: 10,
    },
  },
  {
    id: 'lore_master',
    name: 'Lore Master',
    description: 'Read all lore entries',
    category: 'Lore Discovery',
    icon: '/assets/achievements/lore_master.png',
    petals: 150,
    badge: 'Lore Master',
    progress: {
      current: 0,
      target: 50,
    },
  },
  // Mystery and Chaos Achievements
  {
    id: 'easter_egg_finder',
    name: 'Easter Egg Finder',
    description: 'Find your first easter egg',
    category: 'Mystery and Chaos',
    icon: '/assets/achievements/easter_egg_finder.png',
    petals: 25,
    isHidden: true,
    progress: {
      current: 0,
      target: 1,
    },
  },
  {
    id: 'chaos_master',
    name: 'Chaos Master',
    description: 'Find all easter eggs',
    category: 'Mystery and Chaos',
    icon: '/assets/achievements/chaos_master.png',
    petals: 200,
    badge: 'Chaos Master',
    isHidden: true,
    progress: {
      current: 0,
      target: 10,
    },
  },
  // Seasonal and Event Achievements
  {
    id: 'seasonal_participant',
    name: 'Seasonal Participant',
    description: 'Participate in a seasonal event',
    category: 'Seasonal and Event',
    icon: '/assets/achievements/seasonal_participant.png',
    petals: 80,
    progress: {
      current: 0,
      target: 1,
    },
  },
  {
    id: 'event_champion',
    name: 'Event Champion',
    description: 'Win a seasonal event',
    category: 'Seasonal and Event',
    icon: '/assets/achievements/event_champion.png',
    petals: 150,
    badge: 'Event Champion',
    progress: {
      current: 0,
      target: 1,
    },
  },
  // Special and Hidden Achievements
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Join during the beta phase',
    category: 'Special and Hidden',
    icon: '/assets/achievements/beta_tester.png',
    petals: 100,
    badge: 'Beta Tester',
    isHidden: true,
    progress: {
      current: 0,
      target: 1,
    },
  },
  {
    id: 'founder',
    name: 'Founder',
    description: 'Be one of the first 100 users',
    category: 'Special and Hidden',
    icon: '/assets/achievements/founder.png',
    petals: 200,
    badge: 'Founder',
    isHidden: true,
    progress: {
      current: 0,
      target: 1,
    },
  },
];
