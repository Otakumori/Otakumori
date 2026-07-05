import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PrintifyAdminPage from '@/app/admin/printify/page';

const safePreflight = {
  productCount: 2,
  variantCount: 4,
  enabledInStockVariantCount: 4,
  imageCount: 2,
  invalidProductCount: 0,
  productsMissingUsableImages: 0,
  productsMissingEnabledVariants: 0,
  productsMissingValidPrices: 0,
  duplicatePrintifyProductIdCount: 0,
  duplicateVariantIdCount: 0,
  existingPrintifyProductCount: 0,
  wouldInsert: 2,
  wouldUpdate: 0,
  wouldHide: 0,
  wouldSkip: 0,
  hideMissing: false,
  safeToApply: true,
  issues: [],
};

const unsafePreflight = {
  ...safePreflight,
  safeToApply: false,
  invalidProductCount: 1,
  productsMissingUsableImages: 1,
  wouldInsert: 1,
  wouldSkip: 1,
  issues: [{ productId: 'printify-product-1', reason: 'missing_usable_image' }],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetchOnce(body: unknown, status = 200) {
  vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(body, status));
}

function requestBodyAt(index: number) {
  const init = vi.mocked(fetch).mock.calls[index]?.[1];
  return JSON.parse(String(init?.body));
}

describe('Printify admin catalog control page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('runs read-only preflight with the Clerk admin session and no internal token', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));

    await screen.findByText('req-preflight');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/v1/printify/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'preflight' }),
    });
    expect(JSON.stringify(fetch.mock.calls)).not.toContain('INTERNAL_AUTH_TOKEN');
    expect(JSON.stringify(fetch.mock.calls)).not.toContain('Authorization');
    expect(requestBodyAt(0)).toEqual({ operation: 'preflight' });
  });

  it('renders the complete preflight summary and issues', async () => {
    mockFetchOnce({
      ok: false,
      requestId: 'req-unsafe',
      data: { operation: 'preflight', preflight: unsafePreflight },
    });

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));

    await screen.findByText('req-unsafe');

    for (const label of [
      'Products',
      'Variants',
      'Enabled in-stock variants',
      'Images',
      'Invalid products',
      'Missing usable images',
      'Missing enabled variants',
      'Missing valid prices',
      'Duplicate Printify product IDs',
      'Duplicate variant IDs',
      'Existing Printify products',
      'Would insert',
      'Would update',
      'Would hide',
      'Would skip',
      'Hide missing',
      'Safe to apply',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    expect(screen.getByText('printify-product-1')).toBeInTheDocument();
    expect(screen.getAllByText(/missing_usable_image/).length).toBeGreaterThan(0);
  });

  it('keeps apply disabled when preflight is unsafe', async () => {
    mockFetchOnce({
      ok: false,
      requestId: 'req-unsafe',
      data: { operation: 'preflight', preflight: unsafePreflight },
    });

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText(/apply is blocked because preflight is not safe/i);
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });

    expect(screen.getByRole('button', { name: /apply printify catalog/i })).toBeDisabled();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('sends the exact controlled apply body after clean preflight and confirmation', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce({
      ok: true,
      requestId: 'req-apply',
      data: {
        operation: 'apply',
        result: {
          productCount: 2,
          upserted: 2,
          hidden: 0,
          errorCount: 0,
          errors: [],
        },
      },
    });

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply printify catalog/i }));

    await screen.findByText('req-apply');

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(requestBodyAt(1)).toEqual({
      operation: 'apply',
      apply: true,
      hideMissing: false,
    });
  });

  it('does not send stale manual or products operations', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce({
      ok: true,
      requestId: 'req-apply',
      data: {
        operation: 'apply',
        result: { productCount: 2, upserted: 2, hidden: 0, errorCount: 0, errors: [] },
      },
    });

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply printify catalog/i }));
    await screen.findByText('req-apply');

    const requestBodies = vi.mocked(fetch).mock.calls.map((call) => String(call[1]?.body));
    expect(requestBodies.join('\n')).not.toContain('"type":"manual"');
    expect(requestBodies.join('\n')).not.toContain('"type":"products"');
  });

  it('prevents duplicate apply submissions while a request is active', async () => {
    let resolveApply: (value: Response) => void = () => undefined;

    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveApply = resolve;
      }),
    );

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    fireEvent.click(applyButton);
    fireEvent.click(applyButton);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(requestBodyAt(1)).toEqual({
      operation: 'apply',
      apply: true,
      hideMissing: false,
    });

    resolveApply(
      jsonResponse({
        ok: true,
        requestId: 'req-apply',
        data: {
          operation: 'apply',
          result: { productCount: 2, upserted: 2, hidden: 0, errorCount: 0, errors: [] },
        },
      }),
    );
    await screen.findByText('req-apply');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does not reference the internal auth token in client source', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'app/admin/printify/page.tsx'), 'utf8');

    expect(source).not.toContain('INTERNAL_AUTH_TOKEN');
    expect(source).not.toContain('x-internal-auth');
    expect(source).not.toContain('Authorization');
  });
});
