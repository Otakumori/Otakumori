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

function applySuccessBody(requestId = 'req-apply') {
  return {
    ok: true,
    requestId,
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
  };
}

function preflightBody(summary = safePreflight, requestId = 'req-preflight', ok = true) {
  return {
    ok,
    requestId,
    data: { operation: 'preflight', preflight: summary },
  };
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

  it('consumes authorization immediately when a preflight refresh begins', async () => {
    let resolveRefresh: (value: Response) => void = () => undefined;

    mockFetchOnce(preflightBody(safePreflight, 'req-preflight-1'));
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-1');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    expect(applyButton).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));

    await waitFor(() => expect(applyButton).toBeDisabled());
    expect(screen.getByLabelText(/confirmation phrase/i)).toHaveValue('');
    expect(screen.queryByText('Would insert')).not.toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(fetch).toHaveBeenCalledTimes(2);

    resolveRefresh(jsonResponse(preflightBody(safePreflight, 'req-preflight-2')));
    await screen.findByText('req-preflight-2');
  });

  it('keeps apply locked when a preflight refresh rejects', async () => {
    mockFetchOnce(preflightBody(safePreflight, 'req-preflight-1'));
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network down'));

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-1');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    expect(screen.getByRole('button', { name: /apply printify catalog/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText(/Preflight request failed/i);

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    expect(applyButton).toBeDisabled();
    expect(screen.getByLabelText(/confirmation phrase/i)).toHaveValue('');
    expect(screen.queryByText('Would insert')).not.toBeInTheDocument();
    expect(screen.getByText(/Preflight request failed/i)).toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps apply locked when a preflight refresh returns malformed JSON', async () => {
    mockFetchOnce(preflightBody(safePreflight, 'req-preflight-1'));
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('{not valid json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-1');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText(/Preflight request failed/i);

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    expect(applyButton).toBeDisabled();
    expect(screen.getByLabelText(/confirmation phrase/i)).toHaveValue('');
    expect(screen.queryByText('Would insert')).not.toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps apply locked when a preflight refresh returns an error without a summary', async () => {
    mockFetchOnce(preflightBody(safePreflight, 'req-preflight-1'));
    mockFetchOnce(
      {
        ok: false,
        requestId: 'req-preflight-error',
        error: 'Provider request timed out.',
      },
      503,
    );

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-1');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-error');

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    expect(applyButton).toBeDisabled();
    expect(screen.getByLabelText(/confirmation phrase/i)).toHaveValue('');
    expect(screen.queryByText('Would insert')).not.toBeInTheDocument();
    expect(screen.getByText('Provider request timed out.')).toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('uses only the newest successful preflight after refresh', async () => {
    const firstPreflight = { ...safePreflight, productCount: 2, wouldInsert: 2 };
    const secondPreflight = { ...safePreflight, productCount: 3, wouldInsert: 3 };

    mockFetchOnce(preflightBody(firstPreflight, 'req-preflight-1'));
    mockFetchOnce(preflightBody(secondPreflight, 'req-preflight-2'));
    mockFetchOnce(applySuccessBody());

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-1');
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    expect(screen.getByRole('button', { name: /apply printify catalog/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-2');

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    expect(screen.getByLabelText(/confirmation phrase/i)).toHaveValue('');
    expect(applyButton).toBeDisabled();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);

    fireEvent.click(applyButton);
    expect(fetch).toHaveBeenCalledTimes(2);

    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    fireEvent.click(applyButton);
    await screen.findByText('req-apply');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('sends the exact controlled apply body after clean preflight and confirmation', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce(applySuccessBody());

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

  it('consumes a clean preflight after one completed apply attempt', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce(applySuccessBody());

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    fireEvent.click(applyButton);
    await screen.findByText('req-apply');

    expect(applyButton).toBeDisabled();
    expect(screen.getByLabelText(/confirmation phrase/i)).toHaveValue('');
    expect(screen.queryByText('Would insert')).not.toBeInTheDocument();
    expect(screen.getByText('req-apply')).toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('requires a fresh preflight before a second apply can become available', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight-1',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce(applySuccessBody('req-apply-1'));
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight-2',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce(applySuccessBody('req-apply-2'));

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-1');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply printify catalog/i }));
    await screen.findByText('req-apply-1');

    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply printify catalog/i }));
    expect(fetch).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight-2');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply printify catalog/i }));
    await screen.findByText('req-apply-2');

    expect(fetch).toHaveBeenCalledTimes(4);
    expect(requestBodyAt(3)).toEqual({
      operation: 'apply',
      apply: true,
      hideMissing: false,
    });
  });

  it('consumes the old preflight authorization after a rejected apply request', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network down'));

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    fireEvent.click(applyButton);
    await screen.findByText(/Apply request failed/i);

    expect(applyButton).toBeDisabled();
    expect(screen.getByLabelText(/confirmation phrase/i)).toHaveValue('');
    expect(screen.getByText(/Apply request failed/i)).toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('locks apply and prompts reauthentication when apply returns 401', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce(
      {
        ok: false,
        requestId: 'req-stale-session',
        error: 'Unauthorized',
      },
      401,
    );

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });

    const applyButton = screen.getByRole('button', { name: /apply printify catalog/i });
    fireEvent.click(applyButton);

    await screen.findByText('req-stale-session');
    expect(screen.getByText(/Your session is no longer valid/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in again/i })).toHaveAttribute(
      'href',
      expect.stringContaining('/sign-in?redirect_url='),
    );
    expect(applyButton).toBeDisabled();
    expect(screen.getByLabelText(/confirmation phrase/i)).toHaveValue('');
    expect(screen.queryByText('Would insert')).not.toBeInTheDocument();

    fireEvent.click(applyButton);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps apply locked and distinguishes insufficient permissions on 403', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce(
      {
        ok: false,
        requestId: 'req-forbidden',
        error: 'Forbidden',
      },
      403,
    );

    render(<PrintifyAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: /run preflight/i }));
    await screen.findByText('req-preflight');
    fireEvent.change(screen.getByLabelText(/confirmation phrase/i), {
      target: { value: 'APPLY PRINTIFY CATALOG' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply printify catalog/i }));

    await screen.findByText('req-forbidden');
    expect(screen.getByText(/does not have permission/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign in again/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply printify catalog/i })).toBeDisabled();
  });

  it('does not send stale manual or products operations', async () => {
    mockFetchOnce({
      ok: true,
      requestId: 'req-preflight',
      data: { operation: 'preflight', preflight: safePreflight },
    });
    mockFetchOnce(applySuccessBody());

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
