/**
 * Centralized English Copy
 * 
 * Single source of truth for all user-facing text in the application.
 * All components must import from this file rather than using inline strings.
 */

export const en = {
  // Global Navigation
  nav: {
    home: 'Home',
    shop: 'Shop', 
    miniGames: 'Mini-Games',
    blog: 'Blog',
    about: 'About',
    profile: 'Profile',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    search: {
      placeholder: "What're ya buyin'?",
      noResults: 'No treasures found matching your search.',
      suggestions: 'Suggested searches',
    },
  },

  // Homepage
  homepage: {
    hero: {
      title: 'Welcome home, wanderer',
      subtitle: 'Discover anime treasures, play nostalgic games, and join our community',
      cta: 'Enter the Experience',
    },
    soapstone: {
      title: 'Leave a sign for fellow travelers',
      placeholder: 'Compose a sign…',
      button: 'Place Sign',
      success: 'Your sign has been placed for other travelers to find.',
      error: 'Failed to place sign. Please try again.',
    },
    previews: {
      shop: {
        title: 'Latest Arrivals',
        cta: 'Explore Shop',
      },
      blog: {
        title: 'Community Chronicles', 
        cta: 'Read More',
      },
      games: {
        title: 'Game Realm',
        cta: 'Enter Games',
      },
    },
    newsletter: {
      title: 'Join the Journey',
      placeholder: 'Enter your email',
      button: 'Subscribe',
      success: 'Welcome in. Message Received, Commander!',
      error: 'Failed to subscribe. Please try again.',
    },
  },

  // Mini-Games Hub
  games: {
    hub: {
      title: 'Otaku-mori Mini-Games',
      subtitle: 'Spin the cube. Choose a panel.',
      boot: {
        skip: 'Press any key to skip',
        loading: 'Loading GameCube interface...',
      },
      faces: {
        trade: 'Open Trade Center',
        games: 'Browse Mini-Games', 
        community: 'Open Avatar and Community Hub',
        music: 'Open Music and Extras',
      },
    },
    list: {
      'samurai-petal-slice': "Draw the Tetsusaiga's arc…",
      'anime-memory-match': 'Recall the faces bound by fate.',
      'bubble-pop-gacha': 'Pop for spy-craft secrets…',
      'rhythm-beat-em-up': "Sync to the Moon Prism's pulse.",
      'petal-storm-rhythm': 'Stormy rhythm playlist—precision timing for petals.',
      'memory-match': 'Flip cards and match pairs. Perfect recall earns bonuses.',
      'bubble-girl': 'Spawn bubbles, float and score. Sandbox or challenge mode.',
      'bubble-ragdoll': 'Toss the ragdoll into bubbles. Survive the chaos.',
      'blossomware': 'Chaotic micro-sessions—keep your petal streak alive.',
      'dungeon-of-desire': 'Descend into the dungeon. Survive rooms and claim rewards.',
      'maid-cafe-manager': 'Manage shifts and keep guests smiling.',
      'thigh-coliseum': 'Enter the arena. Win rounds and advance the bracket.',
      'quick-math': 'Answer fast. Pressure builds with each correct streak.',
      'puzzle-reveal': 'Clear the fog to reveal the art. Watch your energy.',
      'petal-samurai': 'Slash petals with style. Master storm and endless modes.',
    },
    achievements: {
      unlock: 'Achievement Unlocked!',
      rarity: {
        common: 'Common',
        rare: 'Rare', 
        legendary: 'Legendary',
      },
    },
    leaderboard: {
      title: 'Leaderboards',
      filters: {
        timeframe: {
          daily: 'Daily',
          weekly: 'Weekly',
          allTime: 'All Time',
        },
        category: {
          score: 'High Score',
          time: 'Best Time',
          completion: 'Completion Rate',
        },
      },
      empty: 'No scores yet. Be the first to make your mark!',
    },
    postGame: {
      victory: 'Victory!',
      defeat: "I didn't lose. Just ran out of health. – Edward Elric",
      playAgain: 'Play Again',
      mainMenu: 'Return to Hub',
      nextLevel: 'Next Level',
    },
  },

  // Shop
  shop: {
    title: 'Otaku-mori Shop',
    subtitle: 'Curated treasures for fellow travelers',
    product: {
      addToCart: 'Add to Cart',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      claim: 'Claim this treasure.',
      outOfStock: 'Out of Stock',
      preOrder: 'Pre-order',
    },
    cart: {
      title: 'Your Cart',
      empty: 'Your cart is empty. Discover treasures in our shop.',
      checkout: 'Proceed to Checkout',
      continue: 'Continue Shopping',
      total: 'Total',
      shipping: 'Shipping',
      tax: 'Tax',
    },
    checkout: {
      title: 'Checkout',
      success: 'Order placed successfully!',
      confirmation: 'Exquisite taste, Senpai, I knew you\'d choose wisely.',
      couponApplied: 'My little gift to you, enjoy your reward.',
      footer: '"Believe in yourself. Not in the you who believes in me. Not the me who believes in you. Believe in the you who believes in yourself." — Kamina',
    },
    wishlist: {
      title: 'Wishlist',
      empty: 'Your wishlist is empty. Add items you love.',
      added: 'Added to wishlist',
      removed: 'Removed from wishlist',
    },
  },

  // Trade Center
  trade: {
    title: 'Barter in the Scarlet Bazaar',
    subtitle: 'Present your offers',
    offer: {
      create: 'Create Offer',
      edit: 'Edit Offer',
      delete: 'Delete Offer',
      accept: 'Accept Trade',
      decline: 'Decline Trade',
      tooltip: 'Present your offer (worth more than 3 simoleons)',
    },
    status: {
      pending: 'Pending',
      accepted: 'Accepted',
      declined: 'Declined',
      completed: 'Completed',
    },
  },

  // Community
  community: {
    title: 'Community Hub',
    soapstones: {
      title: 'Traveler Signs',
      empty: 'No signs have been left yet. Be the first to leave your mark.',
      compose: 'Leave a Sign',
      praise: 'Send praise',
      report: 'Report',
    },
    praise: {
      send: 'Send Praise',
      stamps: {
        'cherry-bud': 'Cherry Bud',
        'petal-favorite': 'Petal Favorite', 
        'site-blossom': 'Site Blossom',
        'divine-bloom': 'Divine Bloom',
      },
      sent: 'Praise sent.',
      cooldown: 'You can send praise again in {time}.',
      limit: 'Daily praise limit reached.',
    },
    moderation: {
      actions: 'Actions',
      approve: 'Approve',
      remove: 'Remove',
      ban: 'Ban User',
      reason: 'Reason',
    },
  },

  // Profile
  profile: {
    title: 'Hall of Echoes',
    subtitle: 'This is your Hall of Echoes…',
    edit: {
      title: 'Shape your reflection.',
      displayName: 'Display Name',
      bio: 'Insider\'s Tale...',
      avatar: 'Give form to your inner self, Hanamichi.',
      save: 'Save Changes',
      success: "You've never looked more like yourself.",
    },
    tabs: {
      overview: 'Overview',
      achievements: 'Achievements', 
      orders: 'Orders',
      petals: 'Petals',
      settings: 'Settings',
    },
    stats: {
      gamesPlayed: 'Games Played',
      totalScore: 'Total Score',
      achievementsUnlocked: 'Achievements',
      petalBalance: 'Petal Balance',
    },
  },

  // Authentication
  auth: {
    signIn: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account',
    },
    signUp: {
      title: 'Join the Journey',
      subtitle: 'Create your account',
    },
    gated: {
      soapstone: 'Sign in to leave a sign for fellow travelers',
      praise: 'Sign in to send praise to other travelers',
      wishlist: 'Sign in to add items to your wishlist',
      trade: 'Sign in to present offers in the Scarlet Bazaar',
      community: 'Sign in to participate in community discussions',
    },
  },

  // Honorifics
  honorifics: {
    hanamichi: {
      term: 'Hanamichi',
      tooltip: "Hanamichi (花道): the 'path of flowers'—a dramatic entrance. Think 'star of the show.'",
    },
    senpai: {
      term: 'Senpai',
      tooltip: 'An honorific for someone with more experience or higher status.',
    },
  },

  // Petals (Currency)
  petals: {
    balance: 'Petal Balance',
    earn: 'Earned {amount} petals',
    spend: 'Spent {amount} petals',
    insufficient: 'Insufficient petals',
    transactions: 'Petal Transactions',
  },

  // Error States  
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'You need to be signed in to do that.',
    forbidden: 'You don\'t have permission to do that.',
    notFound: 'The page you\'re looking for doesn\'t exist.',
    rateLimit: 'Too many requests. Please slow down.',
    validation: 'Please check your input and try again.',
  },

  // Loading States
  loading: {
    generic: 'Loading...',
    games: 'Loading game...',
    shop: 'Loading products...',
    profile: 'Loading profile...',
    saving: 'Saving...',
    submitting: 'Submitting...',
  },

  // Footer
  footer: {
    copyright: "© {year} Otaku-mori. All petals accounted for. Don't go hollow.",
    trademark: 'Otakumori ™ made with ',
    links: {
      leaveSign: 'Leave a sign',
      cookieSettings: 'Cookie Settings',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      help: 'Help Center',
    },
    sections: {
      otakumori: 'Otaku-mori',
      support: 'Support', 
      legal: 'Legal',
      connect: 'Connect',
    },
  },

  // Accessibility
  a11y: {
    skipToMain: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    toggleTheme: 'Toggle theme',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    loading: 'Loading content',
    error: 'Error message',
    success: 'Success message',
  },

  // Time & Dates
  time: {
    justNow: 'Just now',
    minutesAgo: '{minutes}m ago',
    hoursAgo: '{hours}h ago', 
    daysAgo: '{days}d ago',
    weeksAgo: '{weeks}w ago',
  },

  // Common Actions
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    confirm: 'Confirm',
    retry: 'Retry',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    upload: 'Upload',
    download: 'Download',
  },
} as const;

// Type for intellisense and validation
export type Translation = typeof en;
export type TranslationKey = keyof typeof en;

// Helper function for interpolation
export function t(key: string, values?: Record<string, string | number>): string {
  // Simple dot notation key access
  const keys = key.split('.');
  let value: any = en;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  // Simple interpolation
  if (values) {
    return value.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key]?.toString() || match;
    });
  }
  
  return value;
}

export default en;
