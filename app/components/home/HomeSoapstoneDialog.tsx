'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { paths } from '@/lib/paths';

export default function HomeSoapstoneDialog() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-ui focus-ring mt-5 inline-flex items-center rounded-full border border-sakura-300/25 bg-sakura-300/10 px-4 py-2 text-sm font-medium text-sakura-50 transition hover:border-sakura-50/50 hover:bg-sakura-300/18"
      >
        Read a soapstone
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-soapstone-dialog-title"
          aria-describedby="home-soapstone-dialog-body"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <div className="glass-panel card-stroke max-w-md rounded-3xl p-6 text-left text-white shadow-2xl">
            <h3 id="home-soapstone-dialog-title" className="font-display text-2xl font-semibold">
              A message beneath the roots
            </h3>
            <p
              id="home-soapstone-dialog-body"
              className="font-body mt-4 text-sm leading-7 text-white/70"
            >
              Soapstones are little traces left for other travelers. The full wall lives deeper in
              the Mori, where the route owns the message flow.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={paths.soapstones()}
                className="font-ui focus-ring inline-flex rounded-full border border-sakura-300/30 bg-sakura-300/12 px-4 py-2 text-sm font-medium text-sakura-50 transition hover:border-sakura-50/50 hover:bg-sakura-300/18"
              >
                Visit Soapstones
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="font-ui focus-ring inline-flex rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                Leave it be
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
