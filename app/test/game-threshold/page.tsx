import type { Metadata } from 'next';

import '@/app/styles/game-threshold-space.css';
import { GameThresholdFixture } from './GameThresholdFixture';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Game Threshold Visual QA',
};

export default function GameThresholdVisualQaPage() {
  return <GameThresholdFixture />;
}
