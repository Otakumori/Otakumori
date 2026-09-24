import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { MemoryRelicIcon, MemorySealIcon } from './MemoryRelicIcon';
import styles from './MemoryMatchGame.module.css';

export type MemoryKeeperReaction =
  | 'idle'
  | 'reveal'
  | 'match'
  | 'mismatch'
  | 'streak'
  | 'clear'
  | 'fail';

interface MemoryKeeperPresentationProps {
  reaction: MemoryKeeperReaction;
  nonce: number;
  reducedMotion: boolean;
  progress: number;
  streakTier: 'quiet' | 'warm' | 'high';
}

const DECORATIVE_RELICS = ['root', 'reliquary', 'lantern', 'thread'] as const;

export function MemoryKeeperPresentation({
  reaction,
  nonce,
  reducedMotion,
  progress,
  streakTier,
}: MemoryKeeperPresentationProps) {
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    event.currentTarget.style.setProperty('--keeper-parallax-x', `${clamp(x, -1, 1).toFixed(3)}`);
    event.currentTarget.style.setProperty('--keeper-parallax-y', `${clamp(y, -1, 1).toFixed(3)}`);
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--keeper-parallax-x', '0');
    event.currentTarget.style.setProperty('--keeper-parallax-y', '0');
  };

  return (
    <aside
      className={styles.keeperScene}
      data-testid="memory-keeper-presentation"
      data-reaction={reaction}
      data-reaction-nonce={nonce}
      data-streak-tier={streakTier}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      aria-hidden="true"
      style={{ '--keeper-progress': progress } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className={styles.keeperDepth} />
      <div className={styles.keeperPortrait} />
      <div className={styles.keeperBookGlow} />
      <div className={styles.keeperSealArc} />
      <div className={styles.keeperCards}>
        {DECORATIVE_RELICS.map((faceId, index) => (
          <span key={faceId} className={styles.keeperCard} data-card-index={index}>
            <MemorySealIcon className={styles.keeperCardBack} />
            <MemoryRelicIcon faceId={faceId} className={styles.keeperCardRelic} />
          </span>
        ))}
      </div>
      <div
        className={styles.keeperCinematic}
        data-cinematic={reaction === 'clear' || reaction === 'fail' ? reaction : undefined}
      >
        <span>{reaction === 'fail' ? 'Memory scattered' : 'Memory restored'}</span>
      </div>
    </aside>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
