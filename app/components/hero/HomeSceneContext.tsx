'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  resolveHomeScene,
  resolveHomeSceneProjection,
  type HomeSceneProjection,
  type HomeSceneState,
} from './homeScene';

const INITIAL_SCENE_DATE = new Date(2026, 0, 1, 12);

export type HomeWorldStatus = 'resolving' | 'loading' | 'ready' | 'fallback';

type HomeSceneContextValue = {
  scene: HomeSceneState;
  sceneResolved: boolean;
  worldStatus: HomeWorldStatus;
  setWorldStatus: (status: HomeWorldStatus) => void;
  projection: HomeSceneProjection | null;
  reducedMotion: boolean;
  surfaceRef: (node: HTMLDivElement | null) => void;
};

const HomeSceneContext = createContext<HomeSceneContextValue | null>(null);

export function HomeSceneProvider({ children }: { children: ReactNode }) {
  const [surfaceNode, setSurfaceNode] = useState<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sceneResolved, setSceneResolved] = useState(false);
  const [worldStatus, setWorldStatus] = useState<HomeWorldStatus>('resolving');
  const [scene, setScene] = useState<HomeSceneState>(() => ({
    ...resolveHomeScene(INITIAL_SCENE_DATE, false),
    timezone: 'local',
  }));
  const [projection, setProjection] = useState<HomeSceneProjection | null>(null);
  const surfaceRef = useCallback((node: HTMLDivElement | null) => setSurfaceNode(node), []);

  const sceneTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncScene = () => {
      const nextReducedMotion = query.matches;
      setReducedMotion(nextReducedMotion);
      setScene(resolveHomeScene(new Date(), nextReducedMotion));
      setSceneResolved(true);
    };
    const scheduleNextMinute = () => {
      if (sceneTimerRef.current !== null) window.clearTimeout(sceneTimerRef.current);
      const now = new Date();
      const elapsedInMinute = now.getSeconds() * 1_000 + now.getMilliseconds();
      sceneTimerRef.current = window.setTimeout(() => {
        syncScene();
        scheduleNextMinute();
      }, 60_025 - elapsedInMinute);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncScene();
        scheduleNextMinute();
      }
    };

    syncScene();
    scheduleNextMinute();
    query.addEventListener('change', syncScene);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', syncScene);

    return () => {
      query.removeEventListener('change', syncScene);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', syncScene);
      if (sceneTimerRef.current !== null) window.clearTimeout(sceneTimerRef.current);
      sceneTimerRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!surfaceNode) return;

    const update = () => {
      const bounds = surfaceNode.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight ?? bounds.height;
      if (bounds.width <= 0 || viewportHeight <= 0) return;

      setProjection(
        resolveHomeSceneProjection({
          width: bounds.width,
          height: viewportHeight,
        }),
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(surfaceNode);
    window.visualViewport?.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, [surfaceNode]);

  const value = useMemo(
    () => ({
      scene,
      sceneResolved,
      worldStatus,
      setWorldStatus,
      projection,
      reducedMotion,
      surfaceRef,
    }),
    [projection, reducedMotion, scene, sceneResolved, surfaceRef, worldStatus],
  );

  return <HomeSceneContext.Provider value={value}>{children}</HomeSceneContext.Provider>;
}

export function useHomeSceneContext() {
  const value = useContext(HomeSceneContext);

  if (!value) {
    throw new Error('useHomeSceneContext must be used within HomeSceneProvider');
  }

  return value;
}
