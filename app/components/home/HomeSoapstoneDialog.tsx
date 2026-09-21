'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { paths } from '@/lib/paths';
import styles from './HomeSoapstoneDialog.module.css';

const SOAPSTONE_PLAQUE_SOURCE = '/assets/home/ui/runtime/soapstone-plaque-embedded.webp';
const DORMANT_RUNES = 'ᚱ ᚢ ᚾ · ᛋ ᛏ ᛟ ᚾ ᛖ';

export default function HomeSoapstoneDialog() {
  const [open, setOpen] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setDecoded(reducedMotion);
    closeButtonRef.current?.focus();
    const decodeTimer = reducedMotion ? undefined : window.setTimeout(() => setDecoded(true), 460);

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
      if (decodeTimer) window.clearTimeout(decodeTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);

  const closeDialog = () => {
    setOpen(false);
    setDecoded(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${styles.soapstoneTrigger} focus-ring mt-5 inline-flex min-h-11 items-center text-left`}
        data-home-soapstone-control="approved-plaque"
        aria-haspopup="dialog"
      >
        <img
          src={SOAPSTONE_PLAQUE_SOURCE}
          alt=""
          width={1024}
          height={1024}
          loading="lazy"
          decoding="async"
          className={styles.triggerPlaque}
        />
        <span className={styles.triggerContent}>
          <span className={styles.runeMark} aria-hidden="true">
            ᚱ
          </span>
          <span>
            <span className={styles.triggerEyebrow} aria-hidden="true">
              {DORMANT_RUNES}
            </span>
            <span className={styles.triggerLabel}>Read a soapstone</span>
          </span>
        </span>
      </button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-soapstone-dialog-title"
          aria-describedby="home-soapstone-dialog-body"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#070407]/62 px-4 py-4"
        >
          <div
            className={styles.soapstonePanel}
            data-soapstone-decode-state={decoded ? 'decoded' : 'decoding'}
          >
            <img
              src={SOAPSTONE_PLAQUE_SOURCE}
              alt=""
              aria-hidden="true"
              width={1024}
              height={1024}
              decoding="async"
              className={styles.panelPlaque}
            />
            <div className={styles.panelContent}>
              <p className={styles.dormantRunes} aria-hidden="true">
                {DORMANT_RUNES}
              </p>
              <div className={styles.decodedCopy}>
                <p className="font-ui text-[0.62rem] font-semibold uppercase tracking-[0.23em] text-[#eac2a6]/74 sm:text-xs">
                  A traveler left a sign
                </p>
                <h3
                  id="home-soapstone-dialog-title"
                  className="font-display mt-3 text-balance text-lg font-semibold leading-tight text-[#fff1e4] sm:text-xl"
                >
                  A message beneath the roots
                </h3>
                <p
                  id="home-soapstone-dialog-body"
                  className="font-body mt-4 text-xs leading-5 text-[#ead8ce] sm:text-sm sm:leading-6"
                >
                  Soapstones are little traces left for other travelers. The full wall lives deeper
                  in the Mori, where the route owns the message flow.
                </p>
              </div>
              <div className="mt-5 flex w-full max-w-[14rem] flex-col gap-2">
                <Link
                  href={paths.soapstones()}
                  className="font-ui focus-ring inline-flex min-h-10 items-center justify-center border border-[#c89682]/55 bg-[#3a2526]/88 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#fff1e4] shadow-[inset_0_0_0_1px_rgba(255,241,228,0.07)] transition hover:border-[#e4b7a7] hover:bg-[#4b2c30]"
                >
                  Visit Soapstones
                </Link>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeDialog}
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
