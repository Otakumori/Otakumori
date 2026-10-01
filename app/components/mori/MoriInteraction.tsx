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
