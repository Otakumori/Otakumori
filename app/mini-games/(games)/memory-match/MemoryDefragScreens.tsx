'use client';

import styles from './MemoryMatchGame.module.css';
import { MemorySealIcon } from './MemoryRelicIcon';

interface MemoryDefragTitleScreenProps {
  onStart: () => void;
}

interface MemoryDefragResultsScreenProps {
  score: number;
  matches: number;
  moves: number;
  timeElapsed: number;
  didWin: boolean;
  perfectClear?: boolean;
  lowMoveClear?: boolean;
  onRestart: () => void;
  onBack: () => void;
}

const INSTRUCTIONS = [
  'Reveal two sealed relic cards and restore each matching pair.',
  'Arrow keys move through the archive. Enter or Space reveals a card.',
  'A mismatch briefly locks the board while the fragments rebind.',
  'Cleaner moves, faster clears, and longer streaks raise your final score.',
];

function formatResultTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function MemoryDefragTitleScreen({ onStart }: MemoryDefragTitleScreenProps) {
  return (
    <section className={`${styles.shell} ${styles.screenShell}`} aria-labelledby="memory-title">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.screenPanel}>
        <div className={styles.screenRelic} aria-hidden="true">
          <MemorySealIcon />
        </div>
        <p className={styles.eyebrow}>Memory Reliquary</p>
        <h1 id="memory-title" className={styles.screenTitle}>
          Memory Card / Defrag
        </h1>
        <p className={styles.screenCopy}>
          A lacquered archive has split its keepsakes into paired echoes. Restore the relics before
          the shrine record cools.
        </p>
        <ul className={styles.screenInstructions}>
          {INSTRUCTIONS.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ul>
        <button type="button" className={styles.primaryAction} onClick={onStart}>
          Begin restoration
        </button>
      </div>
    </section>
  );
}

export function MemoryDefragResultsScreen({
  score,
  matches,
  moves,
  timeElapsed,
  didWin,
  perfectClear,
  lowMoveClear,
  onRestart,
  onBack,
}: MemoryDefragResultsScreenProps) {
  const resultStats = [
    { label: 'Score', value: score.toLocaleString() },
    { label: 'Pairs', value: matches },
    { label: 'Moves', value: moves },
    { label: 'Time', value: formatResultTime(timeElapsed) },
    { label: 'Perfect', value: perfectClear ? 'Yes' : 'No' },
    { label: 'Low move', value: lowMoveClear ? 'Yes' : 'No' },
  ];

  return (
    <section
      className={`${styles.shell} ${styles.screenShell}`}
      data-phase={didWin ? 'won' : 'ready'}
      aria-labelledby="memory-results-title"
    >
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.screenPanel}>
        <div className={styles.screenRelic} aria-hidden="true">
          <MemorySealIcon />
        </div>
        <p className={styles.eyebrow}>Archive restored</p>
        <h1 id="memory-results-title" className={styles.screenTitle}>
          Reliquary sealed
        </h1>
        <p className={styles.screenCopy}>
          The restored fragments are saved as completion facts. Rewards and achievements remain
          intent-only for the external authority.
        </p>
        <div className={styles.resultsGrid} aria-label="Run results">
          {resultStats.map((stat) => (
            <output key={stat.label}>
              <span>{stat.label}</span>
              {stat.value}
            </output>
          ))}
        </div>
        <div className={styles.screenActions}>
          <button type="button" className={styles.primaryAction} onClick={onRestart}>
            Restore again
          </button>
          <button type="button" className={styles.secondaryAction} onClick={onBack}>
            Return to mini-games
          </button>
        </div>
      </div>
    </section>
  );
}
