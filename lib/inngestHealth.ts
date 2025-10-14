import { env } from '@/env';

let started = false;

function isBuildPhase() {
  // Next sets this during `next build`
  // eslint-disable-next-line no-restricted-syntax -- Next.js internal build variable
  return process.env.NEXT_PHASE === 'phase-production-build';
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
  // eslint-disable-next-line no-restricted-syntax -- Server-only health check variable
  if (process.env.INNGEST_PROBE === 'off') return;

  // Never run during `next build` / SSG pre-render
  if (isBuildPhase()) return;

  // Skip on edge runtime (network constraints, no need to probe here)
  if (isEdgeRuntime()) return;

  // eslint-disable-next-line no-restricted-syntax -- Server-only health check variable
  const serveUrl = process.env.INNGEST_SERVE_URL || 'http://localhost:8288/api/inngest';
  // eslint-disable-next-line no-restricted-syntax -- Server-only health check variable
  const hasEventKey = !!process.env.INNGEST_EVENT_KEY;
  // eslint-disable-next-line no-restricted-syntax -- Server-only health check variable
  const hasSigningKey = !!process.env.INNGEST_SIGNING_KEY;

  if (!hasEventKey || !hasSigningKey) {
    const missing = [];
    if (!hasEventKey) missing.push('INNGEST_EVENT_KEY');
    if (!hasSigningKey) missing.push('INNGEST_SIGNING_KEY');
    // eslint-disable-next-line no-console
    console.warn('[Inngest] Missing env:', missing.join(', '));
  }

  // If we're in production but serveUrl points to localhost, skip
  if (env.NODE_ENV === 'production' && serveUrl.startsWith('http://localhost')) {
    return;
  }

  try {
    const res = await fetch(serveUrl, { method: 'GET' });
    if (!res.ok) {
      console.error(
        `[Inngest] GET ${serveUrl} failed: ${res.status} – check middleware/public routes`,
      );
    }
  } catch (e: any) {
    console.error(`[Inngest] GET ${serveUrl} error:`, e?.message || e);
  }

  try {
    const res = await fetch(serveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'healthcheck/inngest',
        data: { boot: true, at: new Date().toISOString() },
      }),
    });
    if (!res.ok) {
      console.error(`[Inngest] POST ${serveUrl} failed: ${res.status} – check keys/serve URL`);
    }
  } catch (e: any) {
    console.error(`[Inngest] POST ${serveUrl} error:`, e?.message || e);
  }
}
