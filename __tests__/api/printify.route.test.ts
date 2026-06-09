import { describe, it, expect, vi } from 'vitest';
import { callGET } from '../../tests/helpers/route';

const authorizeAdminApiMock = vi.fn();

vi.mock('@/app/lib/auth/admin', () => ({
  authorizeAdminApi: authorizeAdminApiMock,
}));

describe('Printify products API containment', () => {
  it('rejects unauthenticated public access before calling Printify', async () => {
    authorizeAdminApiMock.mockResolvedValue({
      ok: false,
      response: Response.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 }),
    });
    global.fetch = vi.fn();
    const route = await import('../../app/api/printify/products/route');
    const { res, json } = await callGET(route);

    expect(res.status).toBe(401);
    expect(json).toEqual({ ok: false, error: 'AUTH_REQUIRED' });
    expect(authorizeAdminApiMock).toHaveBeenCalledWith(
      expect.any(Request),
      'clerk_admin_or_internal_service',
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
