export type OtakumoriSeason = 'spring' | 'summer' | 'fall' | 'winter';

export type SeasonalHomeTheme = {
  season: OtakumoriSeason;
  label: string;
  invocation: string;
  promise: string;
  palette: {
    root: string;
    mist: string;
    shrine: string;
    petal: string;
    petalAlt: string;
    accent: string;
    ember: string;
  };
  motion: {
    petalCount: number;
    driftSeconds: number;
    pulseSeconds: number;
  };
};

const SEASON_BY_MONTH: OtakumoriSeason[] = [
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
  'summer',
  'summer',
  'fall',
  'fall',
  'fall',
  'winter',
];

export const seasonalHomeThemes: Record<OtakumoriSeason, SeasonalHomeTheme> = {
  spring: {
    season: 'spring',
    label: 'Spring sakura vigil',
    invocation: 'A shrine opens under falling bloom.',
    promise: 'Shop relic-grade drops, earn petals, and carry your progress through the grove.',
    palette: {
      root: '#06040c',
      mist: '#201025',
      shrine: '#3f1833',
      petal: '#ffb7d5',
      petalAlt: '#ffe1ec',
      accent: '#ff6aa9',
      ember: '#f7c56b',
    },
    motion: { petalCount: 26, driftSeconds: 13, pulseSeconds: 5 },
  },
  summer: {
    season: 'summer',
    label: 'Summer lantern arcade',
    invocation: 'Moonlit leaves burn around the game gates.',
    promise: 'Move fast between drops, games, and community without losing the quiet center.',
    palette: {
      root: '#04080c',
      mist: '#10231f',
      shrine: '#12372d',
      petal: '#9ff2c8',
      petalAlt: '#f6ffd2',
      accent: '#40e0a0',
      ember: '#ffd166',
    },
    motion: { petalCount: 22, driftSeconds: 12, pulseSeconds: 4 },
  },
  fall: {
    season: 'fall',
    label: 'Autumn ember oath',
    invocation: 'Red leaves cross the threshold like sparks.',
    promise: 'Find sharp merch, fast play, and a place that remembers your path.',
    palette: {
      root: '#090504',
      mist: '#2a120d',
      shrine: '#472014',
      petal: '#ff9a5c',
      petalAlt: '#ffd09a',
      accent: '#ff6b35',
      ember: '#f5c15c',
    },
    motion: { petalCount: 24, driftSeconds: 11, pulseSeconds: 5 },
  },
  winter: {
    season: 'winter',
    label: 'Winter moon sanctuary',
    invocation: 'White petals fall where the shrine keeps watch.',
    promise: 'A calm, dangerous arcade of shop paths, rewards, and remembered progress.',
    palette: {
      root: '#030711',
      mist: '#0d1728',
      shrine: '#18213b',
      petal: '#dcecff',
      petalAlt: '#ffffff',
      accent: '#9cc9ff',
      ember: '#e9d8a6',
    },
    motion: { petalCount: 20, driftSeconds: 15, pulseSeconds: 6 },
  },
};

export function getOtakumoriSeason(date: Date = new Date()): OtakumoriSeason {
  return SEASON_BY_MONTH[date.getMonth()] ?? 'spring';
}

export function getSeasonalHomeTheme(date: Date = new Date()): SeasonalHomeTheme {
  return seasonalHomeThemes[getOtakumoriSeason(date)];
}

export const defaultSeasonalHomeTheme = seasonalHomeThemes.spring;
