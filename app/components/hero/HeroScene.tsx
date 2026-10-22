'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useHomeSceneContext } from './HomeSceneContext';
import {
  HOME_SCENE_ASSETS,
  HOME_SCENE_CROSSFADE_MS,
  HOME_SCENE_MANIFEST,
  HOME_SCENE_REDUCED_MOTION_CROSSFADE_MS,
  resolveHomeSceneImageSrc,
  resolveHomePetalVariant,
  resolveNextHomeSceneBucket,
  type HomeSceneProjection,
  type HomeSceneAssetVariant,
  type HomeSceneState,
} from './homeScene';
import styles from './HeroScene.module.css';

type PetalStyle = CSSProperties & {
  '--petal-drift': string;
  '--petal-fall': string;
  '--petal-rotate': string;
  '--petal-gust': string;
};

type SceneLayer = {
  key: string;
  src: string;
  fallback: string;
  alt: string;
};

const HOME_SCENE_IMAGE_SIZES = '(min-width: 1200px) 1200px, 100vw';
const HOME_SCENE_PRELOAD_WIDTHS = [640, 750, 828, 1080, 1200] as const;

function createSceneLayer(scene: HomeSceneState, assetVariant: HomeSceneAssetVariant): SceneLayer {
  const image = resolveHomeSceneImageSrc(scene.asset, assetVariant);

  return {
    key: `${scene.bucket}-${assetVariant}-${image.src}`,
    src: image.src,
    fallback: image.fallback,
    alt: scene.asset.alt,
  };
}

function preloadImage(src: string) {
  const alreadyPreloaded = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]'),
  ).some((link) => link.dataset.homeSceneSrc === src);

  if (alreadyPreloaded) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.dataset.homeSceneSrc = src;
  link.setAttribute(
    'imagesrcset',
    HOME_SCENE_PRELOAD_WIDTHS.map(
      (width) => `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75 ${width}w`,
    ).join(', '),
  );
  link.setAttribute('imagesizes', HOME_SCENE_IMAGE_SIZES);
  document.head.appendChild(link);
}

function TreePetalEmitter({
  projection,
  scene,
}: {
  projection: HomeSceneProjection | null;
  scene: HomeSceneState;
}) {
  const artboard = projection?.artboard ?? HOME_SCENE_MANIFEST.world.artboard;
  const scale = projection?.scale ?? 1;
  const petals = useMemo(
    () =>
      Array.from({ length: scene.motion.petalDensity }, (_, index) => {
        const anchor = artboard.anchors.canopy[index % artboard.anchors.canopy.length];
        const drift = 180 + scene.motion.windStrength * 260;

        return {
          id: index,
          sourceX: anchor.x + (((index * 5) % 9) - 4) * 8,
          sourceY: anchor.y + (index % 4) * 14,
          delay: (index % 8) * 0.65,
          duration: 12 + (index % 6) * 1.4,
          drift: drift * 0.72,
          fall: 300 + (index % 7) * 42,
          rotate: (index % 2 === 0 ? 1 : -1) * (70 + index * 9),
          scale: 0.48 + (index % 4) * 0.08,
          variant: index % HOME_SCENE_MANIFEST.petals.variants.length,
        };
      }),
    [artboard.anchors.canopy, scene.motion.petalDensity, scene.motion.windStrength],
  );

  return (
    <div className={styles.petalEmitter} aria-hidden="true" data-testid="mori-petal-emitter">
      {petals.map((petal) => {
        const petalStyle: PetalStyle = {
          backgroundImage: `url(${resolveHomePetalVariant(petal.variant).src})`,
          left: `${petal.sourceX * scale}px`,
          top: `${petal.sourceY * scale}px`,
          transform: `scale(${petal.scale})`,
          animationDuration: scene.motion.reducedMotion ? undefined : `${petal.duration}s`,
          animationDelay: scene.motion.reducedMotion ? undefined : `${petal.delay}s`,
          '--petal-drift': `${petal.drift * scale}px`,
          '--petal-fall': `${petal.fall * scale}px`,
          '--petal-rotate': `${petal.rotate}deg`,
          '--petal-gust': `${scene.motion.gustStrength * 160 * scale}px`,
        };

        return (
          <span
            key={`${scene.bucket}-${petal.id}`}
            data-testid="mori-petal"
            data-source-x={Math.round(petal.sourceX)}
            data-source-y={Math.round(petal.sourceY)}
            data-petal-variant={petal.variant}
            className={styles.petal}
            style={petalStyle}
          />
        );
      })}
    </div>
  );
}

export default function HeroScene() {
  const {
    assetVariant,
    projection,
    reducedMotion,
    scene,
    sceneResolved,
    setWorldStatus,
    worldStatus,
  } = useHomeSceneContext();
  const [displayedLayer, setDisplayedLayer] = useState<SceneLayer>(() =>
    createSceneLayer(scene, 'wide'),
  );
  const [incomingLayer, setIncomingLayer] = useState<SceneLayer | null>(null);
  const [incomingReady, setIncomingReady] = useState(false);
  const hasResolvedSceneRef = useRef(false);
  const resolvedLayer = hasResolvedSceneRef.current
    ? displayedLayer
    : createSceneLayer(scene, assetVariant);

  const decodeImage = useCallback(async (image: HTMLImageElement) => {
    if (typeof image.decode === 'function') await image.decode();
  }, []);

  const markDisplayedReady = useCallback(
    (image: HTMLImageElement) => {
      void decodeImage(image)
        .then(() => setWorldStatus('ready'))
        .catch(() => {
          if (resolvedLayer.src !== resolvedLayer.fallback) {
            setDisplayedLayer({ ...resolvedLayer, src: resolvedLayer.fallback });
            return;
          }
          setWorldStatus('fallback');
        });
    },
    [decodeImage, resolvedLayer, setWorldStatus],
  );

  const markIncomingReady = useCallback(
    (image: HTMLImageElement) => {
      void decodeImage(image)
        .then(() => {
          setIncomingReady(true);
          setWorldStatus('ready');
        })
        .catch(() => {
          if (incomingLayer && incomingLayer.src !== incomingLayer.fallback) {
            setIncomingLayer({ ...incomingLayer, src: incomingLayer.fallback });
            return;
          }
          setIncomingLayer(null);
          setIncomingReady(false);
        });
    },
    [decodeImage, incomingLayer, setWorldStatus],
  );

  useLayoutEffect(() => {
    if (!sceneResolved) return;

    const nextLayer = createSceneLayer(scene, assetVariant);
    if (!hasResolvedSceneRef.current) {
      hasResolvedSceneRef.current = true;
      setWorldStatus('loading');
      setIncomingLayer(null);
      setIncomingReady(false);
      setDisplayedLayer(nextLayer);
      return;
    }
    if (nextLayer.key === displayedLayer.key) return;

    setIncomingLayer(nextLayer);
    setIncomingReady(false);
  }, [assetVariant, displayedLayer.key, scene, sceneResolved, setWorldStatus]);

  useEffect(() => {
    if (!incomingLayer || !incomingReady) return;

    if (reducedMotion) {
      setDisplayedLayer(incomingLayer);
      setIncomingLayer(null);
      setIncomingReady(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setDisplayedLayer(incomingLayer);
      setIncomingLayer(null);
      setIncomingReady(false);
    }, HOME_SCENE_CROSSFADE_MS);

    return () => window.clearTimeout(timeout);
  }, [incomingLayer, incomingReady, reducedMotion]);

  useEffect(() => {
    if (!sceneResolved) return;

    const nextBucket = resolveNextHomeSceneBucket(scene.bucket);
    const currentImage = resolveHomeSceneImageSrc(scene.asset, assetVariant);
    const nextImage = resolveHomeSceneImageSrc(HOME_SCENE_ASSETS[nextBucket], assetVariant);

    preloadImage(currentImage.src);
    preloadImage(nextImage.src);
  }, [assetVariant, scene.asset, scene.bucket, sceneResolved]);

  const ambientTransitionClass = reducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-[2200ms]';

  return (
    <div
      className={styles.scene}
      data-scene-bucket={scene.bucket}
      data-scene-ready={sceneResolved ? 'true' : 'false'}
      data-world-status={worldStatus}
      data-scene-timezone={scene.timezone}
      data-scene-surface-family={projection?.family ?? 'combined'}
      data-scene-art-source="combined-world-master"
      data-scene-asset-variant={assetVariant}
      data-testid="mori-hero-scene"
    >
      <div className={styles.worldExtension} data-testid="mori-world-extension">
        <div className={styles.scenePlate} data-testid="mori-scene-plate">
          {sceneResolved ? (
            <Image
              key={resolvedLayer.key}
              src={resolvedLayer.src}
              alt={incomingLayer ? '' : resolvedLayer.alt}
              aria-hidden={incomingLayer ? 'true' : undefined}
              fill
              priority
              sizes={HOME_SCENE_IMAGE_SIZES}
              className={`${styles.image} ${styles.imageLayer} ${
                incomingLayer ? styles.imageLayerUnder : styles.imageLayerActive
              }`}
              style={{
                transitionDuration: `${
                  reducedMotion ? HOME_SCENE_REDUCED_MOTION_CROSSFADE_MS : HOME_SCENE_CROSSFADE_MS
                }ms`,
              }}
              onError={() => {
                if (resolvedLayer.src !== resolvedLayer.fallback) {
                  setDisplayedLayer({ ...resolvedLayer, src: resolvedLayer.fallback });
                  return;
                }
                setWorldStatus('fallback');
              }}
              onLoad={(event) => markDisplayedReady(event.currentTarget)}
            />
          ) : null}
          {incomingLayer ? (
            <Image
              key={incomingLayer.key}
              src={incomingLayer.src}
              alt={incomingLayer.alt}
              fill
              sizes={HOME_SCENE_IMAGE_SIZES}
              className={`${styles.image} ${styles.imageLayer} ${
                incomingReady ? styles.imageLayerEntering : styles.imageLayerPending
              }`}
              style={{ animationDuration: `${HOME_SCENE_CROSSFADE_MS}ms` }}
              onError={() => {
                if (incomingLayer.src !== incomingLayer.fallback) {
                  setIncomingLayer({ ...incomingLayer, src: incomingLayer.fallback });
                  return;
                }
                setIncomingLayer(null);
                setIncomingReady(false);
              }}
              onLoad={(event) => markIncomingReady(event.currentTarget)}
            />
          ) : null}
          {worldStatus === 'ready' ? (
            <TreePetalEmitter projection={projection} scene={scene} />
          ) : null}
        </div>
      </div>

      <div
        className={`${styles.mist} ${ambientTransitionClass}`}
        style={{ opacity: scene.motion.mistOpacity }}
        aria-hidden="true"
      />
      <div
        className={`${styles.dappledLight} ${ambientTransitionClass}`}
        style={{ opacity: scene.motion.glowOpacity }}
        aria-hidden="true"
      />
      <div className={styles.vignette} aria-hidden="true" />
    </div>
  );
}
