'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  HOME_SCENE_CROSSFADE_MS,
  HOME_SCENE_REDUCED_MOTION_CROSSFADE_MS,
  HOME_SCENE_ASSETS,
  resolveHomeScene,
  resolveHomeSceneImageSrc,
  resolveNextHomeSceneBucket,
  type HomeSceneState,
  type HomeSceneSurfaceFamily,
} from './homeScene';
import styles from './HeroScene.module.css';

const INITIAL_SCENE_DATE = new Date(2026, 0, 1, 12);

type PetalStyle = CSSProperties & {
  '--petal-drift': string;
  '--petal-fall': string;
  '--petal-rotate': string;
  '--petal-gust': string;
};

const CANOPY_ANCHORS = [
  { x: 7, y: 18 },
  { x: 14, y: 12 },
  { x: 24, y: 17 },
  { x: 34, y: 22 },
  { x: 46, y: 17 },
  { x: 58, y: 24 },
];

type SceneLayer = {
  key: string;
  src: string;
  fallback: string;
  alt: string;
};

function createSceneLayer(scene: HomeSceneState, family: HomeSceneSurfaceFamily): SceneLayer {
  const image = resolveHomeSceneImageSrc(scene.asset, family);

  return {
    key: `${scene.bucket}-${family}-${image.src}`,
    src: image.src,
    fallback: image.fallback,
    alt: scene.asset.alt,
  };
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

function useHomeSceneSurfaceFamily(): HomeSceneSurfaceFamily {
  const [family, setFamily] = useState<HomeSceneSurfaceFamily>('canonical');

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setFamily(query.matches ? 'wide' : 'canonical');

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  return family;
}

function preloadImage(src: string) {
  if (typeof document === 'undefined') return;
  const alreadyPreloaded = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]'),
  ).some((link) => link.href.endsWith(src));

  if (alreadyPreloaded) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}

function TreePetalEmitter({ scene }: { scene: HomeSceneState }) {
  const petals = useMemo(() => {
    return Array.from({ length: scene.motion.petalDensity }, (_, index) => {
      const anchor = CANOPY_ANCHORS[index % CANOPY_ANCHORS.length];
      const spread = (index % 5) * 3;
      const drift = 32 + scene.motion.windStrength * 54;

      return {
        id: index,
        left: anchor.x + ((index * 7) % 13) - 6,
        top: anchor.y + spread,
        delay: (index % 8) * 0.65,
        duration: scene.motion.reducedMotion ? 22 : 12 + (index % 6) * 1.4,
        drift: drift * 0.72,
        fall: 44 + (index % 7) * 6,
        rotate: (index % 2 === 0 ? 1 : -1) * (70 + index * 9),
        scale: 0.48 + (index % 4) * 0.08,
      };
    });
  }, [
    scene.bucket,
    scene.motion.petalDensity,
    scene.motion.reducedMotion,
    scene.motion.windStrength,
  ]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[6] overflow-hidden"
      aria-hidden="true"
      data-testid="mori-petal-emitter"
    >
      {petals.map((petal) => {
        const petalStyle: PetalStyle = {
          left: `${petal.left}%`,
          top: `${petal.top}%`,
          transform: `scale(${petal.scale})`,
          animationDuration: scene.motion.reducedMotion ? undefined : `${petal.duration}s`,
          animationDelay: scene.motion.reducedMotion ? undefined : `${petal.delay}s`,
          '--petal-drift': `${petal.drift}vw`,
          '--petal-fall': `${petal.fall}vh`,
          '--petal-rotate': `${petal.rotate}deg`,
          '--petal-gust': `${scene.motion.gustStrength * 24}vw`,
        };

        return (
          <span
            key={`${scene.bucket}-${petal.id}`}
            data-testid="mori-petal"
            className={`${styles.petal} absolute h-5 w-5 rounded-full text-pink-100/52 drop-shadow-[0_3px_5px_rgba(40,15,28,0.42)]`}
            style={petalStyle}
          >
            <span className="block rotate-45 text-sm leading-none">❀</span>
          </span>
        );
      })}
    </div>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  const surfaceFamily = useHomeSceneSurfaceFamily();
  const [scene, setScene] = useState<HomeSceneState>(() => ({
    ...resolveHomeScene(INITIAL_SCENE_DATE, false),
    timezone: 'local',
  }));
  const [displayedLayer, setDisplayedLayer] = useState<SceneLayer>(() =>
    createSceneLayer(resolveHomeScene(INITIAL_SCENE_DATE, false), 'canonical'),
  );
  const [incomingLayer, setIncomingLayer] = useState<SceneLayer | null>(null);

  useEffect(() => {
    setScene(resolveHomeScene(new Date(), reducedMotion));

    const interval = window.setInterval(() => {
      setScene(resolveHomeScene(new Date(), reducedMotion));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => {
    const nextLayer = createSceneLayer(scene, surfaceFamily);

    if (nextLayer.key === displayedLayer.key) return;

    if (reducedMotion) {
      setIncomingLayer(null);
      setDisplayedLayer(nextLayer);
      return;
    }

    setIncomingLayer(nextLayer);

    const timeout = window.setTimeout(() => {
      setDisplayedLayer(nextLayer);
      setIncomingLayer(null);
    }, HOME_SCENE_CROSSFADE_MS);

    return () => window.clearTimeout(timeout);
  }, [displayedLayer.key, reducedMotion, scene, surfaceFamily]);

  useEffect(() => {
    const nextBucket = resolveNextHomeSceneBucket(scene.bucket);
    const nextAsset = HOME_SCENE_ASSETS[nextBucket];
    const currentImage = resolveHomeSceneImageSrc(scene.asset, surfaceFamily);
    const nextImage = resolveHomeSceneImageSrc(nextAsset, surfaceFamily);

    preloadImage(currentImage.src);
    preloadImage(nextImage.src);
  }, [scene.asset, scene.bucket, surfaceFamily]);

  const ambientTransitionClass = reducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-[2200ms]';

  return (
    <div
      className={`${styles.scene} absolute inset-0 z-0 bg-[#080611]`}
      data-scene-bucket={scene.bucket}
      data-scene-timezone={scene.timezone}
      data-scene-surface-family={surfaceFamily}
      data-testid="mori-hero-scene"
    >
      <div className={styles.worldExtension} data-testid="mori-world-extension">
        <div className={styles.scenePlate} data-testid="mori-scene-plate">
          <Image
            key={displayedLayer.key}
            src={displayedLayer.src}
            alt={incomingLayer ? '' : displayedLayer.alt}
            aria-hidden={incomingLayer ? 'true' : undefined}
            fill
            priority
            sizes="(min-width: 1024px) 100vw, (min-aspect-ratio: 1264/843) calc((100svh - 5rem) * 1.499), 100vw"
            className={`${styles.image} ${styles.imageLayer} ${
              incomingLayer ? styles.imageLayerUnder : styles.imageLayerActive
            } absolute inset-0 h-full w-full opacity-95 transition-[opacity,filter] ease-out`}
            style={{
              transitionDuration: `${reducedMotion ? HOME_SCENE_REDUCED_MOTION_CROSSFADE_MS : HOME_SCENE_CROSSFADE_MS}ms`,
            }}
            onError={() => {
              if (displayedLayer.src !== displayedLayer.fallback) {
                setDisplayedLayer({ ...displayedLayer, src: displayedLayer.fallback });
              }
            }}
          />
          {incomingLayer ? (
            <Image
              key={incomingLayer.key}
              src={incomingLayer.src}
              alt={incomingLayer.alt}
              fill
              priority={false}
              sizes="(min-width: 1024px) 100vw, (min-aspect-ratio: 1264/843) calc((100svh - 5rem) * 1.499), 100vw"
              className={`${styles.image} ${styles.imageLayer} ${styles.imageLayerEntering} absolute inset-0 h-full w-full opacity-95 transition-[opacity,filter] ease-out`}
              style={{
                animationDuration: `${HOME_SCENE_CROSSFADE_MS}ms`,
              }}
              onError={() => {
                if (incomingLayer.src !== incomingLayer.fallback) {
                  setIncomingLayer({ ...incomingLayer, src: incomingLayer.fallback });
                }
              }}
            />
          ) : null}
        </div>
      </div>

      <div
        className={`absolute inset-0 z-[3] ${ambientTransitionClass}`}
        style={{
          opacity: scene.motion.mistOpacity,
          background:
            'radial-gradient(circle at 30% 26%, rgba(255,214,235,0.22), transparent 34%), radial-gradient(circle at 78% 22%, rgba(184,152,255,0.16), transparent 30%), linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 42%)',
        }}
      />
      <div
        className={`absolute inset-0 z-[4] ${ambientTransitionClass}`}
        style={{
          opacity: scene.motion.glowOpacity,
          background:
            'radial-gradient(circle at 50% 38%, rgba(255,127,190,0.26), transparent 36%), radial-gradient(circle at 52% 62%, rgba(125,90,255,0.18), transparent 48%)',
        }}
      />
      <TreePetalEmitter scene={scene} />
      <div className="absolute inset-0 z-[7] bg-[radial-gradient(circle_at_70%_42%,rgba(3,2,8,0.1)_0%,rgba(3,2,8,0.34)_33%,transparent_54%),linear-gradient(to_bottom,rgba(5,3,10,0.06),rgba(5,3,10,0.18)_62%,rgba(5,3,10,0.68))]" />
    </div>
  );
}
