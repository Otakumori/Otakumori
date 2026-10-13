import type { Metadata } from 'next';

import '@/app/styles/game-threshold-space.css';
import { GamePlatformFixture } from './GamePlatformFixture';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Shared Game Platform QA',
};

export default function GamePlatformQaPage() {
  return <GamePlatformFixture />;
}
