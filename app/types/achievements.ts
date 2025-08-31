/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export type AchievementCategory =
  | 'Site Interaction'
  | 'Profile Growth'
  | 'Shopping Engagement'
  | 'Community and Commenting'
  | 'Lore Discovery'
  | 'Mystery and Chaos'
  | 'Seasonal and Event'
  | 'Special and Hidden';

export interface AchievementReward {
  petals: number;
  description?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  petals: number;
  badge?: string;
  unlockedAt?: string;
  isHidden?: boolean;
  isUnlocked?: boolean;
  progress?: number;
  target?: number;
  reward: AchievementReward;
}

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface AchievementContextType {
  achievements: Achievement[];
  getProgress: (achievementId: string) => AchievementProgress;
  unlockAchievement: (achievementId: string) => void;
  updateProgress: (achievementId: string, progress: number) => void;
}

export interface PetalTier {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPetals: number;
  unlockedAt?: string;
  tier?: number;
  title?: string;
  perks?: string[];
}

export const PETAL_TIERS: PetalTier[] = [
  {
    id: '1',
    name: 'Fallen Leaf',
    tier: 1,
    title: 'Fallen Leaf',
    description: 'A single petal rests beside you. The journey has begun, quiet and unnoticed.',
    requiredPetals: 100,
    perks: [],
    icon: '/assets/achievements/tier-1-fallen-leaf.png',
  },
  {
    id: '2',
    name: 'Budding Warden',
    tier: 2,
    title: 'Budding Warden',
    description: 'The air knows your scent. You care for fragments most overlook.',
    requiredPetals: 250,
    perks: [],
    icon: '/assets/achievements/tier-2-budding-warden.png',
  },
  {
    id: '3',
    name: 'Bloomtouched',
    tier: 3,
    title: 'Bloomtouched',
    description: 'You walk where petals grow. Luck? Or something blooming beneath the surface.',
    requiredPetals: 500,
    perks: [],
    icon: '/assets/achievements/tier-3-bloomtouched.png',
  },
  {
    id: '4',
    name: 'Petalforged',
    tier: 4,
    title: 'Petalforged',
    description: "These petals weren't gathered. They were earned in motion, grown through intent.",
    requiredPetals: 1000,
    perks: [],
    icon: '/assets/achievements/tier-4-petalforged.png',
  },
  {
    id: '5',
    name: 'Rootkeeper',
    tier: 5,
    title: 'Rootkeeper',
    description: "The veins of the world twist beneath your feet. You've grown past the surface.",
    requiredPetals: 2000,
    perks: [],
    icon: '/assets/achievements/tier-5-rootkeeper.png',
  },
  {
    id: '6',
    name: 'Warden of Bloom',
    tier: 6,
    title: 'Warden of Bloom',
    description:
      'Petal stir in your presence, waiting to be called. You tend more than pixels now.',
    requiredPetals: 3500,
    perks: [],
    icon: '/assets/achievements/tier-6-warden-bloom.png',
  },
  {
    id: '7',
    name: 'Veilbloom Ascendant',
    tier: 7,
    title: 'Veilbloom Ascendant',
    description:
      "You've stepped into the unseen garden. Few are aware it exists. Fewer still are welcomed inside.",
    requiredPetals: 5000,
    perks: ['Petal aura animation around profile'],
    icon: '/assets/achievements/tier-7-veilbloom.png',
  },
  {
    id: '8',
    name: 'Thornbound Sovereign',
    tier: 8,
    title: 'Thornbound Sovereign',
    description:
      'You rose through the vines, bleeding for the bloom. You carry beauty that bites back.',
    requiredPetals: 7500,
    perks: ['Custom border', 'Bonus lore entries'],
    icon: '/assets/achievements/tier-8-thornbound.png',
  },
  {
    id: '9',
    name: 'Crown of Aetherpetal',
    tier: 9,
    title: 'Crown of Aetherpetal',
    description:
      'You are no longer harvesting petals. You are the crown they gather around. Entire systems ripple in your wake.',
    requiredPetals: 10000,
    perks: ['Petal-trail animation on site interactions'],
    icon: '/assets/achievements/tier-9-aetherpetal.png',
  },
  {
    id: '10',
    name: 'Eclipse in Bloom',
    tier: 10,
    title: 'Eclipse in Bloom',
    description:
      'Neither petal nor shadow defines you. You are the event that bends light, myth, and motion into permanence. The final bloom, unseen by most, unforgettable to all.',
    requiredPetals: 15000,
    perks: [
      'Golden petal-stamped messages',
      'Exclusive GameCube UI rune fragment',
      'Voice line on login',
      'One free personalized item',
    ],
    icon: '/assets/achievements/tier-10-eclipse.png',
  },
];
