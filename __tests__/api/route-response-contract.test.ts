import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireLocalViewer: vi.fn(),
  prisma: {
    user: {
      update: vi.fn(),
    },
    userTitle: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  db: {
    inventoryItem: {
      findFirst: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
  generateRequestId: vi.fn(),
}));

vi.mock('@/app/lib/auth/viewer', () => {
  class AuthenticationRequiredError extends Error {}
  class LocalUserUnavailableError extends Error {}

  return {
    AuthenticationRequiredError,
    LocalUserUnavailableError,
    requireLocalViewer: mocks.requireLocalViewer,
    isMissingSchemaError: vi.fn(() => false),
    schemaUnavailableResponse: vi.fn((requestId: string) => ({
      ok: false,
      error: {
        code: 'SCHEMA_UNAVAILABLE',
        message: 'This account feature is temporarily unavailable while account data is prepared.',
      },
      requestId,
    })),
  };
});

vi.mock('@/app/lib/prisma', () => ({
  prisma: mocks.prisma,
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mocks.db),
}));

vi.mock('@/app/lib/petals', () => ({
  PetalService: vi.fn(() => ({
    getUserPetalInfo: vi.fn(),
  })),
}));

vi.mock('@/lib/requestId', () => ({
  generateRequestId: mocks.generateRequestId,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

async function expectBoundedSchemaUnavailableResponse(response: unknown, requestId: string) {
  expect(response).toBeInstanceOf(Response);
  const actualResponse = response as Response;
  expect(actualResponse.status).toBe(503);

  const body = await actualResponse.json();
  expect(body).toEqual({
    ok: false,
    error: {
      code: 'SCHEMA_UNAVAILABLE',
      message: 'This account feature is temporarily unavailable while account data is prepared.',
    },
    requestId,
  });
  expect(JSON.stringify(body)).not.toMatch(/Prisma|provisioning|missing table/i);
}

describe('authenticated route response contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generateRequestId.mockReturnValue('route-request-id');
  });

  it.each([
    {
      label: 'petal spend',
      requestId: 'petals_user_unavailable',
      invoke: async () => {
        const { POST } = await import('@/app/api/v1/petals/spend/route');
        return POST(new Request('https://staging.otaku-mori.com/api/v1/petals/spend', { method: 'POST' }));
      },
    },
    {
      label: 'profile banner equip',
      requestId: 'profile_user_unavailable',
      invoke: async () => {
        const { POST } = await import('@/app/api/profile/equip-banner/route');
        return POST(new Request('https://staging.otaku-mori.com/api/profile/equip-banner', { method: 'POST' }));
      },
    },
    {
      label: 'profile gamertag',
      requestId: 'profile_user_unavailable',
      invoke: async () => {
        const { POST } = await import('@/app/api/profile/gamertag/route');
        return POST(new Request('https://staging.otaku-mori.com/api/profile/gamertag', { method: 'POST' }));
      },
    },
    {
      label: 'user titles',
      requestId: 'titles_user_unavailable',
      invoke: async () => {
        const { GET } = await import('@/app/api/user/titles/route');
        return GET();
      },
    },
    {
      label: 'petal balance',
      requestId: 'route-request-id',
      invoke: async () => {
        const { GET } = await import('@/app/api/v1/petals/balance/route');
        return GET(new Request('https://staging.otaku-mori.com/api/v1/petals/balance') as never);
      },
    },
  ])('$label returns a real bounded 503 response when local user data is unavailable', async ({ invoke, requestId }) => {
    const { LocalUserUnavailableError } = await import('@/app/lib/auth/viewer');
    mocks.requireLocalViewer.mockRejectedValue(
      new LocalUserUnavailableError('Prisma relation UserProfile is unavailable'),
    );

    const response = await invoke();

    await expectBoundedSchemaUnavailableResponse(response, requestId);
  });

  it('display-name returns a bounded 401 response when signed out', async () => {
    const { AuthenticationRequiredError } = await import('@/app/lib/auth/viewer');
    mocks.requireLocalViewer.mockRejectedValue(new AuthenticationRequiredError());

    const { PATCH } = await import('@/app/api/v1/account/display-name/route');
    const response = await PATCH(
      new Request('https://staging.otaku-mori.com/api/v1/account/display-name', {
        method: 'PATCH',
        body: JSON.stringify({ displayName: 'Mori Owner' }),
      }),
    );

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ ok: false, error: 'Unauthorized' });
  });

  it('display-name returns a bounded 503 response when local user data is unavailable', async () => {
    const { LocalUserUnavailableError } = await import('@/app/lib/auth/viewer');
    mocks.requireLocalViewer.mockRejectedValue(new LocalUserUnavailableError('Prisma table User is missing'));

    const { PATCH } = await import('@/app/api/v1/account/display-name/route');
    const response = await PATCH(
      new Request('https://staging.otaku-mori.com/api/v1/account/display-name', {
        method: 'PATCH',
        body: JSON.stringify({ displayName: 'Mori Owner' }),
      }),
    );

    await expectBoundedSchemaUnavailableResponse(response, 'route-request-id');
  });

  it('display-name updates the local user record for authenticated viewers', async () => {
    mocks.requireLocalViewer.mockResolvedValue({
      clerkUserId: 'clerk_user_123',
      localUserId: 'local_user_123',
      email: 'owner@example.invalid',
    });
    mocks.prisma.user.update.mockResolvedValue({ id: 'local_user_123', displayName: 'Mori Owner' });

    const { PATCH } = await import('@/app/api/v1/account/display-name/route');
    const response = await PATCH(
      new Request('https://staging.otaku-mori.com/api/v1/account/display-name', {
        method: 'PATCH',
        body: JSON.stringify({ displayName: 'Mori Owner' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, data: { updated: true } });
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'local_user_123' },
      data: { displayName: 'Mori Owner' },
    });
    expect(mocks.prisma.user.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'clerk_user_123' } }),
    );
  });
});
