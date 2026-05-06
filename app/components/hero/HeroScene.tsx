'use client';

import { useEffect, useMemo, useState } from 'react';
import { resolveHomeScene, type HomeSceneState } from './homeScene';

const CANOPY_ANCHORS = [
  { x: 26, y: 26 },
  { x: 38, y: 18 },
  { x: 51, y: 22 },
  { x: 64, y: 19 },
  { x: 73, y: 30 },
  { x: 45, y: 34 },
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
  const [collected, setCollected] = useState<number | null>(null);
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
        drift,
        fall: 52 + (index % 7) * 7,
        rotate: (index % 2 === 0 ? 1 : -1) * (70 + index * 9),
        scale: 0.72 + (index % 4) * 0.1,
      };
    });
  }, [scene.bucket, scene.motion.petalDensity, scene.motion.reducedMotion, scene.motion.windStrength]);

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
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
      {petals.map((petal) => (
        <button
          key={`${scene.bucket}-${petal.id}`}
          type="button"
          tabIndex={-1}
          aria-label="Collect preview sakura petal"
          onClick={() => collectPreview(petal.id)}
          className="pointer-events-auto absolute h-8 w-8 rounded-full text-pink-100/80 drop-shadow-[0_0_8px_rgba(255,170,210,0.45)] transition-transform duration-300 hover:scale-125 focus:outline-none"
          style={{
            left: `${petal.left}%`,
            top: `${petal.top}%`,
            transform: `scale(${petal.scale})`,
            animation: scene.motion.reducedMotion
              ? undefined
              : `treePetalDrift ${petal.duration}s linear ${petal.delay}s infinite`,
            ['--petal-drift' as string]: `${petal.drift}vw`,
            ['--petal-fall' as string]: `${petal.fall}vh`,
            ['--petal-rotate' as string]: `${petal.rotate}deg`,
            ['--petal-gust' as string]: `${scene.motion.gustStrength * 24}vw`,
          }}
        >
          <span className="block rotate-45 text-lg leading-none">❀</span>
          {collected === petal.id ? (
            <span className="absolute inset-0 rounded-full border border-pink-100/70 animate-ping" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

export default function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();
  const [scene, setScene] = useState(() => resolveHomeScene(new Date(), reducedMotion));
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
        className="absolute inset-0 h-full w-full object-cover opacity-95 transition-[opacity,filter,transform] duration-[1600ms] ease-out"
        onError={() => {
          if (imageSrc !== scene.asset.fallback) setImageSrc(scene.asset.fallback);
        }}
        decoding="async"
        fetchPriority="high"
      />

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
      <div className="absolute inset-0 z-[7] bg-[radial-gradient(circle_at_center,transparent_36%,rgba(3,2,8,0.44)_78%),linear-gradient(to_bottom,rgba(5,3,10,0.12),rgba(5,3,10,0.46))]" />

      <style jsx>{`
        @keyframes treePetalDrift {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.8);
          }
          8% {
            opacity: 0.9;
          }
          45% {
            transform: translate3d(calc(var(--petal-drift) * 0.45 + var(--petal-gust)), calc(var(--petal-fall) * 0.48), 0) rotate(calc(var(--petal-rotate) * 0.5)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--petal-drift), var(--petal-fall), 0) rotate(var(--petal-rotate)) scale(0.76);
          }
        }
      `}</style>
    </div>
  );
}
