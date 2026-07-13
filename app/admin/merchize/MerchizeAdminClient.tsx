'use client';

import { useState } from 'react';
import type { MerchizeCatalogPreflight } from '@/app/lib/merchize/service';
import type {
  MerchizeImportApplyResult,
  MerchizeImportPreflight,
} from '@/app/lib/merchize/importPreflight';

type PreflightResponse =
  | {
      ok: true;
      data: MerchizeCatalogPreflight;
      requestId: string;
    }
  | {
      ok: false;
      error: {
        code?: string;
        message?: string;
      };
      requestId: string;
    };

type ImportPreflightResponse =
  | {
      ok: true;
      data: MerchizeImportPreflight;
      requestId: string;
    }
  | {
      ok: false;
      error: {
        code?: string;
        message?: string;
      };
      requestId: string;
    };

type ImportApplyResponse =
  | {
      ok: true;
      data: MerchizeImportApplyResult;
      requestId: string;
    }
  | {
      ok: false;
      error: {
        code?: string;
        message?: string;
        details?: unknown;
      };
      requestId: string;
    };

function StatCard({ label, value }: { label: string; value: string | number | boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p>
    </div>
  );
}

function truncate(value: string, maxLength = 28) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function formatPriceRange(priceRange: {
  min: number | null;
  max: number | null;
  currency: string | null;
}) {
  if (priceRange.min == null && priceRange.max == null) return 'n/a';
  const currency = priceRange.currency ?? 'USD';
  if (priceRange.min === priceRange.max || priceRange.max == null) {
    return `${currency} ${priceRange.min}`;
  }
  return `${currency} ${priceRange.min} - ${priceRange.max}`;
}

export default function MerchizeAdminClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreflightResponse | null>(null);
  const [importPreflightLoading, setImportPreflightLoading] = useState(false);
  const [importApplyLoading, setImportApplyLoading] = useState(false);
  const [importPreflightResult, setImportPreflightResult] =
    useState<ImportPreflightResponse | null>(null);
  const [importApplyResult, setImportApplyResult] = useState<ImportApplyResponse | null>(null);

  async function runPreflight() {
    if (loading) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/merchize/preflight', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const json = (await response.json()) as PreflightResponse;
      setResult(json);
    } catch {
      setResult({
        ok: false,
        requestId: `client_${Date.now()}`,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to run Merchize preflight.',
        },
      });
    } finally {
      setLoading(false);
    }
  }

  async function runImportPreflight() {
    if (importPreflightLoading || importApplyLoading) return;
    setImportPreflightLoading(true);
    setImportApplyResult(null);

    try {
      const response = await fetch('/api/admin/merchize/import/preflight', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const json = (await response.json()) as ImportPreflightResponse;
      setImportPreflightResult(json);
    } catch {
      setImportPreflightResult({
        ok: false,
        requestId: `client_${Date.now()}`,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to run Merchize import preflight.',
        },
      });
    } finally {
      setImportPreflightLoading(false);
    }
  }

  async function applyHiddenImport() {
    if (
      importApplyLoading ||
      !importPreflightResult?.ok ||
      !importPreflightResult.data.safeToImport
    )
      return;
    setImportApplyLoading(true);

    try {
      const response = await fetch('/api/admin/merchize/import/apply', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ apply: true }),
      });
      const json = (await response.json()) as ImportApplyResponse;
      setImportApplyResult(json);
    } catch {
      setImportApplyResult({
        ok: false,
        requestId: `client_${Date.now()}`,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to import Merchize products.',
        },
      });
    } finally {
      setImportApplyLoading(false);
    }
  }

  const summary = result?.ok ? result.data : null;
  const importSummary = importPreflightResult?.ok ? importPreflightResult.data : null;
  const canApplyHiddenImport =
    Boolean(importSummary?.safeToImport) && !importApplyLoading && !importPreflightLoading;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-medium">Read-only catalog preflight</h2>
            <p className="mt-2 max-w-3xl text-sm text-white/65">
              Runs Merchize GET-only diagnostics, normalizes product shape, and reports import
              readiness. This page does not write to Merchize or the Otakumori database.
            </p>
            <p className="mt-3 rounded-xl border border-pink-300/20 bg-pink-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-100">
              Read-only diagnostics. No import has run. No provider write has run.
            </p>
          </div>
          <button
            type="button"
            onClick={runPreflight}
            disabled={loading}
            className="rounded-full border border-pink-300/40 bg-pink-400/15 px-5 py-2 text-sm font-semibold text-pink-100 transition hover:bg-pink-400/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Running...' : 'Run read-only preflight'}
          </button>
        </div>

        {result ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
            <p>
              <span className="font-medium text-white">Request ID:</span> {result.requestId}
            </p>
            {!result.ok ? (
              <p className="mt-2 text-rose-300">
                {result.error.message ?? 'Merchize preflight failed.'}
              </p>
            ) : null}
          </div>
        ) : null}

        {summary ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Products returned" value={summary.productCount} />
              <StatCard label="Normalized products" value={summary.normalizedProductCount} />
              <StatCard label="Variants detected" value={summary.variantCount} />
              <StatCard label="Priced variants" value={summary.pricedVariantCount} />
              <StatCard label="Images detected" value={summary.imageCount} />
              <StatCard label="Products missing images" value={summary.productsMissingImages} />
              <StatCard label="Products missing price" value={summary.productsMissingPrice} />
              <StatCard label="Duplicate product IDs" value={summary.duplicateProductIdCount} />
              <StatCard label="Duplicate SKUs" value={summary.duplicateSkuCount} />
              <StatCard label="Safe to import" value={summary.safeToImport} />
            </div>

            {summary.issues.length > 0 ? (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
                <h3 className="font-semibold text-amber-100">Readiness issues</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-50/80">
                  {summary.issues.map((issue) => (
                    <li key={issue.code}>
                      {issue.message}
                      {issue.count != null ? ` (${issue.count})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-emerald-100">
                No provider-shape blockers were detected in this read-only pass.
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold">Normalized sample</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {summary.products.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/45">
                      <span>{product.provider}</span>
                      <span aria-label="provider product id">
                        {truncate(product.providerProductId)}
                      </span>
                    </div>
                    <h4 className="mt-2 font-semibold text-white">{product.title}</h4>
                    <p className="mt-2 text-xs text-white/55">
                      SKU: {product.sku ?? 'n/a'} | Status: {product.status ?? 'n/a'}
                    </p>
                    <p className="mt-2 text-xs text-white/55">
                      Variants: {product.variantCount} | Images: {product.imageCount} | Priced:{' '}
                      {product.pricedVariantCount}
                    </p>
                    <p className="mt-2 text-xs text-white/55">
                      Price range: {formatPriceRange(product.priceRange)}
                    </p>
                    {product.warnings.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.warnings.map((warning) => (
                          <span
                            key={warning}
                            className="rounded-full border border-amber-300/20 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-100"
                          >
                            {warning}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-full border border-emerald-300/20 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-100">
                        Readiness: clean
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-pink-300/20 bg-black/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-medium">Hidden local import</h2>
            <p className="mt-2 max-w-3xl text-sm text-white/65">
              Import Preflight is a dry run only. Import Hidden Products writes local catalog rows
              with public visibility disabled. Imported products will not appear in the public shop
              and cannot be purchased until provider-aware checkout and fulfillment are implemented.
            </p>
            <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
              Hidden local records only. No provider write. No checkout or fulfillment enablement.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={runImportPreflight}
              disabled={importPreflightLoading || importApplyLoading}
              className="rounded-full border border-pink-300/40 bg-pink-400/15 px-5 py-2 text-sm font-semibold text-pink-100 transition hover:bg-pink-400/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importPreflightLoading ? 'Running...' : 'Run Import Preflight'}
            </button>
            <button
              type="button"
              onClick={applyHiddenImport}
              disabled={!canApplyHiddenImport}
              className="rounded-full border border-amber-300/40 bg-amber-400/15 px-5 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importApplyLoading ? 'Importing...' : 'Import Hidden Products'}
            </button>
          </div>
        </div>

        {importPreflightResult ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
            <p>
              <span className="font-medium text-white">Import preflight request ID:</span>{' '}
              {importPreflightResult.requestId}
            </p>
            {!importPreflightResult.ok ? (
              <p className="mt-2 text-rose-300">
                {importPreflightResult.error.message ?? 'Merchize import preflight failed.'}
              </p>
            ) : null}
          </div>
        ) : null}

        {importSummary ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Provider products" value={importSummary.productCount} />
              <StatCard label="Would insert" value={importSummary.wouldInsert} />
              <StatCard label="Would update" value={importSummary.wouldUpdate} />
              <StatCard label="Would skip" value={importSummary.wouldSkip} />
              <StatCard label="Would block" value={importSummary.wouldBlock} />
              <StatCard label="Safe to import hidden" value={importSummary.safeToImport} />
            </div>

            {importSummary.issues.length > 0 ? (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
                <h3 className="font-semibold text-amber-100">Import blockers</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-50/80">
                  {importSummary.issues.map((issue) => (
                    <li key={issue.code}>
                      {issue.message}
                      {issue.count != null ? ` (${issue.count})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-emerald-100">
                Hidden import preflight is clean. Products will remain public=false and
                purchasable=false after import.
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold">Import plan</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {importSummary.products.slice(0, 24).map((product) => (
                  <article
                    key={product.integrationRef}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/45">
                      <span>{product.provider}</span>
                      <span>{product.action}</span>
                      <span>{truncate(product.providerProductId)}</span>
                    </div>
                    <h4 className="mt-2 font-semibold text-white">{product.title}</h4>
                    <p className="mt-2 text-xs text-white/55">
                      Variants: {product.variantCount} | Images: {product.imageCount}
                    </p>
                    <p className="mt-2 text-xs text-white/55">
                      Public: {String(product.public)} | Purchasable: {String(product.purchasable)}
                    </p>
                    {product.issues.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.issues.map((issue) => (
                          <span
                            key={issue}
                            className="rounded-full border border-amber-300/20 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-100"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {importApplyResult ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
            <p>
              <span className="font-medium text-white">Apply request ID:</span>{' '}
              {importApplyResult.requestId}
            </p>
            {importApplyResult.ok ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Inserted" value={importApplyResult.data.inserted} />
                <StatCard label="Updated" value={importApplyResult.data.updated} />
                <StatCard label="Skipped" value={importApplyResult.data.skipped} />
                <StatCard label="Blocked" value={importApplyResult.data.blocked} />
              </div>
            ) : (
              <p className="mt-2 text-rose-300">
                {importApplyResult.error.message ?? 'Merchize hidden import failed.'}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
