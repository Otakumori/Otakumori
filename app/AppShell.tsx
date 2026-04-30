'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const FullAppShell = dynamic(() => import('./FullAppShell'));

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/commerce-core')) {
    return children;
  }

  return <FullAppShell>{children}</FullAppShell>;
}
