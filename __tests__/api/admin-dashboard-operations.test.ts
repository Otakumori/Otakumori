import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  loadFinanceReport: vi.fn(),
  userCount: vi.fn(),
  userAggregate: vi.fn(),
  orderCount: vi.fn(),
  runeCount: vi.fn(),
  comboCount: vi.fn(),
  ledgerFind: vi.fn(),
}));

vi.mock('@/app/lib/auth/admin', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('@/lib/finance/reporting', () => ({ loadFinanceReport: mocks.loadFinanceReport }));
vi.mock('@/app/lib/logger', () => ({ logger: { error: vi.fn() } }));
vi.mock('@/lib/db', () => ({
  db: {
    user: { count: mocks.userCount, aggregate: mocks.userAggregate },
    order: { count: mocks.orderCount },
    runeDef: { count: mocks.runeCount },
    runeCombo: { count: mocks.comboCount },
    petalLedger: { findMany: mocks.ledgerFind },
  },
}));

import { GET } from '@/app/api/admin/dashboard/route';

describe('admin operations dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: 'admin_1' });
    mocks.userCount.mockResolvedValue(2);
    mocks.userAggregate.mockResolvedValue({ _sum: { petalBalance: 12 } });
    mocks.orderCount.mockResolvedValue(1);
    mocks.runeCount.mockResolvedValue(3);
    mocks.comboCount.mockResolvedValue(4);
    mocks.ledgerFind.mockResolvedValue([]);
    mocks.loadFinanceReport.mockResolvedValue({
      orders: [],
      reconciliation: [],
      close: { blockers: ['Stripe Tax readiness is blocked'], sourceDigest: 'source_1' },
      tax: { readiness: { status: 'BLOCKED' } },
    });
  });

  it('fails closed without canonical admin authority', async () => {
    mocks.requireAdmin.mockRejectedValue(new Error('Admin access required'));
    const response = await GET();
    expect(response.status).toBe(403);
    expect(mocks.loadFinanceReport).not.toHaveBeenCalled();
  });

  it('returns source-backed attention and provenance', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.stats.sourceDigest).toBe('source_1');
    expect(body.data.stats.attention).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'finance-close-blockers', count: 1 }),
        expect.objectContaining({ key: 'tax-readiness', count: 1 }),
      ]),
    );
  });
});
