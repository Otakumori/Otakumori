import type { ReactNode } from 'react';
import LegacySiteRouteLayout from '../LegacySiteRouteLayout';

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return <LegacySiteRouteLayout>{children}</LegacySiteRouteLayout>;
}
