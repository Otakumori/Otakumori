import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), loadFinanceReport: vi.fn() }));
vi.mock('@/app/lib/auth/admin', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('@/app/lib/request-id', () => ({ generateRequestId: () => 'request_1' }));
vi.mock('@/lib/finance/reporting', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/finance/reporting')>();
  return { ...original, loadFinanceReport: mocks.loadFinanceReport };
});

import { GET } from '@/app/api/admin/finance/export/route';

describe('admin finance exports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: 'admin_1' });
    mocks.loadFinanceReport.mockResolvedValue({
      overview: { grossSales: 1000 },
      ledger: [],
      orders: [],
      reconciliation: [],
      tax: { jurisdictionRows: [] },
      close: { sourceDigest: 'digest' },
    });
  });

  it('fails closed when admin authority is absent', async () => {
    mocks.requireAdmin.mockRejectedValue(new Error('Admin access required'));
    const response = await GET(
      new Request('http://localhost/api/admin/finance/export?dataset=pnl&year=2026') as any,
    );
    expect(response.status).toBe(403);
  });

  it('exports a selected dataset with period and source provenance', async () => {
    const response = await GET(
      new Request('http://localhost/api/admin/finance/export?dataset=pnl&year=2026') as any,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    const body = await response.text();
    expect(body).toContain('# dataset: pnl');
    expect(body).toContain('# sourceDigest: digest');
  });

  it('rejects unknown exports', async () => {
    const response = await GET(
      new Request('http://localhost/api/admin/finance/export?dataset=secret-ledger') as any,
    );
    expect(response.status).toBe(400);
  });
});
