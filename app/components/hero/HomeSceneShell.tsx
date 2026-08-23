'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { PetalCollectionProvider } from '@/app/contexts/PetalCollectionContext';
import PetalSystem from '@/app/components/petals/PetalSystem';
import HeroOverlay from './HeroOverlay';
import HeroScene from './HeroScene';
import RootFooter from './RootFooter';
import { HomeSceneProvider, useHomeSceneContext } from './HomeSceneContext';
import layoutStyles from './HeroLayout.module.css';

type SceneShellStyle = CSSProperties & {
  '--mori-scene-world-left'?: string;
  '--mori-scene-world-top'?: string;
  '--mori-scene-world-width'?: string;
  '--mori-scene-world-height'?: string;
  '--mori-scene-scale'?: string;
  '--mori-root-content-top'?: string;
};

function HomeSceneShellInner({ children }: { children: ReactNode }) {
  const { projection, scene, surfaceRef } = useHomeSceneContext();
  const style = useMemo<SceneShellStyle | undefined>(() => {
    if (!projection) return undefined;

    return {
      '--mori-scene-world-left': `${projection.left}px`,
      '--mori-scene-world-top': `${projection.top}px`,
      '--mori-scene-world-width': `${projection.width}px`,
      '--mori-scene-world-height': `${projection.height}px`,
      '--mori-scene-scale': String(projection.scale),
      '--mori-root-content-top': `${projection.footerContentTop}px`,
    };
  }, [projection]);

  return (
    <section
      id="main-content"
      className={`${layoutStyles.heroRoot} relative isolate w-full overflow-x-clip bg-[#080611]`}
      aria-labelledby="home-hero-title"
      data-home-scene-shell
      data-scene-bucket={scene.bucket}
      data-scene-surface-family={projection?.family ?? 'pending'}
      data-scene-projection-contract="combined-world-master"
      data-testid="mori-home-scene-shell"
      data-scene-master-width={projection?.artboard.width ?? 'pending'}
      data-scene-master-height={projection?.artboard.height ?? 'pending'}
      style={style}
    >
      <PetalCollectionProvider>
        <div ref={surfaceRef} className={layoutStyles.heroSurface} data-testid="mori-scene-surface">
          <HeroScene />
          <PetalSystem />
          <HeroOverlay />
          {children}
          <RootFooter />
        </div>
      </PetalCollectionProvider>
    </section>
  );
}

export default function HomeSceneShell({ children }: { children: ReactNode }) {
  return (
    <HomeSceneProvider>
      <HomeSceneShellInner>{children}</HomeSceneShellInner>
    </HomeSceneProvider>
  );
}
