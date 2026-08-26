'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameSave } from '../../_shared/SaveSystem';
import { MemoryKeeperPresentation, type MemoryKeeperReaction } from './MemoryKeeperPresentation';
import styles from './MemoryMatchGame.module.css';
import { MemoryRelicIcon, MemorySealIcon } from './MemoryRelicIcon';
import {
  buildMemoryDefragAchievementIntent,
  buildMemoryDefragCompletionFacts,
  buildMemoryDefragRewardIntent,
  createMemoryDefragGame,
  getMemoryDefragElapsedMs,
  getMemoryDefragProgress,
  getMemoryDefragScore,
  MEMORY_DEFRAG_CONFIGS,
  pauseMemoryDefrag,
  resolveMemoryMismatch,
  resumeMemoryDefrag,
  revealMemoryCard,
  settleTimedState,
  type MemoryDefragAchievementIntent,
  type MemoryDefragDifficulty,
  type MemoryDefragPlayerPresentation,
  type MemoryDefragRewardIntent,
} from './memoryDefragEngine';

interface MemoryMatchGameProps {
  difficulty?: MemoryDefragDifficulty;
  seed?: string;
  player?: MemoryDefragPlayerPresentation;
  onGameEnd?: (results: {
    score: number;
    matches: number;
    moves: number;
    timeElapsed: number;
    didWin: boolean;
    rewardIntent?: MemoryDefragRewardIntent | null;
    achievementIntent?: MemoryDefragAchievementIntent | null;
  }) => void;
  onStatsUpdate?: (stats: {
    score: number;
    combo: number;
    timer?: number;
    progress: number;
  }) => void;
}

const DIFFICULTIES: MemoryDefragDifficulty[] = ['initiate', 'keeper', 'warden'];

const MEMORY_DEFRAG_AUDIO = {
  reveal: '/assets/sounds/runic-reveal.mp3',
  match: '/assets/sfx/success.ogg',
  mismatch: '/assets/sfx/miss.ogg',
  won: '/assets/sfx/pop.ogg',
};

type FeedbackKind = 'reveal' | 'match' | 'mismatch' | 'won' | 'reset';

interface FeedbackState {
  kind: FeedbackKind;
  ids: string[];
  nonce: number;
}

interface KeeperReactionState {
  kind: MemoryKeeperReaction;
  nonce: number;
}

function playMemoryCue(kind: Exclude<FeedbackKind, 'reset'>) {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') return;

  const url = MEMORY_DEFRAG_AUDIO[kind];
  void import('../../_shared/audio-bus')
    .then(({ play }) => play(url, kind === 'mismatch' ? -18 : -14))
    .catch(() => {});
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reducedMotion;
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function MemoryMatchGame({
  difficulty = 'keeper',
  seed,
  player,
  onGameEnd,
  onStatsUpdate,
}: MemoryMatchGameProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [selectedDifficulty, setSelectedDifficulty] = useState<MemoryDefragDifficulty>(difficulty);
  const [game, setGame] = useState(() =>
    createMemoryDefragGame({ difficulty, seed, nowMs: performance.now() }),
  );
  const [clockMs, setClockMs] = useState(() => performance.now());
  const [announcement, setAnnouncement] = useState('Memory defrag board ready.');
  const [feedback, setFeedback] = useState<FeedbackState>({
    kind: 'reset',
    ids: [],
    nonce: 0,
  });
  const [keeperReaction, setKeeperReaction] = useState<KeeperReactionState>({
    kind: 'idle',
    nonce: 0,
  });
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const finishedSeedRef = useRef<string | null>(null);
  const autoPausedRef = useRef(false);
  const { saveOnExit, autoSave } = useGameSave('memory-match');

  const config = MEMORY_DEFRAG_CONFIGS[game.difficulty];
  const elapsedMs = getMemoryDefragElapsedMs(game, clockMs);
  const score = getMemoryDefragScore(game, clockMs);
  const progress = getMemoryDefragProgress(game);
  const inputLocked = game.phase === 'resolving' || game.phase === 'paused' || game.phase === 'won';
  const feedbackIds = useMemo(() => new Set(feedback.ids), [feedback.ids]);
  const mismatchIds = useMemo(
    () => new Set(game.pendingMismatch?.ids ?? []),
    [game.pendingMismatch?.ids],
  );
  const streakTier = game.streak >= 3 ? 'high' : game.streak >= 2 ? 'warm' : 'quiet';

  const startNewGame = useCallback(
    (nextDifficulty: MemoryDefragDifficulty = selectedDifficulty) => {
      const nextSeed = seed ?? `${nextDifficulty}-${Date.now()}`;
      const now = performance.now();
      finishedSeedRef.current = null;
      setSelectedDifficulty(nextDifficulty);
      setClockMs(now);
      setGame(createMemoryDefragGame({ difficulty: nextDifficulty, seed: nextSeed, nowMs: now }));
      setFeedback((current) => ({ kind: 'reset', ids: [], nonce: current.nonce + 1 }));
      setAnnouncement(
        `${MEMORY_DEFRAG_CONFIGS[nextDifficulty].label} archive opened as a fresh board.`,
      );
      requestAnimationFrame(() => cardRefs.current[0]?.focus());
    },
    [seed, selectedDifficulty],
  );

  const activateCard = useCallback((cardId: string) => {
    const now = performance.now();
    setClockMs(now);
    setGame((current) => {
      const next = revealMemoryCard(current, cardId, now);
      const card = next.cards.find((candidate) => candidate.id === cardId);
      const pairIds = current.revealedIds.includes(cardId)
        ? current.revealedIds
        : [...current.revealedIds, cardId];

      if (next.lastEvent === 'first-reveal' && card) {
        setFeedback((currentFeedback) => ({
          kind: 'reveal',
          ids: [cardId],
          nonce: currentFeedback.nonce + 1,
        }));
        playMemoryCue('reveal');
        setAnnouncement(`${card.face.label} revealed.`);
      } else if (next.lastEvent === 'match' && card) {
        setFeedback((currentFeedback) => ({
          kind: 'match',
          ids: pairIds,
          nonce: currentFeedback.nonce + 1,
        }));
        playMemoryCue('match');
        setAnnouncement(`${card.face.label} pair restored. Streak ${next.streak}.`);
      } else if (next.lastEvent === 'mismatch') {
        setFeedback((currentFeedback) => ({
          kind: 'mismatch',
          ids: next.pendingMismatch?.ids ?? pairIds,
          nonce: currentFeedback.nonce + 1,
        }));
        playMemoryCue('mismatch');
        setAnnouncement('Fragments do not align. Rebinding.');
      } else if (next.lastEvent === 'won') {
        setFeedback((currentFeedback) => ({
          kind: 'won',
          ids: pairIds,
          nonce: currentFeedback.nonce + 1,
        }));
        playMemoryCue('won');
        setAnnouncement('Memory fully defragmented.');
      }

      return next;
    });
  }, []);

  const pauseGame = useCallback(() => {
    const now = performance.now();
    setClockMs(now);
    setGame((current) => pauseMemoryDefrag(current, now));
    setAnnouncement('Memory defrag paused.');
  }, []);

  const resumeGame = useCallback(() => {
    const now = performance.now();
    setClockMs(now);
    setGame((current) => resumeMemoryDefrag(current, now));
    setAnnouncement('Memory defrag resumed.');
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = performance.now();
      setClockMs(now);
      setGame((current) => settleTimedState(current, now));
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!game.pendingMismatch || game.phase !== 'resolving') return;

    const remaining = Math.max(0, game.pendingMismatch.resolveAtMs - game.elapsedMs);
    const timeout = window.setTimeout(
      () => {
        const now = performance.now();
        setClockMs(now);
        setGame((current) => resolveMemoryMismatch(current, now));
        setAnnouncement('Unmatched fragments concealed.');
      },
      reducedMotion ? Math.min(remaining, 120) : remaining,
    );

    return () => window.clearTimeout(timeout);
  }, [game.elapsedMs, game.pendingMismatch, game.phase, reducedMotion]);

  useEffect(() => {
    const nextReaction = mapFeedbackToKeeperReaction(feedback.kind, game.streak);
    setKeeperReaction({ kind: nextReaction, nonce: feedback.nonce });

    if (nextReaction === 'idle' || nextReaction === 'clear' || nextReaction === 'fail') {
      return;
    }

    const timeout = window.setTimeout(
      () => setKeeperReaction({ kind: 'idle', nonce: feedback.nonce }),
      reducedMotion ? 220 : getKeeperReactionDuration(nextReaction),
    );

    return () => window.clearTimeout(timeout);
  }, [feedback.kind, feedback.nonce, game.streak, reducedMotion]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const now = performance.now();
      setClockMs(now);

      if (document.hidden) {
        setGame((current) => {
          if (current.phase === 'playing' || current.phase === 'resolving') {
            autoPausedRef.current = true;
            return pauseMemoryDefrag(current, now);
          }
          return current;
        });
        return;
      }

      if (autoPausedRef.current) {
        autoPausedRef.current = false;
        setGame((current) => resumeMemoryDefrag(current, now));
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (game.phase === 'playing' || game.phase === 'resolving')) {
        event.preventDefault();
        pauseGame();
      }

      if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        startNewGame(game.difficulty);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game.difficulty, game.phase, pauseGame, startNewGame]);

  useEffect(() => {
    onStatsUpdate?.({
      score,
      combo: game.streak,
      timer: Math.floor(elapsedMs / 1000),
      progress,
    });
  }, [elapsedMs, game.streak, onStatsUpdate, progress, score]);

  useEffect(() => {
    if (game.phase !== 'playing' || game.matchedPairs === 0 || game.matchedPairs % 2 !== 0) {
      return;
    }

    autoSave({
      score,
      level: config.pairs,
      progress,
      stats: {
        difficulty: game.difficulty,
        moves: game.moves,
        elapsedMs,
        rewardAuthority: 'external',
      },
    }).catch(() => {});
  }, [
    autoSave,
    config.pairs,
    elapsedMs,
    game.difficulty,
    game.matchedPairs,
    game.moves,
    game.phase,
    progress,
    score,
  ]);

  useEffect(() => {
    if (game.phase !== 'won' || finishedSeedRef.current === game.seed) return;

    finishedSeedRef.current = game.seed;
    const facts = buildMemoryDefragCompletionFacts(game, clockMs);
    const rewardIntent = buildMemoryDefragRewardIntent(game, clockMs);
    const achievementIntent = buildMemoryDefragAchievementIntent(game, clockMs);

    onGameEnd?.({
      score,
      matches: game.matchedPairs,
      moves: game.moves,
      timeElapsed: Math.floor(elapsedMs / 1000),
      didWin: true,
      rewardIntent,
      achievementIntent,
    });

    saveOnExit({
      score,
      level: config.pairs,
      progress: 1,
      stats: {
        difficulty: game.difficulty,
        moves: game.moves,
        elapsedMs,
        perfectClear: facts?.perfectClear ?? false,
        lowMoveClear: facts?.lowMoveClear ?? false,
        rewardIntent,
        achievementIntent,
        playerDisplayName: player?.displayName,
      },
    }).catch(() => {});
  }, [clockMs, config.pairs, elapsedMs, game, onGameEnd, player?.displayName, saveOnExit, score]);

  const focusByOffset = useCallback(
    (index: number, offset: number) => {
      const nextIndex = Math.max(0, Math.min(game.cards.length - 1, index + offset));
      cardRefs.current[nextIndex]?.focus();
    },
    [game.cards.length],
  );

  const handleCardKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number, cardId: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateCard(cardId);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        focusByOffset(index, 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        focusByOffset(index, -1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusByOffset(index, config.columns);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusByOffset(index, -config.columns);
      }
    },
    [activateCard, config.columns, focusByOffset],
  );

  const boardStyle = useMemo(
    () =>
      ({
        '--memory-columns': config.columns,
        '--memory-rows': config.rows,
      }) as React.CSSProperties,
    [config.columns, config.rows],
  );

  return (
    <section
      className={styles.shell}
      data-testid="memory-defrag-game"
      data-phase={game.phase}
      data-feedback={feedback.kind}
      data-streak-tier={streakTier}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      aria-labelledby="memory-defrag-title"
    >
      <div className={styles.backdrop} aria-hidden="true" />

      <div className={styles.hud}>
        <div>
          <p className={styles.eyebrow}>Memory Card / Defrag</p>
          <h1 id="memory-defrag-title" className={styles.title}>
            Restore the fractured relics
          </h1>
        </div>

        <div className={styles.stats} aria-label="Run stats">
          <output>
            <span>Score</span>
            {score.toLocaleString()}
          </output>
          <output>
            <span>Moves</span>
            {game.moves}
          </output>
          <output>
            <span>Time</span>
            {formatTime(elapsedMs)}
          </output>
          <output>
            <span>Pairs</span>
            {game.matchedPairs}/{config.pairs}
          </output>
        </div>

        <div className={styles.controls} aria-label="Game controls">
          <div
            className={styles.segmented}
            role="group"
            aria-label="Difficulty. Changing difficulty starts a fresh board."
          >
            {DIFFICULTIES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={game.difficulty === item}
                onClick={() => startNewGame(item)}
              >
                {MEMORY_DEFRAG_CONFIGS[item].label}
              </button>
            ))}
          </div>
          <p className={styles.controlHint}>Difficulty opens a fresh board.</p>

          <button
            type="button"
            className={styles.controlButton}
            onClick={() => startNewGame(game.difficulty)}
          >
            Restart
          </button>

          {game.phase === 'paused' ? (
            <button type="button" className={styles.controlButton} onClick={resumeGame}>
              Resume
            </button>
          ) : (
            <button
              type="button"
              className={styles.controlButton}
              onClick={pauseGame}
              disabled={game.phase === 'ready' || game.phase === 'won'}
            >
              Pause
            </button>
          )}
        </div>
      </div>

      <div className={styles.stage}>
        <MemoryKeeperPresentation
          reaction={keeperReaction.kind}
          nonce={keeperReaction.nonce}
          reducedMotion={reducedMotion}
          progress={progress}
          streakTier={streakTier}
        />

        <div className={styles.table}>
          <div className={styles.boardHeader}>
            <div>
              <p className={styles.statusLine}>
                {game.phase === 'paused'
                  ? 'Paused'
                  : inputLocked
                    ? 'Resolving memory lock'
                    : 'Select two fragments'}
              </p>
              <p className={styles.metaLine}>
                Streak {game.streak} / Best {game.bestStreak}
              </p>
            </div>
            {player?.displayName && (
              <div className={styles.playerChip}>
                <span>{player.displayName}</span>
                {player.title && <small>{player.title}</small>}
              </div>
            )}
          </div>

          <div
            className={styles.board}
            style={boardStyle}
            role="grid"
            aria-label={`${config.label} memory defrag board`}
          >
            {game.cards.map((card, index) => {
              const isFaceUp = card.state !== 'hidden';
              const hasFeedback = feedbackIds.has(card.id);
              const isMismatched = mismatchIds.has(card.id);
              return (
                <button
                  key={card.id}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  type="button"
                  className={styles.card}
                  data-state={card.state}
                  data-tone={card.face.tone}
                  data-relic={card.face.id}
                  data-feedback={hasFeedback ? feedback.kind : undefined}
                  data-mismatch={isMismatched ? 'true' : undefined}
                  data-feedback-nonce={hasFeedback ? feedback.nonce : undefined}
                  onClick={() => activateCard(card.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, index, card.id)}
                  aria-label={
                    isFaceUp
                      ? `${card.face.label}, ${card.state}`
                      : `Hidden memory card ${index + 1}`
                  }
                  aria-disabled={inputLocked || card.state === 'matched'}
                  role="gridcell"
                >
                  <span className={styles.cardInner}>
                    <span className={styles.cardBack} aria-hidden={isFaceUp}>
                      <MemorySealIcon className={styles.cardSeal} />
                      <span className={styles.cardSigil}>MORI</span>
                    </span>
                    <span className={styles.cardFace} aria-hidden={!isFaceUp}>
                      <span className={styles.relicShape}>
                        <MemoryRelicIcon faceId={card.face.id} className={styles.relicIcon} />
                      </span>
                      <span className={styles.faceCode}>{card.face.shortLabel}</span>
                      <span className={styles.faceLabel}>{card.face.label}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.progressWrap} aria-hidden="true">
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {game.phase === 'paused' && (
        <div
          className={styles.pauseOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-pause-title"
        >
          <div>
            <h2 id="memory-pause-title">Run paused</h2>
            <p>The board is held in place until you resume.</p>
            <div className={styles.overlayActions}>
              <button type="button" onClick={resumeGame}>
                Resume
              </button>
              <button type="button" onClick={() => startNewGame(game.difficulty)}>
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}

function mapFeedbackToKeeperReaction(
  feedbackKind: FeedbackKind,
  streak: number,
): MemoryKeeperReaction {
  if (feedbackKind === 'reset') return 'idle';
  if (feedbackKind === 'won') return 'clear';
  if (feedbackKind === 'match' && streak >= 2) return 'streak';
  return feedbackKind;
}

function getKeeperReactionDuration(reaction: MemoryKeeperReaction) {
  switch (reaction) {
    case 'streak':
      return 920;
    case 'match':
      return 760;
    case 'mismatch':
      return 680;
    case 'reveal':
      return 520;
    default:
      return 0;
  }
}
