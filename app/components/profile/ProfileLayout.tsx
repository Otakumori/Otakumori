'use client';

import type { ReactNode } from 'react';

interface ProfileLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

/**
 * Steam-style two-column profile layout
 * Left: ~35-40% width (avatar + quick stats)
 * Right: ~60-65% width (main content tabs)
 */
export default function ProfileLayout({ left, right }: ProfileLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
      {/* Left Column */}
      <div className="space-y-6">{left}</div>

      {/* Right Column */}
      <div className="space-y-6">{right}</div>
    </div>
  );
}
