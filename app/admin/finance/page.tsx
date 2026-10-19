import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { AdminLayout } from '@/components/admin/AdminNav';
import { loadFinanceReport } from '@/lib/finance/reporting';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function money(cents: number | null) {
  return cents == null
    ? 'Unknown'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const yearValue = Array.isArray(params.year) ? params.year[0] : params.year;
  const year = Number(yearValue ?? new Date().getUTCFullYear());
  const safeYear =
    Number.isInteger(year) && year >= 2000 && year <= 2200 ? year : new Date().getUTCFullYear();
  const fromValue = Array.isArray(params.from) ? params.from[0] : params.from;
  const toValue = Array.isArray(params.to) ? params.to[0] : params.to;
  const defaultFrom = new Date(Date.UTC(safeYear, 0, 1));
  const defaultTo = new Date(Date.UTC(safeYear, 11, 31, 23, 59, 59, 999));
  const requestedFrom = fromValue ? new Date(`${fromValue}T00:00:00.000Z`) : defaultFrom;
  const requestedTo = toValue ? new Date(`${toValue}T23:59:59.999Z`) : defaultTo;
  const validRange =
    !Number.isNaN(requestedFrom.getTime()) &&
    !Number.isNaN(requestedTo.getTime()) &&
    requestedFrom < requestedTo;
  const from = validRange ? requestedFrom : defaultFrom;
  const to = validRange ? requestedTo : defaultTo;
  const period = {
    from,
    to,
    label: `${from.toISOString()}..${to.toISOString()}`,
  };
  const report = await loadFinanceReport(period);
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const reconciliation = Array.isArray(params.reconciliation)
    ? params.reconciliation[0]
    : params.reconciliation;
  const provider = Array.isArray(params.provider) ? params.provider[0] : params.provider;
  const rows = report.reconciliation.filter((row) => {
    if (status && status !== 'all' && row.status !== status) return false;
    if (provider && provider !== 'all' && row.provider !== provider) return false;
    if (reconciliation === 'reconciled' && !row.reconciled) return false;
    if (reconciliation === 'unreconciled' && row.reconciled) return false;
    return true;
  });
  const cards = [
    ['Gross sales', report.overview.grossSales],
    ['Refunds', -report.overview.refunds],
    ['Net sales', report.overview.netSales],
    ['Shipping collected', report.overview.shippingCollected],
    ['Tax collected', report.overview.taxCollected],
    ['Payment fees', -report.overview.paymentFees],
    ['Provider COGS', -report.overview.providerCogs],
    ['Contribution', report.overview.contribution],
  ] as const;

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#0b090b] px-5 py-8 text-[#eee7e2] lg:px-9">
        <div className="mx-auto max-w-7xl space-y-7">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c7a97f]">
                Operations
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Finance &amp; Tax Center</h1>
              <p className="mt-2 max-w-3xl text-sm text-[#9f9691]">
                Source-backed financial facts with visible reconciliation gaps. No filing or
                money-moving actions live here.
              </p>
            </div>
            <form className="flex flex-wrap items-end gap-2" method="get">
              <label className="text-xs text-[#a9a09b]">
                Tax year
                <input
                  name="year"
                  defaultValue={safeYear}
                  inputMode="numeric"
                  className="mt-1 block w-24 rounded border border-white/10 bg-black/30 px-3 py-2 text-white"
                />
              </label>
              <label className="text-xs text-[#a9a09b]">
                From
                <input
                  type="date"
                  name="from"
                  defaultValue={fromValue}
                  className="mt-1 block rounded border border-white/10 bg-black/30 px-3 py-2 text-white"
                />
              </label>
              <label className="text-xs text-[#a9a09b]">
                To
                <input
                  type="date"
                  name="to"
                  defaultValue={toValue}
                  className="mt-1 block rounded border border-white/10 bg-black/30 px-3 py-2 text-white"
                />
              </label>
              <button className="rounded border border-[#a9855f]/40 bg-[#a9855f]/15 px-4 py-2 text-sm">
                Apply
              </button>
            </form>
          </header>

          <section
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Finance summary"
          >
            {cards.map(([label, value]) => (
              <article key={label} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wider text-[#8f8581]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#f5eee9]">{money(value)}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <h2 className="text-lg font-semibold">Reconciliation gate</h2>
              <p className="mt-2 text-sm text-[#aaa09b]">
                {report.overview.unreconciledCount} order(s),{' '}
                {money(report.overview.unreconciledValue)} unresolved.
              </p>
              <p
                className={`mt-3 text-sm font-semibold ${report.close.ready ? 'text-emerald-300' : 'text-amber-300'}`}
              >
                {report.close.ready
                  ? 'Period is eligible for owner close review.'
                  : 'Period close is blocked.'}
              </p>
              {!report.close.ready && (
                <ul className="mt-2 list-disc pl-5 text-sm text-[#c7bdb7]">
                  {report.close.blockers.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              <p className="mt-3 break-all font-mono text-[11px] text-[#756d69]">
                Source digest: {report.close.sourceDigest}
              </p>
            </article>
            <article className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <h2 className="text-lg font-semibold">Stripe Tax readiness</h2>
              <p className="mt-2 text-sm font-semibold text-amber-300">
                {report.tax.readiness.status}
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-[#c7bdb7]">
                {report.tax.readiness.blockers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[#8f8581]">
                No nexus, registration, filing, or payment conclusion is inferred.
              </p>
            </article>
          </section>

          <section className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Order reconciliation</h2>
                <p className="text-sm text-[#8f8581]">
                  Stripe, local order, refund, fulfillment, and immutable COGS evidence.
                </p>
              </div>
              <form className="flex flex-wrap gap-2 text-sm" method="get">
                <input type="hidden" name="year" value={safeYear} />
                {fromValue && <input type="hidden" name="from" value={fromValue} />}
                {toValue && <input type="hidden" name="to" value={toValue} />}
                <select
                  name="status"
                  defaultValue={status ?? 'all'}
                  className="rounded border border-white/10 bg-[#141115] px-3 py-2"
                >
                  <option value="all">All states</option>
                  <option value="pending">Pending</option>
                  <option value="pending_mapping">Pending fulfillment</option>
                  <option value="in_production">In production</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  name="reconciliation"
                  defaultValue={reconciliation ?? 'all'}
                  className="rounded border border-white/10 bg-[#141115] px-3 py-2"
                >
                  <option value="all">All</option>
                  <option value="reconciled">Reconciled</option>
                  <option value="unreconciled">Unreconciled</option>
                </select>
                <select
                  name="provider"
                  defaultValue={provider ?? 'all'}
                  className="rounded border border-white/10 bg-[#141115] px-3 py-2"
                >
                  <option value="all">All providers</option>
                  <option value="printify">Printify</option>
                  <option value="unknown">Unknown</option>
                </select>
                <button className="rounded border border-white/10 px-3 py-2">Filter</button>
              </form>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-[#8f8581]">
                  <tr>
                    <th className="p-2">Order</th>
                    <th className="p-2">State</th>
                    <th className="p-2">Local / ledger</th>
                    <th className="p-2">COGS</th>
                    <th className="p-2">Provider</th>
                    <th className="p-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.orderId} className="border-t border-white/6">
                      <td className="p-2">
                        <Link
                          className="text-[#d5b58b] underline-offset-2 hover:underline"
                          href={`/admin/orders?search=${row.orderNumber}`}
                        >
                          #{row.orderNumber}
                        </Link>
                      </td>
                      <td className="p-2">{row.status}</td>
                      <td className="p-2">
                        {money(row.localTotal)} / {money(row.ledgerRevenue)}
                      </td>
                      <td className="p-2">{money(row.cogsAmount)}</td>
                      <td className="p-2">{row.provider}</td>
                      <td className="p-2">
                        {row.financialScope === 'CHECKOUT_ONLY' ? (
                          <span className="text-[#8f8581]">No paid event</span>
                        ) : row.reconciled ? (
                          <span className="text-emerald-300">Reconciled</span>
                        ) : (
                          <span className="text-amber-300">{row.issues.join(', ')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
            <h2 className="text-lg font-semibold">Exports</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                'pnl',
                'general-ledger',
                'orders',
                'refunds',
                'stripe-reconciliation',
                'provider-cogs',
                'sales-by-jurisdiction',
                'sales-tax-liability',
                'unresolved-reconciliation',
              ].map((dataset) => (
                <a
                  key={dataset}
                  className="rounded border border-[#a9855f]/25 bg-[#a9855f]/8 px-3 py-2 text-sm text-[#dbc19f]"
                  href={`/api/admin/finance/export?dataset=${dataset}&year=${safeYear}${fromValue ? `&from=${encodeURIComponent(fromValue)}` : ''}${toValue ? `&to=${encodeURIComponent(toValue)}` : ''}`}
                >
                  {dataset}
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </AdminLayout>
  );
}
