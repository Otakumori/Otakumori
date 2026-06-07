import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const grantPetalsMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}));

vi.mock('@/app/lib/petals/grant', () => ({
  grantPetals: grantPetalsMock,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

async function callPetals(body: unknown) {
  const { POST } = await import('../route');
  const { NextRequest } = await import('next/server');
  const request = new NextRequest('https://otaku-mori.test/api/petals', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(request);
}

describe('/api/petals authority (client amount is ignored)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: 'user_1' });
    grantPetalsMock.mockResolvedValue({
      success: true,
      granted: 1,
      newBalance: 11,
      lifetimeEarned: 42,
    });
  });

  it('ignores a huge client-supplied amount and grants the server reward', async () => {
    const response = await callPetals({ amount: 999999, reason: 'cherry_blossom_click' });
    const json = await response.json();

    expect(response.status).toBe(200);
    // The route must derive the amount server-side (1), never trust the body.
    expect(grantPetalsMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_1', amount: 1, source: 'background_petal_click' }),
    );
    expect(json.data.earned).toBe(1);
  });

  it('rejects unauthenticated requests', async () => {
    authMock.mockResolvedValue({ userId: null });
    const response = await callPetals({ amount: 5, reason: 'cherry_blossom_click' });
    expect(response.status).toBe(401);
    expect(grantPetalsMock).not.toHaveBeenCalled();
  });
});
