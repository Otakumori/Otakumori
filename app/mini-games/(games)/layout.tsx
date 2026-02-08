import type { ReactNode } from 'react';

interface GamesLayoutProps {
  children: ReactNode;
}

/**
 * Minimal layout for individual mini-game pages.
 * Omits global header, footer, and 3D cube hub for a focused game experience.
 */
export default function GamesLayout({ children }: GamesLayoutProps) {
  return (
    <div className="fixed inset-0 bg-[#080611]">
      <main className="h-full w-full overflow-auto">{children}</main>
    </div>
  );
}

