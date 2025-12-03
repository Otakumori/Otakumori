// Quick Math Game - Answer fast. Pressure builds with each correct streak.

'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAsset } from '../_shared/assets-resolver';
import { play } from '../_shared/audio-bus';
import '../_shared/cohesion.css';

// Config
const ROUND_MS = 60_000;
const PER_Q_BASE_MS = 7000; // base per-question budget
const STREAK_BONUS_MS = 250; // small time credit on correct
const WRONG_PENALTY_MS = 500; // shave time on wrong
const STREAK_MULT_CAP = 5;

type Diff = 'easy' | 'normal' | 'hard' | 'insane';

export default function QuickMath() {
  const sTick = getAsset('quick-math', 'tickSfx') ?? '';
  const sOK = getAsset('quick-math', 'successSfx') ?? '';
  const sNG = getAsset('quick-math', 'failSfx') ?? '';

  // read difficulty from query (?d=easy|normal|hard|insane)
  const diff: Diff = useMemo(() => {
    if (typeof window === 'undefined') return 'normal';
    const d = new URLSearchParams(location.search).get('d') as Diff | null;
    return d && ['easy', 'normal', 'hard', 'insane'].includes(d) ? d! : 'normal';
  }, []);

  // Game state
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<number | null>(null);
  const [input, setInput] = useState<string>('');

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const roundStart = useRef(0);
  const roundEnd = useRef(0);
  const perQDeadline = useRef(0);

  // generate math by difficulty
  function rng(n: number) {
    return Math.floor(Math.random() * n);
  }
  function nextQuestion() {
    // ranges per diff
    const cfg = {
      easy: { a: 10, b: 10, ops: ['+', '-'] as const, allowDiv: false },
      normal: { a: 20, b: 20, ops: ['+', '-', '×'] as const, allowDiv: false },
      hard: { a: 50, b: 12, ops: ['+', '-', '×', '÷'] as const, allowDiv: true },
      insane: { a: 120, b: 24, ops: ['+', '-', '×', '÷'] as const, allowDiv: true },
    }[diff];

    const op = cfg.ops[rng(cfg.ops.length)];
    let A = rng(cfg.a) + 1,
      B = rng(cfg.b) + 1,
      Q = '',
      Ans = 0;

    if (op === '+') {
      Ans = A + B;
      Q = `${A} + ${B}`;
    }
    if (op === '-') {
      if (A < B) [A, B] = [B, A];
      Ans = A - B;
      Q = `${A} - ${B}`;
    }
    if (op === '×') {
      Ans = A * B;
      Q = `${A} × ${B}`;
    }
    if (op === '÷') {
      // force clean division: choose product then divide by one factor
      const x = rng(9) + 2,
        y = rng(9) + 2; // 2..10 tables
      Ans = x;
      Q = `${x * y} ÷ ${y}`;
    }

    setQuestion(Q);
    setAnswer(Ans);
    setInput('');
    const now = performance.now();
    perQDeadline.current = now + perQuestionMs();
  }

  function perQuestionMs() {
    const base = PER_Q_BASE_MS;
    const diffAdj = { easy: +1500, normal: 0, hard: -1000, insane: -1800 }[diff];
    const streakAdj = -Math.min(streak, 12) * 40; // faster as you streak (small)
    return Math.max(2500, base + diffAdj + streakAdj);
  }

  function startIfNeeded() {
    if (started) return;
    setStarted(true);
    const now = performance.now();
    roundStart.current = now;
    roundEnd.current = now + ROUND_MS;
    perQDeadline.current = now + perQuestionMs();
    nextQuestion();
  }

  // timer
  const [, setTick] = useState(0);
  useEffect(() => {
    let raf = 0;
    function loop() {
      if (started && !ended) {
        const now = performance.now();
        if (now >= roundEnd.current) {
          end(now);
          return;
        }
        if (now >= perQDeadline.current) {
          // time up on this question
          miss(false);
        }
        // subtle "tick" at 1Hz last 10s
        const remain = roundEnd.current - now;
        if (
          remain < 10_000 &&
          sTick &&
          Math.floor(remain / 1000) !== Math.floor((remain + 16) / 1000)
        )
          play(sTick, -24);
      }
      setTick((x) => x + 1);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started, ended, sTick]);

  function submit() {
    if (answer === null) return;
    const val = Number(input);
    if (Number.isNaN(val)) return;
    if (val === answer) {
      const base = 100;
      const mult = Math.min(STREAK_MULT_CAP, 1 + Math.floor(streak / 5));
      const delta = base * mult;
      setScore((s) => s + delta);
      setStreak((s) => {
        const ns = s + 1;
        setMaxStreak((m) => Math.max(m, ns));
        return ns;
      });
      setCorrect((c) => c + 1);
      if (sOK) play(sOK, -10);
      // time credit & next Q
      roundEnd.current = Math.min(
        roundStart.current + ROUND_MS,
        roundEnd.current + STREAK_BONUS_MS,
      );
      nextQuestion();
    } else {
      miss(true);
    }
  }

  function miss(playSound: boolean) {
    setWrong((w) => w + 1);
    setStreak(0);
    if (playSound && sNG) play(sNG, -12);
    roundEnd.current = Math.max(performance.now() + 1000, roundEnd.current - WRONG_PENALTY_MS);
    nextQuestion();
  }

  // keypad input (mobile-first, thumb-reachable)
  function push(n: string) {
    startIfNeeded();
    if (n === 'C') {
      setInput('');
      return;
    }
    if (n === '←') {
      setInput((s) => s.slice(0, -1));
      return;
    }
    if (n === '±') {
      setInput((s) => {
        if (!s) return s;
        return s.startsWith('-') ? s.slice(1) : '-' + s;
      });
      return;
    }
    if (n === 'OK') {
      submit();
      return;
    }
    // number
    setInput((s) => {
      if (s.length >= 6) return s; // clamp
      if (s === '0') return n; // no leading zeros
      return s + n;
    });
  }

  // keyboard (desktop)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (ended) return;
      if (e.key === 'Enter') {
        startIfNeeded();
        submit();
        return;
      }
      if (e.key === 'Backspace') {
        startIfNeeded();
        push('←');
        return;
      }
      if (e.key === '-' || e.key === '+') {
        startIfNeeded();
        push('±');
        return;
      }
      if (/[0-9]/.test(e.key)) {
        startIfNeeded();
        push(e.key);
        return;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ended]);

  async function end(now: number) {
    if (ended) return;
    setEnded(true);
    const duration = Math.round(Math.min(now - roundStart.current, ROUND_MS));

    // Calculate petal reward (score / 20)
    const petalReward = Math.floor(score / 20);

    try {
      // Award petals
      if (petalReward > 0) {
        await fetch('/api/v1/petals/collect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: petalReward,
            source: 'game_reward',
          }),
        });
      }

      // Submit to leaderboard
      await fetch('/api/v1/leaderboards/quick-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          metadata: { durationMs: duration, correct, wrong, maxStreak, diff },
        }),
      });
    } catch (error) {
      logger.error('Failed to submit score:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }

    (window as any).__gameEnd?.({
      score,
      durationMs: duration,
      stats: { correct, wrong, maxStreak, diff },
      petalsEarned: petalReward,
    });
  }

  // UI layout (fits 16:9, keypad bottom for thumbs)
  const remainMs = started ? Math.max(0, roundEnd.current - performance.now()) : ROUND_MS;
  return (
    <div className="absolute inset-0 grid grid-rows-[1fr_auto]">
      {/* Top: question + HUD */}
      <div className="relative flex flex-col items-center justify-center p-4">
        {/* HUD */}
        <div className="absolute left-4 top-3 rounded-lg border border-pink-500/30 bg-black/80 backdrop-blur-lg px-3 py-1 text-sm text-pink-200">
          Score {score} • Streak {streak} • {diff.toUpperCase()}
        </div>
        <div className="absolute right-4 top-3 rounded-lg border border-pink-500/30 bg-black/80 backdrop-blur-lg px-3 py-1 text-sm text-pink-200">
          Time {Math.ceil(remainMs / 1000)}s
        </div>

        {/* Question */}
        <div className="mt-6 text-center">
          <div className="text-4xl font-bold tracking-wide text-pink-200 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
            {question || 'Tap a key to start'}
          </div>
          <div className="mt-3 text-3xl font-semibold text-pink-100">
            ={' '}
            <span className="inline-block min-w-[6ch] rounded-lg border border-pink-500/30 bg-black/60 backdrop-blur-sm px-3 py-1 text-white">
              {input || '\u00A0'}
            </span>
          </div>

          {/* Submit on desktop */}
          <div className="mt-3 hidden gap-2 sm:flex">
            <button
              className="rounded-lg border border-pink-500/40 bg-pink-500/20 backdrop-blur-sm px-3 py-1 text-pink-200 hover:bg-pink-500/30"
              onClick={() => {
                startIfNeeded();
                submit();
              }}
            >
              Submit
            </button>
            <button
              className="rounded-lg border border-pink-500/20 bg-black/60 backdrop-blur-sm px-3 py-1 text-pink-100 hover:bg-black/80"
              onClick={() => push('C')}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: mobile keypad (thumb-reachable) */}
      <div className="select-none border-t border-pink-500/20 bg-black/80 p-3 backdrop-blur-lg">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          {['7', '8', '9', '←', '4', '5', '6', '±', '1', '2', '3', 'C', '0', '', '', 'OK'].map(
            (k, i) => {
              if (k === '') return <div key={i} />;
              const primary = ['OK', 'C', '←', '±'].includes(k);
              return (
                <button
                  key={i}
                  onClick={() => push(k)}
                  className={`h-12 rounded-xl border text-lg transition-colors ${
                    primary
                      ? 'border-pink-500/40 bg-pink-500/20 backdrop-blur-sm text-pink-200 hover:bg-pink-500/30'
                      : 'border-pink-500/20 bg-black/60 backdrop-blur-sm text-pink-100 hover:bg-black/80'
                  }`}
                  aria-label={`key ${k}`}
                >
                  {k}
                </button>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
