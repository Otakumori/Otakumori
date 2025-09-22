import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 Game — Otaku-mori',
  description: 'A special mini-game for when you get lost in the digital abyss.',
};

export default function Game404Layout({ children }: { children: React.ReactNode }) {
  return children;
}
