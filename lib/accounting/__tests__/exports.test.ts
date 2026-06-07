import { describe, expect, it } from 'vitest';
import { TaxLedgerEntryType } from '@prisma/client';
import {
  buildBusinessExpenseExportCsv,
  buildLedgerExportCsv,
  parseAccountingDateRange,
} from '@/lib/accounting/exports';

describe('accounting exports', () => {
  it('defaults to a bounded 30-day UTC range and rejects invalid ranges', () => {
    const parsed = parseAccountingDateRange(
      new URLSearchParams(),
      new Date('2026-06-06T12:00:00.000Z'),
    );
    expect(parsed).toEqual({
      ok: true,
      range: {
        gte: new Date('2026-05-08T00:00:00.000Z'),
        lte: new Date('2026-06-06T23:59:59.999Z'),
      },
    });

    expect(
      parseAccountingDateRange(new URLSearchParams('from=2026-06-07&to=2026-06-06')),
    ).toEqual(expect.objectContaining({ ok: false }));
    expect(
      parseAccountingDateRange(new URLSearchParams('from=not-a-date&to=2026-06-06')),
    ).toEqual(expect.objectContaining({ ok: false }));
  });

  it('derives profit exports from signed atomic rows without identifiers or payloads', () => {
    const csv = buildLedgerExportCsv('profit-estimate', [
      {
        occurredAt: new Date('2026-06-06T12:00:00.000Z'),
        entryType: TaxLedgerEntryType.SALE_GROSS,
        amountCents: 10000,
        currency: 'USD',
        customerJurisdiction: 'US-WA-98101',
        sourceProvider: 'stripe',
      },
      {
        occurredAt: new Date('2026-06-06T13:00:00.000Z'),
        entryType: TaxLedgerEntryType.STRIPE_FEE,
        amountCents: -300,
        currency: 'USD',
        customerJurisdiction: 'US-WA-98101',
        sourceProvider: 'stripe',
      },
      {
        occurredAt: new Date('2026-06-06T14:00:00.000Z'),
        entryType: TaxLedgerEntryType.PROVIDER_PRODUCTION_COST,
        amountCents: -2500,
        currency: 'USD',
        customerJurisdiction: null,
        sourceProvider: 'printify',
      },
    ]);

    expect(csv).toContain('2026-06-06,PROFIT_ESTIMATE,7200,USD');
    expect(csv).not.toContain('98101');
    expect(csv).not.toContain('Order ID');
    expect(csv).not.toContain('Source Reference');
  });

  it('sanitizes business expense cells and excludes provider metadata', () => {
    const csv = buildBusinessExpenseExportCsv([
      {
        incurredAt: new Date('2026-06-06T12:00:00.000Z'),
        category: 'software',
        vendor: '=FORMULA',
        description: 'Monthly service',
        amountCents: 2500,
        currency: 'USD',
      },
    ]);

    expect(csv).toContain("'=FORMULA");
    expect(csv).not.toContain('Source Provider');
    expect(csv).not.toContain('Order ID');
  });
});
