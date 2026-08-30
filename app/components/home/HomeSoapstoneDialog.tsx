'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { paths } from '@/lib/paths';

export default function HomeSoapstoneDialog() {
  const [open, setOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements.at(-1);

      if (!firstFocusable || !lastFocusable) return;

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setOpen(true)}
        className="font-ui focus-ring mt-5 inline-flex items-center rounded-full border border-sakura-300/25 bg-sakura-300/10 px-4 py-2 text-sm font-medium text-sakura-50 transition hover:border-sakura-50/50 hover:bg-sakura-300/18"
      >
        Read a soapstone
      </button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-soapstone-dialog-title"
          aria-describedby="home-soapstone-dialog-body"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-4"
        >
          <div className="relative aspect-[579/768] w-[min(92vw,27rem)] text-center text-[#fff1e4]">
            <img
              src="/assets/ui/mori/feature/mori-soapstone-monument.webp"
              alt=""
              aria-hidden="true"
              width={579}
              height={768}
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
            />

            <div className="absolute inset-x-[14%] bottom-[19%] top-[17%] flex flex-col items-center justify-center">
              <p className="font-ui text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#d9aaa0] sm:text-xs">
                A traveler left a sign
              </p>
              <h3
                id="home-soapstone-dialog-title"
                className="font-display mt-3 max-w-[15rem] text-balance text-lg font-semibold leading-tight text-[#fff1e4] sm:text-xl"
              >
                A message beneath the roots
              </h3>
              <p
                id="home-soapstone-dialog-body"
                className="font-body mt-4 max-w-[17rem] text-xs leading-5 text-[#e0cfca] sm:text-sm sm:leading-6"
              >
                Soapstones are little traces left for other travelers. The full wall lives deeper in
                the Mori, where the route owns the message flow.
              </p>
              <div className="mt-5 flex w-full max-w-[14rem] flex-col gap-2">
                <Link
                  href={paths.soapstones()}
                  className="font-ui focus-ring inline-flex min-h-10 items-center justify-center border border-[#c89682]/55 bg-[#3a2526]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#fff1e4] shadow-[inset_0_0_0_1px_rgba(255,241,228,0.07)] transition hover:border-[#e4b7a7] hover:bg-[#4b2c30]"
                >
                  Visit Soapstones
                </Link>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-ui focus-ring inline-flex min-h-10 items-center justify-center border border-[#a9855f]/45 bg-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#e8d8d2] transition hover:border-[#d0aa8e] hover:bg-black/40"
                >
                  Leave it be
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
