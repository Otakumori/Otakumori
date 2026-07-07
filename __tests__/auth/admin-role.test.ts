import { describe, expect, it } from 'vitest';

import { hasAdminRole } from '@/app/lib/auth/adminRole';

describe('canonical Clerk admin role helper', () => {
  it('grants admin only from Clerk metadata role claims', () => {
    expect(hasAdminRole({ metadata: { role: 'admin' } })).toBe(true);
    expect(hasAdminRole({ public_metadata: { role: 'admin' } })).toBe(true);
    expect(hasAdminRole({ publicMetadata: { role: 'admin' } })).toBe(true);
  });

  it('does not treat the managed Supabase authenticated role as admin', () => {
    expect(hasAdminRole({ role: 'authenticated' })).toBe(false);
    expect(hasAdminRole({ metadata: { role: 'user' }, role: 'authenticated' })).toBe(false);
    expect(hasAdminRole({ public_metadata: { role: 'moderator' } })).toBe(false);
  });
});
