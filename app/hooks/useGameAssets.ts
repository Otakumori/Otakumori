/**
 * Game Assets Hook
 * Provides easy access to procedurally generated game assets
 */

'use client';

import { useState, useEffect } from 'react';

export type GameId =
  | 'samurai-petal-slice'
  | 'anime-memory-match'
  | 'bubble-pop-gacha'
  | 'rhythm-beat-em-up'
  | 'petal-storm-rhythm'
  | 'puzzle-reveal'
  | 'dungeon-of-desire'
  | 'maid-cafe-manager'
  | 'thigh-coliseum'
  | 'quick-math';

export type AssetType = string; // Dynamic based on game

interface GameAsset {
  url: string;
  loaded: boolean;
  error: boolean;
}

interface UseGameAssetsResult {
  assets: Record<string, GameAsset>;
  isLoading: boolean;
  hasErrors: boolean;
  getAssetUrl: (assetName: string) => string | null;
  preloadAsset: (assetName: string) => Promise<void>;

const ASSET_CACHE: Record<string, GameAsset> = {};

/**
 * Hook to access game-specific assets
 */
export function useGameAssets(gameId: GameId): UseGameAssetsResult {
  const [assets, setAssets] = useState<Record<string, GameAsset>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasErrors, setHasErrors] = useState(false);

  const basePath = `/assets/games/${gameId}`;

  useEffect(() => {
    // Auto-discover assets for the game
    const assetNames = getAssetNamesForGame(gameId);

    const assetPromises = assetNames.map((assetName) => {
      const cacheKey = `${gameId}-${assetName}`;

      // Check cache first
      if (ASSET_CACHE[cacheKey]) {
        return Promise.resolve({
          name: assetName,
          asset: ASSET_CACHE[cacheKey],
        });
      }

      // Preload image
      return preloadImage(`${basePath}/${assetName}.png`)
        .then((url) => {
          const asset: GameAsset = { url, loaded: true, error: false };
          ASSET_CACHE[cacheKey] = asset;
          return { name: assetName, asset };
        })
        .catch(() => {
          const asset: GameAsset = { url: '', loaded: true, error: true };
          ASSET_CACHE[cacheKey] = asset;
          return { name: assetName, asset };
        });
    });

    Promise.all(assetPromises)
      .then((results) => {
        const loadedAssets: Record<string, GameAsset> = {};
        let errorCount = 0;

        results.forEach(({ name, asset }) => {
          loadedAssets[name] = asset;
          if (asset.error) errorCount++;
        });

        setAssets(loadedAssets);
        setHasErrors(errorCount > 0);
        setIsLoading(false);
      })
      .catch(() => {
        setHasErrors(true);
        setIsLoading(false);
      });
  }, [gameId, basePath]);

  const getAssetUrl = (assetName: string): string | null => {
    return assets[assetName]?.url || null;
  };

  const preloadAsset = async (assetName: string): Promise<void> => {
    const url = `${basePath}/${assetName}.png`;
    await preloadImage(url);
  };

  return {
    assets,
    isLoading,
    hasErrors,
    getAssetUrl,
    preloadAsset,
  };
}

/**
 * Preload an image
 */
function preloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Get asset names for a specific game
 */
function getAssetNamesForGame(gameId: GameId): string[] {
  const assetMap: Record<GameId, string[]> = {
    'samurai-petal-slice': ['katana', 'petal', 'slash-effect', 'background', 'score-panel'],
    'anime-memory-match': [
      'card-back',
      'card-front-1',
      'card-front-2',
      'card-front-3',
      'background',
    ],
    'bubble-pop-gacha': ['bubble-1', 'bubble-2', 'bubble-3', 'pop-effect', 'background'],
    'rhythm-beat-em-up': ['note-1', 'note-2', 'note-3', 'combo-indicator', 'background'],
    'petal-storm-rhythm': ['petal-target', 'rhythm-line', 'perfect-effect', 'background'],
    'puzzle-reveal': ['puzzle-piece', 'reveal-effect', 'fog', 'background'],
    'dungeon-of-desire': ['door', 'treasure', 'enemy', 'player', 'background'],
    'maid-cafe-manager': ['maid-1', 'maid-2', 'customer', 'table', 'background'],
    'thigh-coliseum': ['fighter-1', 'fighter-2', 'arena', 'versus-panel', 'background'],
    'quick-math': ['number-panel', 'operator', 'timer', 'background'],
  };

  return assetMap[gameId] || [];
}

/**
 * Hook for character-specific assets (for games with character customization)
 */
export function useCharacterAsset(gameId: GameId, characterId: string) {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = `/assets/games/${gameId}/characters/${characterId}.png`;

    preloadImage(url)
      .then((loadedUrl) => {
        setAssetUrl(loadedUrl);
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback to default character
        const fallbackUrl = `/assets/games/${gameId}/characters/default.png`;
        preloadImage(fallbackUrl)
          .then((loadedUrl) => {
            setAssetUrl(loadedUrl);
            setIsLoading(false);
          })
          .catch(() => {
            setAssetUrl(null);
            setIsLoading(false);
          });
      });
  }, [gameId, characterId]);

  return { assetUrl, isLoading };
}
