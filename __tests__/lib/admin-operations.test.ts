import { describe, expect, it } from 'vitest';
import { buildAdminAttention, isRetrySafeFulfillmentStatus } from '@/lib/admin/operations';

function order(
  id: string,
  input: Partial<{
    status: string;
    paidAt: string | null;
    refundAmount: number;
    totalAmount: number;
    syncStatus: string;
    syncError: string;
  }> = {},
) {
  return {
    id,
    status: input.status ?? 'in_production',
    paidAt: input.paidAt === undefined ? '2026-03-01T00:00:00.000Z' : input.paidAt,
    refundAmount: input.refundAmount ?? 0,
    totalAmount: input.totalAmount ?? 5000,
    PrintifyOrderSync: input.syncStatus
      ? { status: input.syncStatus, error: input.syncError ?? null }
      : null,
  };
}

describe('admin operations attention', () => {
  it('classifies populated operational fixtures without hiding financial unknowns', () => {
    const orders = [
      order('reconciled', { syncStatus: 'accepted' }),
      order('pending-payment', { status: 'pending', paidAt: null }),
      order('pending-fulfillment'),
      order('retry-safe', {
        status: 'pending_mapping',
        syncStatus: 'failed',
        syncError: 'rejected',
      }),
      order('uncertain', { status: 'pending_mapping', syncStatus: 'submission_uncertain' }),
      order('shipped', { status: 'shipped', syncStatus: 'shipped' }),
      order('refunded', { status: 'cancelled', refundAmount: 2500, syncStatus: 'cancelled' }),
      order('unknown-cogs', { syncStatus: 'accepted' }),
      order('mismatch', { syncStatus: 'accepted' }),
    ];
    const reconciliation = orders.map((item) => ({
      orderId: item.id,
      reconciled: !['unknown-cogs', 'mismatch'].includes(item.id),
      issues:
        item.id === 'unknown-cogs'
          ? ['COGS_UNKNOWN']
          : item.id === 'mismatch'
            ? ['LEDGER_TOTAL_MISMATCH']
            : [],
    }));

    const rows = buildAdminAttention({
      orders,
      reconciliation,
      closeBlockers: ['2 unreconciled order(s)', 'Stripe Tax readiness is blocked'],
      taxReadiness: 'BLOCKED',
    });
    const byKey = new Map(rows.map((row) => [row.key, row]));

    expect(byKey.get('pending-payment')?.count).toBe(1);
    expect(byKey.get('pending-fulfillment')?.count).toBe(4);
    expect(byKey.get('fulfillment-error')?.count).toBe(1);
    expect(byKey.get('submission-uncertain')?.count).toBe(1);
    expect(byKey.get('shipped')?.count).toBe(1);
    expect(byKey.get('cancelled-refunded')?.count).toBe(1);
    expect(byKey.get('financially-unreconciled')?.count).toBe(2);
    expect(byKey.get('unknown-cogs')?.count).toBe(1);
    expect(byKey.get('finance-close-blockers')?.count).toBe(2);
    expect(byKey.get('tax-readiness')?.severity).toBe('critical');
  });

  it('keeps uncertain submissions blocked while exposing only known retry-safe states', () => {
    expect(isRetrySafeFulfillmentStatus('failed')).toBe(true);
    expect(isRetrySafeFulfillmentStatus('mapping_failed')).toBe(true);
    expect(isRetrySafeFulfillmentStatus('no_items')).toBe(true);
    expect(isRetrySafeFulfillmentStatus('submission_uncertain')).toBe(false);
    expect(isRetrySafeFulfillmentStatus('submitting')).toBe(false);
  });

  it('links each attention state to an operational drill-down', () => {
    const rows = buildAdminAttention({
      orders: [],
      reconciliation: [],
      closeBlockers: [],
      taxReadiness: 'READY',
    });
    expect(rows).toHaveLength(10);
    expect(rows.every((row) => row.href.startsWith('/admin/'))).toBe(true);
    expect(rows.find((row) => row.key === 'tax-readiness')).toMatchObject({
      count: 0,
      severity: 'neutral',
    });
  });
});
