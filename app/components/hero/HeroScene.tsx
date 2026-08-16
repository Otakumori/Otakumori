'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { resolveHomeScene, type HomeSceneState } from './homeScene';
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
  const [scene, setScene] = useState<HomeSceneState>(() => ({
    ...resolveHomeScene(INITIAL_SCENE_DATE, false),
    timezone: 'local',
  }));
  const [imageSrc, setImageSrc] = useState(scene.asset.src);

  useEffect(() => {
    setScene(resolveHomeScene(new Date(), reducedMotion));

    const interval = window.setInterval(() => {
      setScene(resolveHomeScene(new Date(), reducedMotion));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => {
    setImageSrc(scene.asset.src);
  }, [scene.asset.src]);

  return (
    <div
      className={`${styles.scene} absolute inset-0 z-0 bg-[#080611]`}
      data-scene-bucket={scene.bucket}
      data-scene-timezone={scene.timezone}
      data-testid="mori-hero-scene"
    >
      <div className={styles.worldExtension} data-testid="mori-world-extension">
        <div className={styles.scenePlate} data-testid="mori-scene-plate">
          <Image
            src={imageSrc}
            alt={scene.asset.alt}
            fill
            priority
            sizes="(min-aspect-ratio: 1264/843) calc((100svh - 5rem) * 1.499), 100vw"
            className={`${styles.image} absolute inset-0 h-full w-full opacity-95 transition-[opacity,filter] duration-[1600ms] ease-out`}
            onError={() => {
              if (imageSrc !== scene.asset.fallback) setImageSrc(scene.asset.fallback);
            }}
          />
        </div>
      </div>

      <div
        className="absolute inset-0 z-[3] transition-opacity duration-[2200ms]"
        style={{
          opacity: scene.motion.mistOpacity,
          background:
            'radial-gradient(circle at 30% 26%, rgba(255,214,235,0.34), transparent 34%), radial-gradient(circle at 78% 22%, rgba(184,152,255,0.28), transparent 30%), linear-gradient(to bottom, rgba(255,255,255,0.08), transparent 42%)',
        }}
      />
      <div
        className="absolute inset-0 z-[4] transition-opacity duration-[2200ms]"
        style={{
          opacity: scene.motion.glowOpacity,
          background:
            'radial-gradient(circle at 50% 38%, rgba(255,127,190,0.54), transparent 36%), radial-gradient(circle at 52% 62%, rgba(125,90,255,0.4), transparent 48%)',
        }}
      />
      <TreePetalEmitter scene={scene} />
      <div className="absolute inset-0 z-[7] bg-[radial-gradient(circle_at_70%_42%,rgba(3,2,8,0.1)_0%,rgba(3,2,8,0.34)_33%,transparent_54%),linear-gradient(to_bottom,rgba(5,3,10,0.06),rgba(5,3,10,0.18)_62%,rgba(5,3,10,0.68))]" />
    </div>
  );
}
