export type HomeSceneBucket =
  | 'earlyMorning'
  | 'morning'
  | 'afternoon'
  | 'lateAfternoon'
  | 'night'
  | 'specialTwilight';

export type HomeSceneAsset = {
  bucket: HomeSceneBucket;
  label: string;
  src: string;
  fallback: string;
  wideSrc: string;
  wideFallback: string;
  alt: string;
};

export type HomeSceneSurfaceFamily = 'canonical' | 'wide';

export type HomeSceneArtDirection = {
  mobilePortrait: string;
  mobileLandscape: string;
  tablet: string;
  desktop: string;
  wide: string;
};

export type HomeSceneMotion = {
  windAngle: number;
  windStrength: number;
  gustStrength: number;
  petalDensity: number;
  mistOpacity: number;
  glowOpacity: number;
  reducedMotion: boolean;
};

export type HomeSceneState = {
  bucket: HomeSceneBucket;
  asset: HomeSceneAsset;
  artDirection: HomeSceneArtDirection;
  motion: HomeSceneMotion;
  timezone: string;
};

const WORLD_ASSET_ROOT = '/assets/home/world';
const WIDE_WORLD_ASSET_ROOT = `${WORLD_ASSET_ROOT}/wide`;
const FALLBACK_TIMEZONE = 'local';

function worldAsset(name: string) {
  return `${WORLD_ASSET_ROOT}/${name}.png`;
}

function wideWorldAsset(name: string) {
  return `${WIDE_WORLD_ASSET_ROOT}/${name}.png`;
}

export const HOME_SCENE_CROSSFADE_MS = 14_000;
export const HOME_SCENE_REDUCED_MOTION_CROSSFADE_MS = 0;

export const HOME_SCENE_ASSETS: Record<HomeSceneBucket, HomeSceneAsset> = {
  earlyMorning: {
    bucket: 'earlyMorning',
    label: 'Early morning',
    src: worldAsset('mori-world-early-morning'),
    fallback: worldAsset('mori-world-morning'),
    wideSrc: wideWorldAsset('mori-world-early-morning-wide'),
    wideFallback: wideWorldAsset('mori-world-morning-wide'),
    alt: 'Otakumori sakura tree scene in early morning light',
  },
  morning: {
    bucket: 'morning',
    label: 'Morning',
    src: worldAsset('mori-world-morning'),
    fallback: worldAsset('mori-world-afternoon'),
    wideSrc: wideWorldAsset('mori-world-morning-wide'),
    wideFallback: wideWorldAsset('mori-world-afternoon-wide'),
    alt: 'Otakumori sakura tree scene in soft morning light',
  },
  afternoon: {
    bucket: 'afternoon',
    label: 'Afternoon',
    src: worldAsset('mori-world-afternoon'),
    fallback: worldAsset('mori-world-sunset'),
    wideSrc: wideWorldAsset('mori-world-afternoon-wide'),
    wideFallback: wideWorldAsset('mori-world-sunset-wide'),
    alt: 'Otakumori sakura tree scene in afternoon light',
  },
  lateAfternoon: {
    bucket: 'lateAfternoon',
    label: 'Late afternoon',
    src: worldAsset('mori-world-sunset'),
    fallback: worldAsset('mori-world-night'),
    wideSrc: wideWorldAsset('mori-world-sunset-wide'),
    wideFallback: wideWorldAsset('mori-world-night-wide'),
    alt: 'Otakumori sakura tree scene in late afternoon light',
  },
  night: {
    bucket: 'night',
    label: 'Night',
    src: worldAsset('mori-world-night'),
    fallback: worldAsset('mori-world-sunset'),
    wideSrc: wideWorldAsset('mori-world-night-wide'),
    wideFallback: wideWorldAsset('mori-world-sunset-wide'),
    alt: 'Otakumori sakura tree scene at night',
  },
  specialTwilight: {
    bucket: 'specialTwilight',
    label: 'Special twilight',
    src: worldAsset('mori-world-twilight'),
    fallback: worldAsset('mori-world-night'),
    wideSrc: wideWorldAsset('mori-world-twilight-wide'),
    wideFallback: wideWorldAsset('mori-world-night-wide'),
    alt: 'Otakumori sakura tree scene in special twilight glow',
  },
};

const NEXT_SCENE_BUCKET: Record<HomeSceneBucket, HomeSceneBucket> = {
  earlyMorning: 'morning',
  morning: 'afternoon',
  afternoon: 'lateAfternoon',
  lateAfternoon: 'night',
  night: 'earlyMorning',
  specialTwilight: 'night',
};

export const HOME_SCENE_ART_DIRECTION: Record<HomeSceneBucket, HomeSceneArtDirection> = {
  earlyMorning: {
    mobilePortrait: '18% 50%',
    mobileLandscape: '8% 50%',
    tablet: '18% 50%',
    desktop: '0% 50%',
    wide: '0% 50%',
  },
  morning: {
    mobilePortrait: '18% 50%',
    mobileLandscape: '8% 50%',
    tablet: '18% 50%',
    desktop: '0% 50%',
    wide: '0% 50%',
  },
  afternoon: {
    mobilePortrait: '18% 50%',
    mobileLandscape: '8% 50%',
    tablet: '18% 50%',
    desktop: '0% 50%',
    wide: '0% 50%',
  },
  lateAfternoon: {
    mobilePortrait: '18% 50%',
    mobileLandscape: '8% 50%',
    tablet: '18% 50%',
    desktop: '0% 50%',
    wide: '0% 50%',
  },
  night: {
    mobilePortrait: '18% 50%',
    mobileLandscape: '8% 50%',
    tablet: '18% 50%',
    desktop: '0% 50%',
    wide: '0% 50%',
  },
  specialTwilight: {
    mobilePortrait: '17% 50%',
    mobileLandscape: '8% 50%',
    tablet: '18% 50%',
    desktop: '0% 50%',
    wide: '0% 50%',
  },
};

function safeHourFromDate(date: Date): number {
  const hour = date.getHours();

  return Number.isFinite(hour) ? Math.max(0, Math.min(23, Math.floor(hour))) : 12;
}

export function isSpecialTwilightDate(date = new Date()): boolean {
  return date.getDate() === 1;
}

export function resolveHomeSceneBucket(date = new Date()): HomeSceneBucket {
  const safeHour = safeHourFromDate(date);

  if (safeHour >= 5 && safeHour < 8) return 'earlyMorning';
  if (safeHour >= 8 && safeHour < 12) return 'morning';
  if (safeHour >= 12 && safeHour < 17) return 'afternoon';
  if (safeHour >= 17 && safeHour < 20) return 'lateAfternoon';
  if (safeHour >= 20 && safeHour < 21 && isSpecialTwilightDate(date)) {
    return 'specialTwilight';
  }

  return 'night';
}

export function resolveHomeSceneMotion(
  bucket: HomeSceneBucket,
  reducedMotion = false,
): HomeSceneMotion {
  const defaults: Record<HomeSceneBucket, Omit<HomeSceneMotion, 'reducedMotion'>> = {
    earlyMorning: {
      windAngle: 18,
      windStrength: 0.38,
      gustStrength: 0.2,
      petalDensity: 7,
      mistOpacity: 0.32,
      glowOpacity: 0.18,
    },
    morning: {
      windAngle: 12,
      windStrength: 0.44,
      gustStrength: 0.24,
      petalDensity: 8,
      mistOpacity: 0.18,
      glowOpacity: 0.22,
    },
    afternoon: {
      windAngle: 8,
      windStrength: 0.5,
      gustStrength: 0.28,
      petalDensity: 8,
      mistOpacity: 0.1,
      glowOpacity: 0.18,
    },
    lateAfternoon: {
      windAngle: -10,
      windStrength: 0.42,
      gustStrength: 0.3,
      petalDensity: 7,
      mistOpacity: 0.2,
      glowOpacity: 0.28,
    },
    specialTwilight: {
      windAngle: -16,
      windStrength: 0.34,
      gustStrength: 0.26,
      petalDensity: 6,
      mistOpacity: 0.3,
      glowOpacity: 0.38,
    },
    night: {
      windAngle: -6,
      windStrength: 0.24,
      gustStrength: 0.14,
      petalDensity: 5,
      mistOpacity: 0.24,
      glowOpacity: 0.24,
    },
  };

  const motion = defaults[bucket] ?? defaults.afternoon;

  return {
    ...motion,
    petalDensity: reducedMotion ? Math.min(4, motion.petalDensity) : motion.petalDensity,
    windStrength: reducedMotion ? motion.windStrength * 0.2 : motion.windStrength,
    gustStrength: reducedMotion ? 0 : motion.gustStrength,
    reducedMotion,
  };
}

export function resolveHomeScene(date = new Date(), reducedMotion = false): HomeSceneState {
  const bucket = resolveHomeSceneBucket(date);

  return {
    bucket,
    asset: HOME_SCENE_ASSETS[bucket] ?? HOME_SCENE_ASSETS.afternoon,
    artDirection: HOME_SCENE_ART_DIRECTION[bucket] ?? HOME_SCENE_ART_DIRECTION.afternoon,
    motion: resolveHomeSceneMotion(bucket, reducedMotion),
    timezone: resolveBrowserTimeZone(),
  };
}

export function resolveHomeSceneImageSrc(asset: HomeSceneAsset, family: HomeSceneSurfaceFamily) {
  return family === 'wide'
    ? { src: asset.wideSrc, fallback: asset.wideFallback }
    : { src: asset.src, fallback: asset.fallback };
}

export function resolveNextHomeSceneBucket(bucket: HomeSceneBucket): HomeSceneBucket {
  return NEXT_SCENE_BUCKET[bucket] ?? 'afternoon';
}

export function resolveBrowserTimeZone() {
  if (typeof Intl === 'undefined') return FALLBACK_TIMEZONE;

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}
