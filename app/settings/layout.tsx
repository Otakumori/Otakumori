import type { ReactNode } from 'react';
import LegacySiteRouteLayout from '../LegacySiteRouteLayout';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <LegacySiteRouteLayout>{children}</LegacySiteRouteLayout>;
}
