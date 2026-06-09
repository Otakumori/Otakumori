'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { resolveHomeScene, type HomeSceneState } from './homeScene';

type PetalStyle = CSSProperties & {
  '--petal-drift': string;
  '--petal-fall': string;
  '--petal-rotate': string;
  '--petal-gust': string;
};

/** Canopy anchors aligned to visible tree branches in the homepage background art. */
const CANOPY_ANCHORS = [
  { x: 22, y: 24 },
  { x: 34, y: 16 },
  { x: 48, y: 20 },
  { x: 62, y: 17 },
  { x: 74, y: 28 },
  { x: 40, y: 32 },
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

function SakuraPetalIcon() {
  return (
    <Image
      src="/assets/petal.svg"
      alt=""
      aria-hidden="true"
      width={22}
      height={22}
      className="pointer-events-none opacity-90"
      draggable={false}
    />
  );
}

function TreePetalEmitter({ scene }: { scene: HomeSceneState }) {
  const [collected, setCollected] = useState<number | null>(null);
  const petalCount = scene.motion.reducedMotion
    ? Math.min(4, scene.motion.petalDensity)
    : Math.min(14, Math.ceil(scene.motion.petalDensity * 0.65));

  const petals = useMemo(() => {
    return Array.from({ length: petalCount }, (_, index) => {
      const anchor = CANOPY_ANCHORS[index % CANOPY_ANCHORS.length];
      const spread = (index % 5) * 2.5;
      const drift = 28 + scene.motion.windStrength * 48;

      return {
        id: index,
        left: anchor.x + ((index * 7) % 11) - 5,
        top: anchor.y + spread,
        delay: (index % 9) * 1.1,
        duration: scene.motion.reducedMotion ? 0 : 20 + (index % 5) * 2.8,
        drift,
        fall: 48 + (index % 7) * 8,
        rotate: (index % 2 === 0 ? 1 : -1) * (55 + index * 11),
        scale: 0.68 + (index % 4) * 0.08,
      };
    });
  }, [
    petalCount,
    scene.bucket,
    scene.motion.reducedMotion,
    scene.motion.windStrength,
  ]);

  function collectPreview(id: number) {
    setCollected(id);
    window.dispatchEvent(
      new CustomEvent('petal:collect-preview', {
        detail: { id, source: 'homepage-tree', bucket: scene.bucket },
      }),
    );

    window.setTimeout(() => setCollected((current) => (current === id ? null : current)), 650);
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
      {petals.map((petal) => {
          const petalStyle: PetalStyle = {
            left: `${petal.left}%`,
            top: `${petal.top}%`,
            transform: `scale(${petal.scale})`,
            opacity: scene.motion.reducedMotion ? 0.55 : undefined,
            animation: scene.motion.reducedMotion
              ? undefined
              : `moriTreePetalDrift ${petal.duration}s linear ${petal.delay}s infinite`,
            '--petal-drift': `${petal.drift}vw`,
            '--petal-fall': `${petal.fall}vh`,
            '--petal-rotate': `${petal.rotate}deg`,
            '--petal-gust': `${scene.motion.gustStrength * 20}vw`,
          };

          return (
            <button
              key={`${scene.bucket}-${petal.id}`}
              type="button"
              aria-label="Collect sakura petal"
              onClick={() => collectPreview(petal.id)}
              className="focus-ring pointer-events-auto absolute flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
              style={petalStyle}
            >
              <SakuraPetalIcon />
              {collected === petal.id ? (
                <span
                  className="absolute inset-0 rounded-full border border-pink-100/60"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  const [scene, setScene] = useState(() => resolveHomeScene(undefined, false));
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
    <div className="absolute inset-0 z-0 bg-[#080611]">
      <img
        src={encodeURI(imageSrc)}
        alt={scene.asset.alt}
        className={`absolute inset-0 h-full w-full object-cover opacity-95 ${
          reducedMotion ? '' : 'transition-[opacity,filter,transform] duration-[1600ms] ease-out'
        }`}
        onError={() => {
          if (imageSrc !== scene.asset.fallback) setImageSrc(scene.asset.fallback);
        }}
        decoding="async"
        fetchPriority="high"
      />

      <div
        className={`absolute inset-0 z-[3] ${reducedMotion ? '' : 'transition-opacity duration-[2200ms]'}`}
        style={{
          opacity: scene.motion.mistOpacity * 0.85,
          background:
            'radial-gradient(circle at 28% 24%, rgba(210,180,190,0.22), transparent 38%), radial-gradient(circle at 72% 20%, rgba(184,152,255,0.12), transparent 32%), linear-gradient(to bottom, rgba(245,240,232,0.05), transparent 42%)',
        }}
      />
      <div
        className={`absolute inset-0 z-[4] ${reducedMotion ? '' : 'transition-opacity duration-[2200ms]'}`}
        style={{
          opacity: scene.motion.glowOpacity * 0.75,
          background:
            'radial-gradient(circle at 42% 34%, rgba(255,160,190,0.28), transparent 38%), radial-gradient(circle at 58% 58%, rgba(125,90,255,0.18), transparent 48%)',
        }}
      />
      <TreePetalEmitter scene={scene} />
      <div className="absolute inset-0 z-[7] bg-[radial-gradient(circle_at_center,transparent_36%,rgba(3,2,8,0.44)_78%),linear-gradient(to_bottom,rgba(5,3,10,0.12),rgba(5,3,10,0.46))]" />
    </div>
  );
}
