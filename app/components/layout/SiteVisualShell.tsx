'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { paths } from '@/lib/paths';

export default function SiteVisualShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === paths.home();

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <div
      id="main-content"
      className="om-site-interior-shell font-body"
      data-visual-surface="mori-interior"
      data-testid="mori-site-interior-shell"
    >
      <div className="om-site-interior-shell__veil" aria-hidden="true" />
      <div className="om-site-interior-shell__content">{children}</div>
    </div>
  );
}
