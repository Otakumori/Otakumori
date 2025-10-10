let started = false;

export async function bootCheckInngest() {
  if (started) return;
  started = true;

  const serveUrl = process.env.INNGEST_SERVE_URL || 'http://localhost:8288/api/inngest';
  const missing = ['INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'].filter(
    (k) => !process.env[k],
  );
  if (missing.length) {
    console.warn('[Inngest] Missing env:', missing.join(', '));
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
      console.error(
        `[Inngest] POST ${serveUrl} failed: ${res.status} – check keys/serve URL`,
      );
    } else {
      console.info(`[Inngest] POST ${serveUrl} succeeded: ${res.status}`);
    }
  } catch (e: any) {
    console.error(`[Inngest] POST ${serveUrl} error:`, e?.message || e);
  }
}

