'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';

import { pauseGameAudio, resumeGameAudio, stopGameAudio } from './audio-bus';

export type GameSessionPhase =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'exiting';

export type GameSessionResult = {
  outcome: 'completed' | 'failed' | 'aborted';
  score?: number;
  stats?: ReadonlyArray<{ label: string; value: string | number }>;
};

export type GameLifecycleAdapter = {
  pause?: () => void;
  resume?: () => void;
  cleanup?: () => void;
};

export type GameAction =
  | 'confirm'
  | 'cancel'
  | 'pause'
  | 'primary'
  | 'secondary'
  | 'move-left'
  | 'move-right'
  | 'move-up'
  | 'move-down';

export type GameActionBindings = Readonly<Record<string, GameAction>>;

export type GameSessionState<TResult extends GameSessionResult = GameSessionResult> = {
  phase: GameSessionPhase;
  result: TResult | null;
  error: string | null;
};

type GameSessionAction<TResult extends GameSessionResult> =
  | { type: 'prepare' }
  | { type: 'ready' }
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'complete'; result: TResult }
  | { type: 'fail'; message: string }
  | { type: 'restart' }
  | { type: 'exit' };

export function reduceGameSession<TResult extends GameSessionResult>(
  state: GameSessionState<TResult>,
  action: GameSessionAction<TResult>,
): GameSessionState<TResult> {
  switch (action.type) {
    case 'prepare':
      return { phase: 'preparing', result: null, error: null };
    case 'ready':
    case 'restart':
      return { phase: 'idle', result: null, error: null };
    case 'start':
      return state.phase === 'idle' ? { ...state, phase: 'running' } : state;
    case 'pause':
      return state.phase === 'running' ? { ...state, phase: 'paused' } : state;
    case 'resume':
      return state.phase === 'paused' ? { ...state, phase: 'running' } : state;
    case 'complete':
      return state.phase === 'running' || state.phase === 'paused'
        ? { phase: 'completed', result: action.result, error: null }
        : state;
    case 'fail':
      return state.phase === 'exiting'
        ? state
        : { phase: 'failed', result: null, error: action.message };
    case 'exit':
      return { ...state, phase: 'exiting' };
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.matches('input, textarea, select, [role="textbox"], [role="combobox"]')
  );
}

export function useGameActionBindings({
  bindings,
  enabled = true,
  onAction,
}: {
  bindings: GameActionBindings;
  enabled?: boolean;
  onAction: (action: GameAction, event: KeyboardEvent) => void;
}) {
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || isEditableTarget(event.target)) return;
      const action = bindings[event.key];
      if (!action) return;
      onActionRef.current(action, event);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bindings, enabled]);
}

const PAUSE_BINDING: GameActionBindings = { Escape: 'pause' };

export function useGameSession<TResult extends GameSessionResult>({
  initialPhase = 'preparing',
  onExit,
}: {
  initialPhase?: GameSessionPhase;
  onExit: () => void;
}) {
  const [state, dispatch] = useReducer(reduceGameSession<TResult>, {
    phase: initialPhase,
    result: null,
    error: null,
  });
  const phaseRef = useRef(state.phase);
  const adaptersRef = useRef(new Set<GameLifecycleAdapter>());
  const exitRef = useRef(onExit);
  const focusBeforePauseRef = useRef<HTMLElement | null>(null);
  const autoPausedRef = useRef(false);

  phaseRef.current = state.phase;
  exitRef.current = onExit;

  const invoke = useCallback((method: keyof GameLifecycleAdapter) => {
    for (const adapter of adaptersRef.current) adapter[method]?.();
  }, []);

  const prepare = useCallback(() => dispatch({ type: 'prepare' }), []);
  const ready = useCallback(() => dispatch({ type: 'ready' }), []);
  const start = useCallback(() => {
    if (phaseRef.current !== 'idle') return;
    void resumeGameAudio();
    dispatch({ type: 'start' });
  }, []);
  const pause = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    focusBeforePauseRef.current = document.activeElement as HTMLElement | null;
    invoke('pause');
    void pauseGameAudio();
    dispatch({ type: 'pause' });
  }, [invoke]);
  const resume = useCallback(() => {
    if (phaseRef.current !== 'paused') return;
    invoke('resume');
    void resumeGameAudio();
    dispatch({ type: 'resume' });
    window.requestAnimationFrame(() => focusBeforePauseRef.current?.focus());
  }, [invoke]);
  const complete = useCallback((result: TResult) => {
    dispatch({ type: 'complete', result });
  }, []);
  const fail = useCallback((error: unknown) => {
    dispatch({ type: 'fail', message: error instanceof Error ? error.message : String(error) });
  }, []);
  const restart = useCallback(() => dispatch({ type: 'restart' }), []);
  const exit = useCallback(() => {
    if (phaseRef.current === 'exiting') return;
    dispatch({ type: 'exit' });
    invoke('cleanup');
    stopGameAudio();
    exitRef.current();
  }, [invoke]);
  const registerLifecycle = useCallback((adapter: GameLifecycleAdapter) => {
    adaptersRef.current.add(adapter);
    return () => adaptersRef.current.delete(adapter);
  }, []);

  useGameActionBindings({
    bindings: PAUSE_BINDING,
    enabled: state.phase === 'running',
    onAction: (action, event) => {
      if (action !== 'pause') return;
      event.preventDefault();
      pause();
    },
  });

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && phaseRef.current === 'running') {
        autoPausedRef.current = true;
        pause();
      } else if (!document.hidden && autoPausedRef.current && phaseRef.current === 'paused') {
        autoPausedRef.current = false;
        resume();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pause, resume]);

  useEffect(
    () => () => {
      invoke('cleanup');
      stopGameAudio();
    },
    [invoke],
  );

  return {
    ...state,
    complete,
    exit,
    fail,
    pause,
    prepare,
    ready,
    registerLifecycle,
    restart,
    resume,
    start,
  };
}

export type GameSessionController<TResult extends GameSessionResult = GameSessionResult> =
  ReturnType<typeof useGameSession<TResult>>;
