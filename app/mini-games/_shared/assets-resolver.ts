import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import manifest from '@/public/assets/manifest.json';
import roles from '@/assets-roles.json';

function normalize(p?: string | null): string | null {
  if (!p) return null;
  if (!p.startsWith('/assets/')) {
    logger.warn('[assets] Non-standard path detected (forcing /assets prefix):', undefined, { value: p });
  }
  return p.startsWith('/assets/') ? p : `/assets/${p.replace(/^\/+/, '')}`;
}

function resolveFromManifest(path: string): string | null {
  // Resolve dot-path like "bg.oakWoods" to manifest.bg.oakWoods
  const parts = path.split('.');
  let current: any = manifest;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  return normalize(typeof current === 'string' ? current : null);
}

export function getAsset(gameKey: string, assetKey: string): string | null {
  const gameRoles: any = (roles as any)[gameKey];
  if (!gameRoles) return null;

  const mapping = gameRoles[assetKey];
  if (mapping == null) return null;

  // If mapping looks like a manifest path (contains a dot and resolves), return resolved URL
  if (typeof mapping === 'string') {
    if (mapping.includes('.')) {
      const resolved = resolveFromManifest(mapping);
      if (resolved) return resolved;
    }
    // Otherwise treat as literal (color hex, rgba, text, enum, external/local URL, etc.)
    return mapping;
  }

  // Non-string mappings are not supported for now
  return null;
}
