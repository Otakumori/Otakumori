import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
  userUpdate: vi.fn(),
  checkIdempotency: vi.fn(),
  storeIdempotencyResponse: vi.fn(),
  rateLimitMiddleware: vi.fn(),
  requestSequence: 0,
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: mocks.auth,
  currentUser: mocks.currentUser,
}));
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      update: mocks.userUpdate,
    },
  },
}));
vi.mock('@/app/lib/idempotency', () => ({
  checkIdempotency: mocks.checkIdempotency,
  storeIdempotencyResponse: mocks.storeIdempotencyResponse,
}));
vi.mock('@/app/lib/rate-limit', () => ({
  RATE_LIMITS: {
    AVATAR_SAVE: {
      windowMs: 10_000,
      maxRequests: 5,
    },
  },
  createRateLimitMiddleware: vi.fn(() => mocks.rateLimitMiddleware),
}));
vi.mock('@/app/lib/request-id', () => ({
  generateRequestId: vi.fn(() => `request_${++mocks.requestSequence}`),
}));

import { POST } from '@/app/api/v1/avatar/save/route.safe';

const validAvatar = {
  gender: 'female',
  age: 'young-adult',
  body: {
    height: 1,
    weight: 1,
    muscleMass: 0.5,
    bodyFat: 0.5,
    proportions: {
      headSize: 1,
      neckLength: 1,
      shoulderWidth: 1,
      chestSize: 1,
      waistSize: 1,
      hipWidth: 1,
      armLength: 1,
      legLength: 1,
    },
  },
  face: {
    faceShape: { overall: 0.5, jawline: 0.5, cheekbones: 0.5, chinShape: 0.5 },
    eyes: {
      size: 1,
      spacing: 1,
      height: 1,
      angle: 0,
      eyelidShape: 0.5,
      eyeColor: '#112233',
      eyebrowThickness: 1,
      eyebrowAngle: 0,
    },
    nose: {
      size: 1,
      width: 1,
      height: 1,
      bridgeWidth: 1,
      nostrilSize: 1,
      noseTip: 0.5,
    },
    mouth: {
      size: 1,
      width: 1,
      lipThickness: 1,
      lipShape: 0.5,
      cupidBow: 0.5,
      mouthAngle: 0,
    },
    skin: {
      tone: '#E0B090',
      texture: 0.5,
      blemishes: 0,
      freckles: 0,
      ageSpots: 0,
      wrinkles: 0,
    },
  },
  hair: {
    style: 'long',
    length: 0.8,
    volume: 1,
    texture: 0.5,
    color: { primary: '#221133' },
    highlights: {
      enabled: false,
      color: '#FFFFFF',
      intensity: 0,
      pattern: 'streaks',
    },
    accessories: [],
  },
  outfit: {
    primary: {
      type: 'casual',
      color: '#334455',
      accessories: [],
    },
    fit: {
      tightness: 0.5,
      length: 0.5,
      style: 'moderate',
    },
  },
  physics: {
    softBody: {
      enable: false,
      mass: 1,
      stiffness: 0.5,
      damping: 0.5,
      maxDisplacement: 0.05,
      collision: { pelvis: true, chest: true, spine: true, thighs: true },
    },
    clothSim: {
      enable: false,
      bendStiffness: 0.5,
      stretchStiffness: 0.5,
      damping: 0.5,
      wind: 0,
      colliders: [],
    },
  },
  materials: {
    shader: 'AnimeToon',
    parameters: {
      glossStrength: 0.5,
      rimStrength: 0.5,
      colorA: '#112233',
      colorB: '#445566',
      rimColor: '#FFFFFF',
      metallic: 0,
      roughness: 0.5,
    },
  },
  interactions: {
    poses: [],
    emotes: [],
    cameraModes: [],
    fx: [],
  },
} as const;

function saveRequest(
  body: unknown = validAvatar,
  idempotencyKey: string | null = 'avatar-save-key',
) {
  const headers = idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : undefined;
  return new NextRequest('https://example.com/api/v1/avatar/save', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('/api/v1/avatar/save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestSequence = 0;
    mocks.auth.mockResolvedValue({ userId: 'user_123' });
    mocks.currentUser.mockResolvedValue({
      id: 'user_123',
      publicMetadata: { adultVerified: true },
    });
    mocks.checkIdempotency.mockResolvedValue({
      isNew: true,
      requestId: 'idempotency_request',
    });
    mocks.rateLimitMiddleware.mockResolvedValue(null);
    mocks.userUpdate
      .mockResolvedValueOnce({
        id: 'db_user_123',
        username: 'testuser',
        avatarConfig: validAvatar,
        avatarRendering: '3d',
      })
      .mockResolvedValueOnce({});
  });

  it('returns 401 when the user is not authenticated', async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const response = await POST(saveRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
    expect(response.headers.get('x-otm-reason')).toBe('AUTH_REQUIRED');
  });

  it('requires an idempotency key', async () => {
    const response = await POST(saveRequest(validAvatar, null));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Idempotency key required');
  });

  it('returns a cached idempotent response without writing', async () => {
    const cached = { ok: true, data: { cached: true }, requestId: 'cached_request' };
    mocks.checkIdempotency.mockResolvedValue({
      isNew: false,
      response: cached,
      requestId: 'idempotency_request',
    });

    const response = await POST(saveRequest());

    expect(await response.json()).toEqual(cached);
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it('returns the rate-limit response when the user exceeds the limit', async () => {
    mocks.rateLimitMiddleware.mockResolvedValue(new Response(
      JSON.stringify({ ok: false, error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    ));

    const response = await POST(saveRequest());

    expect(response.status).toBe(429);
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid avatar data', async () => {
    const response = await POST(saveRequest({ gender: 'invalid' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toEqual(expect.any(Array));
  });

  it('saves a non-NSFW avatar configuration', async () => {
    const response = await POST(saveRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mocks.userUpdate).toHaveBeenCalledTimes(2);
    expect(mocks.storeIdempotencyResponse).toHaveBeenCalledWith(
      'avatar-save-key',
      expect.objectContaining({ ok: true }),
    );
  });

  it('rejects NSFW content for a user without adult verification', async () => {
    mocks.currentUser.mockResolvedValue({
      id: 'user_123',
      publicMetadata: {},
    });

    const response = await POST(saveRequest({
      ...validAvatar,
      nsfw: {
        enabled: true,
        features: {
          anatomyDetail: 0.5,
          arousalIndicators: false,
          interactionLevel: 'basic',
        },
      },
    }));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.code).toBe('ADULT_VERIFICATION_REQUIRED');
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it('allows NSFW content for an adult-verified user', async () => {
    const response = await POST(saveRequest({
      ...validAvatar,
      nsfw: {
        enabled: true,
        features: {
          anatomyDetail: 0.5,
          arousalIndicators: false,
          interactionLevel: 'basic',
        },
      },
    }));

    expect(response.status).toBe(200);
    expect(mocks.currentUser).toHaveBeenCalledOnce();
  });

  it('handles database errors without exposing details', async () => {
    mocks.userUpdate.mockReset();
    mocks.userUpdate.mockRejectedValue(new Error('Database connection failed'));

    const response = await POST(saveRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('handles malformed JSON request bodies', async () => {
    const response = await POST(saveRequest('invalid json{'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('generates distinct request IDs for concurrent saves', async () => {
    mocks.userUpdate.mockReset();
    mocks.userUpdate.mockImplementation(async ({ select }: any) => (
      select
        ? {
            id: 'db_user_123',
            username: 'testuser',
            avatarConfig: validAvatar,
            avatarRendering: '3d',
          }
        : {}
    ));

    const [first, second] = await Promise.all([
      POST(saveRequest(validAvatar, 'key-1')),
      POST(saveRequest(validAvatar, 'key-2')),
    ]);
    const [firstData, secondData] = await Promise.all([first.json(), second.json()]);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(firstData.requestId).not.toBe(secondData.requestId);
  });
});
