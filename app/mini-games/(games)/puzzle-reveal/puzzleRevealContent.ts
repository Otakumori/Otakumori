import { nextPuzzleContentIndex } from '../../_shared/secondaryGameContracts';

export type PuzzleRevealArt = {
  id: string;
  url: string;
  title: string;
  artist: string;
  approvalState: 'owner-approved';
};

export const PUZZLE_REVEAL_CONTENT: readonly PuzzleRevealArt[] = [
  {
    id: 'puzzle-reveal-cover-v1',
    url: '/assets/games/covers/game-puzzle-reveal-cover.webp',
    title: 'Puzzle Reveal — Cover',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
  {
    id: 'puzzle-reveal-hub-v1',
    url: '/assets/games/hub/game-puzzle-reveal-hub.webp',
    title: 'Puzzle Reveal — Hub',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
];

export function selectPuzzleRevealContent(previousIndex: number | null, seed: number) {
  const index = nextPuzzleContentIndex(previousIndex, seed, PUZZLE_REVEAL_CONTENT.length);
  return index === null ? null : { index, art: PUZZLE_REVEAL_CONTENT[index]! };
}
