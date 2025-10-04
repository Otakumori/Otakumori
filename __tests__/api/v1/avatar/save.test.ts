import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/avatar/save/route.safe.ts';

// Mock environment variables
vi.mock('@/env', () => ({
  env: {
    FEATURE_ADULT_ZONE: 'true',
    FEATURE_AVATAR_NSFW: 'true',
  },
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}));

// Mock Database
vi.mock('@/app/lib/db', () => ({
  db: {
    $transaction: vi.fn().mockImplementation((fn) => fn()),
    avatarConfig: {
      upsert: vi.fn().mockResolvedValue({
        id: 'avatar_config_123',
        userId: 'user_123',
        config: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
  },
}));

// Mock Zod validation
vi.mock('@/app/lib/contracts', () => ({
  avatarSaveRequestSchema: {
    safeParse: vi.fn(),
  },
  avatarSaveResponseSchema: {
    safeParse: vi.fn(),
  },
}));

describe('/api/v1/avatar/save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue(null);

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('AUTH_REQUIRED');
  });

  it('should return 400 for invalid request data', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {},
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        issues: [{ path: ['config'], message: 'Invalid avatar configuration' }],
      },
    });

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: 'invalid_config',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should save avatar configuration successfully for verified adult', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {
        adultVerified: true,
      },
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
          nsfwEnabled: true,
        },
      },
    });

    vi.mocked(contracts.avatarSaveResponseSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        id: 'avatar_config_123',
        success: true,
      },
    });

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
          nsfwEnabled: true,
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data.success).toBe(true);
    expect(data.data.id).toBe('avatar_config_123');
  });

  it('should reject NSFW content for non-verified users', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {}, // No adult verification
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
          nsfwEnabled: true, // NSFW content
        },
      },
    });

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
          nsfwEnabled: true,
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('FORBIDDEN');
    expect(data.error.message).toContain('adult verification');
  });

  it('should allow non-NSFW content for non-verified users', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {}, // No adult verification
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
          nsfwEnabled: false, // Safe content
        },
      },
    });

    vi.mocked(contracts.avatarSaveResponseSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        id: 'avatar_config_123',
        success: true,
      },
    });

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
          nsfwEnabled: false,
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data.success).toBe(true);
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {
        adultVerified: true,
      },
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      },
    });

    // Mock database error
    const db = vi.mocked(require('@/app/lib/db').db);
    vi.mocked(db.$transaction).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should handle malformed JSON request body', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {},
    });

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: 'invalid json{',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should validate avatar configuration schema', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {
        adultVerified: true,
      },
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        issues: [
          { path: ['config', 'hair'], message: 'Invalid hair style' },
          { path: ['config', 'eyes'], message: 'Invalid eye color' },
        ],
      },
    });

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'invalid_hair',
          eyes: 'invalid_eyes',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toContain('Invalid hair style');
    expect(data.error.details).toContain('Invalid eye color');
  });

  it('should handle response validation errors', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {
        adultVerified: true,
      },
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      },
    });

    // Mock response validation failure
    vi.mocked(contracts.avatarSaveResponseSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        issues: [{ path: ['data'], message: 'Invalid response data' }],
      },
    });

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should generate unique request ID for tracking', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {
        adultVerified: true,
      },
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      },
    });

    vi.mocked(contracts.avatarSaveResponseSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        id: 'avatar_config_123',
        success: true,
      },
    });

    const request = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.requestId).toMatch(/^otm_\d+_[a-z0-9]+$/);
  });

  it('should handle concurrent avatar saves for same user', async () => {
    vi.mocked(require('@clerk/nextjs/server').currentUser).mockResolvedValue({
      id: 'user_123',
      publicMetadata: {
        adultVerified: true,
      },
    });

    const contracts = vi.mocked(require('@/app/lib/contracts'));
    vi.mocked(contracts.avatarSaveRequestSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      },
    });

    vi.mocked(contracts.avatarSaveResponseSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        id: 'avatar_config_123',
        success: true,
      },
    });

    // Simulate concurrent requests
    const request1 = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'long',
          eyes: 'blue',
          outfit: 'casual',
        },
      }),
    });

    const request2 = new NextRequest('https://example.com/api/v1/avatar/save', {
      method: 'POST',
      body: JSON.stringify({
        config: {
          hair: 'short',
          eyes: 'green',
          outfit: 'formal',
        },
      }),
    });

    const [response1, response2] = await Promise.all([POST(request1), POST(request2)]);

    const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(data1.ok).toBe(true);
    expect(data2.ok).toBe(true);
    expect(data1.requestId).not.toBe(data2.requestId);
  });
});
