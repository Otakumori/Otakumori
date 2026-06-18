'use client';

import { useState } from 'react';

export default function HomeSoapstoneDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-ui focus-ring mt-5 inline-flex items-center rounded-full border border-sakura-300/25 bg-sakura-300/10 px-4 py-2 text-sm font-medium text-sakura-50 transition hover:border-sakura-50/50 hover:bg-sakura-300/18"
      >
        Open soapstone note
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-soapstone-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        >
          <div className="glass-panel card-stroke max-w-md rounded-3xl p-6 text-left text-white shadow-2xl">
            <h3 id="home-soapstone-dialog-title" className="font-display text-2xl font-semibold">
              Soapstone signs
            </h3>
            <p className="font-body mt-4 text-sm leading-7 text-white/70">
              Live soapstone posting remains on its owned route. This homepage note keeps the
              public invitation visible without performing provider or database writes.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-ui focus-ring mt-6 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Close soapstone note
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
