import type { ReactNode } from 'react';

interface GamesLayoutProps {
  children: ReactNode;
}

/**
 * Focused shell for individual mini-game pages. Games keep their own art direction,
 * while the surrounding fallback/background stays within the Mori visual system.
 */
export default function GamesLayout({ children }: GamesLayoutProps) {
  return (
    <div className="fixed inset-0 bg-[#050405] text-[#fff1e4]">
      <main className="h-full w-full overflow-auto overscroll-contain">{children}</main>
    </div>
  );
}
