import type { ReactNode } from 'react';
import { optimusPrinceps } from '@/lib/fonts';

export default async function MiniGamesLayout({ children }: { children: ReactNode }) {
  return <section className={optimusPrinceps.variable}>{children}</section>;
}
