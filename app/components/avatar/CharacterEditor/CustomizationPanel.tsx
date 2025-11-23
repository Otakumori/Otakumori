'use client';

import { useState } from 'react';
import type { CustomizationPanelProps } from './types';

export function CustomizationPanel({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
}: CustomizationPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <section className="mb-4 rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-lg">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="mb-3 flex w-full items-center justify-between text-left"
          aria-expanded={!isCollapsed ? 'true' : 'false'}
        >
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-xl text-white/60" aria-hidden="true">
            {isCollapsed ? '▼' : '▲'}
          </span>
        </button>
      ) : (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      {!isCollapsed && <div className="space-y-3">{children}</div>}
    </section>
  );
}

