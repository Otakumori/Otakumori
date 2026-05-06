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
  alt: string;
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
  motion: HomeSceneMotion;
};

export const HOME_SCENE_ASSETS: Record<HomeSceneBucket, HomeSceneAsset> = {
  earlyMorning: {
    bucket: 'earlyMorning',
    label: 'Early morning',
    src: '/assets/bg/1earlymorningtree.png',
    fallback: '/assets/bg/2morningtree.png',
    alt: 'Otakumori sakura tree scene in early morning light',
  },
  morning: {
    bucket: 'morning',
    label: 'Morning',
    src: '/assets/bg/2morningtree.png',
    fallback: '/assets/bg/3afternoon tree.png',
    alt: 'Otakumori sakura tree scene in soft morning light',
  },
  afternoon: {
    bucket: 'afternoon',
    label: 'Afternoon',
    src: '/assets/bg/3afternoon tree.png',
    fallback: '/assets/bg/2morningtree.png',
    alt: 'Otakumori sakura tree scene in afternoon light',
  },
  lateAfternoon: {
    bucket: 'lateAfternoon',
    label: 'Late afternoon',
    src: '/assets/bg/4lateafternoontree.png',
    fallback: '/assets/bg/3afternoon tree.png',
    alt: 'Otakumori sakura tree scene in late afternoon light',
  },
  night: {
    bucket: 'night',
    label: 'Night',
    src: '/assets/bg/5nighttree.png',
    fallback: '/assets/bg/6special_twilight.png',
    alt: 'Otakumori sakura tree scene at night',
  },
  specialTwilight: {
    bucket: 'specialTwilight',
    label: 'Special twilight',
    src: '/assets/bg/6special_twilight.png',
    fallback: '/assets/bg/5nighttree.png',
    alt: 'Otakumori sakura tree scene in special twilight glow',
  },
};

export function resolveHomeSceneBucket(hour = new Date().getHours()): HomeSceneBucket {
  const safeHour = Number.isFinite(hour) ? Math.max(0, Math.min(23, Math.floor(hour))) : 12;

  if (safeHour >= 5 && safeHour < 8) return 'earlyMorning';
  if (safeHour >= 8 && safeHour < 12) return 'morning';
  if (safeHour >= 12 && safeHour < 16) return 'afternoon';
  if (safeHour >= 16 && safeHour < 19) return 'lateAfternoon';
  if (safeHour >= 19 && safeHour < 21) return 'specialTwilight';

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
      petalDensity: 16,
      mistOpacity: 0.32,
      glowOpacity: 0.18,
    },
    morning: {
      windAngle: 12,
      windStrength: 0.44,
      gustStrength: 0.24,
      petalDensity: 20,
      mistOpacity: 0.18,
      glowOpacity: 0.22,
    },
    afternoon: {
      windAngle: 8,
      windStrength: 0.5,
      gustStrength: 0.28,
      petalDensity: 22,
      mistOpacity: 0.1,
      glowOpacity: 0.18,
    },
    lateAfternoon: {
      windAngle: -10,
      windStrength: 0.42,
      gustStrength: 0.3,
      petalDensity: 18,
      mistOpacity: 0.2,
      glowOpacity: 0.28,
    },
    specialTwilight: {
      windAngle: -16,
      windStrength: 0.34,
      gustStrength: 0.26,
      petalDensity: 14,
      mistOpacity: 0.3,
      glowOpacity: 0.38,
    },
    night: {
      windAngle: -6,
      windStrength: 0.24,
      gustStrength: 0.14,
      petalDensity: 10,
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
  const bucket = resolveHomeSceneBucket(date.getHours());

  return {
    bucket,
    asset: HOME_SCENE_ASSETS[bucket] ?? HOME_SCENE_ASSETS.afternoon,
    motion: resolveHomeSceneMotion(bucket, reducedMotion),
  };
}
