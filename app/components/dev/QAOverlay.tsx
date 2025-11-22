/**
 * Dev-Only QA Overlay Component
 * Shows validation violations in development mode
 */

'use client';

import { useEffect, useState } from 'react';
import { validateGameRuntime } from '@/app/lib/qa/runtime-validator';
import type * as THREE from 'three';

export interface QAOverlayProps {
  gameSlug: string;
  scene: THREE.Scene | null;
  enabled?: boolean;
}

/**
 * QA Overlay - Only visible in development mode
 */
export function QAOverlay({ gameSlug, scene, enabled = true }: QAOverlayProps) {
  const [violations] = useState<
    Array<{ objectName: string; violationType: string; suggestion: string }>
  >([]);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') {
      return;
    }

    // Run validation
    if (scene) {
      validateGameRuntime(gameSlug, scene, { checkMaterials: true });
    }
  }, [gameSlug, scene, enabled]);

  // Don't render overlay in production
  if (process.env.NODE_ENV !== 'development' || !enabled || violations.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-yellow-900/90 p-4 text-xs text-yellow-100 backdrop-blur">
      <div className="mb-2 font-bold">QA Violations ({gameSlug})</div>
      <div className="space-y-1">
        {violations.map((v, i) => (
          <div key={i}>
            <span className="font-semibold">{v.objectName}:</span> {v.violationType}
            <div className="text-yellow-200">{v.suggestion}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
