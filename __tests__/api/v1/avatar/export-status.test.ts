import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/avatar/export/status/route';

// Mock dependencies
vi.mock('@/app/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    avatarConfiguration: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../../../../../lib/request-id', () => ({
  generateRequestId: vi.fn(() => 'test_request_id_status_123'),
}));

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

describe('/api/v1/avatar/export/status', () => {
  const mockUserId = 'user_123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=test-job');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.ok).toBe(false);
      expect(data.error).toBe('Authentication required');
      expect(data.requestId).toBe('test_request_id_status_123');
    });
  });

  describe('Request Validation', () => {
    it('should return 400 when neither jobId nor avatarConfigId is provided', async () => {
      const request = new NextRequest('https://example.com/api/v1/avatar/export/status');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('jobId or avatarConfigId');
    });

    it('should accept jobId parameter', async () => {
      const mockConfig = {
        id: 'config_123',
        glbUrl: null,
        glbGeneratedAt: null,
        updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      };

      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(mockConfig as any);

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=test-job');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(db.avatarConfiguration.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { updatedAt: 'desc' },
        select: expect.objectContaining({
          id: true,
          glbUrl: true,
          glbGeneratedAt: true,
          updatedAt: true,
        }),
      });
    });

    it('should accept avatarConfigId parameter', async () => {
      const mockConfig = {
        id: 'config_123',
        glbUrl: null,
        glbGeneratedAt: null,
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
      };

      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(mockConfig as any);

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?avatarConfigId=config_123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
    });
  });

  describe('Status Responses', () => {
    it('should return 404 when no avatar configuration is found', async () => {
      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(null);

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=test-job');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.ok).toBe(false);
      expect(data.error).toBe('Export job not found');
    });

    it('should return completed status when GLB URL exists', async () => {
      const generatedAt = new Date('2024-01-01T12:00:00Z');
      const mockConfig = {
        id: 'config_123',
        glbUrl: 'https://blob.vercel-storage.com/test-avatar.glb',
        glbGeneratedAt: generatedAt,
        updatedAt: new Date(),
      };

      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(mockConfig as any);

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=test-job');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.status).toBe('completed');
      expect(data.data.downloadUrl).toBe('https://blob.vercel-storage.com/test-avatar.glb');
      expect(data.data.generatedAt).toEqual(generatedAt);
      expect(data.data.format).toBe('glb');
    });

    it('should return processing status when updated recently (within 5 minutes)', async () => {
      const mockConfig = {
        id: 'config_123',
        glbUrl: null,
        glbGeneratedAt: null,
        updatedAt: new Date(), // Just now
      };

      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(mockConfig as any);

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=test-job');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.status).toBe('processing');
      expect(data.data.message).toContain('Generation in progress');
      expect(data.data.format).toBe('glb');
    });

    it('should return pending status when updated more than 5 minutes ago', async () => {
      const mockConfig = {
        id: 'config_123',
        glbUrl: null,
        glbGeneratedAt: null,
        updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      };

      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(mockConfig as any);

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=test-job');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.data.status).toBe('pending');
      expect(data.data.message).toContain('Generation is pending');
      expect(data.data.format).toBe('glb');
    });
  });

  describe('Security', () => {
    it('should only return status for authenticated user\'s avatar configuration', async () => {
      const mockConfig = {
        id: 'config_123',
        glbUrl: 'https://blob.vercel-storage.com/test-avatar.glb',
        glbGeneratedAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(mockConfig as any);

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=other-user-job');

      const response = await GET(request);
      const data = await response.json();

      // Should succeed because we filter by userId in the query
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);

      // Verify the query filters by authenticated userId
      expect(db.avatarConfiguration.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId }, // Critical security filter
        orderBy: { updatedAt: 'desc' },
        select: expect.any(Object),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(db.avatarConfiguration.findFirst).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=test-job');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.error).toBe('Database connection failed');
      expect(data.requestId).toBe('test_request_id_status_123');
    });

    it('should handle malformed query parameters', async () => {
      // This should still pass validation since we accept any string for jobId
      const request = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=');

      // Empty jobId should still pass (we check for null, not empty string)
      // But the query will fail because neither jobId nor avatarConfigId has a value
      const response = await GET(request);
      const data = await response.json();

      // Should return 400 because empty string is falsy
      expect(response.status).toBe(400);
      expect(data.ok).toBe(false);
    });
  });
});

