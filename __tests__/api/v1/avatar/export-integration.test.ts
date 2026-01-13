import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/avatar/export/route.safe';
import { GET as GET_STATUS } from '@/app/api/v1/avatar/export/status/route';

// Mock all dependencies
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
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/3d/comprehensive-glb-generator', () => ({
  generateComprehensiveGLB: vi.fn(),
}));

vi.mock('@/app/lib/blob/client', () => ({
  putBlobFile: vi.fn(),
}));

vi.mock('@/inngest/client', () => ({
  inngest: {
    send: vi.fn(),
  },
}));

vi.mock('@/app/lib/rateLimit', () => ({
  withRateLimit: vi.fn((request, config, handler) => handler()),
  rateLimitConfigs: {
    glbExport: {
      windowMs: 60 * 60 * 1000,
      maxRequests: 5,
    },
  },
}));

vi.mock('@/app/lib/monitoring', () => ({
  trackError: vi.fn(),
  trackEvent: vi.fn(),
  EVENT_CATEGORIES: {
    USER: 'user',
    PERFORMANCE: 'performance',
    ERROR: 'error',
  },
}));

vi.mock('../../../../lib/request-id', () => ({
  generateRequestId: vi.fn(() => `test_request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
}));

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { putBlobFile } from '@/app/lib/blob/client';
import { inngest } from '@/inngest/client';
import { generateComprehensiveGLB } from '@/app/lib/3d/comprehensive-glb-generator';

describe('Avatar Export Integration Flow', () => {
  const mockUserId = 'user_123';
  const mockAvatarConfigId = 'avatar_config_123';
  const mockUser = {
    id: 'user_db_123',
    username: 'testuser',
  };

  const mockAvatarConfigRecord = {
    id: mockAvatarConfigId,
    userId: 'user_db_123',
    configurationData: {
      baseModel: 'female',
      contentRating: 'sfw',
      showNsfwContent: false,
    },
    exportFormat: 'glb',
    createdAt: new Date(),
    updatedAt: new Date(),
    AvatarConfigurationPart: [],
    AvatarMorphTarget: [],
    AvatarMaterialOverride: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(mockAvatarConfigRecord as any);
  });

  describe('Synchronous Export Flow', () => {
    it('should complete full synchronous export flow: request → generate → upload → return URL', async () => {
      const mockGLBData = {
        buffer: Buffer.from('mock glb file data'),
        size: 2048,
      };
      const mockBlobUrl = 'https://blob.vercel-storage.com/test-avatar.glb';

      vi.mocked(generateComprehensiveGLB).mockResolvedValue(mockGLBData as any);
      vi.mocked(putBlobFile).mockResolvedValue(mockBlobUrl);

      // Step 1: Request export
      const exportRequest = new NextRequest('https://example.com/api/v1/avatar/export', {
        method: 'POST',
        body: JSON.stringify({
          format: 'glb',
          quality: 'high',
          async: false,
        }),
      });

      const exportResponse = await POST(exportRequest);
      const exportData = await exportResponse.json();

      // Verify export request succeeded
      expect(exportResponse.status).toBe(200);
      expect(exportData.ok).toBe(true);
      expect(exportData.data.downloadUrl).toBe(mockBlobUrl);
      expect(exportData.data.format).toBe('glb');
      expect(exportData.data.size).toBe(2048);

      // Verify generation and upload were called
      expect(generateComprehensiveGLB).toHaveBeenCalled();
      expect(putBlobFile).toHaveBeenCalled();
    });
  });

  describe('Asynchronous Export Flow', () => {
    it('should complete full async export flow: request → queue job → check status → download', async () => {
      const mockBlobUrl = 'https://blob.vercel-storage.com/async-avatar.glb';
      const jobId = 'test_request_123';

      // Step 1: Request async export
      vi.mocked(inngest.send).mockResolvedValue({ ids: [jobId] } as any);

      const exportRequest = new NextRequest('https://example.com/api/v1/avatar/export', {
        method: 'POST',
        body: JSON.stringify({
          format: 'glb',
          quality: 'high',
          async: true,
        }),
      });

      const exportResponse = await POST(exportRequest);
      const exportData = await exportResponse.json();

      // Verify async job was queued
      expect(exportResponse.status).toBe(200);
      expect(exportData.ok).toBe(true);
      expect(exportData.data.jobStatus).toBe('queued');
      expect(exportData.data.jobId).toBeDefined();
      expect(inngest.send).toHaveBeenCalledWith({
        name: 'avatar/glb.generate',
        data: expect.objectContaining({
          userId: mockUserId,
          avatarConfigId: mockAvatarConfigId,
          format: 'glb',
          quality: 'high',
        }),
      });

      // Step 2: Check status (initially pending/processing)
      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue({
        ...mockAvatarConfigRecord,
        glbUrl: null,
        glbGeneratedAt: null,
        updatedAt: new Date(), // Recently updated = processing
      } as any);

      const statusRequest1 = new NextRequest(`https://example.com/api/v1/avatar/export/status?jobId=${exportData.data.jobId}`);
      const statusResponse1 = await GET_STATUS(statusRequest1);
      const statusData1 = await statusResponse1.json();

      expect(statusResponse1.status).toBe(200);
      expect(statusData1.ok).toBe(true);
      expect(['processing', 'pending']).toContain(statusData1.data.status);

      // Step 3: Simulate completion - update config with GLB URL
      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue({
        ...mockAvatarConfigRecord,
        glbUrl: mockBlobUrl,
        glbGeneratedAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const statusRequest2 = new NextRequest(`https://example.com/api/v1/avatar/export/status?jobId=${exportData.data.jobId}`);
      const statusResponse2 = await GET_STATUS(statusRequest2);
      const statusData2 = await statusResponse2.json();

      // Verify status shows completed with download URL
      expect(statusResponse2.status).toBe(200);
      expect(statusData2.ok).toBe(true);
      expect(statusData2.data.status).toBe('completed');
      expect(statusData2.data.downloadUrl).toBe(mockBlobUrl);
      expect(statusData2.data.format).toBe('glb');
    });

    it('should handle status transitions correctly: pending → processing → completed', async () => {
      const jobId = 'test_request_456';

      // Initial request
      vi.mocked(inngest.send).mockResolvedValue({ ids: [jobId] } as any);

      const exportRequest = new NextRequest('https://example.com/api/v1/avatar/export', {
        method: 'POST',
        body: JSON.stringify({
          format: 'glb',
          quality: 'high',
          async: true,
        }),
      });

      await POST(exportRequest);

      // Check 1: Pending (updated more than 5 minutes ago)
      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue({
        ...mockAvatarConfigRecord,
        glbUrl: null,
        updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      } as any);

      const statusRequest1 = new NextRequest(`https://example.com/api/v1/avatar/export/status?jobId=${jobId}`);
      const statusResponse1 = await GET_STATUS(statusRequest1);
      const statusData1 = await statusResponse1.json();

      expect(statusData1.data.status).toBe('pending');

      // Check 2: Processing (updated recently)
      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue({
        ...mockAvatarConfigRecord,
        glbUrl: null,
        updatedAt: new Date(), // Just now
      } as any);

      const statusRequest2 = new NextRequest(`https://example.com/api/v1/avatar/export/status?jobId=${jobId}`);
      const statusResponse2 = await GET_STATUS(statusRequest2);
      const statusData2 = await statusResponse2.json();

      expect(statusData2.data.status).toBe('processing');

      // Check 3: Completed (GLB URL exists)
      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue({
        ...mockAvatarConfigRecord,
        glbUrl: 'https://blob.vercel-storage.com/completed.glb',
        glbGeneratedAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const statusRequest3 = new NextRequest(`https://example.com/api/v1/avatar/export/status?jobId=${jobId}`);
      const statusResponse3 = await GET_STATUS(statusRequest3);
      const statusData3 = await statusResponse3.json();

      expect(statusData3.data.status).toBe('completed');
      expect(statusData3.data.downloadUrl).toBeDefined();
    });
  });

  describe('Error Handling in Flow', () => {
    it('should handle export generation failure gracefully', async () => {
      vi.mocked(generateComprehensiveGLB).mockRejectedValue(new Error('GLB generation failed'));

      const exportRequest = new NextRequest('https://example.com/api/v1/avatar/export', {
        method: 'POST',
        body: JSON.stringify({
          format: 'glb',
          quality: 'high',
          async: false,
        }),
      });

      const exportResponse = await POST(exportRequest);
      const exportData = await exportResponse.json();

      expect(exportResponse.status).toBe(500);
      expect(exportData.ok).toBe(false);
      expect(exportData.error).toBe('GLB generation failed');
    });

    it('should handle status check failure when config not found', async () => {
      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue(null);

      const statusRequest = new NextRequest('https://example.com/api/v1/avatar/export/status?jobId=test-job');
      const statusResponse = await GET_STATUS(statusRequest);
      const statusData = await statusResponse.json();

      expect(statusResponse.status).toBe(404);
      expect(statusData.ok).toBe(false);
      expect(statusData.error).toBe('Export job not found');
    });
  });

  describe('Security in Flow', () => {
    it('should only allow users to check status of their own exports', async () => {
      // Even if jobId from another user is provided, we filter by authenticated userId
      const otherUserJobId = 'other_user_job_123';

      vi.mocked(db.avatarConfiguration.findFirst).mockResolvedValue({
        ...mockAvatarConfigRecord,
        glbUrl: null,
        updatedAt: new Date(),
      } as any);

      const statusRequest = new NextRequest(`https://example.com/api/v1/avatar/export/status?jobId=${otherUserJobId}`);
      const statusResponse = await GET_STATUS(statusRequest);

      // Should succeed because we filter by userId, not by jobId
      expect(statusResponse.status).toBe(200);
      
      // Verify the query used authenticated userId
      expect(db.avatarConfiguration.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId }, // Critical: filters by authenticated user
        orderBy: { updatedAt: 'desc' },
        select: expect.any(Object),
      });
    });
  });
});

