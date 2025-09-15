'use client';

import { useState } from 'react';

interface SoapstoneMessageProps {
  preview: string;
  full: string;
}

export default function SoapstoneMessage({ preview, full }: SoapstoneMessageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-zinc-300 transition hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
      >
        <div className="font-medium">{preview}</div>
        <div className="text-[10px] text-zinc-400 group-hover:text-fuchsia-300/80">
          Click to read
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-[61] w-[min(90vw,480px)] rounded-2xl border border-fuchsia-500/20 bg-zinc-950/90 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-fuchsia-200">Soapstone Message</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            <p className="text-sm leading-relaxed text-zinc-200">{full}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-fuchsia-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
