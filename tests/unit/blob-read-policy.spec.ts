/**
 * Unit tests for NSFW policy enforcement
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getPolicyFromRequestSync } from '@/app/lib/policy/fromRequest';

describe('NSFW Policy', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should deny NSFW without cookie when NSFW_GLOBAL is off', () => {
    process.env.NSFW_GLOBAL = 'off';

    const req = new Request('https://example.com/api/blob/read?key=test', {
      headers: { cookie: '' },
    });

    const policy = getPolicyFromRequestSync(req);
    expect(policy.nsfwAllowed).toBe(false);
  });

  it('should allow NSFW with om_age_ok cookie', () => {
    process.env.NSFW_GLOBAL = 'off';

    const req = new Request('https://example.com/api/blob/read?key=test', {
      headers: { cookie: 'om_age_ok=1' },
    });

    const policy = getPolicyFromRequestSync(req);
    expect(policy.nsfwAllowed).toBe(true);
  });

  it('should allow NSFW when NSFW_GLOBAL is on', () => {
    process.env.NSFW_GLOBAL = 'on';

    const req = new Request('https://example.com/api/blob/read?key=test', {
      headers: { cookie: '' },
    });

    const policy = getPolicyFromRequestSync(req);
    expect(policy.nsfwAllowed).toBe(true);
  });

  it('should deny NSFW with wrong cookie value', () => {
    process.env.NSFW_GLOBAL = 'off';

    const req = new Request('https://example.com/api/blob/read?key=test', {
      headers: { cookie: 'om_age_ok=0' },
    });

    const policy = getPolicyFromRequestSync(req);
    expect(policy.nsfwAllowed).toBe(false);
  });

  it('should handle multiple cookies correctly', () => {
    process.env.NSFW_GLOBAL = 'off';

    const req = new Request('https://example.com/api/blob/read?key=test', {
      headers: { cookie: 'other=value; om_age_ok=1; another=test' },
    });

    const policy = getPolicyFromRequestSync(req);
    expect(policy.nsfwAllowed).toBe(true);
  });
});
