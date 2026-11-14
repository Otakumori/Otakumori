// @vitest-environment node

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireLocalViewer: vi.fn(),
  create: vi.fn(),
  loggerError: vi.fn(),
}));

vi.mock('@/app/lib/auth/viewer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/auth/viewer')>();
  return { ...actual, requireLocalViewer: mocks.requireLocalViewer };
});
vi.mock('@/app/lib/db', () => ({ db: { gameSession: { create: mocks.create } } }));
vi.mock('@/app/lib/logger', () => ({ logger: { error: mocks.loggerError } }));

import { POST } from '@/app/api/v1/analytics/session/route';

function sessionRequest(id = 'session-1') {
  return new NextRequest('https://www.otaku-mori.com/api/v1/analytics/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id,
      gameId: 'petal-samurai',
      startTime: Date.now() - 1_000,
      endTime: Date.now(),
      score: 100,
      highScore: 100,
      actions: [],
      metadata: {},
      synced: false,
    }),
  });
}

describe('game session persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireLocalViewer.mockResolvedValue({ localUserId: 'local_a' });
  });

  it('accepts the initial write and rejects a replay with a stable 409', async () => {
    mocks.create
      .mockResolvedValueOnce({ id: 'session-1' })
      .mockRejectedValueOnce({ code: 'P2002', meta: { target: ['id'] } });

    const initial = await POST(sessionRequest());
    const replay = await POST(sessionRequest());

    expect(initial.status).toBe(200);
    await expect(initial.json()).resolves.toMatchObject({
      ok: true,
      data: { sessionId: 'session-1' },
    });
    expect(replay.status).toBe(409);
    await expect(replay.json()).resolves.toEqual({
      ok: false,
      error: 'DUPLICATE_SESSION',
      message: 'This game session has already been recorded.',
    });
    expect(mocks.create).toHaveBeenCalledTimes(2);
  });

  it('rejects a cross-account session-id collision without exposing owner data', async () => {
    mocks.requireLocalViewer
      .mockResolvedValueOnce({ localUserId: 'local_a' })
      .mockResolvedValueOnce({ localUserId: 'local_b' });
    mocks.create
      .mockResolvedValueOnce({ id: 'shared-session' })
      .mockRejectedValueOnce({ code: 'P2002', meta: { target: ['id'] } });

    expect((await POST(sessionRequest('shared-session'))).status).toBe(200);
    const collision = await POST(sessionRequest('shared-session'));
    const body = await collision.json();

    expect(collision.status).toBe(409);
    expect(body).toEqual({
      ok: false,
      error: 'DUPLICATE_SESSION',
      message: 'This game session has already been recorded.',
    });
    expect(JSON.stringify(body)).not.toContain('local_a');
    expect(mocks.create.mock.calls[1]?.[0]).toMatchObject({
      data: { id: 'shared-session', userId: 'local_b' },
    });
  });

  it('does not mislabel an unrelated database failure as a duplicate', async () => {
    mocks.create.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await POST(sessionRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Failed to store session',
    });
    expect(mocks.loggerError).toHaveBeenCalledTimes(1);
  });
});
