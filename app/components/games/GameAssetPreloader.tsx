'use client';

import { useEffect, useState, useCallback } from 'react';
import { gameAssetCache } from '@/app/lib/game-asset-cache';

export interface AssetManifest {
  sprites?: string[];
  audio?: string[];
  images?: string[];
}

interface GameAssetPreloaderProps {
  gameId: string;
  assets: AssetManifest;
  onComplete: () => void;
  onProgress?: (progress: number) => void;
}

interface LoadedAsset {
  url: string;
  type: 'sprite' | 'audio' | 'image';
  loaded: boolean;
  error: boolean;
}

/**
 * Preloads game assets (sprites, audio, images) in a Web Worker or off main thread
 * Displays progress indicator during loading
 */
export default function GameAssetPreloader({
  gameId,
  assets,
  onComplete,
  onProgress,
}: GameAssetPreloaderProps) {
  const [loadedAssets, setLoadedAssets] = useState<Map<string, LoadedAsset>>(new Map());
  const [totalAssets, setTotalAssets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total assets
  useEffect(() => {
    const total =
      (assets.sprites?.length ?? 0) +
      (assets.audio?.length ?? 0) +
      (assets.images?.length ?? 0);
    setTotalAssets(total);
  }, [assets]);

  // Load sprite/image assets
  const loadImageAsset = useCallback((url: string): Promise<LoadedAsset> => {
    // Check cache first
    if (gameAssetCache.has(url)) {
      const cached = gameAssetCache.get(url);
      return Promise.resolve({
        url,
        type: cached?.type === 'image' ? 'image' : 'sprite',
        loaded: true,
        error: cached?.error ?? false,
      });
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Cache the loaded image
        gameAssetCache.set(url, {
          url,
          type: 'sprite',
          element: img,
          loaded: true,
          error: false,
        });
        resolve({ url, type: 'sprite', loaded: true, error: false });
      };
      
      img.onerror = () => {
        gameAssetCache.set(url, {
          url,
          type: 'sprite',
          element: img,
          loaded: true,
          error: true,
        });
        resolve({ url, type: 'sprite', loaded: true, error: true });
      };
      
      img.src = url;
    });
  }, []);

  // Load audio assets
  const loadAudioAsset = useCallback((url: string): Promise<LoadedAsset> => {
    // Check cache first
    if (gameAssetCache.has(url)) {
      const cached = gameAssetCache.get(url);
      return Promise.resolve({
        url,
        type: 'audio',
        loaded: true,
        error: cached?.error ?? false,
      });
    }

    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Use canplaythrough for better loading detection
      const handleCanPlayThrough = () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('error', handleError);
        // Cache the loaded audio
        gameAssetCache.set(url, {
          url,
          type: 'audio',
          element: audio,
          loaded: true,
          error: false,
        });
        resolve({ url, type: 'audio', loaded: true, error: false });
      };
      
      const handleError = () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('error', handleError);
        gameAssetCache.set(url, {
          url,
          type: 'audio',
          element: audio,
          loaded: true,
          error: true,
        });
        resolve({ url, type: 'audio', loaded: true, error: true });
      };
      
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('error', handleError);
      audio.src = url;
      
      // Force load attempt
      audio.load();
    });
  }, []);

  // Preload all assets
  useEffect(() => {
    if (totalAssets === 0) {
      setIsLoading(false);
      onComplete();
      return;
    }

    const loadAllAssets = async () => {
      const assetPromises: Promise<LoadedAsset>[] = [];
      const assetMap = new Map<string, LoadedAsset>();

      // Load sprites
      if (assets.sprites) {
        assets.sprites.forEach((url) => {
          const promise = loadImageAsset(url).then((asset) => {
            assetMap.set(url, asset);
            setLoadedAssets(new Map(assetMap));
            return asset;
          });
          assetPromises.push(promise);
        });
      }

      // Load images
      if (assets.images) {
        assets.images.forEach((url) => {
          const promise = loadImageAsset(url).then((asset) => {
            assetMap.set(url, asset);
            setLoadedAssets(new Map(assetMap));
            return asset;
          });
          assetPromises.push(promise);
        });
      }

      // Load audio (use requestIdleCallback or setTimeout to avoid blocking)
      if (assets.audio) {
        assets.audio.forEach((url) => {
          const promise = loadAudioAsset(url).then((asset) => {
            assetMap.set(url, asset);
            setLoadedAssets(new Map(assetMap));
            return asset;
          });
          assetPromises.push(promise);
        });
      }

      // Wait for all assets to load
      await Promise.all(assetPromises);

      setIsLoading(false);
      onComplete();
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        loadAllAssets();
      });
    } else {
      // Fallback: small delay to avoid blocking main thread
      setTimeout(() => {
        loadAllAssets();
      }, 0);
    }
  }, [assets, totalAssets, loadImageAsset, loadAudioAsset, onComplete]);

  // Update progress
  useEffect(() => {
    if (totalAssets > 0 && onProgress) {
      const loadedCount = loadedAssets.size;
      const progress = Math.min((loadedCount / totalAssets) * 100, 100);
      onProgress(progress);
    }
  }, [loadedAssets, totalAssets, onProgress]);

  const progress = totalAssets > 0 ? (loadedAssets.size / totalAssets) * 100 : 0;
  const loadedCount = loadedAssets.size;
  const errorCount = Array.from(loadedAssets.values()).filter((a) => a.error).length;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-md px-6 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Loading {gameId}</h2>
          <p className="text-sm text-zinc-400">
            Preparing assets for smooth gameplay...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 text-xs text-zinc-300">
            <span>
              {loadedCount} / {totalAssets} assets
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error indicator */}
        {errorCount > 0 && (
          <div className="mt-4 text-xs text-yellow-400 text-center">
            {errorCount} asset(s) failed to load (using fallbacks)
          </div>
        )}

        {/* Loading indicator */}
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

