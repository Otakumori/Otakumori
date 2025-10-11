'use client';
import { type ReactNode, useState } from 'react';

export function Tooltip({
  children,
  content,
  align = 'center',
}: {
  children: ReactNode;
  content: ReactNode;
  align?: 'left' | 'center' | 'right';
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <span
        className="inline-flex"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        role="button"
        tabIndex={0}
        aria-describedby={open ? 'tooltip-content' : undefined}
      >
        {children}
      </span>
      {open && (
        <span
          id="tooltip-content"
          role="tooltip"
          className={`pointer-events-none absolute z-30 mt-2 w-80 rounded-lg border border-white/10 bg-black/90 p-3 text-xs text-zinc-300 shadow-2xl
                          ${align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
