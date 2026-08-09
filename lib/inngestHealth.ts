import { env } from '@/env/server';

let started = false;

function isBuildPhase() {
  // Next sets this during `next build`
  return env.NEXT_PHASE === 'phase-production-build';
}

function isEdgeRuntime() {
  // Next 14/15: 'edge' | 'nodejs' (undefined in some build contexts)
  return env.NEXT_RUNTIME === 'edge';
}

export async function bootCheckInngest() {
  // Only once per boot
  if (started) return;
  started = true;

  // Allow opt-out via env (e.g. INNGEST_PROBE=off)
  if (env.INNGEST_PROBE === 'off') return;

  // Never run during `next build` / SSG pre-render
  if (isBuildPhase()) return;

  // Skip on edge runtime (network constraints, no need to probe here)
  if (isEdgeRuntime()) return;

  const serveUrl = env.INNGEST_SERVE_URL || 'http://localhost:8288/api/inngest';
  const hasEventKey = !!env.INNGEST_EVENT_KEY;
  const hasSigningKey = !!env.INNGEST_SIGNING_KEY;

  if (!hasEventKey || !hasSigningKey) {
    console.warn('[Inngest] Required server configuration is unavailable.');
    return;
  }

  // If we're in production but serveUrl points to localhost, skip
  if (env.NODE_ENV === 'production' && serveUrl.startsWith('http://localhost')) {
    return;
  }

  try {
    const res = await fetch(serveUrl, { method: 'GET' });
    if (!res.ok) {
      console.error(`[Inngest] Serve endpoint health check failed: ${res.status}`);
    }
  } catch (e: any) {
    console.error('[Inngest] Serve endpoint health check errored:', e?.message || e);
  }
}
