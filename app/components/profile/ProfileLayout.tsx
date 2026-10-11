'use client';

import type { ReactNode } from 'react';

interface ProfileLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export default function ProfileLayout({ left, right }: ProfileLayoutProps) {
  return (
    <div className="commander-profile__composition">
      <section
        aria-label="Identity and account summary"
        className="commander-profile__identity-grid"
      >
        {left}
      </section>
      <div>{right}</div>
    </div>
  );
}
