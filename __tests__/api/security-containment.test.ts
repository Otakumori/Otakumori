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
  it('imports Printify sync functions without eager full server env validation or provider calls', async () => {
    vi.resetModules();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    vi.doMock('@/env/server', () => {
      throw new Error('unexpected full server env validation during Printify sync import');
    });
    vi.doMock('@/env.mjs', () => ({
      env: {
        PRINTIFY_SHOP_ID: 'synthetic-shop',
      },
    }));
    vi.doMock('@/app/lib/db', () => ({
      db: {},
    }));
    vi.doMock('@/lib/db', () => ({
      db: {},
    }));
    vi.doMock('@/app/lib/logger', () => ({
      logger: {
        error: vi.fn(),
      },
    }));

    const syncModule = await import('@/lib/catalog/printifySync');

    expect(syncModule.syncPrintifyProducts).toBeTypeOf('function');
    expect(syncModule.syncSinglePrintifyProduct).toBeTypeOf('function');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('imports the Inngest serve route without route-level provider calls', async () => {
    vi.resetModules();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const sendSpy = vi.fn();

    vi.doMock('@/env.mjs', () => ({
      env: {
        INNGEST_SIGNING_KEY: 'synthetic-signing-key',
      },
    }));
    vi.doMock('@/inngest/client', () => ({
      inngest: {
        send: sendSpy,
        createFunction: vi.fn((config, trigger, handler) => ({ config, trigger, handler })),
      },
    }));
    vi.doMock('../../../inngest/client', () => ({
      inngest: {
        send: sendSpy,
        createFunction: vi.fn((config, trigger, handler) => ({ config, trigger, handler })),
      },
    }));
    vi.doMock('../../../inngest/functions', () => ({
      syncUserToSupabase: { id: 'sync-user-to-supabase' },
      updatePrintifyProducts: { id: 'update-printify-products' },
      processOrder: { id: 'process-order' },
      sendOrderConfirmation: { id: 'send-order-confirmation' },
      sendOrderConfirmationEmail: { id: 'send-order-confirmation-email' },
      syncInventory: { id: 'sync-inventory' },
      processPaymentWebhook: { id: 'process-payment-webhook' },
      dailyInventorySync: { id: 'daily-inventory-sync' },
      weeklyProductUpdate: { id: 'weekly-product-update' },
      retryFailedOperation: { id: 'retry-failed-operation' },
      cleanupOldData: { id: 'cleanup-old-data' },
      cleanupOldGLBFiles: { id: 'cleanup-old-glb-files' },
      fulfillOrder: { id: 'fulfill-order' },
    }));
    vi.doMock('../../../inngest/glb-generation', () => ({
      generateGLBBackground: { id: 'generate-glb-background' },
    }));
    vi.doMock('inngest/next', () => ({
      serve: vi.fn(() => ({
        GET: vi.fn(),
        POST: vi.fn(),
        PUT: vi.fn(),
      })),
    }));

    const route = await import('@/app/api/inngest/route');

    expect(route.GET).toBeTypeOf('function');
    expect(route.POST).toBeTypeOf('function');
    expect(route.PUT).toBeTypeOf('function');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(sendSpy).not.toHaveBeenCalled();
  });

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
