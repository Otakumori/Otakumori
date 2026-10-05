import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/** A decorative line-and-mark divider; it never adds noise to the accessibility tree. */
export function MoriLineTrace({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} aria-hidden="true" className={cn('om-line-trace', className)}>
      <span className="om-line-trace__mark" />
    </div>
  );
}

/** A small ceremonial mark for rare route-state or completion moments. */
export function MoriSealMark({ className, label }: { className?: string; label?: string }) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cn('om-seal-mark', className)}
      role={label ? 'img' : undefined}
    >
      <span className="om-seal-mark__dot" />
    </span>
  );
}

/** Provisional archive stamp: broken register ring and a bound record, never a heart. */
export function MoriArchiveSeal() {
  return (
    <svg aria-hidden="true" className="om-archive-seal" width="62" height="62" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M25 7a12 12 0 1 0 3 7M7 8a10 10 0 0 1 12-2" />
      <path d="M11 10h9v13h-9zM13 10v13M16 14h2M16 18h2M9 26l-1 2" />
      <path className="om-archive-seal__notch" d="m23 4 1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
    </svg>
  );
}
