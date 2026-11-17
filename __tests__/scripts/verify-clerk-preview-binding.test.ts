import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';

import {
  CLERK_BINDING_EXPECTATIONS,
  decodeClerkFrontendHost,
  verifyClerkPreviewBinding,
} from '../../scripts/verify-clerk-preview-binding.mjs';

const targetEnvironment = {
  VERCEL: '1',
  VERCEL_ENV: 'preview',
  VERCEL_GIT_COMMIT_REF: CLERK_BINDING_EXPECTATIONS.gitBranch,
  CLERK_SECRET_KEY: 'test-only-secret',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_test_${Buffer.from(
    `${CLERK_BINDING_EXPECTATIONS.frontendHost}$`,
  ).toString('base64')}`,
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function harness(overrides: Record<string, string | undefined> = {}) {
  const output: string[] = [];
  const errors: string[] = [];
  const fetchImpl = vi.fn();

  return {
    env: { ...targetEnvironment, ...overrides },
    output,
    errors,
    fetchImpl,
    options: {
      env: { ...targetEnvironment, ...overrides },
      fetchImpl,
      writeOutput: (message: string) => output.push(message),
      writeError: (message: string) => errors.push(message),
    },
  };
}

describe('verifyClerkPreviewBinding', () => {
  it.each([
    [{ VERCEL: undefined }, 'non-Vercel'],
    [{ VERCEL_ENV: 'production' }, 'Production'],
    [{ VERCEL_GIT_COMMIT_REF: 'codex/another-branch' }, 'another Preview branch'],
  ])('is inert for %s builds', async (overrides) => {
    const test = harness(overrides);

    await expect(verifyClerkPreviewBinding(test.options)).resolves.toBe(0);
    expect(test.fetchImpl).not.toHaveBeenCalled();
    expect(test.output).toEqual([]);
    expect(test.errors).toEqual([]);
  });

  it('verifies the raw Backend API identity and emits only the success marker', async () => {
    const test = harness();
    test.fetchImpl.mockResolvedValue(
      response({
        id: CLERK_BINDING_EXPECTATIONS.instanceId,
        environment_type: CLERK_BINDING_EXPECTATIONS.environmentType,
      }),
    );

    await expect(verifyClerkPreviewBinding(test.options)).resolves.toBe(0);
    expect(test.fetchImpl).toHaveBeenCalledOnce();
    expect(test.fetchImpl).toHaveBeenCalledWith(
      'https://api.clerk.com/v1/instance',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer test-only-secret' }),
      }),
    );
    expect(test.output).toEqual(['CLERK_BINDING=VERIFIED']);
    expect(test.errors).toEqual([]);
  });

  it.each([
    [{ CLERK_SECRET_KEY: undefined }, 'CLERK_BINDING_FAILED:CONFIG_MISSING'],
    [{ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined }, 'CLERK_BINDING_FAILED:CONFIG_MISSING'],
    [
      { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_invalid' },
      'CLERK_BINDING_FAILED:FRONTEND_MISMATCH',
    ],
    [
      {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_test_${Buffer.from(
          'different.clerk.accounts.dev$',
        ).toString('base64')}`,
      },
      'CLERK_BINDING_FAILED:FRONTEND_MISMATCH',
    ],
  ])('fails closed for invalid configuration', async (overrides, expectedError) => {
    const test = harness(overrides);

    await expect(verifyClerkPreviewBinding(test.options)).resolves.toBe(1);
    expect(test.fetchImpl).not.toHaveBeenCalled();
    expect(test.output).toEqual([]);
    expect(test.errors).toEqual([expectedError]);
  });

  it.each([
    [401, 'CLERK_BINDING_FAILED:UNAUTHORIZED'],
    [403, 'CLERK_BINDING_FAILED:UNAUTHORIZED'],
    [500, 'CLERK_BINDING_FAILED:HTTP_RESPONSE'],
  ])('sanitizes non-success API responses', async (status, expectedError) => {
    const test = harness();
    test.fetchImpl.mockResolvedValue(response({ secret: 'must-not-appear' }, status));

    await expect(verifyClerkPreviewBinding(test.options)).resolves.toBe(1);
    expect(test.output).toEqual([]);
    expect(test.errors).toEqual([expectedError]);
    expect(test.errors.join(' ')).not.toContain('must-not-appear');
  });

  it('fails closed on a network error without exposing its message', async () => {
    const test = harness();
    test.fetchImpl.mockRejectedValue(new Error('sensitive network detail'));

    await expect(verifyClerkPreviewBinding(test.options)).resolves.toBe(1);
    expect(test.errors).toEqual(['CLERK_BINDING_FAILED:REQUEST_FAILED']);
    expect(test.errors.join(' ')).not.toContain('sensitive network detail');
  });

  it('fails closed on malformed JSON', async () => {
    const test = harness();
    test.fetchImpl.mockResolvedValue(
      new Response('not-json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    );

    await expect(verifyClerkPreviewBinding(test.options)).resolves.toBe(1);
    expect(test.errors).toEqual(['CLERK_BINDING_FAILED:MALFORMED_RESPONSE']);
  });

  it.each([
    [
      { id: 'ins_wrong', environment_type: 'development' },
      'CLERK_BINDING_FAILED:INSTANCE_MISMATCH',
    ],
    [
      { id: CLERK_BINDING_EXPECTATIONS.instanceId, environment_type: 'production' },
      'CLERK_BINDING_FAILED:ENVIRONMENT_MISMATCH',
    ],
    [
      { id: CLERK_BINDING_EXPECTATIONS.instanceId, environmentType: 'development' },
      'CLERK_BINDING_FAILED:ENVIRONMENT_MISMATCH',
    ],
  ])('validates the raw API response shape and identity', async (body, expectedError) => {
    const test = harness();
    test.fetchImpl.mockResolvedValue(response(body));

    await expect(verifyClerkPreviewBinding(test.options)).resolves.toBe(1);
    expect(test.output).toEqual([]);
    expect(test.errors).toEqual([expectedError]);
  });
});

describe('decodeClerkFrontendHost', () => {
  it('decodes a Clerk test publishable key host', () => {
    expect(decodeClerkFrontendHost(targetEnvironment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)).toBe(
      CLERK_BINDING_EXPECTATIONS.frontendHost,
    );
  });

  it.each(['', 'pk_live_invalid', 'pk_test_', 'pk_test_***'])('rejects %s', (key) => {
    expect(decodeClerkFrontendHost(key)).toBeNull();
  });
});
