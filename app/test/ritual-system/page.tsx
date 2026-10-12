import type { Metadata } from 'next';

import { RitualSystemFixture } from './RitualSystemFixture';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Ritual System Visual QA',
};

export default function RitualSystemVisualQaPage() {
  return <RitualSystemFixture />;
}
