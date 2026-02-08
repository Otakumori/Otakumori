'use client';
import { useEffect, useState, useCallback } from 'react';
import type { AssetManifest } from './GameAssetPreloader';
import GameAssetPreloader from './GameAssetPreloader';

interface BootScreenProps {
  gameId: string;
  children: React.ReactNode;
  assets?: AssetManifest;
}

export default function BootScreen({ gameId, children, assets }: BootScreenProps) {
  const key = `boot:${gameId}`;
  const [ready, setReady] = useState(false);
  const [showBoot, setShowBoot] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const seen = sessionStorage.getItem(key) === '1';
    setShowBoot(!seen);
    setReady(true);
  }, [key]);

  const handleAssetComplete = useCallback(() => {
    setAssetsLoaded(true);
  }, []);

  const handleAssetProgress = useCallback((progress: number) => {
    setLoadingProgress(progress);
  }, []);

  const start = () => {
    sessionStorage.setItem(key, '1');
    setShowBoot(false);
  };

  if (!ready) return null;

  const canStart = !assets || assetsLoaded;

  return (
    <>
      {children}
      {showBoot && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/85 backdrop-blur-sm">
          {/* Asset Preloader */}
          {assets && !assetsLoaded && (
            <GameAssetPreloader
              gameId={gameId}
              assets={assets}
              onComplete={handleAssetComplete}
              onProgress={handleAssetProgress}
            />
          )}

          {/* Boot Menu */}
          <div className="select-none rounded-2xl border border-fuchsia-500/30 bg-zinc-950/80 p-6 text-center shadow-2xl">
            <div className="mb-4 text-xs uppercase tracking-[0.25em] text-fuchsia-300/80">
              Otaku-mori System
            </div>
            <div className="mb-6 text-2xl font-bold text-fuchsia-200">Boot Menu</div>

            {/* Loading indicator if assets are loading */}
            {assets && !assetsLoaded && (
              <div className="mb-4">
                <div className="mb-2 text-sm text-zinc-400">
                  Loading assets... {Math.round(loadingProgress)}%
                </div>
                <div className="h-1 w-48 mx-auto bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={start}
              disabled={!canStart}
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow transition-colors ${
                canStart
                  ? 'bg-fuchsia-500 hover:bg-fuchsia-400 cursor-pointer'
                  : 'bg-zinc-700 cursor-not-allowed opacity-50'
              }`}
            >
              {canStart ? 'Press Start' : 'Loading...'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
