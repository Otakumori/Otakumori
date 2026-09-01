'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
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

type HomeSceneContextValue = {
  scene: HomeSceneState;
  projection: HomeSceneProjection | null;
  reducedMotion: boolean;
  surfaceRef: (node: HTMLDivElement | null) => void;
};

const HomeSceneContext = createContext<HomeSceneContextValue | null>(null);

export function HomeSceneProvider({ children }: { children: ReactNode }) {
  const [surfaceNode, setSurfaceNode] = useState<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scene, setScene] = useState<HomeSceneState>(() => ({
    ...resolveHomeScene(INITIAL_SCENE_DATE, false),
    timezone: 'local',
  }));
  const [projection, setProjection] = useState<HomeSceneProjection | null>(null);
  const surfaceRef = useCallback((node: HTMLDivElement | null) => setSurfaceNode(node), []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const update = () => setScene(resolveHomeScene(new Date(), reducedMotion));

    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [reducedMotion]);

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
    () => ({ scene, projection, reducedMotion, surfaceRef }),
    [projection, reducedMotion, scene, surfaceRef],
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
