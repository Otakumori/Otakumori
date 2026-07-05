'use client';

import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, Database, RefreshCw, XCircle } from 'lucide-react';

import { logger } from '@/app/lib/logger';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

const CONFIRMATION_PHRASE = 'APPLY PRINTIFY CATALOG';

type ValidationIssue = {
  productId: string;
  reason: string;
};

type PreflightSummary = {
  productCount: number;
  variantCount: number;
  enabledInStockVariantCount: number;
  imageCount: number;
  invalidProductCount: number;
  productsMissingUsableImages: number;
  productsMissingEnabledVariants: number;
  productsMissingValidPrices: number;
  duplicatePrintifyProductIdCount: number;
  duplicateVariantIdCount: number;
  existingPrintifyProductCount: number;
  wouldInsert: number;
  wouldUpdate: number;
  wouldHide: number;
  wouldSkip: number;
  hideMissing: boolean;
  safeToApply: boolean;
  issues: ValidationIssue[];
};

type CatalogSyncResponse = {
  ok: boolean;
  error?: string;
  requestId?: string;
  data?: {
    operation?: 'preflight' | 'apply';
    preflight?: PreflightSummary;
    result?: {
      productCount: number;
      upserted: number;
      hidden: number;
      errorCount: number;
      errors: string[];
      lastSync?: string;
    };
  };
};

type OperationResult = {
  operation: 'preflight' | 'apply';
  ok: boolean;
  status: number;
  requestId?: string;
  error?: string;
  productCount?: number;
  upserted?: number;
  hidden?: number;
  errorCount?: number;
  errors?: string[];
};

const preflightRows: Array<{ key: keyof PreflightSummary; label: string }> = [
  { key: 'productCount', label: 'Products' },
  { key: 'variantCount', label: 'Variants' },
  { key: 'enabledInStockVariantCount', label: 'Enabled in-stock variants' },
  { key: 'imageCount', label: 'Images' },
  { key: 'invalidProductCount', label: 'Invalid products' },
  { key: 'productsMissingUsableImages', label: 'Missing usable images' },
  { key: 'productsMissingEnabledVariants', label: 'Missing enabled variants' },
  { key: 'productsMissingValidPrices', label: 'Missing valid prices' },
  { key: 'duplicatePrintifyProductIdCount', label: 'Duplicate Printify product IDs' },
  { key: 'duplicateVariantIdCount', label: 'Duplicate variant IDs' },
  { key: 'existingPrintifyProductCount', label: 'Existing Printify products' },
  { key: 'wouldInsert', label: 'Would insert' },
  { key: 'wouldUpdate', label: 'Would update' },
  { key: 'wouldHide', label: 'Would hide' },
  { key: 'wouldSkip', label: 'Would skip' },
  { key: 'hideMissing', label: 'Hide missing' },
  { key: 'safeToApply', label: 'Safe to apply' },
];

function canApply(preflight: PreflightSummary | null) {
  return (
    preflight?.safeToApply === true &&
    preflight.invalidProductCount === 0 &&
    preflight.productsMissingUsableImages === 0 &&
    preflight.productsMissingEnabledVariants === 0 &&
    preflight.productsMissingValidPrices === 0 &&
    preflight.duplicatePrintifyProductIdCount === 0 &&
    preflight.duplicateVariantIdCount === 0 &&
    preflight.wouldHide === 0 &&
    preflight.hideMissing === false &&
    preflight.productCount > 0
  );
}

function formatValue(value: string | number | boolean | ValidationIssue[]) {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return String(value.length);
  return String(value);
}

async function parseCatalogSyncResponse(response: Response): Promise<CatalogSyncResponse> {
  const parsed = (await response.json()) as CatalogSyncResponse;
  return parsed;
}

export default function PrintifyAdminPage() {
  const [preflight, setPreflight] = useState<PreflightSummary | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [isPreflightLoading, setIsPreflightLoading] = useState(false);
  const [isApplyLoading, setIsApplyLoading] = useState(false);
  const activeApplyRef = useRef(false);

  const applyAllowed = useMemo(() => canApply(preflight), [preflight]);
  const confirmationMatches = confirmation.trim() === CONFIRMATION_PHRASE;
  const applyDisabled =
    isPreflightLoading || isApplyLoading || !applyAllowed || !confirmationMatches;

  const runPreflight = async () => {
    if (isPreflightLoading || isApplyLoading) return;

    setIsPreflightLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/v1/printify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'preflight' }),
      });
      const body = await parseCatalogSyncResponse(response);
      const summary = body.data?.preflight ?? null;

      setPreflight(summary);
      setConfirmation('');
      setResult({
        operation: 'preflight',
        ok: body.ok,
        status: response.status,
        requestId: body.requestId,
        error: body.error,
        productCount: summary?.productCount,
        errorCount: summary?.issues?.length,
        errors: summary?.issues?.map((issue) => `${issue.productId}: ${issue.reason}`),
      });
    } catch (error) {
      logger.error(
        'Printify preflight failed',
        undefined,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
      setResult({
        operation: 'preflight',
        ok: false,
        status: 0,
        error: 'Preflight request failed. Check server logs for details.',
      });
    } finally {
      setIsPreflightLoading(false);
    }
  };

  const runApply = async () => {
    if (activeApplyRef.current || applyDisabled) return;

    activeApplyRef.current = true;
    setIsApplyLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/v1/printify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'apply', apply: true, hideMissing: false }),
      });
      const body = await parseCatalogSyncResponse(response);
      const syncResult = body.data?.result;

      setResult({
        operation: 'apply',
        ok: body.ok,
        status: response.status,
        requestId: body.requestId,
        error: body.error,
        productCount: syncResult?.productCount,
        upserted: syncResult?.upserted,
        hidden: syncResult?.hidden,
        errorCount: syncResult?.errorCount,
        errors: syncResult?.errors,
      });
    } catch (error) {
      logger.error(
        'Printify apply failed',
        undefined,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
      setResult({
        operation: 'apply',
        ok: false,
        status: 0,
        error: 'Apply request failed. Check server logs for details.',
      });
    } finally {
      activeApplyRef.current = false;
      setIsApplyLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Printify Catalog Control</h1>
          <p className="text-muted-foreground">
            Review Printify catalog readiness before running a controlled database import.
          </p>
        </div>
        <Badge variant={applyAllowed ? 'default' : 'destructive'}>
          {applyAllowed ? 'Preflight clean' : 'Apply locked'}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Read-only Preflight
            </CardTitle>
            <CardDescription>
              Uses your authenticated Clerk admin session. No internal token is sent to the browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runPreflight} disabled={isPreflightLoading || isApplyLoading}>
              {isPreflightLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run Preflight
            </Button>

            {preflight ? (
              <div className="grid gap-3 md:grid-cols-2">
                {preflightRows.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                  >
                    <div className="text-muted-foreground">{row.label}</div>
                    <div className="font-mono text-base font-semibold">
                      {formatValue(preflight[row.key])}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run preflight to see product, variant, image, duplicate, and apply-safety
                statistics.
              </p>
            )}

            {preflight?.issues?.length ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Issues
                </div>
                <ul className="space-y-1 text-sm">
                  {preflight.issues.map((issue, index) => (
                    <li key={`${issue.productId}-${issue.reason}-${index}`}>
                      <span className="font-mono">{issue.productId}</span>: {issue.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controlled Apply</CardTitle>
            <CardDescription>
              Apply is disabled until preflight is clean and the confirmation phrase is typed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              Type <span className="font-mono font-semibold">{CONFIRMATION_PHRASE}</span> to unlock
              Apply after a clean preflight.
            </div>

            <label className="block space-y-2 text-sm font-medium" htmlFor="printify-apply-confirm">
              Confirmation phrase
              <input
                id="printify-apply-confirm"
                className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={isApplyLoading}
                autoComplete="off"
              />
            </label>

            <Button
              onClick={runApply}
              disabled={applyDisabled}
              variant={applyAllowed && confirmationMatches ? 'primary' : 'outline'}
              className="w-full"
            >
              {isApplyLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Apply Printify Catalog
            </Button>

            {!applyAllowed && preflight ? (
              <p className="text-sm text-destructive">
                Apply is blocked because preflight is not safe.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.ok ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Last Operation
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Operation:</span> {result.operation}
            </div>
            <div>
              <span className="text-muted-foreground">HTTP status:</span> {result.status}
            </div>
            <div>
              <span className="text-muted-foreground">Request ID:</span>{' '}
              <span className="font-mono">{result.requestId ?? 'not provided'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Product count:</span>{' '}
              {result.productCount ?? 'n/a'}
            </div>
            <div>
              <span className="text-muted-foreground">Upserted:</span> {result.upserted ?? 'n/a'}
            </div>
            <div>
              <span className="text-muted-foreground">Hidden:</span> {result.hidden ?? 'n/a'}
            </div>
            <div>
              <span className="text-muted-foreground">Error count:</span>{' '}
              {result.errorCount ?? 'n/a'}
            </div>
            {result.error ? (
              <div className="text-destructive md:col-span-2">{result.error}</div>
            ) : null}
            {result.errors?.length ? (
              <div className="md:col-span-2">
                <div className="mb-2 font-medium">Sanitized errors</div>
                <ul className="space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={`${error}-${index}`}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
