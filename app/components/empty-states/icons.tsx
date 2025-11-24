'use client';

import React from 'react';

export function EmptyCartIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-28 w-28 text-pink-400"
      aria-hidden="true"
      focusable="false"
    >
      <g className="empty-icon-stroke">
        <polyline points="20 30 32 30 40 75 88 75 98 45 36 45" />
        <circle cx="48" cy="84" r="5.5" />
        <circle cx="80" cy="84" r="5.5" />
      </g>
    </svg>
  );
}

export function EmptyWishlistIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-28 w-28 text-pink-300"
      aria-hidden="true"
      focusable="false"
    >
      <g className="empty-icon-stroke">
        {/* Plump heart – softer, wider, curvier */}
        <path
          d="
            M60 90
            C60 90, 34 68, 34 46
            C34 36, 42 28, 52 28
            C57 28, 60 30.5, 62 33
            C64 30.5, 67 28, 72 28
            C82 28, 90 36, 90 46
            C90 68, 60 90, 60 90
            Z
          "
        />
      </g>
    </svg>
  );
}

export function EmptySearchIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-28 w-28 text-slate-200"
      aria-hidden="true"
      focusable="false"
    >
      <g className="empty-icon-stroke">
        <circle cx="52" cy="52" r="20" />
        <line x1="66" y1="66" x2="86" y2="86" />
      </g>
    </svg>
  );
}

export function EmptyOrdersIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-28 w-28 text-rose-200"
      aria-hidden="true"
      focusable="false"
    >
      <g className="empty-icon-stroke">
        <rect x="36" y="24" width="48" height="72" rx="6" ry="6" />
        <line x1="44" y1="38" x2="76" y2="38" />
        <line x1="44" y1="50" x2="72" y2="50" />
        <line x1="44" y1="62" x2="68" y2="62" />
        <line x1="44" y1="74" x2="60" y2="74" />
      </g>
    </svg>
  );
}

export function Empty404Icon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-32 w-32 text-pink-400"
      aria-hidden="true"
      focusable="false"
    >
      <g className="empty-icon-stroke">
        {/* Broken path / lost way icon */}
        <path d="M30 30 L50 50 M50 50 L70 30 M70 30 L90 50" />
        <circle cx="30" cy="90" r="8" />
        <circle cx="60" cy="90" r="8" />
        <circle cx="90" cy="90" r="8" />
      </g>
    </svg>
  );
}

