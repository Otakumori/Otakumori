'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { useHomeSceneContext } from '@/app/components/hero/HomeSceneContext';
import { HOME_SCENE_MANIFEST, resolvePetalSpritePosition } from '@/app/components/hero/homeScene';
import { PETAL_VALUES, SPAWN, UI } from '@/app/lib/petals/constants';
import type { Position } from '@/app/lib/petals/physics';
import styles from './FallingPetals.module.css';

interface FallingPetalsProps {
  onPetalCollect: (petalId: number, value: number, x: number, y: number) => void;
  counterPosition?: Position;
}

type CollectiblePetal = {
  id: number;
  lane: number;
  sourceNudgeX: number;
  sourceNudgeY: number;
  drift: number;
  fall: number;
  duration: number;
  delay: number;
  rotation: number;
  scale: number;
  variant: number;
  value: number;
};

type PetalStyle = CSSProperties & {
  '--collectible-left': string;
  '--collectible-top': string;
  '--collectible-drift': string;
  '--collectible-fall': string;
  '--collectible-rotation': string;
  '--collectible-scale': string;
  '--collectible-duration': string;
  '--collectible-delay': string;
  '--petal-sprite-position': string;
  '--petal-nudge-x': string;
  '--petal-nudge-y': string;
};

const DESKTOP_PETAL_COUNT = 6;
const COMPACT_PETAL_COUNT = 4;
const POINTER_INFLUENCE_RADIUS = 112;

function createCollectiblePetal(id: number): CollectiblePetal {
  const lane = id % 6;
  const isRare = id % Math.max(2, Math.round(1 / SPAWN.RARE_CHANCE)) === 0;

  return {
    id,
    lane,
    sourceNudgeX: (((id * 7) % 11) - 5) * 14,
    sourceNudgeY: ((id * 13) % 38) + 20,
    drift: 150 + ((id * 11) % 170),
    fall: 320 + ((id * 9) % 190),
    duration: 13 + (id % 5) * 1.8,
    delay: -(id % 7) * 1.7,
    rotation: (id % 2 === 0 ? 1 : -1) * (190 + (id % 4) * 48),
    scale: 0.74 + (id % 3) * 0.12,
    variant: id % HOME_SCENE_MANIFEST.petals.frameCount,
    value: isRare ? PETAL_VALUES.RARE : PETAL_VALUES.COMMON,
  };
}

function getDevicePetalCount() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const constrained =
    window.matchMedia('(max-width: 639px)').matches ||
    (typeof memory === 'number' && memory <= 4) ||
    (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4);

  return constrained ? COMPACT_PETAL_COUNT : DESKTOP_PETAL_COUNT;
}

export default function FallingPetals({ onPetalCollect, counterPosition }: FallingPetalsProps) {
  const { projection, reducedMotion } = useHomeSceneContext();
  const [petalCount, setPetalCount] = useState(COMPACT_PETAL_COUNT);
  const [generation, setGeneration] = useState(0);
  const [collectingIds, setCollectingIds] = useState<Set<number>>(() => new Set());
  const [isActive, setIsActive] = useState(true);
  const layerRef = useRef<HTMLDivElement>(null);
  const isIntersectingRef = useRef(true);
  const pointerFrameRef = useRef<number | null>(null);
  const nextIdRef = useRef(100);

  useEffect(() => {
    setPetalCount(getDevicePetalCount());
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const updateActivity = () =>
      setIsActive(document.visibilityState === 'visible' && isIntersectingRef.current);
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = Boolean(entry?.isIntersecting);
        updateActivity();
      },
      { threshold: 0.04 },
    );

    observer.observe(layer);
    document.addEventListener('visibilitychange', updateActivity);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateActivity);
    };
  }, []);

  useEffect(
    () => () => {
      if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    },
    [],
  );

  const petals = useMemo(
    () =>
      Array.from({ length: petalCount }, (_, index) =>
        createCollectiblePetal(generation * 17 + index),
      ),
    [generation, petalCount],
  );

  const resolveCounterPosition = useCallback((): Position => {
    if (counterPosition) return counterPosition;

    const counter = document.querySelector<HTMLElement>('[data-petal-counter]');
    if (counter) {
      const bounds = counter.getBoundingClientRect();
      return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    }

    return {
      x: window.innerWidth - UI.COUNTER_BOTTOM_RIGHT_MARGIN - 30,
      y: window.innerHeight - UI.COUNTER_BOTTOM_RIGHT_MARGIN - 20,
    };
  }, [counterPosition]);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);

    pointerFrameRef.current = requestAnimationFrame(() => {
      layerRef.current
        ?.querySelectorAll<HTMLElement>('[data-collectible-petal]')
        .forEach((petal) => {
          const bounds = petal.getBoundingClientRect();
          const centerX = bounds.left + bounds.width / 2;
          const centerY = bounds.top + bounds.height / 2;
          const dx = clientX - centerX;
          const dy = clientY - centerY;
          const distance = Math.hypot(dx, dy);
          const influence = Math.max(0, 1 - distance / POINTER_INFLUENCE_RADIUS);

          petal.style.setProperty('--petal-nudge-x', `${dx * influence * 0.08}px`);
          petal.style.setProperty('--petal-nudge-y', `${dy * influence * 0.06}px`);
          petal.dataset.pointerNear = influence > 0 ? 'true' : 'false';
        });
      pointerFrameRef.current = null;
    });
  }, []);

  const collectPetal = useCallback(
    (petal: CollectiblePetal, element: HTMLButtonElement) => {
      if (collectingIds.has(petal.id)) return;

      const bounds = element.getBoundingClientRect();
      const origin = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      const target = resolveCounterPosition();

      setCollectingIds((current) => new Set(current).add(petal.id));
      onPetalCollect(petal.id, petal.value, origin.x, origin.y);

      const finishCollection = () => {
        setCollectingIds((current) => {
          const next = new Set(current);
          next.delete(petal.id);
          return next;
        });
        nextIdRef.current += 1;
        setGeneration(nextIdRef.current);
      };

      if (typeof element.animate !== 'function') {
        window.setTimeout(finishCollection, reducedMotion ? 120 : 520);
        return;
      }

      const animation = element.animate(
        reducedMotion
          ? [
              { opacity: 1, transform: 'scale(1)' },
              { opacity: 0, transform: 'scale(0.72)' },
            ]
          : [
              { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
              {
                opacity: 0.96,
                transform: `translate3d(${(target.x - origin.x) * 0.45}px, ${(target.y - origin.y) * 0.45}px, 0) rotate(150deg) scale(1.12)`,
                offset: 0.55,
              },
              {
                opacity: 0,
                transform: `translate3d(${target.x - origin.x}px, ${target.y - origin.y}px, 0) rotate(330deg) scale(0.38)`,
              },
            ],
        {
          duration: reducedMotion ? 120 : 520,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        },
      );

      animation.finished.catch(() => undefined).finally(finishCollection);
    },
    [collectingIds, onPetalCollect, reducedMotion, resolveCounterPosition],
  );

  return (
    <div
      ref={layerRef}
      className={styles.layer}
      data-active={isActive ? 'true' : 'false'}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      data-testid="collectible-petal-layer"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        layerRef.current
          ?.querySelectorAll<HTMLElement>('[data-collectible-petal]')
          .forEach((petal) => {
            petal.style.setProperty('--petal-nudge-x', '0px');
            petal.style.setProperty('--petal-nudge-y', '0px');
            petal.dataset.pointerNear = 'false';
          });
      }}
    >
      {petals.map((petal) => {
        const artboard = HOME_SCENE_MANIFEST.world.artboard;
        const anchor = artboard.anchors.canopy[petal.lane % artboard.anchors.canopy.length];
        const scale = projection?.scale ?? 1;
        const left = projection
          ? projection.left + (anchor.x + petal.sourceNudgeX) * scale
          : 9 + petal.lane * 15;
        const top = projection
          ? projection.top + (anchor.y + petal.sourceNudgeY) * scale
          : 8 + petal.lane * 5;
        const style: PetalStyle = {
          backgroundImage: `url(${HOME_SCENE_MANIFEST.petals.src})`,
          '--collectible-left': projection ? `${left}px` : `${left}%`,
          '--collectible-top': projection ? `${top}px` : `${top}%`,
          '--collectible-drift': projection ? `${petal.drift * scale}px` : `${petal.drift / 8}vw`,
          '--collectible-fall': projection ? `${petal.fall * scale}px` : `${petal.fall / 7}vh`,
          '--collectible-rotation': `${petal.rotation}deg`,
          '--collectible-scale': String(petal.scale),
          '--collectible-duration': `${petal.duration}s`,
          '--collectible-delay': `${petal.delay}s`,
          '--petal-sprite-position': resolvePetalSpritePosition(petal.variant),
          '--petal-nudge-x': '0px',
          '--petal-nudge-y': '0px',
        };

        return (
          <button
            key={petal.id}
            type="button"
            className={styles.collectible}
            style={style}
            aria-label={`Collect sakura petal worth ${petal.value}`}
            data-collectible-petal
            data-source-x={Math.round(anchor.x + petal.sourceNudgeX)}
            data-source-y={Math.round(anchor.y + petal.sourceNudgeY)}
            data-petal-variant={petal.variant}
            data-pointer-near="false"
            disabled={collectingIds.has(petal.id)}
            onClick={(event) => collectPetal(petal, event.currentTarget)}
          />
        );
      })}
    </div>
  );
}
