let started = false;

function isBuildPhase() {
  // Next sets this during `next build`
  return process.env.NEXT_PHASE === 'phase-production-build';
}

function isEdgeRuntime() {
  // Next 14/15: 'edge' | 'nodejs' (undefined in some build contexts)
  return process.env.NEXT_RUNTIME === 'edge';
}

export async function bootCheckInngest() {
  // Only once per boot
  if (started) return;
  started = true;

  // Allow opt-out via env (e.g. INNGEST_PROBE=off)
  if (process.env.INNGEST_PROBE === 'off') return;

  // Never run during `next build` / SSG pre-render
  if (isBuildPhase()) return;

  // Skip on edge runtime (network constraints, no need to probe here)
  if (isEdgeRuntime()) return;

  const serveUrl = process.env.INNGEST_SERVE_URL || 'http://localhost:8288/api/inngest';
  const missing = ['INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn('[Inngest] Missing env:', missing.join(', '));
  }

  // If we're in production but serveUrl points to localhost, skip
  if (process.env.NODE_ENV === 'production' && serveUrl.startsWith('http://localhost')) {
    return;
  }

  try {
    const res = await fetch(serveUrl, { method: 'GET' });
    if (!res.ok) {
      console.error(
        `[Inngest] GET ${serveUrl} failed: ${res.status} – check middleware/public routes`,
      );
    } else {
      console.info(`[Inngest] GET ${serveUrl} succeeded: ${res.status}`);
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
    } else {
      console.info(`[Inngest] POST ${serveUrl} succeeded: ${res.status}`);
    }
  } catch (e: any) {
    console.error(`[Inngest] POST ${serveUrl} error:`, e?.message || e);
  }
}
