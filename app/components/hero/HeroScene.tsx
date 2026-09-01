'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useHomeSceneContext } from './HomeSceneContext';
import {
  HOME_SCENE_ASSETS,
  HOME_SCENE_CROSSFADE_MS,
  HOME_SCENE_MANIFEST,
  HOME_SCENE_REDUCED_MOTION_CROSSFADE_MS,
  resolveHomeSceneImageSrc,
  resolveNextHomeSceneBucket,
  resolvePetalSpritePosition,
  type HomeSceneProjection,
  type HomeSceneState,
} from './homeScene';
import styles from './HeroScene.module.css';

type PetalStyle = CSSProperties & {
  '--petal-drift': string;
  '--petal-fall': string;
  '--petal-rotate': string;
  '--petal-gust': string;
  '--petal-sprite-position': string;
};

type SceneLayer = {
  key: string;
  src: string;
  fallback: string;
  alt: string;
};

function createSceneLayer(scene: HomeSceneState): SceneLayer {
  const image = resolveHomeSceneImageSrc(scene.asset);

  return {
    key: `${scene.bucket}-${image.src}`,
    src: image.src,
    fallback: image.fallback,
    alt: scene.asset.alt,
  };
}

function preloadImage(src: string) {
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

function TreePetalEmitter({
  projection,
  scene,
}: {
  projection: HomeSceneProjection | null;
  scene: HomeSceneState;
}) {
  const artboard = HOME_SCENE_MANIFEST.world.artboard;
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
          variant: index % HOME_SCENE_MANIFEST.petals.frameCount,
        };
      }),
    [artboard.anchors.canopy, scene.motion.petalDensity, scene.motion.windStrength],
  );

  return (
    <div className={styles.petalEmitter} aria-hidden="true" data-testid="mori-petal-emitter">
      {petals.map((petal) => {
        const petalStyle: PetalStyle = {
          backgroundImage: `url(${HOME_SCENE_MANIFEST.petals.src})`,
          left: `${petal.sourceX * scale}px`,
          top: `${petal.sourceY * scale}px`,
          transform: `scale(${petal.scale})`,
          animationDuration: scene.motion.reducedMotion ? undefined : `${petal.duration}s`,
          animationDelay: scene.motion.reducedMotion ? undefined : `${petal.delay}s`,
          '--petal-drift': `${petal.drift * scale}px`,
          '--petal-fall': `${petal.fall * scale}px`,
          '--petal-rotate': `${petal.rotate}deg`,
          '--petal-gust': `${scene.motion.gustStrength * 160 * scale}px`,
          '--petal-sprite-position': resolvePetalSpritePosition(petal.variant),
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
  const { projection, reducedMotion, scene } = useHomeSceneContext();
  const [displayedLayer, setDisplayedLayer] = useState<SceneLayer>(() =>
    createSceneLayer(scene),
  );
  const [incomingLayer, setIncomingLayer] = useState<SceneLayer | null>(null);

  useEffect(() => {
    const nextLayer = createSceneLayer(scene);
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
  }, [displayedLayer.key, reducedMotion, scene]);

  useEffect(() => {
    const nextBucket = resolveNextHomeSceneBucket(scene.bucket);
    const currentImage = resolveHomeSceneImageSrc(scene.asset);
    const nextImage = resolveHomeSceneImageSrc(HOME_SCENE_ASSETS[nextBucket]);

    preloadImage(currentImage.src);
    preloadImage(nextImage.src);
  }, [scene.asset, scene.bucket]);

  const ambientTransitionClass = reducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-[2200ms]';

  return (
    <div
      className={styles.scene}
      data-scene-bucket={scene.bucket}
      data-scene-timezone={scene.timezone}
      data-scene-surface-family={projection?.family ?? 'combined'}
      data-scene-art-source="combined-world-master"
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
            sizes="100vw"
            className={`${styles.image} ${styles.imageLayer} ${
              incomingLayer ? styles.imageLayerUnder : styles.imageLayerActive
            }`}
            style={{
              transitionDuration: `${
                reducedMotion ? HOME_SCENE_REDUCED_MOTION_CROSSFADE_MS : HOME_SCENE_CROSSFADE_MS
              }ms`,
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
              sizes="100vw"
              className={`${styles.image} ${styles.imageLayer} ${styles.imageLayerEntering}`}
              style={{ animationDuration: `${HOME_SCENE_CROSSFADE_MS}ms` }}
              onError={() => {
                if (incomingLayer.src !== incomingLayer.fallback) {
                  setIncomingLayer({ ...incomingLayer, src: incomingLayer.fallback });
                }
              }}
            />
          ) : null}
          <TreePetalEmitter projection={projection} scene={scene} />
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
