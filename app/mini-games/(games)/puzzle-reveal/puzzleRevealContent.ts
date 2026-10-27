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
    url: '/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-cover-v1.webp',
    title: 'Puzzle Reveal — Cover',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
  {
    id: 'puzzle-reveal-hub-v1',
    url: '/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-hub-v1.webp',
    title: 'Puzzle Reveal — Hub',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
  {
    id: 'puzzle_reveal_shrine_circuit_oracle_v1',
    url: '/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-shrine-circuit-oracle-v1.webp',
    title: 'Shrine Circuit Oracle',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
  {
    id: 'puzzle_reveal_kintsugi_machine_bodhisattva_v1',
    url: '/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-kintsugi-machine-bodhisattva-v1.webp',
    title: 'Kintsugi Machine Bodhisattva',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
  {
    id: 'puzzle_reveal_foxfire_data_reliquary_v2',
    url: '/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-foxfire-data-reliquary-v2.webp',
    title: 'Foxfire Data Reliquary',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
  {
    id: 'puzzle_reveal_sakura_singularity_v1',
    url: '/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-sakura-singularity-v1.webp',
    title: 'Sakura Singularity',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
  {
    id: 'puzzle_reveal_memory_well_archivist_v1',
    url: '/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-memory-well-archivist-v1.webp',
    title: 'Memory Well Archivist',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
  {
    id: 'puzzle_reveal_celestial_komainu_gate_v1',
    url: '/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-celestial-komainu-gate-v1.webp',
    title: 'Celestial Komainu Gate',
    artist: 'Otaku-mori Studios',
    approvalState: 'owner-approved',
  },
];

export function selectPuzzleRevealContent(previousIndex: number | null, seed: number) {
  const index = nextPuzzleContentIndex(previousIndex, seed, PUZZLE_REVEAL_CONTENT.length);
  return index === null ? null : { index, art: PUZZLE_REVEAL_CONTENT[index]! };
}
