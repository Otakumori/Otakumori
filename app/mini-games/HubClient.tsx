'use client';

import gamesRegistry from '@/lib/games.meta.json';
import { MiniGameArcSelector, type MiniGameArcOption } from './_components/MiniGameArcSelector';

function getEnabledGames(): MiniGameArcOption[] {
  return gamesRegistry.games
    .filter((game) => game.enabled)
    .sort((first, second) => first.order - second.order)
    .map((game) => ({
      category: game.category,
      description: game.description,
      id: game.id,
      slug: game.slug,
      title: game.title,
    }));
}

/**
 * The hub is a destination selector only. It deliberately leaves each game
 * runtime, its mechanics, and its presentation authority untouched.
 */
export default function HubClient() {
  return (
    <main className="om-route-page om-route-page--games mori-game-shell px-5 pb-20 pt-28 sm:px-8">
      <MiniGameArcSelector games={getEnabledGames()} />
    </main>
  );
}
