import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  loadFinanceReport: vi.fn(),
  manifestUpsert: vi.fn(),
}));
vi.mock('@/app/lib/auth/admin', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('@/app/lib/request-id', () => ({ generateRequestId: () => 'request_1' }));
vi.mock('@/lib/db', () => ({
  db: { financialReportExport: { upsert: mocks.manifestUpsert } },
}));
vi.mock('@/lib/finance/reporting', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/finance/reporting')>();
  return { ...original, loadFinanceReport: mocks.loadFinanceReport };
});

import { GET } from '@/app/api/admin/finance/export/route';

describe('admin finance exports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: 'admin_1' });
    mocks.manifestUpsert.mockResolvedValue({ id: 'report_1' });
    mocks.loadFinanceReport.mockResolvedValue({
      period: { from: new Date('2026-01-01'), to: new Date('2026-12-31'), label: '2026' },
      overview: {
        grossSales: 1000,
        refunds: 0,
        netSales: 1000,
        discounts: 0,
        shippingCollected: 0,
        taxCollected: 0,
        paymentFees: 0,
        providerCogs: 0,
        operatingExpenses: 0,
        contribution: 1000,
        transactionCount: 0,
        orderCount: 0,
        unreconciledValue: 0,
      },
      ledger: [],
      orders: [],
      reconciliation: [],
      tax: { readiness: { status: 'BLOCKED' }, registrations: [], jurisdictionRows: [] },
      close: { sourceDigest: 'digest' },
      methodology: {
        merchantAccountId: 'acct_1RwMJgHN4OLBC1u4',
        reportingEnvironment: 'test',
        timezone: 'America/New_York',
        accountingMethod: 'cash',
        reportVersion: '1.0.0',
        generatedAt: '2026-01-01T00:00:00.000Z',
        sources: [],
        limitations: [],
      },
    });
  });

  it('exports a real accountant workbook with private no-store headers', async () => {
    const response = await GET(
      new Request('http://localhost/api/admin/finance/export?format=xlsx&year=2026') as any,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('spreadsheetml.sheet');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1_000);
    expect(mocks.manifestUpsert).toHaveBeenCalledTimes(1);
  }, 10_000);

  it('records a deduplicated manifest for an owner-generated workbook', async () => {
    const { POST } = await import('@/app/api/admin/finance/export/route');
    const response = await POST(
      new Request('http://localhost/api/admin/finance/export?year=2026', { method: 'POST' }) as any,
    );
    expect(response.status).toBe(200);
    expect(mocks.manifestUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          merchantAccountId: 'acct_1RwMJgHN4OLBC1u4',
          generatedBy: 'admin_1',
          status: 'GENERATED',
        }),
      }),
    );
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
