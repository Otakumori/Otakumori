'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HomeDesktopCursor.module.css';

type Point = { x: number; y: number };

const CURSOR_BODY_SOURCE = '/assets/home/ui/runtime/cursor-body-helper.webp';
const CURSOR_TASSEL_SOURCE = '/assets/home/ui/runtime/cursor-tassel-helper.webp';

/**
 * A Home-only fine-pointer treatment. The cursor body is positioned at the
 * pointer without interpolation; only the secondary tassel eases toward it.
 */
export default function HomeDesktopCursor() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const tasselRef = useRef<HTMLImageElement>(null);
  const targetRef = useRef<Point>({ x: -160, y: -160 });
  const tailRef = useRef<Point>({ x: -160, y: -160 });
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [isArtReady, setIsArtReady] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateEligibility = () => setIsEligible(finePointer.matches && !reducedMotion.matches);

    updateEligibility();
    finePointer.addEventListener('change', updateEligibility);
    reducedMotion.addEventListener('change', updateEligibility);

    return () => {
      finePointer.removeEventListener('change', updateEligibility);
      reducedMotion.removeEventListener('change', updateEligibility);
    };
  }, []);

  useEffect(() => {
    if (!isEligible) {
      setHasMoved(false);
      return undefined;
    }

    const settleTassel = () => {
      const target = targetRef.current;
      const tail = tailRef.current;
      const velocity = velocityRef.current;
      const body = bodyRef.current;
      const tassel = tasselRef.current;

      if (!body || !tassel) {
        frameRef.current = null;
        return;
      }

      const offsetX = target.x - tail.x;
      const offsetY = target.y - tail.y;
      velocity.x = (velocity.x + offsetX * 0.075) * 0.76;
      velocity.y = (velocity.y + offsetY * 0.075 + 0.18) * 0.76;
      tail.x += velocity.x;
      tail.y += velocity.y;

      body.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      const tilt = Math.max(-10, Math.min(10, velocity.x * 0.9));
      tassel.style.transform = `translate3d(${tail.x + 26}px, ${tail.y + 23}px, 0) rotate(${tilt}deg)`;

      if (
        Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(velocity.x) + Math.abs(velocity.y) >
        0.35
      ) {
        frameRef.current = window.requestAnimationFrame(settleTassel);
      } else {
        frameRef.current = null;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;

      targetRef.current = { x: event.clientX, y: event.clientY };
      if (!hasMoved) {
        tailRef.current = { x: event.clientX, y: event.clientY };
        setHasMoved(true);
      }
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(settleTassel);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [hasMoved, isEligible]);

  useEffect(() => {
    const shouldReplaceCursor = isEligible && hasMoved && isArtReady;
    if (shouldReplaceCursor) document.body.dataset.homeCursor = 'ready';
    else delete document.body.dataset.homeCursor;

    return () => {
      delete document.body.dataset.homeCursor;
    };
  }, [hasMoved, isArtReady, isEligible]);

  if (!isEligible || !hasMoved) return null;

  return (
    <div className={styles.cursor} aria-hidden="true" data-home-desktop-cursor>
      <div ref={bodyRef} className={styles.body}>
        <img
          src={CURSOR_BODY_SOURCE}
          alt=""
          width={256}
          height={171}
          onLoad={() => setIsArtReady(true)}
          className={styles.bodyArt}
        />
      </div>
      <img
        ref={tasselRef}
        src={CURSOR_TASSEL_SOURCE}
        alt=""
        width={128}
        height={148}
        className={styles.tassel}
      />
    </div>
  );
}
