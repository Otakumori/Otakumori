import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const WEBHOOK_SECRET = 'printify_whsec_test';

const handleWebhookEventMock = vi.fn();
const inngestSendMock = vi.fn();

const envMock: { PRINTIFY_WEBHOOK_SECRET: string | undefined } = {
  PRINTIFY_WEBHOOK_SECRET: WEBHOOK_SECRET,
};

vi.mock('@/env.mjs', () => ({
  get env() {
    return envMock;
  },
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/app/lib/requestId', () => ({
  newRequestId: () => 'req_test',
}));

vi.mock('@/app/lib/printify/advanced-service', () => ({
  getAdvancedPrintifyService: () => ({
    handleWebhookEvent: handleWebhookEventMock,
  }),
}));

vi.mock('@/inngest/client', () => ({
  inngest: {
    send: inngestSendMock,
  },
}));

function sign(body: string, secret: string) {
  return createHmac('sha256', secret).update(body).digest('hex');
}

async function callWebhook(body: string, headers: Record<string, string> = {}) {
  const { POST } = await import('../route');
  const { NextRequest } = await import('next/server');
  const request = new NextRequest('https://otaku-mori.test/api/webhooks/printify', {
    method: 'POST',
    headers,
    body,
  });
  return POST(request);
}

describe('Printify webhook signature verification (fail closed)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    envMock.PRINTIFY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('returns 503 WEBHOOK_SECRET_NOT_CONFIGURED when the secret is absent', async () => {
    envMock.PRINTIFY_WEBHOOK_SECRET = undefined;
    const body = JSON.stringify({ type: 'order:created', data: { id: 'o1' } });

    const response = await callWebhook(body, {
      'x-printify-signature': sign(body, WEBHOOK_SECRET),
    });
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ ok: false, error: 'WEBHOOK_SECRET_NOT_CONFIGURED' });
    expect(handleWebhookEventMock).not.toHaveBeenCalled();
  });

  it('returns 401 INVALID_SIGNATURE when the signature header is missing', async () => {
    const body = JSON.stringify({ type: 'order:created', data: { id: 'o1' } });

    const response = await callWebhook(body);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ ok: false, error: 'INVALID_SIGNATURE' });
    expect(handleWebhookEventMock).not.toHaveBeenCalled();
  });

  it('returns 401 INVALID_SIGNATURE when the signature is wrong', async () => {
    const body = JSON.stringify({ type: 'order:created', data: { id: 'o1' } });

    const response = await callWebhook(body, {
      'x-printify-signature': sign(body, 'the_wrong_secret'),
    });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ ok: false, error: 'INVALID_SIGNATURE' });
    expect(handleWebhookEventMock).not.toHaveBeenCalled();
  });

  it('returns 200 and processes the event for a valid signature', async () => {
    const body = JSON.stringify({ type: 'order:created', data: { id: 'o1' } });

    const response = await callWebhook(body, {
      'x-printify-signature': sign(body, WEBHOOK_SECRET),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(handleWebhookEventMock).toHaveBeenCalledTimes(1);
  });
});
