export type HomeSceneBucket =
  | 'earlyMorning'
  | 'morning'
  | 'afternoon'
  | 'lateAfternoon'
  | 'night'
  | 'specialTwilight';

export type HomeSceneSurfaceFamily = 'combined';

export type ScenePoint = {
  x: number;
  y: number;
};

export type HomeSceneAsset = {
  bucket: HomeSceneBucket;
  label: string;
  src: string;
  fallback: string;
  alt: string;
};

export type HomeSceneArtboard = {
  width: number;
  height: number;
  anchors: {
    treeBase: ScenePoint;
    groundLine: ScenePoint;
    rootCrossSection: ScenePoint;
    undergroundStart: ScenePoint;
    footerContent: ScenePoint;
    canopy: readonly ScenePoint[];
  };
  viewportTreeBase: {
    x: number;
    y: number;
  };
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
  timezone: string;
};

export type HomeSceneProjection = {
  family: HomeSceneSurfaceFamily;
  viewport: {
    width: number;
    height: number;
  };
  artboard: HomeSceneArtboard;
  scale: number;
  width: number;
  height: number;
  left: number;
  top: number;
  treeBase: ScenePoint;
  footerContentTop: number;
};

const COMBINED_WORLD_ASSET_ROOT = '/assets/home/world/combined';
const FALLBACK_TIMEZONE = 'local';
const COMBINED_WORLD_WIDTH = 1325;
const COMBINED_WORLD_HEIGHT = 1187;
const MIN_WORLD_HEIGHT_MULTIPLIER = 1.42;

function combinedWorldAsset(name: string) {
  return `${COMBINED_WORLD_ASSET_ROOT}/${name}.png`;
}

const WORLD_STATES: Record<HomeSceneBucket, HomeSceneAsset> = {
  earlyMorning: {
    bucket: 'earlyMorning',
    label: 'Early morning',
    src: combinedWorldAsset('om-home-world-01-early-morning-wide'),
    fallback: combinedWorldAsset('om-home-world-02-morning-wide'),
    alt: 'Otakumori sakura shoreline and root cavern in early morning light',
  },
  morning: {
    bucket: 'morning',
    label: 'Morning',
    src: combinedWorldAsset('om-home-world-02-morning-wide'),
    fallback: combinedWorldAsset('om-home-world-03-afternoon-wide'),
    alt: 'Otakumori sakura shoreline and root cavern in soft morning light',
  },
  afternoon: {
    bucket: 'afternoon',
    label: 'Afternoon',
    src: combinedWorldAsset('om-home-world-03-afternoon-wide'),
    fallback: combinedWorldAsset('om-home-world-04-late-afternoon-wide'),
    alt: 'Otakumori sakura shoreline and root cavern in afternoon light',
  },
  lateAfternoon: {
    bucket: 'lateAfternoon',
    label: 'Late afternoon',
    src: combinedWorldAsset('om-home-world-04-late-afternoon-wide'),
    fallback: combinedWorldAsset('om-home-world-05-night-wide'),
    alt: 'Otakumori sakura shoreline and root cavern in late afternoon light',
  },
  night: {
    bucket: 'night',
    label: 'Night',
    src: combinedWorldAsset('om-home-world-05-night-wide'),
    fallback: combinedWorldAsset('om-home-world-04-late-afternoon-wide'),
    alt: 'Otakumori sakura shoreline and root cavern at night',
  },
  specialTwilight: {
    bucket: 'specialTwilight',
    label: 'Special twilight',
    src: combinedWorldAsset('om-home-world-06-special-twilight-wide'),
    fallback: combinedWorldAsset('om-home-world-05-night-wide'),
    alt: 'Otakumori sakura shoreline and root cavern in special twilight glow',
  },
};

const COMBINED_ARTBOARD: HomeSceneArtboard = {
  width: COMBINED_WORLD_WIDTH,
  height: COMBINED_WORLD_HEIGHT,
  anchors: {
    treeBase: { x: 382, y: 520 },
    groundLine: { x: 662, y: 538 },
    rootCrossSection: { x: 662, y: 592 },
    undergroundStart: { x: 662, y: 686 },
    footerContent: { x: 662, y: 822 },
    canopy: [
      { x: 116, y: 120 },
      { x: 226, y: 76 },
      { x: 346, y: 106 },
      { x: 470, y: 156 },
      { x: 612, y: 118 },
      { x: 736, y: 174 },
    ],
  },
  viewportTreeBase: { x: 0.3, y: 0.57 },
};

export const HOME_SCENE_MANIFEST = {
  world: {
    sourceDirectory: 'docs/design/references/home-world-wide-approved',
    runtimeDirectory: COMBINED_WORLD_ASSET_ROOT,
    states: WORLD_STATES,
    artboard: COMBINED_ARTBOARD,
    portraitMasterAvailable: false,
    precomposedSurfaceAndUnderground: true,
  },
  petals: {
    src: '/assets/images/petal_sprite.png',
    width: 874,
    height: 668,
    columns: 4,
    rows: 3,
    frameCount: 12,
  },
  atmosphere: {
    authoredMist: null,
    authoredDappledLight: null,
    authoredMotes: null,
  },
} as const;

export const HOME_SCENE_ASSETS = HOME_SCENE_MANIFEST.world.states;
export const HOME_SCENE_CROSSFADE_MS = 14_000;
export const HOME_SCENE_REDUCED_MOTION_CROSSFADE_MS = 0;
export const HOME_SCENE_VIEWPORT_MATRIX = [
  { label: 'phone portrait compact', width: 320, height: 568 },
  { label: 'phone portrait', width: 375, height: 812 },
  { label: 'phone portrait large', width: 390, height: 844 },
  { label: 'phone portrait tall', width: 430, height: 932 },
  { label: 'tablet portrait', width: 768, height: 1024 },
  { label: 'tablet landscape', width: 1024, height: 768 },
  { label: 'laptop landscape', width: 1280, height: 720 },
  { label: 'desktop', width: 1366, height: 768 },
  { label: 'large desktop', width: 1440, height: 900 },
  { label: 'desktop hd', width: 1920, height: 1080 },
  { label: 'ultrawide', width: 2560, height: 1080 },
] as const;

const NEXT_SCENE_BUCKET: Record<HomeSceneBucket, HomeSceneBucket> = {
  earlyMorning: 'morning',
  morning: 'afternoon',
  afternoon: 'lateAfternoon',
  lateAfternoon: 'night',
  night: 'earlyMorning',
  specialTwilight: 'night',
};

function safeHourFromDate(date: Date): number {
  const hour = date.getHours();
  return Number.isFinite(hour) ? Math.max(0, Math.min(23, Math.floor(hour))) : 12;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
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
    motion: resolveHomeSceneMotion(bucket, reducedMotion),
    timezone: resolveBrowserTimeZone(),
  };
}

export function resolveHomeSceneImageSrc(asset: HomeSceneAsset) {
  return { src: asset.src, fallback: asset.fallback };
}

export function resolveHomeSceneSurfaceFamily(): HomeSceneSurfaceFamily {
  return 'combined';
}

export function projectHomeScenePoint(
  point: ScenePoint,
  projection: Pick<HomeSceneProjection, 'left' | 'top' | 'scale'>,
): ScenePoint {
  return {
    x: projection.left + point.x * projection.scale,
    y: projection.top + point.y * projection.scale,
  };
}

export function resolveHomeSceneProjection(viewport: {
  width: number;
  height: number;
}): HomeSceneProjection {
  const width = Number.isFinite(viewport.width) && viewport.width > 0 ? viewport.width : 1280;
  const height = Number.isFinite(viewport.height) && viewport.height > 0 ? viewport.height : 720;
  const artboard = HOME_SCENE_MANIFEST.world.artboard;
  const widthScale = width / artboard.width;
  const minimumHeight = height * MIN_WORLD_HEIGHT_MULTIPLIER;
  const worldHeight = Math.max(minimumHeight, artboard.height * widthScale);
  const scale = worldHeight / artboard.height;
  const projectedWidth = artboard.width * scale;
  const projectedHeight = artboard.height * scale;
  const preferredLeft = width * artboard.viewportTreeBase.x - artboard.anchors.treeBase.x * scale;
  const left = clamp(preferredLeft, width - projectedWidth, 0);
  const top = 0;
  const treeBase = projectHomeScenePoint(artboard.anchors.treeBase, { left, top, scale });
  const footerContentTop = artboard.anchors.footerContent.y * scale;

  return {
    family: 'combined',
    viewport: { width, height },
    artboard,
    scale,
    width: projectedWidth,
    height: projectedHeight,
    left,
    top,
    treeBase,
    footerContentTop,
  };
}

export function resolvePetalSpritePosition(variant: number) {
  const { columns, rows, frameCount } = HOME_SCENE_MANIFEST.petals;
  const frame = Math.abs(Math.floor(variant)) % frameCount;
  const column = frame % columns;
  const row = Math.floor(frame / columns);

  return `${(column / (columns - 1)) * 100}% ${(row / (rows - 1)) * 100}%`;
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
