/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
// Brand microcopy placeholders for Otakumori
// These are seed texts that can be iterated on later

export const BRAND_MICROCOPY = {
  // Search & Shop
  search: {
    placeholder: "Whatt're ya buyin'?",
    noResults: 'Nothing found in the realm...',
    suggestions: "Try searching for 'anime', 'gaming', or 'merch'",
  },

  // Authentication
  auth: {
    cta: 'Join the Ranks?',
    greeting: 'Welcome back, Commander!',
    signIn: 'Enter the Realm',
    signUp: 'Begin Your Journey',
    signOut: 'Leave the Throne',
    guest: 'Continue as Guest',
  },

  // Blog & Content
  blog: {
    signup: 'Join Otakumori Insiders… if you even care',
    readMore: 'Continue reading...',
    share: 'Share this wisdom',
    bookmark: 'Save for later',
    tags: 'Related topics',
  },

  // R18 Content Gate
  r18: {
    gate: 'Abyss ahead. Turn back, or press on.',
    warning: 'This content contains mature themes',
    confirm: 'I understand, proceed',
    cancel: 'Return to safety',
  },

  // Mini-Games
  games: {
    loading: 'Loading the arena...',
    paused: 'Game paused - take a breath',
    gameOver: 'Your journey ends here... for now',
    victory: 'Victory achieved!',
    newRecord: "New record! You're getting stronger",
    practice: 'Practice mode - no pressure',
  },

  // Hub & Navigation
  hub: {
    welcome: 'Welcome to the GameCube Hub',
    select: 'Choose your destination',
    loading: 'Initializing realm...',
    error: 'Something went wrong in the void',
  },

  // Profile & Achievements
  profile: {
    title: 'Your Legend',
    subtitle: 'Tales of your achievements',
    level: 'Level {level}',
    experience: '{current}/{total} XP',
    achievements: 'Trophies earned',
    cosmetics: 'Equipped items',
  },

  // Petals & Economy
  petals: {
    balance: 'Petal Balance',
    earn: 'Earn petals by playing games',
    spend: 'Spend on cosmetics and upgrades',
    bonus: 'Daily bonus available!',
    shop: 'Visit the Petal Store',
  },

  // Trade Center
  trade: {
    title: 'Trade Center',
    subtitle: 'Exchange items with other travelers',
    offer: 'Create trade offer',
    accept: 'Accept trade',
    decline: 'Decline trade',
    history: 'Trade history',
  },

  // Music Player
  music: {
    nowPlaying: 'Now Playing',
    playlist: 'Your Playlist',
    volume: 'Volume',
    mute: 'Mute',
    unmute: 'Unmute',
    favorite: 'Add to favorites',
  },

  // Admin
  admin: {
    title: "Princess Admin General's Throne",
    subtitle: 'Welcome to your domain, Your Highness',
    access: 'Join the Ranks?',
    denied: 'This throne room is reserved for those with proper authority',
    stats: 'Realm Statistics',
    users: 'User Management',
    content: 'Content Moderation',
    signOut: 'Leave the Throne',
  },

  // Errors & Messages
  errors: {
    notFound: 'Page not found in this realm',
    serverError: 'Something went wrong in the void',
    networkError: 'Connection to the realm failed',
    unauthorized: "You don't have permission to access this area",
    maintenance: 'The realm is under maintenance',
  },

  // Success Messages
  success: {
    saved: 'Changes saved successfully',
    updated: 'Profile updated',
    purchased: 'Purchase completed!',
    equipped: 'Item equipped',
    achievement: 'Achievement unlocked!',
  },

  // Loading States
  loading: {
    general: 'Loading...',
    games: 'Initializing games...',
    profile: 'Loading profile...',
    shop: 'Loading shop...',
    trade: 'Loading trade center...',
  },

  // Empty States
  empty: {
    achievements: 'No achievements yet. Start playing to earn them!',
    inventory: 'Your inventory is empty. Visit the shop to get started!',
    friends: 'No friends yet. Connect with other travelers!',
    messages: 'No messages yet. Be the first to leave a mark!',
    playlists: 'No playlists yet. Create your first one!',
  },
};

// Helper function to get microcopy with optional interpolation
export function getMicrocopy(key: string, replacements?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = BRAND_MICROCOPY;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if not found
    }
  }

  if (typeof value === 'string' && replacements) {
    return value.replace(/\{(\w+)\}/g, (match, key) => {
      return replacements[key]?.toString() || match;
    });
  }

  return value || key;
}

// Export individual sections for convenience
export const {
  search,
  auth,
  blog,
  r18,
  games,
  hub,
  profile,
  petals,
  trade,
  music,
  admin,
  errors,
  success,
  loading,
  empty,
} = BRAND_MICROCOPY;
