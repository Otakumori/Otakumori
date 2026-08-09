import crypto from 'node:crypto';

import { auth } from '@clerk/nextjs/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: null, sessionClaims: null })),
  currentUser: vi.fn(() => null),
}));

function signBody(body: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

async function loadSanityRoute(secret: string | undefined) {
  vi.resetModules();
  vi.doMock('@/env.mjs', () => ({
    env: {
      SANITY_WEBHOOK_SECRET: secret,
    },
  }));
  return import('@/app/api/webhooks/sanity/route');
}

async function loadInngestHealthRoute(eventKey?: string, signingKey?: string) {
  vi.resetModules();
  vi.doMock('@/env.mjs', () => ({
    env: {
      INNGEST_EVENT_KEY: eventKey,
      INNGEST_SIGNING_KEY: signingKey,
    },
  }));
  return import('@/app/api/health/inngest/route');
}

async function loadDiagnosticRoute() {
  vi.resetModules();
  vi.doMock('@/env.mjs', () => ({
    env: {
      NODE_ENV: 'test',
      INNGEST_EVENT_KEY: 'configured',
      INNGEST_SIGNING_KEY: 'configured',
      PRINTIFY_API_KEY: 'configured',
      PRINTIFY_SHOP_ID: 'configured',
      CLERK_SECRET_KEY: 'configured',
      DATABASE_URL: 'configured',
      UPSTASH_REDIS_REST_URL: 'configured',
      UPSTASH_REDIS_REST_TOKEN: 'configured',
      STRIPE_SECRET_KEY: 'configured',
      STRIPE_WEBHOOK_SECRET: 'configured',
    },
  }));
  return import('@/app/api/diagnostic/route');
}

describe('Sanity webhook containment', () => {
  it('accepts a configured webhook with a valid signature', async () => {
    const secret = 'synthetic-sanity-secret';
    const body = JSON.stringify({ _type: 'post', _id: 'drafts.synthetic' });
    const { POST } = await loadSanityRoute(secret);

    const response = await POST(
      new Request('http://localhost/api/webhooks/sanity', {
        method: 'POST',
        body,
        headers: { 'x-sanity-signature': signBody(body, secret) },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
  });

  it('rejects a configured webhook with an invalid signature', async () => {
    const { POST } = await loadSanityRoute('synthetic-sanity-secret');

    const response = await POST(
      new Request('http://localhost/api/webhooks/sanity', {
        method: 'POST',
        body: '{}',
        headers: { 'x-sanity-signature': 'not-a-valid-signature' },
      }),
    );

    expect(response.status).toBe(401);
  });

  it('fails closed when the webhook secret is missing, including an empty-key signature', async () => {
    const body = JSON.stringify({ _type: 'post' });
    const { POST } = await loadSanityRoute(undefined);

    const response = await POST(
      new Request('http://localhost/api/webhooks/sanity', {
        method: 'POST',
        body,
        headers: { 'x-sanity-signature': signBody(body, '') },
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'SANITY_WEBHOOK_UNAVAILABLE',
    });
  });
});

describe('Inngest health and diagnostics containment', () => {
  it('returns coarse Inngest health without config names or network probes', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { GET } = await loadInngestHealthRoute('synthetic-event-key', 'synthetic-signing-key');

    const response = await GET();
    const json = await response.json();
    const serialized = JSON.stringify(json);

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true, service: 'inngest', status: 'configured' });
    expect(serialized).not.toContain('INNGEST_EVENT_KEY');
    expect(serialized).not.toContain('INNGEST_SIGNING_KEY');
    expect(serialized).not.toContain('http://');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fails Inngest health closed without disclosing missing key names', async () => {
    const { GET } = await loadInngestHealthRoute(undefined, undefined);

    const response = await GET();
    const json = await response.json();
    const serialized = JSON.stringify(json);

    expect(response.status).toBe(503);
    expect(json).toEqual({ ok: false, service: 'inngest', status: 'unavailable' });
    expect(serialized).not.toContain('INNGEST_EVENT_KEY');
    expect(serialized).not.toContain('INNGEST_SIGNING_KEY');
  });

  it('requires authentication before returning diagnostic state', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);
    const { GET } = await loadDiagnosticRoute();

    const response = await GET(new Request('http://localhost/api/diagnostic') as never);

    expect(response.status).toBe(401);
  });

  it('returns admin-only coarse diagnostics without secret-presence booleans or provider calls', async () => {
    vi.mocked(auth)
      .mockResolvedValueOnce({ userId: 'admin_123' } as never)
      .mockResolvedValueOnce({
        userId: 'admin_123',
        sessionClaims: { metadata: { role: 'admin' } },
      } as never);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { GET } = await loadDiagnosticRoute();

    const response = await GET(new Request('http://localhost/api/diagnostic') as never);
    const json = await response.json();
    const serialized = JSON.stringify(json);

    expect(response.status).toBe(200);
    expect(json.services).toEqual({
      inngest: 'configured',
      printify: 'configured',
      clerk: 'configured',
      database: 'configured',
      redis: 'configured',
      stripe: 'configured',
    });
    expect(serialized).not.toContain('PRINTIFY_API_KEY');
    expect(serialized).not.toContain('PRINTIFY_SHOP_ID');
    expect(serialized).not.toContain('DATABASE_URL');
    expect(serialized).not.toContain('INNGEST_EVENT_KEY');
    expect(serialized).not.toContain('true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
