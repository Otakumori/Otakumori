import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/avatar/export/health/route';

// Mock dependencies
vi.mock('@/app/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    $queryRaw: vi.fn(),
    avatarConfiguration: {
      count: vi.fn(),
    },
  },
}));

vi.mock('../../../../../lib/request-id', () => ({
  generateRequestId: vi.fn(() => 'test_health_request_id_123'),
}));

import { logger } from '@/app/lib/logger';
import { db } from '@/lib/db';

describe('/api/v1/avatar/export/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to healthy state
    vi.mocked(db.$queryRaw).mockResolvedValue([{ '?column?': 1 }] as any);
    vi.mocked(db.avatarConfiguration.count)
      .mockResolvedValueOnce(10) // recentExports count
      .mockResolvedValueOnce(10); // recentAttempts count
  });

  it('should return healthy status when all checks pass', async () => {
    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.checks.database.status).toBe('ok');
    expect(data.checks.blobStorage.status).toBe('ok');
    expect(data.checks.recentExports.status).toBe('ok');
    expect(data.requestId).toBe('test_health_request_id_123');
    expect(data.duration).toBeGreaterThanOrEqual(0);
  });

  it('should check database connectivity', async () => {
    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    await GET(request);

    expect(db.$queryRaw).toHaveBeenCalledWith(expect.any(String));
  });

  it('should return unhealthy status when database check fails', async () => {
    vi.mocked(db.$queryRaw).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.checks.database.status).toBe('error');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should check recent export success rate', async () => {
    vi.mocked(db.avatarConfiguration.count)
      .mockResolvedValueOnce(8) // 8 successful exports
      .mockResolvedValueOnce(10); // 10 total attempts (80% success rate)

    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.checks.recentExports.successRate).toBe(80);
    expect(data.checks.recentExports.status).toBe('ok');
  });

  it('should return degraded status when success rate is below 80%', async () => {
    vi.mocked(db.avatarConfiguration.count)
      .mockResolvedValueOnce(7) // 7 successful exports
      .mockResolvedValueOnce(10); // 10 total attempts (70% success rate - below 80%)

    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200); // Still 200 for degraded
    expect(data.status).toBe('degraded');
    expect(data.checks.recentExports.successRate).toBe(70);
    expect(data.checks.recentExports.status).toBe('error');
  });

  it('should handle no recent exports gracefully', async () => {
    vi.mocked(db.avatarConfiguration.count)
      .mockResolvedValueOnce(0) // No recent exports
      .mockResolvedValueOnce(0); // No recent attempts

    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.checks.recentExports.status).toBe('ok');
    expect(data.checks.recentExports.successRate).toBe(100); // Default to 100% when no attempts
  });

  it('should include version in response', async () => {
    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    expect(data.version).toBeDefined();
  });

  it('should include database latency in response', async () => {
    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    expect(data.checks.database.latency).toBeGreaterThanOrEqual(0);
  });

  it('should handle blob storage import check', async () => {
    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    // Blob storage check should pass (import should succeed)
    expect(data.checks.blobStorage.status).toBe('ok');
  });

  it('should handle errors gracefully and return unhealthy status', async () => {
    vi.mocked(db.$queryRaw).mockRejectedValue(new Error('Unexpected error'));

    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should not require authentication', async () => {
    // Health endpoints are typically public
    const request = new NextRequest('https://example.com/api/v1/avatar/export/health');

    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});

