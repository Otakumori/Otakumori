/**
 * Unit tests for Vercel Blob client
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Blob Client', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should throw clear error when BLOB_READ_WRITE_TOKEN is missing', async () => {
    // Remove required env vars
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_PUBLIC_BASE_URL;

    // Dynamic import to get fresh module with updated env
    const { putBlobFile } = await import('@/app/lib/blob/client');

    await expect(
      putBlobFile({
        key: 'test/file.bin',
        data: new Uint8Array([1, 2, 3]),
        contentType: 'application/octet-stream',
        access: 'public',
      }),
    ).rejects.toThrow(/Missing required env.*BLOB_READ_WRITE_TOKEN/i);
  });

  it('should throw clear error when BLOB_PUBLIC_BASE_URL is missing', async () => {
    // Set token but not base URL
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    delete process.env.BLOB_PUBLIC_BASE_URL;

    const { putBlobFile } = await import('@/app/lib/blob/client');

    await expect(
      putBlobFile({
        key: 'test/file.bin',
        data: new Uint8Array([1, 2, 3]),
        contentType: 'application/octet-stream',
        access: 'public',
      }),
    ).rejects.toThrow(/Missing required env.*BLOB_PUBLIC_BASE_URL/i);
  });

  it('should include helpful setup instructions in error', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_PUBLIC_BASE_URL;

    const { putBlobFile } = await import('@/app/lib/blob/client');

    await expect(
      putBlobFile({
        key: 'test/file.bin',
        data: new Uint8Array([1, 2, 3]),
        contentType: 'application/octet-stream',
        access: 'public',
      }),
    ).rejects.toThrow(/Vercel.*Storage.*Blob.*Create Token/i);
  });

  it('should throw clear error for headBlob when env is missing', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_PUBLIC_BASE_URL;

    const { headBlob } = await import('@/app/lib/blob/client');

    await expect(headBlob({ key: 'test/file.bin' })).rejects.toThrow(/Missing required env/i);
  });
});
